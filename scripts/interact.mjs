import { ethers } from "hardhat";
import fs from "fs";
import path from "path";
import readline from "readline";

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

let contract;
let signer;
let contractAddress;

async function main() {
  console.log("🔄 Carbon Credit Trading - Interactive CLI\n");

  // Load contract
  await loadContract();

  // Main menu loop
  let running = true;
  while (running) {
    console.log("\n═══════════════════════════════════════");
    console.log("           MAIN MENU");
    console.log("═══════════════════════════════════════");
    console.log("1.  Register User");
    console.log("2.  Check User Registration");
    console.log("3.  Authorize Issuer");
    console.log("4.  Issue Carbon Credits");
    console.log("5.  Deposit Tokens");
    console.log("6.  Create Buy Order");
    console.log("7.  Execute Trade");
    console.log("8.  View My Balances");
    console.log("9.  View My Credits");
    console.log("10. View My Orders");
    console.log("11. View Credit Info");
    console.log("12. View Order Info");
    console.log("13. Cancel Order");
    console.log("14. View System Stats");
    console.log("15. Check Contract Owner");
    console.log("0.  Exit");
    console.log("═══════════════════════════════════════\n");

    const choice = await question("Select an option: ");

    try {
      switch (choice.trim()) {
        case "1":
          await registerUser();
          break;
        case "2":
          await checkUserRegistration();
          break;
        case "3":
          await authorizeIssuer();
          break;
        case "4":
          await issueCarbonCredits();
          break;
        case "5":
          await depositTokens();
          break;
        case "6":
          await createBuyOrder();
          break;
        case "7":
          await executeTrade();
          break;
        case "8":
          await viewMyBalances();
          break;
        case "9":
          await viewMyCredits();
          break;
        case "10":
          await viewMyOrders();
          break;
        case "11":
          await viewCreditInfo();
          break;
        case "12":
          await viewOrderInfo();
          break;
        case "13":
          await cancelOrder();
          break;
        case "14":
          await viewSystemStats();
          break;
        case "15":
          await checkOwner();
          break;
        case "0":
          console.log("\n👋 Goodbye!\n");
          running = false;
          break;
        default:
          console.log("\n❌ Invalid option. Please try again.");
      }
    } catch (error) {
      console.error("\n❌ Error:", error.message);
    }

    if (running) {
      await question("\nPress Enter to continue...");
    }
  }

  rl.close();
}

async function loadContract() {
  const network = process.env.HARDHAT_NETWORK || "sepolia";
  const deploymentFile = path.join(
    process.cwd(),
    "deployments",
    network,
    "CarbonCreditTrading.json"
  );

  if (!fs.existsSync(deploymentFile)) {
    console.error("❌ Error: Deployment file not found!");
    console.log(`Please deploy the contract first: npm run deploy:${network}\n`);
    process.exit(1);
  }

  const deploymentData = JSON.parse(fs.readFileSync(deploymentFile, "utf-8"));
  contractAddress = deploymentData.contractAddress;

  [signer] = await ethers.getSigners();
  contract = await ethers.getContractAt("CarbonCreditTrading", contractAddress, signer);

  console.log(`📍 Contract Address: ${contractAddress}`);
  console.log(`👤 Your Address: ${signer.address}`);
  const balance = await ethers.provider.getBalance(signer.address);
  console.log(`💰 Your Balance: ${ethers.formatEther(balance)} ETH`);
}

async function registerUser() {
  console.log("\n📝 Registering user...");
  const tx = await contract.registerUser();
  console.log("⏳ Transaction sent:", tx.hash);
  await tx.wait();
  console.log("✅ User registered successfully!");
}

async function checkUserRegistration() {
  const address = await question("\nEnter address to check (or press Enter for your address): ");
  const targetAddress = address.trim() || signer.address;
  const isRegistered = await contract.isUserRegistered(targetAddress);
  console.log(`\n${isRegistered ? "✅" : "❌"} Address ${targetAddress} is ${isRegistered ? "" : "NOT "}registered`);
}

async function authorizeIssuer() {
  const address = await question("\nEnter issuer address to authorize: ");
  console.log("🔐 Authorizing issuer...");
  const tx = await contract.authorizeIssuer(address.trim());
  console.log("⏳ Transaction sent:", tx.hash);
  await tx.wait();
  console.log("✅ Issuer authorized successfully!");
}

async function issueCarbonCredits() {
  const amount = await question("\nEnter credit amount: ");
  const price = await question("Enter price per credit: ");
  const projectType = await question("Enter project type (e.g., renewable_energy): ");
  const verificationHash = await question("Enter verification hash (32 bytes, e.g., 0x...): ");

  console.log("\n🌱 Issuing carbon credits...");
  const tx = await contract.issueCarbonCredits(
    parseInt(amount),
    parseInt(price),
    projectType,
    verificationHash
  );
  console.log("⏳ Transaction sent:", tx.hash);
  const receipt = await tx.wait();

  // Extract creditId from event
  const event = receipt.logs.find((log) => {
    try {
      return contract.interface.parseLog(log).name === "CreditIssued";
    } catch (e) {
      return false;
    }
  });

  if (event) {
    const parsedEvent = contract.interface.parseLog(event);
    console.log(`✅ Credits issued! Credit ID: ${parsedEvent.args.creditId}`);
  } else {
    console.log("✅ Credits issued successfully!");
  }
}

async function depositTokens() {
  const amount = await question("\nEnter token amount to deposit: ");
  console.log("\n💰 Depositing tokens...");
  const tx = await contract.depositTokens(parseInt(amount));
  console.log("⏳ Transaction sent:", tx.hash);
  await tx.wait();
  console.log("✅ Tokens deposited successfully!");
}

async function createBuyOrder() {
  const creditId = await question("\nEnter credit ID: ");
  const amount = await question("Enter amount to buy: ");
  const maxPrice = await question("Enter maximum price per credit: ");

  console.log("\n🛒 Creating buy order...");
  const tx = await contract.createBuyOrder(parseInt(creditId), parseInt(amount), parseInt(maxPrice));
  console.log("⏳ Transaction sent:", tx.hash);
  const receipt = await tx.wait();

  // Extract orderId from event
  const event = receipt.logs.find((log) => {
    try {
      return contract.interface.parseLog(log).name === "OrderCreated";
    } catch (e) {
      return false;
    }
  });

  if (event) {
    const parsedEvent = contract.interface.parseLog(event);
    console.log(`✅ Order created! Order ID: ${parsedEvent.args.orderId}`);
  } else {
    console.log("✅ Order created successfully!");
  }
}

async function executeTrade() {
  const orderId = await question("\nEnter order ID to execute: ");
  console.log("\n🤝 Executing trade...");
  const tx = await contract.executeTrade(parseInt(orderId));
  console.log("⏳ Transaction sent:", tx.hash);
  await tx.wait();
  console.log("✅ Trade executed successfully!");
}

async function viewMyBalances() {
  console.log("\n💼 Fetching your balances...");
  try {
    const balances = await contract.getMyBalances();
    console.log("\n📊 Your Balances (Encrypted):");
    console.log(`   Credit Balance: ${balances.encryptedCreditBalance}`);
    console.log(`   Token Balance: ${balances.encryptedTokenBalance}`);
    console.log("\nℹ️  Note: These are encrypted values. Decrypt them using FHEVM client.");
  } catch (error) {
    console.log("❌ You must be registered to view balances.");
  }
}

async function viewMyCredits() {
  console.log("\n🌱 Fetching your credits...");
  const creditIds = await contract.getMyCreditIds();
  if (creditIds.length === 0) {
    console.log("No credits found.");
  } else {
    console.log(`\nYour Credit IDs: ${creditIds.join(", ")}`);
  }
}

async function viewMyOrders() {
  console.log("\n📋 Fetching your orders...");
  const orderIds = await contract.getMyOrderIds();
  if (orderIds.length === 0) {
    console.log("No orders found.");
  } else {
    console.log(`\nYour Order IDs: ${orderIds.join(", ")}`);
  }
}

async function viewCreditInfo() {
  const creditId = await question("\nEnter credit ID: ");
  console.log("\n🔍 Fetching credit info...");
  const info = await contract.getCreditInfo(parseInt(creditId));
  console.log("\n📄 Credit Information:");
  console.log(`   Issuer: ${info.issuer}`);
  console.log(`   Active: ${info.isActive}`);
  console.log(`   Timestamp: ${new Date(Number(info.timestamp) * 1000).toLocaleString()}`);
  console.log(`   Project Type: ${info.projectType}`);
  console.log(`   Verification Hash: ${info.verificationHash}`);
}

async function viewOrderInfo() {
  const orderId = await question("\nEnter order ID: ");
  console.log("\n🔍 Fetching order info...");
  const info = await contract.getOrderInfo(parseInt(orderId));
  console.log("\n📄 Order Information:");
  console.log(`   Buyer: ${info.buyer}`);
  console.log(`   Seller: ${info.seller}`);
  console.log(`   Active: ${info.isActive}`);
  console.log(`   Fulfilled: ${info.isFulfilled}`);
  console.log(`   Timestamp: ${new Date(Number(info.timestamp) * 1000).toLocaleString()}`);
  console.log(`   Credit ID: ${info.creditId}`);
}

async function cancelOrder() {
  const orderId = await question("\nEnter order ID to cancel: ");
  console.log("\n❌ Cancelling order...");
  const tx = await contract.cancelOrder(parseInt(orderId));
  console.log("⏳ Transaction sent:", tx.hash);
  await tx.wait();
  console.log("✅ Order cancelled successfully!");
}

async function viewSystemStats() {
  console.log("\n📊 Fetching system stats...");
  const stats = await contract.getSystemStats();
  console.log("\n📈 System Statistics:");
  console.log(`   Total Credits: ${stats.totalCredits}`);
  console.log(`   Total Orders: ${stats.totalOrders}`);
}

async function checkOwner() {
  console.log("\n👑 Fetching contract owner...");
  const owner = await contract.owner();
  console.log(`\nContract Owner: ${owner}`);
  console.log(`You are ${owner === signer.address ? "" : "NOT "}the owner`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Script error:");
    console.error(error);
    rl.close();
    process.exit(1);
  });
