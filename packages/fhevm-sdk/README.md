# @fhevm/sdk

> Universal SDK for building privacy-preserving dApps with Zama's Fully Homomorphic Encryption

## 🚀 Quick Start

```bash
npm install @fhevm/sdk
```

```typescript
import { FhevmClient } from '@fhevm/sdk';
import { ethers } from 'ethers';

// Initialize
const provider = new ethers.BrowserProvider(window.ethereum);
const client = new FhevmClient({ provider });
await client.init();

// Encrypt
const encrypted = await client.encrypt(1000, {
  type: 'euint32',
  contractAddress: '0x...'
});

// Use in contract call
await contract.transfer(encrypted.handles, encrypted.inputProof);

// Decrypt
const signer = await provider.getSigner();
const decrypted = await client.decrypt({
  contractAddress: '0x...',
  handle: '0x...',
  signer
});
```

## ✨ Features

- ✅ **Framework-Agnostic** - Works with any JavaScript environment
- ✅ **React Integration** - Optional hooks for React apps
- ✅ **TypeScript** - Full type safety with IntelliSense
- ✅ **Easy Encryption** - Automatic type inference
- ✅ **EIP-712 Signatures** - Secure decryption with user consent
- ✅ **Batch Operations** - Encrypt/decrypt multiple values efficiently

## 📖 Usage

### Framework-Agnostic Core

```typescript
import { FhevmClient } from '@fhevm/sdk';

const client = new FhevmClient({ provider, network: { chainId: 11155111 } });
await client.init();

// Encrypt values
const encrypted = await client.encrypt(1000);

// Decrypt values
const decrypted = await client.decrypt({ contractAddress, handle, signer });
```

### React Hooks

```typescript
import { FhevmProvider, useFhevm, useEncrypt, useDecrypt } from '@fhevm/sdk/react';

// Wrap your app
function App() {
  return (
    <FhevmProvider config={{ provider }}>
      <MyComponent />
    </FhevmProvider>
  );
}

// Use in components
function MyComponent() {
  const { client, isInitialized } = useFhevm();
  const { encrypt, isEncrypting } = useEncrypt();
  const { decrypt, data, isDecrypting } = useDecrypt();

  // Encrypt and send
  const handleEncrypt = async () => {
    const encrypted = await encrypt(1000);
    await contract.someFunction(encrypted.handles, encrypted.inputProof);
  };

  // Decrypt and display
  const handleDecrypt = async () => {
    const decrypted = await decrypt({ contractAddress, handle, signer });
    console.log(decrypted.value);
  };
}
```

## 🎯 API Reference

### FhevmClient

Main SDK class for encryption/decryption operations.

#### Methods

- **`init(): Promise<void>`** - Initialize the FHEVM instance
- **`encrypt(value, options): Promise<EncryptedInput>`** - Encrypt a value
- **`decrypt(options): Promise<DecryptedOutput>`** - Decrypt a value with EIP-712
- **`publicDecrypt(contractAddress, handle): Promise<bigint>`** - Public decryption
- **`getPublicKey(): Promise<string>`** - Get encryption public key

### React Hooks

- **`useFhevm()`** - Access FHEVM client instance
- **`useEncrypt()`** - Encrypt values with loading state
- **`useDecrypt()`** - Decrypt values with loading state
- **`useContractWrite(contract)`** - Contract interactions helper

### Types

```typescript
interface EncryptedInput {
  handles: string;
  inputProof: Uint8Array;
}

interface DecryptedOutput {
  value: bigint | boolean | number;
  encryptedValue: string;
}

enum EncryptedType {
  EUINT8 = 'euint8',
  EUINT16 = 'euint16',
  EUINT32 = 'euint32',
  EUINT64 = 'euint64',
  EUINT128 = 'euint128',
  EUINT256 = 'euint256',
  EBOOL = 'ebool',
}
```

## 📦 Installation

```bash
# npm
npm install @fhevm/sdk

# yarn
yarn add @fhevm/sdk

# pnpm
pnpm add @fhevm/sdk
```

## 🔧 Configuration

```typescript
const config: FhevmConfig = {
  provider: ethersProvider,           // Required: Ethers provider
  network: {
    chainId: 11155111,                // Sepolia testnet
    name: 'sepolia',
    rpcUrl: 'https://...'
  },
  aclAddress: '0x...',                // Optional: ACL contract
  kmsVerifierAddress: '0x...',        // Optional: KMS verifier
  gatewayAddress: '0x...',            // Optional: Gateway
  signer: ethersSigner,               // Optional: Signer for transactions
};

const client = new FhevmClient(config);
await client.init();
```

## 🎨 Examples

See the `examples/` directory for complete implementations:

- **`nextjs-carbon-trading/`** - Next.js app with React hooks
- **`carbon-credit-trading/`** - Full dApp with smart contracts

## 📚 Documentation

For complete documentation, see:

- [Main README](../../README.md)
- [API Reference](../../docs/API.md)
- [Architecture](../../docs/ARCHITECTURE.md)
- [Examples](../../docs/EXAMPLES.md)

## 🤝 Contributing

Contributions welcome! Please see the main repository for guidelines.

## 📄 License

MIT License - see [LICENSE](../../LICENSE) for details.

---

**Built for the Zama FHEVM SDK Bounty**

**Powered by Zama FHEVM** 🔐
