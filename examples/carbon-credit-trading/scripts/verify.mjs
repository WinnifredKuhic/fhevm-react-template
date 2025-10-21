import { run } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🔍 Starting Contract Verification...\n");

  // Get contract address from command line or deployment file
  const contractAddress = process.argv[2];

  if (!contractAddress) {
    // Try to load from deployment file
    const network = process.env.HARDHAT_NETWORK || "sepolia";
    const deploymentFile = path.join(
      process.cwd(),
      "deployments",
      network,
      "CarbonCreditTrading.json"
    );

    if (!fs.existsSync(deploymentFile)) {
      console.error("❌ Error: No contract address provided and no deployment file found.");
      console.log("\nUsage:");
      console.log("  npm run verify:sepolia <CONTRACT_ADDRESS>");
      console.log("  or deploy first: npm run deploy:sepolia\n");
      process.exit(1);
    }

    const deploymentData = JSON.parse(fs.readFileSync(deploymentFile, "utf-8"));
    const address = deploymentData.contractAddress;

    console.log(`📄 Loading deployment info from: ${deploymentFile}`);
    console.log(`📍 Contract Address: ${address}`);
    console.log(`📡 Network: ${deploymentData.network}\n`);

    await verifyContract(address, []);
  } else {
    console.log(`📍 Contract Address: ${contractAddress}\n`);
    await verifyContract(contractAddress, []);
  }
}

async function verifyContract(address, constructorArguments) {
  try {
    console.log("⏳ Verifying contract on Etherscan...");
    console.log("This may take a few moments...\n");

    await run("verify:verify", {
      address: address,
      constructorArguments: constructorArguments,
    });

    console.log("\n✅ Contract verified successfully!");
    console.log(`🔗 View on Etherscan: https://sepolia.etherscan.io/address/${address}#code\n`);
  } catch (error) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("✅ Contract is already verified!");
      console.log(`🔗 View on Etherscan: https://sepolia.etherscan.io/address/${address}#code\n`);
    } else {
      console.error("\n❌ Verification failed:");
      console.error(error.message);
      console.log("\nCommon issues:");
      console.log("1. Make sure ETHERSCAN_API_KEY is set in .env file");
      console.log("2. Wait a minute after deployment before verifying");
      console.log("3. Ensure the contract was deployed with the same compiler settings\n");
      process.exit(1);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Verification script error:");
    console.error(error);
    process.exit(1);
  });
