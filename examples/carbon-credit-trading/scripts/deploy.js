import { ethers } from "hardhat";

async function main() {
    console.log("Deploying CarbonCreditTrading contract...");

    // Get the ContractFactory and Signers here
    // Use the standard version without FHEVM for local testing
    const CarbonCreditTrading = await ethers.getContractFactory("CarbonCreditTrading");

    // Deploy the contract
    const contract = await CarbonCreditTrading.deploy();

    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();

    console.log("CarbonCreditTrading deployed to:", contractAddress);
    console.log("Contract owner:", await contract.owner());

    // Verify deployment by calling a simple function
    const stats = await contract.getSystemStats();
    console.log("Initial stats - Credits:", stats.totalCredits.toString(), "Orders:", stats.totalOrders.toString());

    // Save deployment info
    const deploymentInfo = {
        network: network.name,
        contractAddress: contractAddress,
        deployer: (await ethers.getSigners())[0].address,
        deploymentTime: new Date().toISOString(),
        blockNumber: await ethers.provider.getBlockNumber()
    };

    console.log("\nDeployment Info:");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    console.log("\n🎉 Deployment completed successfully!");
    console.log(`\n📝 Update your frontend CONTRACT_ADDRESS to: ${contractAddress}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Deployment failed:", error);
        process.exit(1);
    });