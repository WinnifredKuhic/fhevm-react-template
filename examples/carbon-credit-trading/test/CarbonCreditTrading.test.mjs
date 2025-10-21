import { expect } from "chai";
import { ethers } from "hardhat";

describe("CarbonCreditTrading", function () {
  let contract;
  let contractAddress;
  let owner, issuer1, issuer2, buyer1, buyer2, buyer3;
  let signers;

  // Deploy fixture - isolates each test
  async function deployFixture() {
    const CarbonCreditTrading = await ethers.getContractFactory("CarbonCreditTrading");
    const carbonCreditTrading = await CarbonCreditTrading.deploy();
    await carbonCreditTrading.waitForDeployment();
    const address = await carbonCreditTrading.getAddress();

    return { contract: carbonCreditTrading, contractAddress: address };
  }

  before(async function () {
    // Setup signers for different roles
    const ethSigners = await ethers.getSigners();
    signers = {
      owner: ethSigners[0],
      issuer1: ethSigners[1],
      issuer2: ethSigners[2],
      buyer1: ethSigners[3],
      buyer2: ethSigners[4],
      buyer3: ethSigners[5],
    };

    [owner, issuer1, issuer2, buyer1, buyer2, buyer3] = ethSigners;
  });

  beforeEach(async function () {
    ({ contract, contractAddress } = await deployFixture());
  });

  // ========================================
  // DEPLOYMENT TESTS (5 tests)
  // ========================================
  describe("Deployment", function () {
    it("should deploy successfully with valid address", async function () {
      expect(contractAddress).to.be.properAddress;
      expect(contractAddress).to.not.equal(ethers.ZeroAddress);
    });

    it("should set correct owner on deployment", async function () {
      const contractOwner = await contract.owner();
      expect(contractOwner).to.equal(owner.address);
    });

    it("should initialize credit counter to 1", async function () {
      const nextCreditId = await contract.nextCreditId();
      expect(nextCreditId).to.equal(1);
    });

    it("should initialize order counter to 1", async function () {
      const nextOrderId = await contract.nextOrderId();
      expect(nextOrderId).to.equal(1);
    });

    it("should authorize owner as issuer by default", async function () {
      const isAuthorized = await contract.isAuthorizedIssuer(owner.address);
      expect(isAuthorized).to.be.true;
    });
  });

  // ========================================
  // USER REGISTRATION TESTS (6 tests)
  // ========================================
  describe("User Registration", function () {
    it("should allow user to register", async function () {
      await contract.connect(buyer1).registerUser();
      const isRegistered = await contract.isUserRegistered(buyer1.address);
      expect(isRegistered).to.be.true;
    });

    it("should emit BalanceUpdated event on registration", async function () {
      await expect(contract.connect(buyer1).registerUser())
        .to.emit(contract, "BalanceUpdated")
        .withArgs(buyer1.address);
    });

    it("should reject duplicate registration", async function () {
      await contract.connect(buyer1).registerUser();
      await expect(
        contract.connect(buyer1).registerUser()
      ).to.be.revertedWith("Already registered");
    });

    it("should return false for unregistered user", async function () {
      const isRegistered = await contract.isUserRegistered(buyer1.address);
      expect(isRegistered).to.be.false;
    });

    it("should allow multiple users to register", async function () {
      await contract.connect(buyer1).registerUser();
      await contract.connect(buyer2).registerUser();
      await contract.connect(buyer3).registerUser();

      expect(await contract.isUserRegistered(buyer1.address)).to.be.true;
      expect(await contract.isUserRegistered(buyer2.address)).to.be.true;
      expect(await contract.isUserRegistered(buyer3.address)).to.be.true;
    });

    it("should initialize user balance correctly", async function () {
      await contract.connect(buyer1).registerUser();
      const balances = await contract.connect(buyer1).getMyBalances();
      // Balances are encrypted, we just verify they're returned
      expect(balances.encryptedCreditBalance).to.exist;
      expect(balances.encryptedTokenBalance).to.exist;
    });
  });

  // ========================================
  // ISSUER AUTHORIZATION TESTS (5 tests)
  // ========================================
  describe("Issuer Authorization", function () {
    it("should allow owner to authorize issuer", async function () {
      await contract.connect(owner).authorizeIssuer(issuer1.address);
      const isAuthorized = await contract.isAuthorizedIssuer(issuer1.address);
      expect(isAuthorized).to.be.true;
    });

    it("should emit IssuerAuthorized event", async function () {
      await expect(contract.connect(owner).authorizeIssuer(issuer1.address))
        .to.emit(contract, "IssuerAuthorized")
        .withArgs(issuer1.address);
    });

    it("should reject non-owner authorization attempt", async function () {
      await expect(
        contract.connect(buyer1).authorizeIssuer(issuer1.address)
      ).to.be.revertedWith("Not authorized");
    });

    it("should allow multiple issuers", async function () {
      await contract.connect(owner).authorizeIssuer(issuer1.address);
      await contract.connect(owner).authorizeIssuer(issuer2.address);

      expect(await contract.isAuthorizedIssuer(issuer1.address)).to.be.true;
      expect(await contract.isAuthorizedIssuer(issuer2.address)).to.be.true;
    });

    it("should return false for unauthorized issuer", async function () {
      const isAuthorized = await contract.isAuthorizedIssuer(issuer1.address);
      expect(isAuthorized).to.be.false;
    });
  });

  // ========================================
  // CARBON CREDIT ISSUANCE TESTS (8 tests)
  // ========================================
  describe("Carbon Credit Issuance", function () {
    beforeEach(async function () {
      await contract.connect(issuer1).registerUser();
      await contract.connect(owner).authorizeIssuer(issuer1.address);
    });

    it("should allow authorized issuer to issue credits", async function () {
      const verificationHash = ethers.keccak256(ethers.toUtf8Bytes("verification1"));

      const tx = await contract
        .connect(issuer1)
        .issueCarbonCredits(1000, 50, "renewable_energy", verificationHash);

      await tx.wait();

      const stats = await contract.getSystemStats();
      expect(stats.totalCredits).to.equal(1);
    });

    it("should emit CreditIssued event", async function () {
      const verificationHash = ethers.keccak256(ethers.toUtf8Bytes("verification1"));

      await expect(
        contract.connect(issuer1).issueCarbonCredits(1000, 50, "renewable_energy", verificationHash)
      )
        .to.emit(contract, "CreditIssued")
        .withArgs(1, issuer1.address, "renewable_energy");
    });

    it("should reject issuance from unauthorized issuer", async function () {
      await contract.connect(buyer1).registerUser();
      const verificationHash = ethers.keccak256(ethers.toUtf8Bytes("verification1"));

      await expect(
        contract.connect(buyer1).issueCarbonCredits(1000, 50, "renewable_energy", verificationHash)
      ).to.be.revertedWith("Not authorized issuer");
    });

    it("should reject unregistered issuer", async function () {
      await contract.connect(owner).authorizeIssuer(issuer2.address);
      const verificationHash = ethers.keccak256(ethers.toUtf8Bytes("verification1"));

      await expect(
        contract.connect(issuer2).issueCarbonCredits(1000, 50, "renewable_energy", verificationHash)
      ).to.be.revertedWith("User not registered");
    });

    it("should reject zero amount", async function () {
      const verificationHash = ethers.keccak256(ethers.toUtf8Bytes("verification1"));

      await expect(
        contract.connect(issuer1).issueCarbonCredits(0, 50, "renewable_energy", verificationHash)
      ).to.be.revertedWith("Amount must be positive");
    });

    it("should reject zero price", async function () {
      const verificationHash = ethers.keccak256(ethers.toUtf8Bytes("verification1"));

      await expect(
        contract.connect(issuer1).issueCarbonCredits(1000, 0, "renewable_energy", verificationHash)
      ).to.be.revertedWith("Price must be positive");
    });

    it("should increment credit ID correctly", async function () {
      const verificationHash = ethers.keccak256(ethers.toUtf8Bytes("verification1"));

      await contract.connect(issuer1).issueCarbonCredits(1000, 50, "renewable_energy", verificationHash);
      await contract.connect(issuer1).issueCarbonCredits(500, 75, "reforestation", verificationHash);

      const stats = await contract.getSystemStats();
      expect(stats.totalCredits).to.equal(2);
    });

    it("should store credit information correctly", async function () {
      const verificationHash = ethers.keccak256(ethers.toUtf8Bytes("verification1"));

      await contract.connect(issuer1).issueCarbonCredits(1000, 50, "renewable_energy", verificationHash);

      const creditInfo = await contract.getCreditInfo(1);
      expect(creditInfo.issuer).to.equal(issuer1.address);
      expect(creditInfo.isActive).to.be.true;
      expect(creditInfo.projectType).to.equal("renewable_energy");
      expect(creditInfo.verificationHash).to.equal(verificationHash);
    });
  });

  // ========================================
  // TOKEN DEPOSIT TESTS (5 tests)
  // ========================================
  describe("Token Deposits", function () {
    beforeEach(async function () {
      await contract.connect(buyer1).registerUser();
    });

    it("should allow registered user to deposit tokens", async function () {
      await expect(contract.connect(buyer1).depositTokens(10000))
        .to.emit(contract, "BalanceUpdated")
        .withArgs(buyer1.address);
    });

    it("should reject deposit from unregistered user", async function () {
      await expect(
        contract.connect(buyer2).depositTokens(10000)
      ).to.be.revertedWith("User not registered");
    });

    it("should reject zero deposit", async function () {
      await expect(
        contract.connect(buyer1).depositTokens(0)
      ).to.be.revertedWith("Amount must be positive");
    });

    it("should allow multiple deposits", async function () {
      await contract.connect(buyer1).depositTokens(5000);
      await contract.connect(buyer1).depositTokens(5000);

      // Balance is encrypted, just verify no revert
      const balances = await contract.connect(buyer1).getMyBalances();
      expect(balances.encryptedTokenBalance).to.exist;
    });

    it("should handle large deposit amounts", async function () {
      const largeAmount = 1000000;
      await expect(contract.connect(buyer1).depositTokens(largeAmount))
        .to.emit(contract, "BalanceUpdated")
        .withArgs(buyer1.address);
    });
  });

  // ========================================
  // BUY ORDER CREATION TESTS (7 tests)
  // ========================================
  describe("Buy Order Creation", function () {
    let creditId;

    beforeEach(async function () {
      await contract.connect(issuer1).registerUser();
      await contract.connect(buyer1).registerUser();
      await contract.connect(owner).authorizeIssuer(issuer1.address);

      const verificationHash = ethers.keccak256(ethers.toUtf8Bytes("verification1"));
      await contract.connect(issuer1).issueCarbonCredits(1000, 50, "renewable_energy", verificationHash);
      creditId = 1;
    });

    it("should allow registered user to create buy order", async function () {
      await expect(contract.connect(buyer1).createBuyOrder(creditId, 100, 55))
        .to.emit(contract, "OrderCreated")
        .withArgs(1, buyer1.address, creditId);
    });

    it("should increment order ID correctly", async function () {
      await contract.connect(buyer1).createBuyOrder(creditId, 100, 55);
      await contract.connect(buyer1).createBuyOrder(creditId, 200, 60);

      const stats = await contract.getSystemStats();
      expect(stats.totalOrders).to.equal(2);
    });

    it("should reject order from unregistered user", async function () {
      await expect(
        contract.connect(buyer2).createBuyOrder(creditId, 100, 55)
      ).to.be.revertedWith("User not registered");
    });

    it("should reject order for inactive credit", async function () {
      await expect(
        contract.connect(buyer1).createBuyOrder(999, 100, 55)
      ).to.be.revertedWith("Credit not active");
    });

    it("should reject zero amount order", async function () {
      await expect(
        contract.connect(buyer1).createBuyOrder(creditId, 0, 55)
      ).to.be.revertedWith("Amount must be positive");
    });

    it("should store order information correctly", async function () {
      await contract.connect(buyer1).createBuyOrder(creditId, 100, 55);

      const orderInfo = await contract.getOrderInfo(1);
      expect(orderInfo.buyer).to.equal(buyer1.address);
      expect(orderInfo.seller).to.equal(issuer1.address);
      expect(orderInfo.isActive).to.be.true;
      expect(orderInfo.isFulfilled).to.be.false;
      expect(orderInfo.creditId).to.equal(creditId);
    });

    it("should allow multiple orders from same buyer", async function () {
      await contract.connect(buyer1).createBuyOrder(creditId, 100, 55);
      await contract.connect(buyer1).createBuyOrder(creditId, 200, 60);

      const orderIds = await contract.connect(buyer1).getMyOrderIds();
      expect(orderIds.length).to.equal(2);
    });
  });

  // ========================================
  // TRADE EXECUTION TESTS (6 tests)
  // ========================================
  describe("Trade Execution", function () {
    let creditId, orderId;

    beforeEach(async function () {
      await contract.connect(issuer1).registerUser();
      await contract.connect(buyer1).registerUser();
      await contract.connect(owner).authorizeIssuer(issuer1.address);

      const verificationHash = ethers.keccak256(ethers.toUtf8Bytes("verification1"));
      await contract.connect(issuer1).issueCarbonCredits(1000, 50, "renewable_energy", verificationHash);
      creditId = 1;

      await contract.connect(buyer1).depositTokens(100000);
      await contract.connect(buyer1).createBuyOrder(creditId, 100, 55);
      orderId = 1;
    });

    it("should allow seller to execute trade", async function () {
      await expect(contract.connect(issuer1).executeTrade(orderId))
        .to.emit(contract, "TradeExecuted")
        .withArgs(orderId, buyer1.address, issuer1.address);
    });

    it("should mark order as fulfilled", async function () {
      await contract.connect(issuer1).executeTrade(orderId);

      const orderInfo = await contract.getOrderInfo(orderId);
      expect(orderInfo.isFulfilled).to.be.true;
      expect(orderInfo.isActive).to.be.false;
    });

    it("should reject execution by non-seller", async function () {
      await contract.connect(buyer2).registerUser();

      await expect(
        contract.connect(buyer2).executeTrade(orderId)
      ).to.be.revertedWith("Not the seller");
    });

    it("should reject execution of fulfilled order", async function () {
      await contract.connect(issuer1).executeTrade(orderId);

      await expect(
        contract.connect(issuer1).executeTrade(orderId)
      ).to.be.revertedWith("Order already fulfilled");
    });

    it("should reject execution of inactive order", async function () {
      await contract.connect(buyer1).cancelOrder(orderId);

      await expect(
        contract.connect(issuer1).executeTrade(orderId)
      ).to.be.revertedWith("Order not active");
    });

    it("should emit balance updated events for both parties", async function () {
      const tx = await contract.connect(issuer1).executeTrade(orderId);
      const receipt = await tx.wait();

      // Check for BalanceUpdated events
      const events = receipt.logs.filter((log) => {
        try {
          return contract.interface.parseLog(log).name === "BalanceUpdated";
        } catch (e) {
          return false;
        }
      });

      expect(events.length).to.be.gte(2);
    });
  });

  // ========================================
  // ORDER CANCELLATION TESTS (4 tests)
  // ========================================
  describe("Order Cancellation", function () {
    let creditId, orderId;

    beforeEach(async function () {
      await contract.connect(issuer1).registerUser();
      await contract.connect(buyer1).registerUser();
      await contract.connect(owner).authorizeIssuer(issuer1.address);

      const verificationHash = ethers.keccak256(ethers.toUtf8Bytes("verification1"));
      await contract.connect(issuer1).issueCarbonCredits(1000, 50, "renewable_energy", verificationHash);
      creditId = 1;

      await contract.connect(buyer1).createBuyOrder(creditId, 100, 55);
      orderId = 1;
    });

    it("should allow buyer to cancel order", async function () {
      await contract.connect(buyer1).cancelOrder(orderId);

      const orderInfo = await contract.getOrderInfo(orderId);
      expect(orderInfo.isActive).to.be.false;
    });

    it("should reject cancellation by non-buyer", async function () {
      await expect(
        contract.connect(buyer2).cancelOrder(orderId)
      ).to.be.revertedWith("Not the buyer");
    });

    it("should reject cancellation of inactive order", async function () {
      await contract.connect(buyer1).cancelOrder(orderId);

      await expect(
        contract.connect(buyer1).cancelOrder(orderId)
      ).to.be.revertedWith("Order not active");
    });

    it("should reject cancellation of fulfilled order", async function () {
      await contract.connect(buyer1).depositTokens(100000);
      await contract.connect(issuer1).executeTrade(orderId);

      await expect(
        contract.connect(buyer1).cancelOrder(orderId)
      ).to.be.revertedWith("Order already fulfilled");
    });
  });

  // ========================================
  // VIEW FUNCTIONS TESTS (4 tests)
  // ========================================
  describe("View Functions", function () {
    beforeEach(async function () {
      await contract.connect(buyer1).registerUser();
    });

    it("should return user balances for registered user", async function () {
      const balances = await contract.connect(buyer1).getMyBalances();
      expect(balances.encryptedCreditBalance).to.exist;
      expect(balances.encryptedTokenBalance).to.exist;
    });

    it("should return user credit IDs", async function () {
      const creditIds = await contract.connect(buyer1).getMyCreditIds();
      expect(creditIds).to.be.an("array");
      expect(creditIds.length).to.equal(0);
    });

    it("should return user order IDs", async function () {
      const orderIds = await contract.connect(buyer1).getMyOrderIds();
      expect(orderIds).to.be.an("array");
      expect(orderIds.length).to.equal(0);
    });

    it("should return correct system stats", async function () {
      const stats = await contract.getSystemStats();
      expect(stats.totalCredits).to.equal(0);
      expect(stats.totalOrders).to.equal(0);
    });
  });

  // ========================================
  // VERIFICATION UPDATE TESTS (3 tests)
  // ========================================
  describe("Verification Updates", function () {
    let creditId;

    beforeEach(async function () {
      await contract.connect(issuer1).registerUser();
      await contract.connect(owner).authorizeIssuer(issuer1.address);

      const verificationHash = ethers.keccak256(ethers.toUtf8Bytes("verification1"));
      await contract.connect(issuer1).issueCarbonCredits(1000, 50, "renewable_energy", verificationHash);
      creditId = 1;
    });

    it("should allow issuer to update verification", async function () {
      const newHash = ethers.keccak256(ethers.toUtf8Bytes("verification2"));

      await expect(contract.connect(issuer1).updateVerification(creditId, newHash))
        .to.emit(contract, "VerificationCompleted")
        .withArgs(creditId, newHash);
    });

    it("should reject update from non-issuer", async function () {
      await contract.connect(buyer1).registerUser();
      const newHash = ethers.keccak256(ethers.toUtf8Bytes("verification2"));

      await expect(
        contract.connect(buyer1).updateVerification(creditId, newHash)
      ).to.be.revertedWith("Not the issuer");
    });

    it("should update verification hash correctly", async function () {
      const newHash = ethers.keccak256(ethers.toUtf8Bytes("verification2"));
      await contract.connect(issuer1).updateVerification(creditId, newHash);

      const creditInfo = await contract.getCreditInfo(creditId);
      expect(creditInfo.verificationHash).to.equal(newHash);
    });
  });

  // ========================================
  // EDGE CASES TESTS (3 tests)
  // ========================================
  describe("Edge Cases", function () {
    it("should handle maximum uint32 values", async function () {
      await contract.connect(issuer1).registerUser();
      await contract.connect(owner).authorizeIssuer(issuer1.address);

      const maxUint32 = 4294967295; // 2^32 - 1
      const verificationHash = ethers.keccak256(ethers.toUtf8Bytes("verification1"));

      await expect(
        contract.connect(issuer1).issueCarbonCredits(maxUint32, maxUint32, "test", verificationHash)
      ).to.not.be.reverted;
    });

    it("should handle maximum uint64 deposit", async function () {
      await contract.connect(buyer1).registerUser();

      const maxUint64 = BigInt("18446744073709551615"); // 2^64 - 1

      await expect(
        contract.connect(buyer1).depositTokens(maxUint64)
      ).to.not.be.reverted;
    });

    it("should handle empty project type string", async function () {
      await contract.connect(issuer1).registerUser();
      await contract.connect(owner).authorizeIssuer(issuer1.address);

      const verificationHash = ethers.keccak256(ethers.toUtf8Bytes("verification1"));

      await expect(
        contract.connect(issuer1).issueCarbonCredits(1000, 50, "", verificationHash)
      ).to.not.be.reverted;
    });
  });
});
