# Carbon Credit Trading - Smart Contract Example

> Privacy-Preserving Carbon Credit Marketplace using Zama's FHE technology

This example demonstrates a complete implementation of a carbon credit trading platform using Fully Homomorphic Encryption (FHE) to protect sensitive trading data on-chain.

## Overview

This smart contract example showcases how to build privacy-preserving decentralized applications with the Universal FHEVM SDK. The platform enables companies to trade carbon credits while keeping all sensitive business information encrypted on the blockchain.

## Core Concept

**Privacy-Preserving Carbon Emissions Trading**

Traditional carbon credit marketplaces expose:
- ❌ Carbon footprint amounts
- ❌ Credit purchase volumes
- ❌ Trading prices
- ❌ Company emission patterns

**FHE-Powered Solution:**
- ✅ All sensitive values encrypted on-chain
- ✅ Homomorphic operations on encrypted data
- ✅ Privacy preserved throughout execution
- ✅ Authorized decryption for regulators

## Features

### 🔐 Encrypted Data Types
- **euint32** - Carbon credit amounts (tons CO₂)
- **euint32** - Price per credit (tokens)
- **euint64** - User token balances
- **ebool** - Verification flags

### 🧮 Homomorphic Operations
```solidity
// Calculate total cost WITHOUT decryption
euint64 totalCost = FHE.mul(
    FHE.asEuint64(order.encryptedAmount),
    FHE.asEuint64(credit.encryptedPrice)
);

// Verify balance WITHOUT decryption
ebool hasSufficientFunds = FHE.gte(
    buyer.encryptedBalance,
    totalCost
);

// Update balance WITHOUT decryption
euint64 newBalance = FHE.sub(
    buyer.encryptedBalance,
    totalCost
);
```

## Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- MetaMask browser extension
- Sepolia ETH for testing

### Installation

```bash
# From repository root
cd examples/carbon-credit-trading

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Compile contracts
npx hardhat compile
```

### Environment Configuration

Create `.env` file:

```env
# Network Configuration
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY

# Contract Configuration
OWNER_ADDRESS=0xYOUR_OWNER_ADDRESS
PAUSER_ADDRESS=0xYOUR_PAUSER_ADDRESS
```

### Deploy to Sepolia

```bash
# Deploy contract
npx hardhat run scripts/deploy.mjs --network sepolia

# Verify on Etherscan
npx hardhat run scripts/verify.mjs --network sepolia
```

### Run Tests

```bash
# Run all tests
npx hardhat test

# Run with coverage
npx hardhat coverage

# Run Sepolia integration tests
npx hardhat test test/CarbonCreditTrading.sepolia.test.mjs --network sepolia
```

## Usage

### For Carbon Credit Issuers

```bash
# Interactive CLI
npx hardhat run scripts/interact.mjs --network sepolia

# Select options:
# 1. Authorize as issuer (owner only)
# 2. Issue carbon credit with encrypted parameters
```

**Example:**
```javascript
// Issue 1000 tons CO₂ credit at 50 tokens/credit
await contract.issueCredit(
    encryptedAmount(1000),  // Encrypted
    encryptedPrice(50),     // Encrypted
    verificationHash        // Public hash
);
```

### For Credit Buyers

```bash
# Create buy order
npx hardhat run scripts/interact.mjs --network sepolia

# Select options:
# 1. Deposit tokens (encrypted amount)
# 2. Create buy order (encrypted quantity)
```

**Example:**
```javascript
// Create order for 100 credits
await contract.createBuyOrder(
    creditId,
    encryptedAmount(100)  // Encrypted
);
```

### For Trade Execution

```bash
# Execute trade
npx hardhat run scripts/interact.mjs --network sepolia

# Select option: Execute trade (homomorphic operations)
```

**Example:**
```javascript
// Execute trade with encrypted balance verification
await contract.executeTrade(orderId);
// All operations happen on encrypted data!
```

## SDK Integration

This example demonstrates integration with the Universal FHEVM SDK:

```typescript
import { FhevmClient, encryptInput } from '@fhevm/sdk';
import { ethers } from 'ethers';

// Initialize FHEVM client
const provider = new ethers.BrowserProvider(window.ethereum);
const client = new FhevmClient({
  provider,
  network: { chainId: 11155111 }
});

await client.init();

// Encrypt values for contract
const encryptedAmount = await encryptInput(client, 1000, {
  type: 'euint32',
  contractAddress: await contract.getAddress()
});

// Call contract with encrypted input
await contract.issueCredit(
    encryptedAmount.handles,
    encryptedAmount.inputProof,
    verificationHash
);
```

## Testing

### Test Suite Structure

```
66 Total Test Cases
├── Deployment Tests (5)
├── User Registration (6)
├── Issuer Authorization (5)
├── Credit Issuance (8)
├── Token Operations (5)
├── Order Management (7)
├── Trade Execution (6)
├── View Functions (4)
├── Verification (3)
└── Edge Cases (11)
```

### Test Coverage

```
File: CarbonCreditTradingFHEVM.sol
Statements: 95.2%
Branches:   88.7%
Functions:  96.1%
Lines:      94.8%
```

## Smart Contract Architecture

```
CarbonCreditTradingFHEVM.sol
├── User Management
│   ├── Registration (with encrypted balance allocation)
│   ├── Role assignment (Issuer authorization)
│   └── Balance tracking (euint64 encrypted)
│
├── Credit Management
│   ├── Issuer authorization by owner
│   ├── Credit issuance (encrypted amount & price)
│   ├── Verification hash storage
│   └── Ownership transfer tracking
│
├── Order Management
│   ├── Buy order creation (encrypted amounts)
│   ├── Order cancellation
│   └── Order state management
│
└── Trade Execution
    ├── Homomorphic balance verification (FHE.gte)
    ├── Encrypted cost calculation (FHE.mul)
    ├── Balance updates (FHE.sub)
    └── Ownership transfer
```

## Privacy Model

**What's Private (Encrypted):**
- ✅ Carbon credit amounts
- ✅ Credit prices
- ✅ User token balances
- ✅ Order quantities
- ✅ Trade volumes

**What's Public (Transparent):**
- ✅ User registration status
- ✅ Issuer authorization
- ✅ Credit existence (not amount)
- ✅ Order existence (not details)
- ✅ Trade execution events
- ✅ Verification hashes

## Gas Costs

| Operation | Estimated Gas | Cost @ 20 gwei |
|-----------|---------------|----------------|
| Contract Deployment | ~3,500,000 | ~0.07 ETH |
| User Registration | ~180,000 | ~0.0036 ETH |
| Token Deposit | ~110,000 | ~0.0022 ETH |
| Credit Issuance | ~280,000 | ~0.0056 ETH |
| Order Creation | ~230,000 | ~0.0046 ETH |
| Trade Execution | ~320,000 | ~0.0064 ETH |

*Optimized with 800-run Solidity optimizer + Yul optimization*

## Project Structure

```
carbon-credit-trading/
├── contracts/
│   └── CarbonCreditTradingFHEVM.sol    # Main FHE contract
│
├── scripts/
│   ├── deploy.mjs                       # Deployment automation
│   ├── verify.mjs                       # Etherscan verification
│   ├── interact.mjs                     # Interactive CLI
│   └── simulate.mjs                     # Full workflow simulation
│
├── test/
│   ├── CarbonCreditTrading.test.mjs          # 60 unit tests
│   └── CarbonCreditTrading.sepolia.test.mjs  # 6 integration tests
│
├── hardhat.config.js                    # Hardhat configuration
├── package.json                         # NPM dependencies
├── .env.example                         # Environment template
└── README.md                            # This file
```

## Security Features

### Access Control
- Owner-based administration
- Issuer authorization required
- User registration gating

### DoS Protection
- Rate limiting per address
- Batch size restrictions
- Gas price caps

### Data Privacy
- All sensitive values encrypted
- Homomorphic operations only
- Authorized decryption with EIP-712

### Emergency Controls
- Pause functionality
- Circuit breakers
- Owner intervention capability

## Learn More

### Zama Resources
- [Zama Documentation](https://docs.zama.ai/)
- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Zama GitHub](https://github.com/zama-ai)

### Related Documentation
- [Universal FHEVM SDK](../../README.md)
- [Next.js Example](../nextjs-carbon-trading/README.md)
- [API Reference](../../docs/API.md)
- [Architecture Guide](../../docs/ARCHITECTURE.md)

## License

MIT License - See LICENSE file in repository root for details.

---

**Built for the Zama FHEVM SDK Bounty**

**Powered by Zama FHEVM** 🔐
