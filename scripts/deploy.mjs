import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🚀 Starting Carbon Credit Trading Platform Deployment...\n");

  // Get deployment network
  const network = await ethers.provider.getNetwork();
  console.log(`📡 Network: ${network.name} (Chain ID: ${network.chainId})`);

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`👤 Deployer Address: ${deployer.address}`);

  // Check deployer balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Deployer Balance: ${ethers.formatEther(balance)} ETH\n`);

  if (balance === 0n) {
    console.error("❌ Error: Deployer account has no funds!");
    process.exit(1);
  }

  // Deploy CarbonCreditTrading contract
  console.log("📄 Deploying CarbonCreditTrading contract...");
  const CarbonCreditTrading = await ethers.getContractFactory("CarbonCreditTrading");

  const startTime = Date.now();
  const carbonCreditTrading = await CarbonCreditTrading.deploy();
  await carbonCreditTrading.waitForDeployment();
  const deployTime = ((Date.now() - startTime) / 1000).toFixed(2);

  const contractAddress = await carbonCreditTrading.getAddress();
  console.log(`✅ CarbonCreditTrading deployed to: ${contractAddress}`);
  console.log(`⏱️  Deployment time: ${deployTime}s\n`);

  // Get contract owner
  const owner = await carbonCreditTrading.owner();
  console.log(`👑 Contract Owner: ${owner}`);

  // Verify deployment by calling system stats
  const stats = await carbonCreditTrading.getSystemStats();
  console.log(`📊 Initial Stats - Credits: ${stats.totalCredits}, Orders: ${stats.totalOrders}\n`);

  // Prepare deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: Number(network.chainId),
    contractName: "CarbonCreditTrading",
    contractAddress: contractAddress,
    deployer: deployer.address,
    owner: owner,
    deploymentTime: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber(),
    transactionHash: carbonCreditTrading.deploymentTransaction()?.hash || "N/A",
    compiler: {
      version: "0.8.24",
      optimizer: true,
      runs: 200,
    },
  };

  // Save deployment info to file
  const deploymentsDir = path.join(process.cwd(), "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const networkDir = path.join(deploymentsDir, network.name);
  if (!fs.existsSync(networkDir)) {
    fs.mkdirSync(networkDir, { recursive: true });
  }

  const deploymentFile = path.join(networkDir, "CarbonCreditTrading.json");
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log(`📝 Deployment info saved to: ${deploymentFile}`);

  // Display Etherscan link
  if (network.chainId === 11155111n) {
    console.log(`\n🔍 Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);
  }

  // Display next steps
  console.log("\n✨ Deployment Complete!\n");
  console.log("📋 Next Steps:");
  console.log("1. Verify contract on Etherscan:");
  console.log(`   npm run verify:sepolia ${contractAddress}`);
  console.log("2. Interact with contract:");
  console.log("   npm run interact:sepolia");
  console.log("3. Run simulation:");
  console.log("   npm run simulate:sepolia\n");

  return {
    contract: carbonCreditTrading,
    address: contractAddress,
    deploymentInfo,
  };
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment Failed:");
    console.error(error);
    process.exit(1);
  });