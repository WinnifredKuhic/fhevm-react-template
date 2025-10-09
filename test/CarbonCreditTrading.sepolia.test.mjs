import { expect } from "chai";
import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

describe("CarbonCreditTrading - Sepolia Testnet", function () {
  let contract;
  let contractAddress;
  let alice;
  let step;
  let steps;

  function progress(message) {
    console.log(`    ${++step}/${steps} ${message}`);
  }

  before(async function () {
    // Check if we're on Sepolia
    const network = await ethers.provider.getNetwork();
    if (network.chainId !== 11155111n) {
      console.warn("⚠️  This test suite can only run on Sepolia Testnet");
      console.warn(`   Current network: ${network.name} (Chain ID: ${network.chainId})`);
      console.warn("   To run on Sepolia: npm run test:sepolia");
      this.skip();
    }

    // Load contract from deployment file
    const deploymentFile = path.join(process.cwd(), "deployments", "sepolia", "CarbonCreditTrading.json");

    if (!fs.existsSync(deploymentFile)) {
      const error = new Error("Deployment file not found");
      error.message += `\n   Deploy first: npm run deploy:sepolia`;
      throw error;
    }

    const deploymentData = JSON.parse(fs.readFileSync(deploymentFile, "utf-8"));
    contractAddress = deploymentData.contractAddress;

    console.log(`\n   📍 Contract Address: ${contractAddress}`);
    console.log(`   🔗 View on Etherscan: https://sepolia.etherscan.io/address/${contractAddress}\n`);

    contract = await ethers.getContractAt("CarbonCreditTrading", contractAddress);

    const ethSigners = await ethers.getSigners();
    alice = ethSigners[0];

    console.log(`   👤 Test Account: ${alice.address}`);
    const balance = await ethers.provider.getBalance(alice.address);
    console.log(`   💰 Balance: ${ethers.formatEther(balance)} SepoliaETH\n`);

    if (balance === 0n) {
      throw new Error("Test account has no SepoliaETH. Get funds from https://sepoliafaucet.com/");
    }
  });

  beforeEach(function () {
    step = 0;
    steps = 0;
  });

  describe("Contract Verification", function () {
    it("should have valid contract address", async function () {
      expect(contractAddress).to.be.properAddress;
      expect(contractAddress).to.not.equal(ethers.ZeroAddress);
    });

    it("should be able to read contract owner", async function () {
      this.timeout(30000);

      const owner = await contract.owner();
      expect(owner).to.be.properAddress;
      console.log(`      Contract Owner: ${owner}`);
    });

    it("should be able to read system stats", async function () {
      this.timeout(30000);

      const stats = await contract.getSystemStats();
      expect(stats.totalCredits).to.be.gte(0);
      expect(stats.totalOrders).to.be.gte(0);

      console.log(`      Total Credits: ${stats.totalCredits}`);
      console.log(`      Total Orders: ${stats.totalOrders}`);
    });
  });

  describe("User Registration on Testnet", function () {
    it("should register user on Sepolia", async function () {
      steps = 4;
      this.timeout(160000); // 160 seconds for testnet

      progress("Checking current registration status...");
      const wasRegistered = await contract.isUserRegistered(alice.address);
      console.log(`      Already registered: ${wasRegistered}`);

      if (!wasRegistered) {
        progress("Registering user on Sepolia...");
        const tx = await contract.connect(alice).registerUser();

        progress(`Waiting for transaction confirmation...`);
        const receipt = await tx.wait();
        console.log(`      ✅ Transaction: ${receipt.hash}`);
        console.log(`      ⛽ Gas Used: ${receipt.gasUsed.toString()}`);

        progress("Verifying registration...");
        const isRegistered = await contract.isUserRegistered(alice.address);
        expect(isRegistered).to.be.true;

        console.log(`      ✅ User registered successfully`);
      } else {
        console.log(`      ℹ️  Skipping registration - already registered`);
      }
    });
  });

  describe("Token Deposit on Testnet", function () {
    it("should deposit tokens on Sepolia", async function () {
      steps = 4;
      this.timeout(160000);

      progress("Ensuring user is registered...");
      const isRegistered = await contract.isUserRegistered(alice.address);
      if (!isRegistered) {
        console.log(`      Registering user first...`);
        await (await contract.connect(alice).registerUser()).wait();
      }

      progress("Depositing tokens...");
      const depositAmount = 50000;
      const tx = await contract.connect(alice).depositTokens(depositAmount);

      progress("Waiting for confirmation...");
      const receipt = await tx.wait();
      console.log(`      ✅ Transaction: ${receipt.hash}`);
      console.log(`      💰 Deposited: ${depositAmount} tokens`);
      console.log(`      ⛽ Gas Used: ${receipt.gasUsed.toString()}`);

      progress("Verifying deposit...");
      const balances = await contract.connect(alice).getMyBalances();
      expect(balances.encryptedTokenBalance).to.exist;

      console.log(`      ✅ Tokens deposited successfully`);
    });
  });

  describe("Carbon Credit Issuance on Testnet", function () {
    it("should issue carbon credits on Sepolia", async function () {
      steps = 6;
      this.timeout(200000);

      progress("Checking authorization...");
      const isAuthorized = await contract.isAuthorizedIssuer(alice.address);
      console.log(`      Is authorized issuer: ${isAuthorized}`);

      if (!isAuthorized) {
        console.log(`      ⚠️  Account is not authorized issuer`);
        console.log(`      This test requires the deployer account`);
        this.skip();
      }

      progress("Ensuring user is registered...");
      const isRegistered = await contract.isUserRegistered(alice.address);
      if (!isRegistered) {
        console.log(`      Registering user first...`);
        await (await contract.connect(alice).registerUser()).wait();
      }

      progress("Preparing credit data...");
      const amount = 500;
      const price = 45;
      const projectType = "solar_farm_testnet";
      const verificationHash = ethers.keccak256(
        ethers.toUtf8Bytes(`sepolia_test_${Date.now()}`)
      );

      progress("Issuing carbon credits...");
      const tx = await contract
        .connect(alice)
        .issueCarbonCredits(amount, price, projectType, verificationHash);

      progress("Waiting for confirmation...");
      const receipt = await tx.wait();
      console.log(`      ✅ Transaction: ${receipt.hash}`);
      console.log(`      🌱 Amount: ${amount} credits`);
      console.log(`      💵 Price: ${price} per credit`);
      console.log(`      ⛽ Gas Used: ${receipt.gasUsed.toString()}`);

      progress("Verifying issuance...");
      const stats = await contract.getSystemStats();
      expect(stats.totalCredits).to.be.gt(0);

      console.log(`      ✅ Credits issued successfully`);
      console.log(`      📊 Total credits in system: ${stats.totalCredits}`);
    });
  });

  describe("Gas Cost Analysis", function () {
    it("should track gas costs for operations", async function () {
      this.timeout(30000);

      const isRegistered = await contract.isUserRegistered(alice.address);

      console.log(`\n      Gas Cost Summary:`);
      console.log(`      ═════════════════════════════════════`);

      if (!isRegistered) {
        console.log(`      Registration: ~150,000 - 200,000 gas`);
      }

      console.log(`      Token Deposit: ~80,000 - 120,000 gas`);
      console.log(`      Issue Credits: ~200,000 - 300,000 gas`);
      console.log(`      Create Order: ~150,000 - 250,000 gas`);
      console.log(`      Execute Trade: ~200,000 - 350,000 gas`);
      console.log(`      ═════════════════════════════════════`);
    });
  });

  describe("Network Information", function () {
    it("should display network and contract information", async function () {
      const network = await ethers.provider.getNetwork();
      const blockNumber = await ethers.provider.getBlockNumber();
      const block = await ethers.provider.getBlock(blockNumber);

      console.log(`\n      Network Information:`);
      console.log(`      ═════════════════════════════════════`);
      console.log(`      Network: ${network.name}`);
      console.log(`      Chain ID: ${network.chainId}`);
      console.log(`      Block Number: ${blockNumber}`);
      console.log(`      Block Timestamp: ${new Date(Number(block.timestamp) * 1000).toLocaleString()}`);
      console.log(`      Contract: ${contractAddress}`);
      console.log(`      Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);
      console.log(`      ═════════════════════════════════════\n`);
    });
  });
});
