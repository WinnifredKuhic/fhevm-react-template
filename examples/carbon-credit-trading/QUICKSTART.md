# Quick Start Guide

Get the Carbon Credit Trading Platform React app running in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- MetaMask browser extension
- Terminal/Command Prompt

## 1. Install Dependencies

```bash
npm install
```

## 2. Start Local Blockchain

Open a new terminal and run:

```bash
npm run node
```

Keep this running. You should see:
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
```

## 3. Deploy Smart Contract

Open another terminal and run:

```bash
npm run deploy:localhost
```

You should see:
```
CarbonCreditTrading deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

## 4. Configure MetaMask

### Add Network
1. Open MetaMask
2. Click network dropdown → "Add Network" → "Add network manually"
3. Enter:
   - **Network Name**: Hardhat Local
   - **RPC URL**: http://127.0.0.1:8545
   - **Chain ID**: 31337
   - **Currency Symbol**: ETH

### Import Test Account
1. Click account icon → "Import Account"
2. Paste private key:
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
3. Click "Import"

You should now have 10,000 ETH.

## 5. Start React App

```bash
npm run dev
```

The app will open at: http://localhost:3000

## 6. Use the App

1. Click **"Connect Wallet"**
2. Approve in MetaMask
3. Click **"Register User"** in the Register tab
4. Try issuing credits, creating orders, etc.

## Troubleshooting

**"Contract not found"**: Make sure you deployed (step 3)

**"Wrong network"**: Switch to Hardhat Local in MetaMask

**"Insufficient funds"**: Import the test account (step 4)

**"Port already in use"**: Kill process on port 3000 or 8545

## Next Steps

- Read [README-REACT.md](./README-REACT.md) for detailed documentation
- Review [MIGRATION-GUIDE.md](./MIGRATION-GUIDE.md) to understand the code
- Check [CONVERSION-SUMMARY.md](./CONVERSION-SUMMARY.md) for technical details

## Commands Reference

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Blockchain
npm run node             # Start Hardhat node
npm run compile          # Compile contracts
npm run deploy:localhost # Deploy to local
npm run test             # Run contract tests
```

Enjoy trading carbon credits! 🌱
