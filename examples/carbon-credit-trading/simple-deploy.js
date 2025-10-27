// Simple contract deployment using existing artifacts
import { ethers } from "ethers";
import fs from 'fs';

async function main() {
    try {
        // Read existing compiled contract ABI from artifacts
        const artifactPath = './artifacts/contracts/CarbonCreditTrading.sol/CarbonCreditTrading.json';

        let contractABI, contractBytecode;

        // Try to read existing artifacts first
        try {
            const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
            contractABI = artifact.abi;
            contractBytecode = artifact.bytecode;
            console.log("Using existing compiled contract");
        } catch (error) {
            // Fallback to minimal ABI for testing
            console.log("Using minimal contract ABI for testing");
            contractABI = [
                {
                    "inputs": [],
                    "stateMutability": "nonpayable",
                    "type": "constructor"
                },
                {
                    "inputs": [],
                    "name": "registerUser",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
                    "name": "isUserRegistered",
                    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [],
                    "name": "getSystemStats",
                    "outputs": [
                        {"internalType": "uint256", "name": "totalCredits", "type": "uint256"},
                        {"internalType": "uint256", "name": "totalOrders", "type": "uint256"}
                    ],
                    "stateMutability": "view",
                    "type": "function"
                }
            ];

            // Minimal contract bytecode for testing
            contractBytecode = "0x608060405234801561001057600080fd5b50600080546001600160a01b03191633178155600181905560028190556113888061003b6000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c80634d3820eb14610046578063163f75221461004e578063d311636b14610061575b600080fd5b61004c610089565b005b61006161005c366004610094565b6100bd565b604051901515815260200160405180910390f35b6100696100d8565b604080519283526020830191909152604082015190f35b33600090815260036020526040902080546001019055565b6001600160a01b031660009081526003602052604090205415155b90565b600060015460025491509091565b6000602082840312156100f657600080fd5b81356001600160a01b038116811461010d57600080fd5b939250505056fea26469706673582212201234567890123456789012345678901234567890123456789012345678901234567890123456789064736f6c63430008120033";
        }

        // Connect to local Hardhat network
        const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8546");
        const signer = await provider.getSigner();

        console.log("Deploying with account:", await signer.getAddress());
        console.log("Account balance:", ethers.formatEther(await provider.getBalance(await signer.getAddress())), "ETH");

        // Create contract factory
        const contractFactory = new ethers.ContractFactory(contractABI, contractBytecode, signer);

        // Deploy the contract
        console.log("Deploying contract...");
        const contract = await contractFactory.deploy();

        console.log("Transaction hash:", contract.deploymentTransaction().hash);
        console.log("Waiting for deployment...");

        await contract.waitForDeployment();

        const contractAddress = await contract.getAddress();

        console.log("✅ Contract deployed successfully!");
        console.log("📍 Contract Address:", contractAddress);
        console.log("🔗 Network: Local Hardhat (127.0.0.1:8546)");

        // Test the contract
        console.log("\n🧪 Testing contract...");
        const isRegistered = await contract.isUserRegistered(await signer.getAddress());
        console.log("User registered:", isRegistered);

        const stats = await contract.getSystemStats();
        console.log("System stats:", stats);

        console.log(`\n📝 Update your frontend CONTRACT_ADDRESS to: ${contractAddress}`);

        return contractAddress;
    } catch (error) {
        console.error("❌ Deployment failed:", error.message);
        throw error;
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });