# Next.js Carbon Credit Trading Platform

> Privacy-preserving carbon credit marketplace built with Next.js and @fhevm/sdk

## 🌟 Overview

This is a complete Next.js application demonstrating the @fhevm/sdk integration for building privacy-preserving dApps. The app showcases:

- ✅ **React Hooks Integration** - Using useFhevm, useEncrypt, useDecrypt
- ✅ **Encrypted Operations** - Credit amounts, prices, and balances remain private
- ✅ **Homomorphic Trading** - Execute trades on encrypted data
- ✅ **Modern UI** - Built with Tailwind CSS
- ✅ **TypeScript** - Full type safety

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- MetaMask browser extension
- Sepolia testnet ETH

### Installation

```bash
# From repository root
npm install

# Or from this directory
npm install
```

### Configuration

1. Copy environment template:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local`:
   ```env
   NEXT_PUBLIC_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
   NEXT_PUBLIC_CONTRACT_ADDRESS=0xYOUR_CONTRACT_ADDRESS
   ```

### Deploy Contract

```bash
# From repository root
npm run compile
npm run deploy:sepolia
```

Copy the deployed contract address to `.env.local`.

### Run Development Server

```bash
# From repository root
npm run dev:nextjs

# Or from this directory
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📱 Features

### 1. Balance Viewer 💰
- View encrypted token balance
- Decrypt with EIP-712 signature
- Shows encrypted handle on-chain

### 2. Credit Issuer 🌱
- Issue carbon credits with encrypted amounts
- Set encrypted prices
- Verification hash for authenticity

### 3. Order Manager 📋
- Create buy orders with encrypted amounts
- Privacy-preserving order book
- Track order status

### 4. Trade Executor ⚡
- Execute trades on encrypted data
- Homomorphic operations:
  - `FHE.mul(amount, price)` - Calculate cost
  - `FHE.gte(balance, cost)` - Verify funds
  - `FHE.sub(balance, cost)` - Update balance

## 🎨 Architecture

```
nextjs-carbon-trading/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Main page
│   │   ├── providers.tsx       # FhevmProvider wrapper
│   │   └── globals.css         # Global styles
│   │
│   ├── components/
│   │   ├── BalanceViewer.tsx   # View encrypted balance
│   │   ├── CreditIssuer.tsx    # Issue carbon credits
│   │   ├── OrderManager.tsx    # Create buy orders
│   │   └── TradeExecutor.tsx   # Execute trades
│   │
│   └── lib/
│       └── fhevm.ts            # SDK utilities (optional)
│
├── public/                     # Static assets
├── package.json
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## 🔐 SDK Integration

### 1. Provider Setup

```typescript
// app/providers.tsx
import { FhevmProvider } from '@fhevm/sdk';

export function Providers({ children }) {
  return (
    <FhevmProvider config={{ provider, network: { chainId: 11155111 } }}>
      {children}
    </FhevmProvider>
  );
}
```

### 2. Using Hooks in Components

```typescript
// components/CreditIssuer.tsx
import { useEncrypt } from '@fhevm/sdk';

function CreditIssuer() {
  const { encrypt, isEncrypting } = useEncrypt();

  const handleIssue = async () => {
    const encryptedAmount = await encrypt(1000, {
      type: 'euint32',
      contractAddress,
    });

    await contract.issueCredit(
      encryptedAmount.handles,
      encryptedAmount.inputProof,
      // ...
    );
  };
}
```

### 3. Decrypting Values

```typescript
// components/BalanceViewer.tsx
import { useDecrypt } from '@fhevm/sdk';

function BalanceViewer() {
  const { decrypt, data, isDecrypting } = useDecrypt();

  const handleView = async () => {
    await decrypt({
      contractAddress,
      handle: balanceHandle,
      signer,
    });

    console.log('Balance:', data.value);
  };
}
```

## 🛠️ Development

### Scripts

```bash
# Development
npm run dev                 # Start dev server

# Building
npm run build              # Build for production
npm run start              # Start production server

# Linting
npm run lint               # Run ESLint
```

### Adding New Features

1. **Create Component** in `src/components/`
2. **Use SDK Hooks**: `useFhevm`, `useEncrypt`, `useDecrypt`
3. **Import in Page**: Add to `src/app/page.tsx`
4. **Style with Tailwind**: Use utility classes

## 🎯 Example Workflows

### Issue Carbon Credit

1. Connect wallet (MetaMask)
2. Navigate to "Issue Carbon Credit" section
3. Enter amount (e.g., 1000 tons)
4. Enter price (e.g., 50 tokens)
5. Enter verification data
6. Click "Issue Credit"
7. Confirm transaction in MetaMask

**Result**: Credit created with encrypted amount and price!

### Create Buy Order

1. Find credit ID (from events or UI)
2. Navigate to "Create Buy Order"
3. Enter credit ID
4. Enter order amount
5. Click "Create Buy Order"
6. Confirm transaction

**Result**: Order created with encrypted amount!

### Execute Trade

1. Get order ID from previous step
2. Navigate to "Execute Trade"
3. Enter order ID
4. Click "Execute Trade"
5. Confirm transaction

**Result**: Trade executed using homomorphic operations!

## 🔒 Privacy Features

### Encrypted Data
- Credit amounts (euint32)
- Prices (euint32)
- Balances (euint64)
- Order amounts (euint32)

### Homomorphic Operations
- Multiplication: `cost = amount × price`
- Comparison: `balance >= cost`
- Subtraction: `newBalance = balance - cost`

### Access Control
- EIP-712 signatures for decryption
- Only authorized users can view their data
- Public key encryption for input

## 📚 Learn More

- **@fhevm/sdk Documentation**: See `packages/fhevm-sdk/README.md`
- **Contract Documentation**: See `examples/carbon-credit-trading/`
- **Zama FHEVM**: https://docs.zama.ai/fhevm
- **Next.js**: https://nextjs.org/docs

## 🤝 Contributing

Contributions welcome! Please see the main repository for guidelines.

## 📄 License

MIT License - see [LICENSE](../../LICENSE) for details.

---

**Built for the Zama FHEVM SDK Bounty**

**Powered by Zama FHEVM** 🔐
