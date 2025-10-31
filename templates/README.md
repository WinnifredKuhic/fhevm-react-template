# FHEVM SDK Templates

This directory contains starter templates for different frameworks demonstrating FHEVM SDK integration.

## Available Templates

### Next.js Template

**Location**: `nextjs/` (links to `../examples/nextjs-carbon-trading`)

A complete Next.js 14+ application demonstrating:

- **React Hooks Integration** - `useFhevm`, `useEncrypt`, `useDecrypt`
- **SDK Provider Setup** - FhevmProvider configuration
- **API Routes** - FHE encryption/decryption endpoints
- **Component Examples** - Fully functional UI components
- **TypeScript Support** - Full type safety with IntelliSense

**Quick Start**:

```bash
cd nextjs-carbon-trading
npm install
npm run dev
```

**Features**:
- ✅ Encrypted balance viewing with EIP-712 decryption
- ✅ Credit issuance with private amounts
- ✅ Order creation with encrypted parameters
- ✅ Trade execution with homomorphic operations
- ✅ Modern UI with Tailwind CSS
- ✅ Complete TypeScript support

## Using Templates

### Starting a New Project

1. **Copy the template**:
```bash
cp -r templates/nextjs my-new-project
cd my-new-project
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment**:
```bash
cp .env.example .env
# Edit .env with your settings
```

4. **Start development**:
```bash
npm run dev
```

### Template Structure

All templates follow this structure based on the FHEVM SDK:

```
template/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout with providers
│   │   ├── page.tsx            # Main page
│   │   ├── providers.tsx       # FhevmProvider setup
│   │   └── api/                # API routes
│   │       ├── fhe/            # FHE operations
│   │       └── keys/           # Key management
│   ├── components/             # React components
│   │   ├── ui/                 # UI components
│   │   ├── fhe/                # FHE-specific components
│   │   └── examples/           # Example use cases
│   ├── hooks/                  # Custom hooks
│   ├── lib/                    # Utilities
│   └── types/                  # TypeScript types
├── package.json
└── README.md
```

## SDK Integration

All templates integrate the `@fhevm/sdk` package:

```typescript
import { FhevmProvider, useFhevm, useEncrypt, useDecrypt } from '@fhevm/sdk';
```

### Basic Setup

```typescript
// app/providers.tsx
import { FhevmProvider } from '@fhevm/sdk';

export function Providers({ children }) {
  return (
    <FhevmProvider config={{ network: { chainId: 11155111 } }}>
      {children}
    </FhevmProvider>
  );
}
```

### Using Hooks

```typescript
// components/MyComponent.tsx
import { useFhevm, useEncrypt, useDecrypt } from '@fhevm/sdk';

function MyComponent() {
  const { client, isInitialized } = useFhevm();
  const { encrypt } = useEncrypt();
  const { decrypt } = useDecrypt();

  // Use encryption/decryption
}
```

## Future Templates

Additional templates planned:
- Vue.js template
- Pure Node.js backend template
- React SPA template

## Resources

- **Main Documentation**: [../README.md](../README.md)
- **SDK Documentation**: [../packages/fhevm-sdk/README.md](../packages/fhevm-sdk/README.md)
- **API Reference**: [../docs/API.md](../docs/API.md)
- **Architecture Guide**: [../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)

## Support

For issues and questions:
- Check the main README
- Review example implementations
- Consult the API documentation
