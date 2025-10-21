import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🎬 Starting Carbon Credit Trading Simulation...\n");

  // Load contract
  const { contract, signers } = await loadContract();
  const [deployer, issuer1, issuer2, buyer1, buyer2, buyer3] = signers;

  console.log("👥 Simulation Participants:");
  console.log(`   Deployer: ${deployer.address}`);
  console.log(`   Issuer 1: ${issuer1.address}`);
  console.log(`   Issuer 2: ${issuer2.address}`);
  console.log(`   Buyer 1:  ${buyer1.address}`);
  console.log(`   Buyer 2:  ${buyer2.address}`);
  console.log(`   Buyer 3:  ${buyer3.address}\n`);

  // Step 1: Register all users
  console.log("═══════════════════════════════════════");
  console.log("STEP 1: User Registration");
  console.log("═══════════════════════════════════════");
  await registerAllUsers(contract, [deployer, issuer1, issuer2, buyer1, buyer2, buyer3]);

  // Step 2: Authorize issuers
  console.log("\n═══════════════════════════════════════");
  console.log("STEP 2: Authorize Carbon Credit Issuers");
  console.log("═══════════════════════════════════════");
  await authorizeIssuers(contract, deployer, [issuer1.address, issuer2.address]);

  // Step 3: Deposit tokens for buyers
  console.log("\n═══════════════════════════════════════");
  console.log("STEP 3: Deposit Trading Tokens");
  console.log("═══════════════════════════════════════");
  await depositTokensForBuyers(contract, [
    { signer: buyer1, amount: 100000 },
    { signer: buyer2, amount: 150000 },
    { signer: buyer3, amount: 80000 },
  ]);

  // Step 4: Issue carbon credits
  console.log("\n═══════════════════════════════════════");
  console.log("STEP 4: Issue Carbon Credits");
  console.log("═══════════════════════════════════════");
  const creditIds = await issueCredits(contract, [
    {
      signer: issuer1,
      amount: 1000,
      price: 50,
      projectType: "renewable_energy",
      description: "Solar Farm Project in California",
    },
    {
      signer: issuer1,
      amount: 500,
      price: 75,
      projectType: "reforestation",
      description: "Amazon Rainforest Restoration",
    },
    {
      signer: issuer2,
      amount: 2000,
      price: 40,
      projectType: "wind_energy",
      description: "Offshore Wind Farm Project",
    },
  ]);

  // Step 5: Create buy orders
  console.log("\n═══════════════════════════════════════");
  console.log("STEP 5: Create Buy Orders");
  console.log("═══════════════════════════════════════");
  const orderIds = await createBuyOrders(contract, [
    { signer: buyer1, creditId: creditIds[0], amount: 100, maxPrice: 55 },
    { signer: buyer2, creditId: creditIds[1], amount: 200, maxPrice: 80 },
    { signer: buyer3, creditId: creditIds[2], amount: 500, maxPrice: 45 },
    { signer: buyer1, creditId: creditIds[2], amount: 300, maxPrice: 42 },
  ]);

  // Step 6: Execute trades
  console.log("\n═══════════════════════════════════════");
  console.log("STEP 6: Execute Trades");
  console.log("═══════════════════════════════════════");
  await executeTrades(contract, [
    { orderId: orderIds[0], seller: issuer1 },
    { orderId: orderIds[1], seller: issuer1 },
    { orderId: orderIds[2], seller: issuer2 },
  ]);

  // Step 7: Cancel an order
  console.log("\n═══════════════════════════════════════");
  console.log("STEP 7: Cancel Order");
  console.log("═══════════════════════════════════════");
  await cancelOrderDemo(contract, orderIds[3], buyer1);

  // Step 8: View system statistics
  console.log("\n═══════════════════════════════════════");
  console.log("STEP 8: Final System Statistics");
  console.log("═══════════════════════════════════════");
  await viewFinalStats(contract);

  // Step 9: View user balances
  console.log("\n═══════════════════════════════════════");
  console.log("STEP 9: User Balances");
  console.log("═══════════════════════════════════════");
  await viewUserBalances(contract, [
    { name: "Issuer 1", signer: issuer1 },
    { name: "Buyer 1", signer: buyer1 },
    { name: "Buyer 2", signer: buyer2 },
  ]);

  console.log("\n✅ Simulation Complete!\n");
}

async function loadContract() {
  const network = process.env.HARDHAT_NETWORK || "localhost";
  const deploymentFile = path.join(
    process.cwd(),
    "deployments",
    network,
    "CarbonCreditTrading.json"
  );

  let contractAddress;

  if (fs.existsSync(deploymentFile)) {
    const deploymentData = JSON.parse(fs.readFileSync(deploymentFile, "utf-8"));
    contractAddress = deploymentData.contractAddress;
    console.log(`📄 Loaded contract from deployment file`);
  } else {
    console.log("⚠️  No deployment file found. Deploying new contract...\n");
    const CarbonCreditTrading = await ethers.getContractFactory("CarbonCreditTrading");
    const carbonCreditTrading = await CarbonCreditTrading.deploy();
    await carbonCreditTrading.waitForDeployment();
    contractAddress = await carbonCreditTrading.getAddress();
    console.log(`✅ Contract deployed to: ${contractAddress}\n`);
  }

  const signers = await ethers.getSigners();
  const contract = await ethers.getContractAt("CarbonCreditTrading", contractAddress);

  console.log(`📍 Contract Address: ${contractAddress}\n`);

  return { contract, signers };
}

async function registerAllUsers(contract, signers) {
  for (let i = 0; i < signers.length; i++) {
    const userContract = contract.connect(signers[i]);
    const isRegistered = await userContract.isUserRegistered(signers[i].address);

    if (!isRegistered) {
      console.log(`📝 Registering user ${i + 1}: ${signers[i].address.slice(0, 10)}...`);
      const tx = await userContract.registerUser();
      await tx.wait();
      console.log(`   ✅ Registered`);
    } else {
      console.log(`   ℹ️  User ${i + 1} already registered`);
    }
  }
}

async function authorizeIssuers(contract, deployer, issuerAddresses) {
  const deployerContract = contract.connect(deployer);

  for (const issuerAddress of issuerAddresses) {
    const isAuthorized = await deployerContract.isAuthorizedIssuer(issuerAddress);

    if (!isAuthorized) {
      console.log(`🔐 Authorizing issuer: ${issuerAddress.slice(0, 10)}...`);
      const tx = await deployerContract.authorizeIssuer(issuerAddress);
      await tx.wait();
      console.log(`   ✅ Authorized`);
    } else {
      console.log(`   ℹ️  Issuer already authorized`);
    }
  }
}

async function depositTokensForBuyers(contract, buyers) {
  for (const buyer of buyers) {
    const buyerContract = contract.connect(buyer.signer);
    console.log(`💰 ${buyer.signer.address.slice(0, 10)}... depositing ${buyer.amount} tokens`);
    const tx = await buyerContract.depositTokens(buyer.amount);
    await tx.wait();
    console.log(`   ✅ Deposited`);
  }
}

async function issueCredits(contract, credits) {
  const creditIds = [];

  for (let i = 0; i < credits.length; i++) {
    const credit = credits[i];
    const issuerContract = contract.connect(credit.signer);

    // Generate verification hash
    const verificationHash = ethers.keccak256(
      ethers.toUtf8Bytes(`${credit.projectType}_${credit.description}_${Date.now()}`)
    );

    console.log(`🌱 Credit ${i + 1}: ${credit.description}`);
    console.log(`   Amount: ${credit.amount}, Price: ${credit.price}, Type: ${credit.projectType}`);

    const tx = await issuerContract.issueCarbonCredits(
      credit.amount,
      credit.price,
      credit.projectType,
      verificationHash
    );

    const receipt = await tx.wait();

    // Extract creditId from event
    const event = receipt.logs.find((log) => {
      try {
        return contract.interface.parseLog(log).name === "CreditIssued";
      } catch (e) {
        return false;
      }
    });

    let creditId;
    if (event) {
      const parsedEvent = contract.interface.parseLog(event);
      creditId = parsedEvent.args.creditId;
      creditIds.push(creditId);
      console.log(`   ✅ Issued - Credit ID: ${creditId}`);
    } else {
      console.log(`   ✅ Issued`);
    }
  }

  return creditIds;
}

async function createBuyOrders(contract, orders) {
  const orderIds = [];

  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];
    const buyerContract = contract.connect(order.signer);

    console.log(`🛒 Order ${i + 1}: Buyer ${order.signer.address.slice(0, 10)}...`);
    console.log(`   Credit ID: ${order.creditId}, Amount: ${order.amount}, Max Price: ${order.maxPrice}`);

    const tx = await buyerContract.createBuyOrder(order.creditId, order.amount, order.maxPrice);
    const receipt = await tx.wait();

    // Extract orderId from event
    const event = receipt.logs.find((log) => {
      try {
        return contract.interface.parseLog(log).name === "OrderCreated";
      } catch (e) {
        return false;
      }
    });

    let orderId;
    if (event) {
      const parsedEvent = contract.interface.parseLog(event);
      orderId = parsedEvent.args.orderId;
      orderIds.push(orderId);
      console.log(`   ✅ Created - Order ID: ${orderId}`);
    } else {
      console.log(`   ✅ Created`);
    }
  }

  return orderIds;
}

async function executeTrades(contract, trades) {
  for (let i = 0; i < trades.length; i++) {
    const trade = trades[i];
    const sellerContract = contract.connect(trade.seller);

    console.log(`🤝 Trade ${i + 1}: Executing Order ID ${trade.orderId}`);
    console.log(`   Seller: ${trade.seller.address.slice(0, 10)}...`);

    try {
      const tx = await sellerContract.executeTrade(trade.orderId);
      await tx.wait();
      console.log(`   ✅ Trade Executed`);
    } catch (error) {
      console.log(`   ❌ Trade Failed: ${error.message.split("\n")[0]}`);
    }
  }
}

async function cancelOrderDemo(contract, orderId, buyer) {
  const buyerContract = contract.connect(buyer);

  console.log(`❌ Cancelling Order ID: ${orderId}`);
  console.log(`   Buyer: ${buyer.address.slice(0, 10)}...`);

  try {
    const tx = await buyerContract.cancelOrder(orderId);
    await tx.wait();
    console.log(`   ✅ Order Cancelled`);
  } catch (error) {
    console.log(`   ❌ Cancellation Failed: ${error.message.split("\n")[0]}`);
  }
}

async function viewFinalStats(contract) {
  const stats = await contract.getSystemStats();
  console.log(`📊 Total Credits Issued: ${stats.totalCredits}`);
  console.log(`📊 Total Orders Created: ${stats.totalOrders}`);

  const owner = await contract.owner();
  console.log(`👑 Contract Owner: ${owner.slice(0, 10)}...`);
}

async function viewUserBalances(contract, users) {
  for (const user of users) {
    const userContract = contract.connect(user.signer);

    try {
      const balances = await userContract.getMyBalances();
      console.log(`\n💼 ${user.name} (${user.signer.address.slice(0, 10)}...):`);
      console.log(`   Encrypted Credit Balance: ${balances.encryptedCreditBalance}`);
      console.log(`   Encrypted Token Balance: ${balances.encryptedTokenBalance}`);

      const creditIds = await userContract.getMyCreditIds();
      const orderIds = await userContract.getMyOrderIds();
      console.log(`   My Credit IDs: [${creditIds.join(", ")}]`);
      console.log(`   My Order IDs: [${orderIds.join(", ")}]`);
    } catch (error) {
      console.log(`\n💼 ${user.name}: Not registered or error fetching data`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Simulation failed:");
    console.error(error);
    process.exit(1);
  });
