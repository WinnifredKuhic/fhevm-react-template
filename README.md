# Universal FHEVM SDK

> Framework-agnostic SDK for building privacy-preserving applications with Zama's Fully Homomorphic Encryption

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/badge/npm-@fhevm/sdk-blue.svg)](https://www.npmjs.com/package/@fhevm/sdk)
[![FHEVM](https://img.shields.io/badge/FHEVM-Zama-purple.svg)](https://docs.zama.ai/fhevm)

## 🎯 Project Overview

This repository contains a **universal, framework-agnostic SDK** for building privacy-preserving decentralized applications using Zama's Fully Homomorphic Encryption technology.

**Live Demo**: [https://carbon-credit-trading-fhe.vercel.app/](https://carbon-credit-trading-fhe.vercel.app/)

**Demo Video**: `demo.mp4` (Download to watch - streaming not available)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Usage](#usage)
  - [Framework-Agnostic Core](#framework-agnostic-core)
  - [React Integration](#react-integration)
  - [Next.js Example](#nextjs-example)
  - [Node.js Usage](#nodejs-usage)
- [Example Application](#example-application)
- [API Reference](#api-reference)
- [Architecture](#architecture)
- [Documentation](#documentation)
- [Bounty Requirements](#bounty-requirements)
- [License](#license)

---

## 🌟 Overview

The **Universal FHEVM SDK** provides a comprehensive toolkit for integrating Zama's Fully Homomorphic Encryption into any JavaScript/TypeScript application. It delivers:

✅ **Framework-Agnostic Core** - Works with Node.js, Next.js, Vue, React, or any frontend setup
✅ **All-in-One Package** - Wraps all required dependencies, no scattered setup
✅ **wagmi-like Structure** - Intuitive API for web3 developers
✅ **Official Zama Integration** - Follows Zama's official SDK and guidelines
✅ **Less Than 10 Lines** - Minimal setup time, maximum productivity

### Problem Statement

Current FHEVM development requires:
- Managing multiple scattered dependencies
- Framework-specific implementations
- Complex encryption/decryption setup
- Repetitive boilerplate code

### Our Solution

A single, universal SDK that:
- Consolidates all FHEVM dependencies
- Provides consistent API across frameworks
- Simplifies encryption/decryption flows
- Offers reusable components and utilities

---

## 🔑 Key Features

### 1. Framework-Agnostic Core

```typescript
// Works anywhere - Node.js, React, Vue, Svelte, etc.
import { FhevmClient, initFhevm } from '@fhevm/sdk';

const client = await initFhevm({ provider, chainId: 11155111 });
const encrypted = await client.encrypt(1000);
```

### 2. Unified Dependency Management

No more juggling multiple packages:

```json
{
  "dependencies": {
    "@fhevm/sdk": "^1.0.0"  // Everything you need!
  }
}
```

### 3. wagmi-Inspired API

Familiar patterns for web3 developers:

```typescript
// Initialization
const { client, isReady } = useFhevm({ provider, network });

// Encryption
const { encrypt, isEncrypting } = useEncrypt();
const encrypted = await encrypt(value);

// Decryption
const { decrypt, data } = useDecrypt();
const decrypted = await decrypt(handle);
```

### 4. React Hooks (Optional)

```typescript
import { useFhevm, useEncrypt, useDecrypt } from '@fhevm/sdk/react';

function MyComponent() {
  const { client } = useFhevm();
  const { encrypt } = useEncrypt(client);
  const { decrypt } = useDecrypt(client);

  // Use encryption in your component
}
```

### 5. Complete Encryption/Decryption Flow

- ✅ **Initialize** - Simple setup with provider
- ✅ **Encrypt Inputs** - Type-safe encryption with automatic type inference
- ✅ **User Decrypt** - EIP-712 signature-based decryption
- ✅ **Public Decrypt** - For public encrypted values
- ✅ **Batch Operations** - Encrypt/decrypt multiple values efficiently

---

## ⚡ Quick Start

### Install from Root

```bash
# Navigate to project directory
cd fhevm-react-template

# Install all packages
npm install

# Build SDK
npm run build:sdk

# Run Next.js example
npm run dev:nextjs
```

### Deploy Contracts

```bash
# Compile Solidity contracts
npm run compile

# Deploy to Sepolia
npm run deploy:sepolia

# Generate ABIs
npm run generate:abi
```

### Start Next.js Example

```bash
# Start development server
npm run dev:nextjs

# Open browser
# Visit application
```

---

## 📦 Installation

### As NPM Package

```bash
npm install @fhevm/sdk
# or
yarn add @fhevm/sdk
# or
pnpm add @fhevm/sdk
```

### From Monorepo

```bash
# Install all dependencies
npm install

# Link SDK locally
npm run link:sdk
```

---

## 💻 Usage

### Framework-Agnostic Core

Perfect for Node.js, backends, or any JavaScript environment:

```typescript
import { FhevmClient } from '@fhevm/sdk';
import { ethers } from 'ethers';

// Setup
const provider = new ethers.BrowserProvider(window.ethereum);
const client = new FhevmClient({
  provider,
  network: {
    chainId: 11155111,
    name: 'sepolia',
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_KEY'
  }
});

// Initialize
await client.init();

// Encrypt values
const encryptedAmount = await client.encrypt(1000, {
  type: 'euint32',
  contractAddress: '0x...'
});

// Use in contract call
const tx = await contract.transfer(
  recipient,
  encryptedAmount.handles,
  encryptedAmount.inputProof
);

// Decrypt results
const balance = await client.decrypt({
  contractAddress: '0x...',
  handle: '0x...',
  signer: await provider.getSigner()
});

console.log('Balance:', balance.value);
```

### React Integration

For React applications with hooks:

```typescript
import { FhevmProvider, useFhevm, useEncrypt, useDecrypt } from '@fhevm/sdk/react';

// App.tsx
function App() {
  return (
    <FhevmProvider network={{ chainId: 11155111 }}>
      <MyComponent />
    </FhevmProvider>
  );
}

// MyComponent.tsx
function MyComponent() {
  const { client, isReady } = useFhevm();
  const { encrypt, isEncrypting } = useEncrypt();
  const { decrypt, data, isDecrypting } = useDecrypt();

  const handleEncrypt = async () => {
    const encrypted = await encrypt(1000, {
      type: 'euint32',
      contractAddress: contractAddress
    });

    // Use encrypted.handles and encrypted.inputProof
    await contract.someFunction(encrypted.handles, encrypted.inputProof);
  };

  const handleDecrypt = async () => {
    const decrypted = await decrypt({
      contractAddress,
      handle: encryptedHandle,
      signer
    });

    console.log('Decrypted value:', decrypted.value);
  };

  if (!isReady) return <div>Initializing FHEVM...</div>;

  return (
    <div>
      <button onClick={handleEncrypt} disabled={isEncrypting}>
        Encrypt & Send
      </button>
      <button onClick={handleDecrypt} disabled={isDecrypting}>
        Decrypt
      </button>
      {data && <p>Decrypted: {data.value.toString()}</p>}
    </div>
  );
}
```

### Next.js Example

Complete Next.js application demonstrating SDK integration:

```bash
cd examples/nextjs-carbon-trading
npm install
npm run dev
```

### Node.js Usage

For backend or scripts:

```typescript
import { initFhevm, encryptInput, decryptOutput } from '@fhevm/sdk';
import { ethers } from 'ethers';

// Initialize
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const fhevm = await initFhevm({
  provider,
  signer,
  network: { chainId: 11155111 }
});

// Encrypt
const encrypted = await encryptInput(fhevm, 1000, {
  type: 'euint32',
  contractAddress: process.env.CONTRACT_ADDRESS
});

// Call contract
const contract = new ethers.Contract(address, abi, signer);
const tx = await contract.deposit(encrypted.handles, encrypted.inputProof);
await tx.wait();

// Decrypt
const handle = await contract.getBalance(signer.address);
const decrypted = await decryptOutput(fhevm, {
  contractAddress: process.env.CONTRACT_ADDRESS,
  handle,
  signer
});

console.log('Balance:', decrypted.value);
```

---

## 🎮 Example Applications

This repository includes two comprehensive examples demonstrating the SDK integration:

### 1. Next.js Carbon Trading Platform

A complete privacy-preserving carbon credit marketplace with modern React UI.

**Location**: `examples/nextjs-carbon-trading/`

**Live Demo**: [https://carbon-credit-trading-fhe.vercel.app/](https://carbon-credit-trading-fhe.vercel.app/)

**Features**:
- ✅ React Hooks Integration (`useFhevm`, `useEncrypt`, `useDecrypt`)
- ✅ Encrypted credit amounts and private pricing
- ✅ Confidential balances with EIP-712 decryption
- ✅ Homomorphic trade execution
- ✅ Modern UI with Tailwind CSS

**Components**:
- `BalanceViewer.tsx` - View and decrypt encrypted balances
- `CreditIssuer.tsx` - Issue carbon credits with encrypted amounts
- `OrderManager.tsx` - Create privacy-preserving buy orders
- `TradeExecutor.tsx` - Execute trades on encrypted data

**Run Example**:

```bash
# From root directory
npm run dev:nextjs

# Or from example directory
cd examples/nextjs-carbon-trading
npm install
npm run dev
```

### 2. Smart Contract Implementation

Complete Solidity contracts with comprehensive testing and deployment scripts.

**Location**: `examples/carbon-credit-trading/`

**Features**:
- ✅ Full FHE-enabled smart contracts
- ✅ Comprehensive test suite with 66+ test scenarios
- ✅ Deployment scripts for multiple networks
- ✅ Interactive CLI with 15+ commands
- ✅ Privacy-preserving carbon credit trading logic

**Key Workflows**:
1. User registration with encrypted balances
2. Credit issuance with private amounts and verification
3. Order creation with encrypted parameters
4. Trade execution with homomorphic operations
5. Balance viewing with authorized decryption
6. Regulatory compliance with privacy preservation

---

## 📚 API Reference

### Core Functions

#### `initFhevm(config)`

Initialize FHEVM instance.

```typescript
const fhevm = await initFhevm({
  provider: ethersProvider,
  network: { chainId: 11155111 }
});
```

#### `encryptInput(client, value, options)`

Encrypt a value for contract input.

```typescript
const encrypted = await encryptInput(client, 1000, {
  type: 'euint32',
  contractAddress: '0x...'
});
```

#### `decryptOutput(client, options)`

Decrypt a value from contract (user decrypt with EIP-712).

```typescript
const decrypted = await decryptOutput(client, {
  contractAddress: '0x...',
  handle: '0x...',
  signer: signer
});
```

#### `publicDecrypt(client, contractAddress, handle)`

Public decryption for non-sensitive values.

```typescript
const value = await publicDecrypt(client, contractAddress, handle);
```

### React Hooks

#### `useFhevm()`

Access FHEVM client instance.

```typescript
const { client, isReady, error } = useFhevm();
```

#### `useEncrypt()`

Encrypt values with loading state.

```typescript
const { encrypt, isEncrypting, error } = useEncrypt();
```

#### `useDecrypt()`

Decrypt values with loading state.

```typescript
const { decrypt, data, isDecrypting, error } = useDecrypt();
```

---

## 🏗️ Architecture

```
fhevm-react-template/
├── packages/
│   └── fhevm-sdk/                    # Universal SDK package
│       ├── src/
│       │   ├── index.ts              # Main exports
│       │   ├── client.ts             # FhevmClient class
│       │   ├── types.ts              # TypeScript types
│       │   ├── provider.tsx          # React Provider & Hooks
│       │   ├── encrypt.ts            # Encryption utilities
│       │   ├── decrypt.ts            # Decryption utilities
│       │   └── package.json          # SDK configuration
│       └── README.md                 # SDK documentation
│
├── examples/
│   ├── nextjs-carbon-trading/        # Next.js Example
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── layout.tsx        # Root layout with providers
│   │   │   │   ├── page.tsx          # Main page
│   │   │   │   ├── providers.tsx     # FhevmProvider wrapper
│   │   │   │   └── globals.css       # Global styles
│   │   │   ├── components/
│   │   │   │   ├── BalanceViewer.tsx # View encrypted balances
│   │   │   │   ├── CreditIssuer.tsx  # Issue carbon credits
│   │   │   │   ├── OrderManager.tsx  # Create buy orders
│   │   │   │   └── TradeExecutor.tsx # Execute trades
│   │   │   └── lib/
│   │   │       └── fhevm.ts          # SDK utilities
│   │   ├── package.json
│   │   ├── next.config.js
│   │   ├── tailwind.config.ts
│   │   └── README.md
│   │
│   └── carbon-credit-trading/        # Smart Contract Example
│       ├── contracts/
│       │   └── CarbonCreditTradingFHEVM.sol  # Main contract
│       ├── scripts/
│       │   ├── deploy.js             # Deployment script
│       │   └── interact.js           # Interaction CLI
│       ├── test/
│       │   └── CarbonCreditTradingFHEVM.test.js
│       ├── hardhat.config.js
│       └── README.md
│
├── docs/                             # Documentation
│   ├── API.md                        # Complete API reference
│   ├── ARCHITECTURE.md               # System design
│   └── DEPLOYMENT.md                 # Deployment guide
│
├── package.json                      # Root package.json
├── demo.mp4                          # Demo video
└── README.md                         # This file
```

---

## 📖 Documentation

Comprehensive documentation available in `docs/`:

- **[API Reference](./docs/API.md)** - Complete API documentation
- **[Architecture](./docs/ARCHITECTURE.md)** - System design and structure
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - How to deploy contracts

---

## ✅ Key Features & Deliverables

### ✓ Universal SDK Package

- **Framework-agnostic core** - Works with Node.js, React, Vue, any framework
- **Initialization utilities** - Simple `initFhevm()` function
- **Encryption/decryption** - Complete `userDecrypt` with EIP-712 + `publicDecrypt`
- **Developer-friendly API** - Intuitive hooks and functions with full TypeScript support
- **Reusable components** - Modular utilities for different encryption scenarios
- **Clean & extensible** - Well-structured, documented, easy to extend

### ✓ Next.js Integration Example

- **Complete Next.js 14 app** - Full-featured frontend with App Router
- **SDK integration** - Demonstrates all SDK hooks and utilities
- **4 Core Components**:
  - `BalanceViewer` - View and decrypt encrypted balances
  - `CreditIssuer` - Issue carbon credits with encrypted amounts
  - `OrderManager` - Create privacy-preserving buy orders
  - `TradeExecutor` - Execute trades on encrypted data
- **Tailwind CSS** - Modern, responsive UI design
- **TypeScript** - Type-safe throughout with full IntelliSense

### ✓ Smart Contract Example

- **Smart contract** - Carbon Credit Trading with FHE operations
- **Comprehensive testing** - 66+ test scenarios with high code coverage
- **Deployment scripts** - Automated deployment for multiple networks
- **Interactive CLI** - 15+ commands for contract interaction
- **Complete workflows** - End-to-end privacy-preserving trading scenarios

### ✓ Developer Experience

- **Minimal setup** - Less than 10 lines to start using SDK
- **Clear documentation** - Comprehensive guides and API reference
- **Type-safe** - Full TypeScript support with IntelliSense
- **Working examples** - Both frontend and backend implementations

### ✓ Project Deliverables

- ✅ **Complete Repository** - SDK package with examples
- ✅ **Example Applications** - Next.js frontend + Smart contracts
- ✅ **Video Demo** - `demo.mp4` showcasing setup and features
- ✅ **Live Deployment** - Production demo on Vercel
- ✅ **Documentation** - Comprehensive README and API docs

---

## 🏆 What Makes This SDK Special

### 1. True Framework Agnosticism

Unlike template-specific solutions, this SDK works **anywhere**:
- ✅ React / Next.js
- ✅ Vue / Nuxt
- ✅ Svelte / SvelteKit
- ✅ Node.js backends
- ✅ Vanilla JavaScript
- ✅ TypeScript projects

### 2. Production-Ready Implementation

- **Comprehensive testing** - 66+ unit tests with high coverage
- **Full TypeScript** support with type inference
- **Error handling** with custom error types and validation
- **Gas optimized** contracts with security hardening
- **DoS protection** and access control mechanisms

### 3. Real-World Application

The Carbon Credit Trading Platform demonstrates:
- Complex homomorphic operations on encrypted data
- Multi-role access control and permissions
- Encrypted order matching and execution
- Privacy-preserving settlements and balance management
- EIP-712 signature-based decryption

### 4. Outstanding Developer Experience

- **Instant setup** - One command installation
- **Comprehensive documentation** - Complete guides and API reference
- **Clear examples** - Multiple usage patterns and scenarios
- **Active development** - Ready for community contributions and extensions

---

## 🚀 Getting Started

```bash
# 1. Navigate to project directory
cd fhevm-react-template

# 2. Install all dependencies
npm install

# 3. Build SDK package
npm run build:sdk

# 4. Deploy smart contracts (optional)
npm run compile
npm run deploy:sepolia

# 5. Run Next.js example application
npm run dev:nextjs
```

**That's it!** You're ready to build privacy-preserving applications with FHEVM.

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

---

## 🙏 Acknowledgments

Special thanks to:
- **Zama Team** - For pioneering Fully Homomorphic Encryption technology
- **FHEVM Community** - For feedback, support, and collaboration
- **Web3 Developers** - For inspiring this developer-friendly SDK design

---

## 📞 Contact & Support

- **Documentation**: [Full Docs](./docs/)
- **Live Demo**: [https://carbon-credit-trading-fhe.vercel.app/](https://carbon-credit-trading-fhe.vercel.app/)
- **API Reference**: [API.md](./docs/API.md)
- **Architecture Guide**: [ARCHITECTURE.md](./docs/ARCHITECTURE.md)

---

**Project Status**: ✅ Complete & Production Ready

**Powered by Zama FHEVM** 🔐
