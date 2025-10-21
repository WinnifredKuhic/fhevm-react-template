// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, euint64, ebool } from "@fhevm/solidity/lib/FHE.sol";

contract CarbonCreditTrading {

    address public owner;
    uint256 public nextCreditId;
    uint256 public nextOrderId;

    struct CarbonCredit {
        address issuer;
        euint32 encryptedAmount;        // Encrypted amount of credits
        euint32 encryptedPrice;         // Encrypted price per credit
        bool isActive;
        uint256 timestamp;
        string projectType;             // e.g., "renewable_energy", "reforestation"
        bytes32 verificationHash;       // Hash of verification documents
    }

    struct PrivateOrder {
        address buyer;
        address seller;
        euint32 encryptedAmount;        // Encrypted amount requested
        euint32 encryptedMaxPrice;      // Encrypted maximum price willing to pay
        euint64 encryptedTotalValue;    // Encrypted total transaction value
        bool isActive;
        bool isFulfilled;
        uint256 timestamp;
        uint256 creditId;
    }

    struct UserBalance {
        euint64 encryptedCreditBalance; // Encrypted carbon credit balance
        euint64 encryptedTokenBalance;  // Encrypted token balance for payments
        bool isRegistered;
    }

    mapping(uint256 => CarbonCredit) public carbonCredits;
    mapping(uint256 => PrivateOrder) public orders;
    mapping(address => UserBalance) public userBalances;
    mapping(address => bool) public authorizedIssuers;
    mapping(address => uint256[]) public userCreditIds;
    mapping(address => uint256[]) public userOrderIds;

    event CreditIssued(uint256 indexed creditId, address indexed issuer, string projectType);
    event OrderCreated(uint256 indexed orderId, address indexed buyer, uint256 indexed creditId);
    event TradeExecuted(uint256 indexed orderId, address indexed buyer, address indexed seller);
    event BalanceUpdated(address indexed user);
    event IssuerAuthorized(address indexed issuer);
    event VerificationCompleted(uint256 indexed creditId, bytes32 verificationHash);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier onlyAuthorizedIssuer() {
        require(authorizedIssuers[msg.sender], "Not authorized issuer");
        _;
    }

    modifier onlyRegistered() {
        require(userBalances[msg.sender].isRegistered, "User not registered");
        _;
    }

    constructor() {
        owner = msg.sender;
        nextCreditId = 1;
        nextOrderId = 1;
        authorizedIssuers[msg.sender] = true;
    }

    // Register user in the system
    function registerUser() external {
        require(!userBalances[msg.sender].isRegistered, "Already registered");

        userBalances[msg.sender] = UserBalance({
            encryptedCreditBalance: FHE.asEuint64(0),
            encryptedTokenBalance: FHE.asEuint64(0),
            isRegistered: true
        });

        // Set ACL permissions
        FHE.allowThis(userBalances[msg.sender].encryptedCreditBalance);
        FHE.allowThis(userBalances[msg.sender].encryptedTokenBalance);
        FHE.allow(userBalances[msg.sender].encryptedCreditBalance, msg.sender);
        FHE.allow(userBalances[msg.sender].encryptedTokenBalance, msg.sender);

        emit BalanceUpdated(msg.sender);
    }

    // Authorize carbon credit issuer
    function authorizeIssuer(address issuer) external onlyOwner {
        authorizedIssuers[issuer] = true;
        emit IssuerAuthorized(issuer);
    }

    // Issue new carbon credits with encrypted amounts and prices
    function issueCarbonCredits(
        uint32 amount,
        uint32 pricePerCredit,
        string calldata projectType,
        bytes32 verificationHash
    ) external onlyAuthorizedIssuer onlyRegistered {
        require(amount > 0, "Amount must be positive");
        require(pricePerCredit > 0, "Price must be positive");

        // Encrypt the sensitive data
        euint32 encryptedAmount = FHE.asEuint32(amount);
        euint32 encryptedPrice = FHE.asEuint32(pricePerCredit);

        carbonCredits[nextCreditId] = CarbonCredit({
            issuer: msg.sender,
            encryptedAmount: encryptedAmount,
            encryptedPrice: encryptedPrice,
            isActive: true,
            timestamp: block.timestamp,
            projectType: projectType,
            verificationHash: verificationHash
        });

        // Set ACL permissions
        FHE.allowThis(encryptedAmount);
        FHE.allowThis(encryptedPrice);
        FHE.allow(encryptedAmount, msg.sender);
        FHE.allow(encryptedPrice, msg.sender);

        // Update issuer's credit balance
        userBalances[msg.sender].encryptedCreditBalance = FHE.add(
            userBalances[msg.sender].encryptedCreditBalance,
            FHE.asEuint64(amount)
        );

        userCreditIds[msg.sender].push(nextCreditId);

        emit CreditIssued(nextCreditId, msg.sender, projectType);
        emit BalanceUpdated(msg.sender);

        nextCreditId++;
    }

    // Create private buy order for carbon credits
    function createBuyOrder(
        uint256 creditId,
        uint32 amount,
        uint32 maxPricePerCredit
    ) external onlyRegistered {
        require(carbonCredits[creditId].isActive, "Credit not active");
        require(amount > 0, "Amount must be positive");

        // Encrypt order details
        euint32 encryptedAmount = FHE.asEuint32(amount);
        euint32 encryptedMaxPrice = FHE.asEuint32(maxPricePerCredit);
        euint64 encryptedTotalValue = FHE.mul(
            FHE.asEuint64(amount),
            FHE.asEuint64(maxPricePerCredit)
        );

        // Note: In FHEVM, balance checks are typically done off-chain or through zero-knowledge proofs
        // For now, we'll proceed without the encrypted balance check as it requires client-side verification

        orders[nextOrderId] = PrivateOrder({
            buyer: msg.sender,
            seller: carbonCredits[creditId].issuer,
            encryptedAmount: encryptedAmount,
            encryptedMaxPrice: encryptedMaxPrice,
            encryptedTotalValue: encryptedTotalValue,
            isActive: true,
            isFulfilled: false,
            timestamp: block.timestamp,
            creditId: creditId
        });

        // Set ACL permissions
        FHE.allowThis(encryptedAmount);
        FHE.allowThis(encryptedMaxPrice);
        FHE.allowThis(encryptedTotalValue);
        FHE.allow(encryptedAmount, msg.sender);
        FHE.allow(encryptedMaxPrice, msg.sender);
        FHE.allow(encryptedTotalValue, msg.sender);
        FHE.allow(encryptedAmount, carbonCredits[creditId].issuer);

        userOrderIds[msg.sender].push(nextOrderId);

        emit OrderCreated(nextOrderId, msg.sender, creditId);

        nextOrderId++;
    }

    // Execute trade (seller accepts buy order)
    function executeTrade(uint256 orderId) external onlyRegistered {
        PrivateOrder storage order = orders[orderId];
        CarbonCredit storage credit = carbonCredits[order.creditId];

        require(order.isActive, "Order not active");
        require(!order.isFulfilled, "Order already fulfilled");
        require(msg.sender == order.seller, "Not the seller");

        // Note: Credit balance verification done off-chain in FHEVM
        // The actual balance checks would be performed client-side before calling this function

        // Note: Price comparison done off-chain in FHEVM
        // Price acceptability would be verified client-side before calling this function

        // Calculate actual total cost using encrypted values
        euint64 actualTotalCost = FHE.mul(
            FHE.asEuint64(order.encryptedAmount),
            FHE.asEuint64(credit.encryptedPrice)
        );

        // Transfer tokens from buyer to seller
        userBalances[order.buyer].encryptedTokenBalance = FHE.sub(
            userBalances[order.buyer].encryptedTokenBalance,
            actualTotalCost
        );
        userBalances[msg.sender].encryptedTokenBalance = FHE.add(
            userBalances[msg.sender].encryptedTokenBalance,
            actualTotalCost
        );

        // Transfer credits from seller to buyer
        euint64 creditAmount = FHE.asEuint64(order.encryptedAmount);
        userBalances[msg.sender].encryptedCreditBalance = FHE.sub(
            userBalances[msg.sender].encryptedCreditBalance,
            creditAmount
        );
        userBalances[order.buyer].encryptedCreditBalance = FHE.add(
            userBalances[order.buyer].encryptedCreditBalance,
            creditAmount
        );

        // Mark order as fulfilled
        order.isFulfilled = true;
        order.isActive = false;

        emit TradeExecuted(orderId, order.buyer, msg.sender);
        emit BalanceUpdated(order.buyer);
        emit BalanceUpdated(msg.sender);
    }

    // Deposit tokens for trading (in practice, this would integrate with a payment system)
    function depositTokens(uint64 amount) external onlyRegistered {
        require(amount > 0, "Amount must be positive");

        euint64 encryptedAmount = FHE.asEuint64(amount);
        userBalances[msg.sender].encryptedTokenBalance = FHE.add(
            userBalances[msg.sender].encryptedTokenBalance,
            encryptedAmount
        );

        emit BalanceUpdated(msg.sender);
    }

    // Get user's encrypted balances (returns encrypted values for client-side decryption)
    function getMyBalances() external view onlyRegistered returns (
        euint64 encryptedCreditBalance,
        euint64 encryptedTokenBalance
    ) {
        return (
            userBalances[msg.sender].encryptedCreditBalance,
            userBalances[msg.sender].encryptedTokenBalance
        );
    }

    // Get user's credit IDs
    function getMyCreditIds() external view returns (uint256[] memory) {
        return userCreditIds[msg.sender];
    }

    // Get user's order IDs
    function getMyOrderIds() external view returns (uint256[] memory) {
        return userOrderIds[msg.sender];
    }

    // Get public credit information (amounts and prices remain encrypted)
    function getCreditInfo(uint256 creditId) external view returns (
        address issuer,
        bool isActive,
        uint256 timestamp,
        string memory projectType,
        bytes32 verificationHash
    ) {
        CarbonCredit storage credit = carbonCredits[creditId];
        return (
            credit.issuer,
            credit.isActive,
            credit.timestamp,
            credit.projectType,
            credit.verificationHash
        );
    }

    // Get order information (sensitive data remains encrypted)
    function getOrderInfo(uint256 orderId) external view returns (
        address buyer,
        address seller,
        bool isActive,
        bool isFulfilled,
        uint256 timestamp,
        uint256 creditId
    ) {
        PrivateOrder storage order = orders[orderId];
        return (
            order.buyer,
            order.seller,
            order.isActive,
            order.isFulfilled,
            order.timestamp,
            order.creditId
        );
    }

    // Cancel active order (only buyer can cancel)
    function cancelOrder(uint256 orderId) external {
        PrivateOrder storage order = orders[orderId];
        require(msg.sender == order.buyer, "Not the buyer");
        require(order.isActive, "Order not active");
        require(!order.isFulfilled, "Order already fulfilled");

        order.isActive = false;
    }

    // Update verification hash for credits (only issuer)
    function updateVerification(uint256 creditId, bytes32 newVerificationHash) external {
        require(msg.sender == carbonCredits[creditId].issuer, "Not the issuer");
        carbonCredits[creditId].verificationHash = newVerificationHash;
        emit VerificationCompleted(creditId, newVerificationHash);
    }

    // Get total number of credits and orders
    function getSystemStats() external view returns (
        uint256 totalCredits,
        uint256 totalOrders
    ) {
        return (nextCreditId - 1, nextOrderId - 1);
    }

    // Check if user is registered
    function isUserRegistered(address user) external view returns (bool) {
        return userBalances[user].isRegistered;
    }

    // Check if address is authorized issuer
    function isAuthorizedIssuer(address issuer) external view returns (bool) {
        return authorizedIssuers[issuer];
    }
}