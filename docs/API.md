# Contract API Reference

## Overview

This document provides a complete API reference for the CarbonCreditTrading smart contract, including all functions, events, and error codes.

## Contract Information

- **Contract Name**: CarbonCreditTrading
- **Solidity Version**: 0.8.24
- **License**: MIT
- **Dependencies**: @fhevm/solidity

## State Variables

### Public Variables

```solidity
address public owner;
uint256 public nextCreditId;
uint256 public nextOrderId;
uint256 public totalUsers;
```

### Mappings

```solidity
mapping(address => User) public users;
mapping(uint256 => CarbonCredit) public carbonCredits;
mapping(uint256 => Order) public orders;
```

## Data Structures

### User

```solidity
struct User {
    bool registered;         // Registration status
    bool isIssuer;          // Issuer authorization
    euint64 encryptedBalance; // Encrypted token balance
    uint256 registrationTime; // Timestamp of registration
}
```

### CarbonCredit

```solidity
struct CarbonCredit {
    uint256 creditId;          // Unique credit identifier
    address issuer;            // Credit issuer address
    euint32 encryptedAmount;   // Encrypted credit amount
    euint32 encryptedPrice;    // Encrypted price per unit
    bytes32 verificationHash;  // Verification hash
    uint256 issuanceTime;      // Timestamp of issuance
    address currentOwner;      // Current owner address
}
```

### Order

```solidity
struct Order {
    uint256 orderId;          // Unique order identifier
    address buyer;            // Buyer address
    uint256 creditId;         // Credit being purchased
    euint32 encryptedAmount;  // Encrypted order amount
    bool isActive;            // Order active status
    uint256 createdTime;      // Timestamp of creation
}
```

## Functions

### Constructor

```solidity
constructor()
```

**Description**: Initializes the contract and sets the deployer as owner.

**Access**: Public (deployment only)

**Effects**:
- Sets `owner` to `msg.sender`
- Initializes counters to 0

**Example**:
```javascript
const Contract = await ethers.getContractFactory("CarbonCreditTrading");
const contract = await Contract.deploy();
```

---

### User Management

#### registerUser

```solidity
function registerUser(address _user) external onlyOwner
```

**Description**: Registers a new user on the platform.

**Parameters**:
- `_user` (address): Address of the user to register

**Access**: Only contract owner

**Requirements**:
- Caller must be owner
- User not already registered

**Effects**:
- Creates User struct
- Sets `registered = true`
- Allocates initial encrypted balance (1,000,000)
- Increments `totalUsers`

**Events**: Emits `UserRegistered(_user, timestamp)`

**Gas Cost**: ~180,000

**Example**:
```javascript
const tx = await contract.registerUser("0x1234...");
await tx.wait();
console.log("User registered successfully");
```

**Errors**:
- `"Only owner"` - Caller is not owner
- `"Already registered"` - User already exists

---

#### authorizeIssuer

```solidity
function authorizeIssuer(address _issuer) external onlyOwner
```

**Description**: Authorizes an address as a carbon credit issuer.

**Parameters**:
- `_issuer` (address): Address to authorize as issuer

**Access**: Only contract owner

**Requirements**:
- Caller must be owner
- Issuer must be registered user
- Not already authorized

**Effects**:
- Sets `user.isIssuer = true`

**Events**: Emits `IssuerAuthorized(_issuer, timestamp)`

**Gas Cost**: ~45,000

**Example**:
```javascript
await contract.authorizeIssuer("0x5678...");
```

---

### Credit Management

#### issueCredit

```solidity
function issueCredit(
    einput encryptedAmount,
    bytes calldata inputProof,
    einput encryptedPrice,
    bytes calldata priceProof,
    bytes32 verificationHash
) external onlyIssuer returns (uint256)
```

**Description**: Issues a new carbon credit with encrypted parameters.

**Parameters**:
- `encryptedAmount` (einput): Encrypted credit amount
- `inputProof` (bytes): Proof for amount encryption
- `encryptedPrice` (einput): Encrypted price per unit
- `priceProof` (bytes): Proof for price encryption
- `verificationHash` (bytes32): Verification hash for credit authenticity

**Access**: Only authorized issuers

**Requirements**:
- Caller must be authorized issuer

**Effects**:
- Creates new CarbonCredit struct
- Assigns unique `creditId`
- Stores encrypted amount and price
- Increments `nextCreditId`

**Returns**: `creditId` (uint256)

**Events**: Emits `CreditIssued(creditId, issuer, verificationHash, timestamp)`

**Gas Cost**: ~280,000

**Example**:
```javascript
const amount = await fhevmClient.encrypt(1000);
const price = await fhevmClient.encrypt(50);
const hash = ethers.keccak256(ethers.toUtf8Bytes("verification-data"));

const tx = await contract.issueCredit(
    amount.handles,
    amount.inputProof,
    price.handles,
    price.inputProof,
    hash
);
const receipt = await tx.wait();
const creditId = receipt.events[0].args.creditId;
```

---

### Token Operations

#### depositTokens

```solidity
function depositTokens(
    einput encryptedAmount,
    bytes calldata inputProof
) external onlyRegistered
```

**Description**: Deposits tokens with encrypted amount.

**Parameters**:
- `encryptedAmount` (einput): Encrypted deposit amount
- `inputProof` (bytes): Proof for encryption

**Access**: Only registered users

**Requirements**:
- Caller must be registered

**Effects**:
- Adds encrypted amount to user balance using `FHE.add()`

**Events**: Emits `TokensDeposited(user, timestamp)`

**Gas Cost**: ~110,000

**Example**:
```javascript
const amount = await fhevmClient.encrypt(500000);
await contract.depositTokens(amount.handles, amount.inputProof);
```

---

### Order Management

#### createBuyOrder

```solidity
function createBuyOrder(
    uint256 _creditId,
    einput encryptedAmount,
    bytes calldata inputProof
) external onlyRegistered returns (uint256)
```

**Description**: Creates a buy order for carbon credits.

**Parameters**:
- `_creditId` (uint256): ID of credit to purchase
- `encryptedAmount` (einput): Encrypted order amount
- `inputProof` (bytes): Proof for encryption

**Access**: Only registered users

**Requirements**:
- Caller must be registered
- Credit must exist

**Effects**:
- Creates new Order struct
- Assigns unique `orderId`
- Sets `isActive = true`
- Increments `nextOrderId`

**Returns**: `orderId` (uint256)

**Events**: Emits `OrderCreated(orderId, buyer, creditId, timestamp)`

**Gas Cost**: ~230,000

**Example**:
```javascript
const amount = await fhevmClient.encrypt(100);
const orderId = await contract.createBuyOrder(
    1,  // creditId
    amount.handles,
    amount.inputProof
);
```

---

#### cancelOrder

```solidity
function cancelOrder(uint256 _orderId) external
```

**Description**: Cancels an active order.

**Parameters**:
- `_orderId` (uint256): ID of order to cancel

**Access**: Only order owner

**Requirements**:
- Caller must be order buyer
- Order must be active

**Effects**:
- Sets `order.isActive = false`

**Events**: Emits `OrderCancelled(orderId, timestamp)`

**Gas Cost**: ~30,000

**Example**:
```javascript
await contract.cancelOrder(1);
```

---

### Trade Execution

#### executeTrade

```solidity
function executeTrade(uint256 _orderId) external returns (bool)
```

**Description**: Executes a trade using homomorphic encryption.

**Parameters**:
- `_orderId` (uint256): ID of order to execute

**Access**: Public (anyone can execute)

**Requirements**:
- Order must be active
- Buyer must have sufficient balance (verified homomorphically)

**Effects**:
- Calculates total cost: `FHE.mul(amount, price)`
- Verifies balance: `FHE.gte(balance, totalCost)`
- Updates buyer balance: `FHE.sub(balance, totalCost)`
- Transfers credit ownership
- Sets `order.isActive = false`

**Returns**: Success status (bool)

**Events**: Emits `TradeExecuted(orderId, buyer, creditId, timestamp)`

**Gas Cost**: ~320,000

**Example**:
```javascript
const tx = await contract.executeTrade(1);
await tx.wait();
console.log("Trade executed successfully");
```

---

### View Functions

#### getUserInfo

```solidity
function getUserInfo(address _user) external view returns (
    bool registered,
    bool isIssuer,
    uint256 registrationTime
)
```

**Description**: Retrieves public user information.

**Parameters**:
- `_user` (address): User address to query

**Returns**:
- `registered` (bool): Registration status
- `isIssuer` (bool): Issuer authorization
- `registrationTime` (uint256): Registration timestamp

**Gas Cost**: ~5,000 (view function)

**Example**:
```javascript
const [registered, isIssuer, regTime] = await contract.getUserInfo("0x1234...");
```

---

#### getCreditInfo

```solidity
function getCreditInfo(uint256 _creditId) external view returns (
    address issuer,
    bytes32 verificationHash,
    uint256 issuanceTime,
    address currentOwner
)
```

**Description**: Retrieves public credit information.

**Parameters**:
- `_creditId` (uint256): Credit ID to query

**Returns**:
- `issuer` (address): Credit issuer
- `verificationHash` (bytes32): Verification hash
- `issuanceTime` (uint256): Issuance timestamp
- `currentOwner` (address): Current owner

**Gas Cost**: ~8,000 (view function)

---

#### getOrderInfo

```solidity
function getOrderInfo(uint256 _orderId) external view returns (
    address buyer,
    uint256 creditId,
    bool isActive,
    uint256 createdTime
)
```

**Description**: Retrieves public order information.

**Parameters**:
- `_orderId` (uint256): Order ID to query

**Returns**:
- `buyer` (address): Order buyer
- `creditId` (uint256): Credit being purchased
- `isActive` (bool): Order status
- `createdTime` (uint256): Creation timestamp

**Gas Cost**: ~7,000 (view function)

---

### Encrypted Data Access

#### getUserBalance

```solidity
function getUserBalance(
    bytes32 publicKey,
    bytes calldata signature
) external view returns (bytes memory)
```

**Description**: Returns sealed encrypted balance for authorized access.

**Parameters**:
- `publicKey` (bytes32): User's public key
- `signature` (bytes): Authorization signature

**Access**: Only user themselves (verified by signature)

**Returns**: Sealed encrypted balance

**Example**:
```javascript
const sealedBalance = await contract.getUserBalance(publicKey, signature);
const balance = await fhevmClient.decrypt(sealedBalance);
```

---

## Events

### UserRegistered

```solidity
event UserRegistered(address indexed user, uint256 timestamp);
```

**Emitted**: When a new user is registered

**Parameters**:
- `user` (indexed): Address of registered user
- `timestamp`: Block timestamp

---

### IssuerAuthorized

```solidity
event IssuerAuthorized(address indexed issuer, uint256 timestamp);
```

**Emitted**: When an issuer is authorized

---

### CreditIssued

```solidity
event CreditIssued(
    uint256 indexed creditId,
    address indexed issuer,
    bytes32 verificationHash,
    uint256 timestamp
);
```

**Emitted**: When a carbon credit is issued

---

### TokensDeposited

```solidity
event TokensDeposited(address indexed user, uint256 timestamp);
```

**Emitted**: When tokens are deposited

---

### OrderCreated

```solidity
event OrderCreated(
    uint256 indexed orderId,
    address indexed buyer,
    uint256 indexed creditId,
    uint256 timestamp
);
```

**Emitted**: When a buy order is created

---

### OrderCancelled

```solidity
event OrderCancelled(uint256 indexed orderId, uint256 timestamp);
```

**Emitted**: When an order is cancelled

---

### TradeExecuted

```solidity
event TradeExecuted(
    uint256 indexed orderId,
    address indexed buyer,
    uint256 indexed creditId,
    uint256 timestamp
);
```

**Emitted**: When a trade is successfully executed

---

## Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `"Only owner"` | Caller is not contract owner | Use owner account |
| `"Only issuer"` | Caller is not authorized issuer | Get issuer authorization |
| `"Not registered"` | User not registered | Register first |
| `"Already registered"` | User already exists | Use existing account |
| `"Already issuer"` | Issuer already authorized | Skip authorization |
| `"Invalid credit"` | Credit ID doesn't exist | Use valid credit ID |
| `"Order not active"` | Order already executed/cancelled | Create new order |
| `"Not order owner"` | Not authorized to cancel | Use order owner account |
| `"Insufficient balance"` | Balance too low for trade | Deposit more tokens |

## Gas Costs Summary

| Function | Estimated Gas | Cost @ 20 gwei |
|----------|---------------|----------------|
| registerUser | 180,000 | 0.0036 ETH |
| authorizeIssuer | 45,000 | 0.0009 ETH |
| issueCredit | 280,000 | 0.0056 ETH |
| depositTokens | 110,000 | 0.0022 ETH |
| createBuyOrder | 230,000 | 0.0046 ETH |
| cancelOrder | 30,000 | 0.0006 ETH |
| executeTrade | 320,000 | 0.0064 ETH |
| getUserInfo | 5,000 | 0.0001 ETH |

---

**Last Updated**: 2025-10-25
**Version**: 1.0.0
