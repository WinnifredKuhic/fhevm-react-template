# Carbon Credit Trading Platform - React Application

A fully functional decentralized carbon credit trading platform built with React, TypeScript, and FHEVM (Fully Homomorphic Encryption Virtual Machine). This application enables privacy-preserving carbon credit trading with encrypted balances and order matching.

## Features

- **User Registration**: Register on the platform to start trading
- **Credit Issuance**: Issue carbon credits with encrypted amounts and prices
- **Order Management**: Create and manage buy orders with encrypted values
- **Trade Execution**: Execute trades between buyers and sellers
- **Balance Management**: View encrypted balances and deposit tokens
- **Privacy-Preserving**: All sensitive data (amounts, prices, balances) are encrypted using FHEVM

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Smart Contracts**: Solidity with FHEVM
- **Blockchain Interaction**: ethers.js v6
- **Encryption**: @fhevm/sdk (Fully Homomorphic Encryption)
- **Development**: Hardhat

## Project Structure

```
carbon-credit-trading/
├── src/
│   ├── components/          # React components
│   │   ├── UserRegistration.tsx
│   │   ├── CreditManagement.tsx
│   │   ├── OrderManagement.tsx
│   │   ├── TradeExecution.tsx
│   │   └── BalanceDisplay.tsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useContract.ts   # Contract interaction hook
│   │   ├── useFHE.ts        # FHE operations hook
│   │   └── useWallet.ts     # Wallet connection hook
│   ├── lib/                 # Utilities and configuration
│   │   ├── abi.json         # Contract ABI
│   │   └── contract.ts      # Contract utilities
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx              # Main application component
│   ├── App.css              # Application styles
│   ├── main.tsx             # React entry point
│   └── vite-env.d.ts        # Vite type definitions
├── contracts/               # Solidity smart contracts
├── scripts/                 # Deployment scripts
├── test/                    # Contract tests
├── public/                  # Static assets (legacy HTML app)
├── index.html               # HTML template for React
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies and scripts
```

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MetaMask browser extension
- Hardhat Local Network running

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Compile smart contracts**:
   ```bash
   npm run compile
   ```

## Running the Application

### Step 1: Start Hardhat Local Network

In one terminal, start the local Hardhat node:

```bash
npm run node
```

This will start a local blockchain at `http://127.0.0.1:8545`.

### Step 2: Deploy Smart Contracts

In another terminal, deploy the contracts:

```bash
npm run deploy:localhost
```

This will deploy the `CarbonCreditTrading` contract and output the contract address. Update the `CONTRACT_ADDRESS` in `src/lib/contract.ts` if needed.

### Step 3: Configure MetaMask

1. **Add Hardhat Network to MetaMask**:
   - Network Name: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`

2. **Import Test Account**:
   - Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - This account has 10,000 ETH for testing

### Step 4: Start React Development Server

```bash
npm run dev
```

The application will open in your browser at `http://localhost:3000`.

## Usage Guide

### 1. Connect Wallet

Click the "Connect Wallet" button and approve the connection in MetaMask.

### 2. Register User

Navigate to the "Register" tab and click "Register User". This is required before any trading activity.

### 3. Issue Carbon Credits

Navigate to the "Issue Credits" tab and fill out the form:
- **Amount**: Number of credits to issue
- **Price per Credit**: Price in tokens
- **Project Type**: Type of carbon offset project
- **Verification Hash**: Hash of verification documents (must start with `0x`)

### 4. Create Buy Orders

Navigate to the "Trade" tab and create a buy order:
- **Credit ID**: ID of the credit you want to buy
- **Amount**: Number of credits to purchase
- **Max Price per Credit**: Maximum price you're willing to pay

### 5. Execute Trades

If you're a seller and there are pending orders for your credits:
1. Navigate to the "My Orders" tab
2. View pending orders where you're the seller
3. Click "Execute Trade" to complete the transaction

### 6. Manage Balances

Navigate to the "Balances" tab to:
- Deposit tokens into the platform
- View your encrypted credit and token balances
- See system-wide statistics

## SDK Integration

### FHEVM SDK

The application is designed to integrate with the FHEVM SDK for privacy-preserving computations. The `useFHE` hook provides a foundation for:

- Encrypting values before sending to the contract
- Decrypting values for user viewing
- Requesting re-encryption for authorized users

**Note**: The current implementation includes placeholder functions. For full FHE functionality, you need to:

1. Install the FHEVM SDK properly configured for your network
2. Initialize the FHE instance with the correct gateway URL
3. Implement encryption/decryption in the `useFHE` hook

Example initialization:
```typescript
import { createInstance } from '@fhevm/sdk';

const instance = await createInstance({
  chainId: 31337,
  networkUrl: 'http://127.0.0.1:8545',
  gatewayUrl: 'http://localhost:8545', // Replace with actual gateway
});
```

### Contract Interaction

The `useContract` hook provides type-safe contract interactions:

```typescript
const {
  registerUser,
  issueCredits,
  createBuyOrder,
  executeTrade,
  getMyBalances,
  // ... other methods
} = useContract();
```

## Development Scripts

- `npm run dev` - Start Vite development server
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build
- `npm run compile` - Compile smart contracts
- `npm run test` - Run contract tests
- `npm run node` - Start Hardhat local node
- `npm run deploy:localhost` - Deploy to local network
- `npm run deploy:sepolia` - Deploy to Sepolia testnet

## Key Components

### Hooks

- **useWallet**: Manages wallet connection, account changes, and network switches
- **useContract**: Provides contract interaction methods with error handling
- **useFHE**: Handles FHE operations (encryption/decryption)

### Components

- **UserRegistration**: User registration interface
- **CreditManagement**: Form for issuing new carbon credits
- **OrderManagement**: Interface for creating buy orders
- **TradeExecution**: View and manage trades and orders
- **BalanceDisplay**: Display balances and system statistics

## Privacy Features

All sensitive data is encrypted using FHEVM:

- **Credit Amounts**: Encrypted as `euint32`
- **Credit Prices**: Encrypted as `euint32`
- **Order Amounts**: Encrypted as `euint32`
- **Order Prices**: Encrypted as `euint32`
- **User Balances**: Encrypted as `euint64`

Only authorized users can decrypt their own data through the re-encryption mechanism.

## Troubleshooting

### Common Issues

1. **MetaMask not connecting**:
   - Ensure MetaMask is installed
   - Check that you're on the correct network (Hardhat Local)
   - Try refreshing the page

2. **Contract calls failing**:
   - Verify the contract is deployed
   - Check that the contract address in `src/lib/contract.ts` is correct
   - Ensure you have enough ETH for gas fees

3. **Transaction reverts**:
   - Make sure you're registered before performing operations
   - Check that you have sufficient balance for deposits
   - Verify all form inputs are valid

4. **Build errors**:
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Clear Vite cache: `rm -rf node_modules/.vite`

## Security Considerations

- This is a demonstration application for educational purposes
- Private keys are exposed in the documentation for testing only
- Never use test private keys on mainnet
- Always verify contract addresses before interacting
- Implement proper access controls in production

## Future Enhancements

- Full FHEVM SDK integration with gateway
- Decryption interface for viewing encrypted balances
- Order matching algorithm with privacy preservation
- Credit verification workflow
- Carbon offset project registry
- Trading history and analytics
- Multi-signature approvals for large trades

## Contributing

Contributions are welcome! Please ensure:
- Code follows TypeScript best practices
- All components are properly typed
- Tests pass before submitting PRs
- Documentation is updated for new features

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
- Check the troubleshooting section above
- Review the original README.md for contract details
- Open an issue on the repository
