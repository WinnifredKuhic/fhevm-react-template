# Deployment Guide - Carbon Credit Trading Platform

## Overview

This guide provides step-by-step instructions for deploying the Carbon Credit Trading Platform to the Sepolia testnet using Hardhat.

## Prerequisites

### Required Software

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **Git**: Latest version
- **MetaMask**: Browser extension with Sepolia testnet configured

### Required Accounts

1. **Infura/Alchemy Account**: For RPC access
   - Sign up at https://infura.io/ or https://www.alchemy.com/
   - Create a project and obtain API key

2. **Etherscan Account**: For contract verification
   - Sign up at https://etherscan.io/
   - Generate API key from account settings

3. **Test Wallet**: With Sepolia ETH
   - Create new wallet in MetaMask (DO NOT use mainnet wallet)
   - Export private key for deployment

## Setup Steps

### 1. Install Dependencies

```bash
# Navigate to project directory
cd fhevm-react-template

# Install all dependencies
npm install

# Verify installation
npm list --depth=0
```

**Expected output:**
```
fhevm-react-template@1.0.0
├── @fhevm/solidity@0.8.0
├── @nomicfoundation/hardhat-toolbox@6.1.0
├── chai@4.3.0
├── dotenv@16.4.5
├── eslint@8.57.0
├── ethers@6.15.0
├── hardhat@3.0.6
├── husky@9.0.0
├── prettier@3.2.0
├── prettier-plugin-solidity@1.3.0
└── solhint@5.0.0
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your credentials
nano .env  # or use your preferred editor
```

**Required environment variables:**

```env
# Network Configuration
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY

# Security Configuration
OWNER_ADDRESS=0xYOUR_OWNER_ADDRESS
PAUSER_ADDRESS=0xYOUR_PAUSER_ADDRESS

# Optional Settings
REPORT_GAS=true
OPTIMIZER_RUNS=800
```

**Important security notes:**
- ⚠️ Never commit `.env` file to version control
- ⚠️ Use a dedicated test wallet (not your main wallet)
- ⚠️ Keep private keys secure
- ⚠️ Add `.env` to `.gitignore`

### 3. Get Sepolia Test ETH

You'll need Sepolia ETH for deployment (~0.1 ETH recommended).

**Sepolia Faucets:**

1. **Alchemy Sepolia Faucet**
   - URL: https://www.alchemy.com/faucets/ethereum-sepolia
   - Requirements: Alchemy account
   - Amount: 0.5 ETH per day

2. **Infura Sepolia Faucet**
   - URL: https://www.infura.io/faucet/sepolia
   - Requirements: Infura account
   - Amount: 0.5 ETH per day

3. **Sepolia PoW Faucet**
   - URL: https://sepolia-faucet.pk910.de/
   - Requirements: Mining (browser-based)
   - Amount: Variable based on mining

**Verify your balance:**
```bash
# Check balance using Ethers.js
node -e "const ethers = require('ethers'); const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL); provider.getBalance(process.env.OWNER_ADDRESS).then(b => console.log('Balance:', ethers.formatEther(b), 'ETH'));"
```

### 4. Compile Contracts

```bash
# Clean previous artifacts
npm run clean

# Compile contracts
npm run compile
```

**Expected output:**
```
Compiled 1 Solidity file successfully (evm target: cancun).
Generating typings for: 1 artifacts in dir: typechain-types
Successfully generated 5 typings!
```

**Verify compilation:**
```bash
# Check artifacts
ls artifacts/contracts/CarbonCreditTrading.sol/

# Expected files:
# CarbonCreditTrading.json
# CarbonCreditTrading.dbg.json
```

### 5. Run Tests (Optional but Recommended)

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run with gas report
npm run test:gas
```

**Expected results:**
```
  CarbonCreditTrading
    ✓ should deploy successfully (1234ms)
    ✓ should register users (567ms)
    ✓ should authorize issuers (432ms)
    ... (60 more tests)

  60 passing (45s)
```

## Deployment

### Deploy to Sepolia

```bash
# Deploy contract
npm run deploy:sepolia
```

**Deployment process:**

1. **Network verification**
   ```
   🌐 Deploying to network: sepolia
   📍 Chain ID: 11155111
   👤 Deployer: 0x1234...
   💰 Balance: 0.5 ETH
   ```

2. **Contract deployment**
   ```
   ✅ Deploying CarbonCreditTrading...
   ⏳ Waiting for deployment...
   📝 Transaction hash: 0xabcd...
   ⏱️  Deployment time: 45.2 seconds
   ```

3. **Deployment confirmation**
   ```
   ✅ Contract deployed successfully!

   📍 Contract Address: 0x5678...
   🌐 Network: sepolia (11155111)
   👤 Deployer: 0x1234...
   💰 Deployment Cost: 0.0234 ETH
   ⛽ Gas Used: 3,456,789
   🔗 Etherscan: https://sepolia.etherscan.io/address/0x5678...
   ```

4. **Artifact saving**
   ```
   💾 Saving deployment artifacts...
   📁 Saved to: deployments/sepolia/CarbonCreditTrading.json
   ✅ Deployment complete!
   ```

### Deployment Artifacts

The deployment creates the following files:

```
deployments/
└── sepolia/
    └── CarbonCreditTrading.json
```

**Artifact contents:**
```json
{
  "network": "sepolia",
  "chainId": 11155111,
  "contractName": "CarbonCreditTrading",
  "contractAddress": "0x5678...",
  "deployer": "0x1234...",
  "deploymentHash": "0xabcd...",
  "timestamp": "2025-10-25T12:34:56.789Z",
  "gasUsed": "3456789",
  "deploymentCost": "0.0234",
  "abi": [...],
  "bytecode": "0x..."
}
```

## Verification

### Verify on Etherscan

```bash
# Verify contract
npm run verify:sepolia
```

**Verification process:**

1. **Load deployment info**
   ```
   📂 Loading deployment from: deployments/sepolia/CarbonCreditTrading.json
   📍 Contract: 0x5678...
   🌐 Network: sepolia
   ```

2. **Submit to Etherscan**
   ```
   🔍 Verifying contract on Etherscan...
   ⏳ Submitting source code...
   ✅ Verification submitted
   ```

3. **Confirmation**
   ```
   ✅ Contract verified successfully!
   🔗 View on Etherscan: https://sepolia.etherscan.io/address/0x5678...#code
   ```

**If already verified:**
```
ℹ️  Contract already verified on Etherscan
🔗 https://sepolia.etherscan.io/address/0x5678...#code
```

### Verify Deployment

After deployment, verify the contract is working:

```bash
# Check contract state
node -e "
const ethers = require('ethers');
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const contractAddress = '0x5678...'; // Your deployed address
const abi = require('./artifacts/contracts/CarbonCreditTrading.sol/CarbonCreditTrading.json').abi;
const contract = new ethers.Contract(contractAddress, abi, provider);
contract.owner().then(owner => console.log('Contract owner:', owner));
"
```

## Post-Deployment

### 1. Save Deployment Information

Create a deployment record:

```bash
# Create deployment record
cat > DEPLOYMENT_INFO.md << EOF
# Deployment Information

**Date**: $(date)
**Network**: Sepolia
**Chain ID**: 11155111
**Contract Address**: 0x5678...
**Deployer**: 0x1234...
**Transaction Hash**: 0xabcd...
**Gas Used**: 3,456,789
**Deployment Cost**: 0.0234 ETH
**Etherscan**: https://sepolia.etherscan.io/address/0x5678...

EOF
```

### 2. Update Configuration

Update any frontend or integration configurations with the new contract address.

### 3. Initialize Contract

Run initial setup if needed:

```bash
# Use interactive CLI
npm run interact:sepolia

# Available initialization commands:
# 1. Authorize issuers
# 2. Set initial parameters
# 3. Configure access control
```

### 4. Test Deployment

Run integration tests on deployed contract:

```bash
# Run Sepolia tests
npm run test:sepolia
```

## Troubleshooting

### Common Issues

#### 1. Insufficient Funds

**Error:**
```
Error: insufficient funds for intrinsic transaction cost
```

**Solution:**
- Get more Sepolia ETH from faucets
- Check balance: `provider.getBalance(address)`

#### 2. Invalid Private Key

**Error:**
```
Error: invalid private key
```

**Solution:**
- Ensure private key starts with `0x`
- Verify key is 64 hex characters (+ `0x` prefix)
- Check for extra spaces or newlines in `.env`

#### 3. Network Connection

**Error:**
```
Error: could not detect network
```

**Solution:**
- Verify RPC URL is correct
- Check Infura/Alchemy API key is valid
- Test RPC endpoint: `curl -X POST $SEPOLIA_RPC_URL`

#### 4. Gas Price Too Low

**Error:**
```
Error: transaction underpriced
```

**Solution:**
- Wait for lower network congestion
- Increase gas price in hardhat config
- Use gas price oracle

#### 5. Contract Already Deployed

**Error:**
```
Error: contract already deployed at this address
```

**Solution:**
- This is informational, deployment succeeded previously
- Check `deployments/sepolia/` for existing deployment
- Use existing deployment or deploy new instance

### Debug Mode

Enable verbose logging:

```bash
# Set debug flag
export DEBUG=hardhat:*

# Deploy with debug output
npm run deploy:sepolia
```

## Gas Optimization

### Estimated Costs (at 20 gwei)

| Operation | Gas Used | Cost (ETH) | Cost (USD @$2000/ETH) |
|-----------|----------|------------|-----------------------|
| Deployment | 3,500,000 | 0.070 | $140 |
| User Registration | 180,000 | 0.0036 | $7.20 |
| Issuer Authorization | 45,000 | 0.0009 | $1.80 |
| Credit Issuance | 280,000 | 0.0056 | $11.20 |
| Token Deposit | 110,000 | 0.0022 | $4.40 |
| Order Creation | 230,000 | 0.0046 | $9.20 |
| Trade Execution | 320,000 | 0.0064 | $12.80 |

### Reducing Costs

1. **Optimizer Settings**: Already optimized with 800 runs
2. **Batch Operations**: Combine multiple operations
3. **Gas Price**: Deploy during low congestion
4. **Code Splitting**: Consider proxy patterns for large contracts

## Security Checklist

Before deploying to production:

- [ ] All tests passing
- [ ] Security audit completed
- [ ] Private keys secured
- [ ] Multi-sig wallet configured
- [ ] Access control verified
- [ ] Emergency pause tested
- [ ] Rate limiting configured
- [ ] Input validation tested
- [ ] Reentrancy protection verified
- [ ] Gas limits appropriate
- [ ] Error handling complete
- [ ] Events properly emitted
- [ ] Documentation updated

## Next Steps

After successful deployment:

1. **Initialize Contract**: Set up initial state
2. **Authorize Issuers**: Add carbon credit issuers
3. **Configure Frontend**: Update UI with contract address
4. **Monitor Contract**: Set up monitoring and alerts
5. **User Onboarding**: Begin registering users
6. **Testing**: Perform end-to-end testing
7. **Documentation**: Update user guides

## Support

For deployment issues:

- Check Hardhat documentation: https://hardhat.org/docs
- Review Etherscan verification guide
- Contact Zama community for FHEVM support

---

**Last Updated**: 2025-10-25
**Version**: 1.0.0
