# Migration Guide: Static HTML to React Application

This document outlines the conversion of the Carbon Credit Trading platform from a static HTML/JavaScript application to a modern React application with TypeScript and SDK integration.

## Overview of Changes

The application has been completely refactored from vanilla JavaScript to a React-based TypeScript application while maintaining all functionality and the same visual design.

## Architecture Changes

### Before (Static HTML)
```
carbon-credit-trading/
├── public/
│   ├── index.html        (1 file, 200 lines - entire UI)
│   ├── app.js            (1 file, 1251 lines - all logic)
│   └── style.css         (1 file, 652 lines)
├── contracts/            (unchanged)
├── scripts/              (unchanged)
└── package.json          (minimal dependencies)
```

### After (React Application)
```
carbon-credit-trading/
├── src/
│   ├── components/       (5 React components)
│   ├── hooks/            (3 custom hooks)
│   ├── lib/              (utilities + ABI)
│   ├── types/            (TypeScript types)
│   ├── App.tsx           (main component)
│   └── main.tsx          (entry point)
├── contracts/            (unchanged)
├── scripts/              (unchanged)
├── index.html            (minimal React mount point)
├── vite.config.ts        (build configuration)
├── tsconfig.json         (TypeScript config)
└── package.json          (React + TypeScript dependencies)
```

## Key Conversions

### 1. ABI Extraction

**Before**: Embedded directly in `app.js` (690 lines)
```javascript
const CONTRACT_ABI = [ ... ];  // Huge array in app.js
```

**After**: Separate JSON file
```typescript
// src/lib/abi.json
import CONTRACT_ABI from './abi.json';
```

### 2. Wallet Connection

**Before**: Global variables and event listeners
```javascript
let provider, signer, contract, userAddress;

async function connectWallet() {
  provider = new ethers.providers.Web3Provider(window.ethereum);
  signer = provider.getSigner();
  userAddress = await signer.getAddress();
  contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}
```

**After**: React hook with state management
```typescript
// src/hooks/useWallet.ts
export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnected: false,
  });
  // ... managed state and effects
};
```

### 3. Contract Interactions

**Before**: Direct contract calls scattered throughout code
```javascript
async function registerUser() {
  const tx = await contract.registerUser();
  await tx.wait();
}
```

**After**: Centralized hook with error handling
```typescript
// src/hooks/useContract.ts
export const useContract = () => {
  const registerUser = useCallback(async () => {
    if (!contract) throw new Error('Contract not initialized');
    const tx = await contract.registerUser();
    await tx.wait();
  }, [contract]);

  return { registerUser, /* ... other methods */ };
};
```

### 4. UI Components

**Before**: Imperative DOM manipulation
```javascript
function showTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  document.getElementById(tabName).classList.add('active');
}
```

**After**: Declarative React components
```typescript
// src/App.tsx
const [activeTab, setActiveTab] = useState<TabId>('register');

<div className={`tab-content ${activeTab === 'register' ? 'active' : ''}`}>
  <UserRegistration />
</div>
```

### 5. Form Handling

**Before**: Event listeners on DOM elements
```javascript
document.getElementById('issueForm').addEventListener('submit', issueCredits);

async function issueCredits(event) {
  event.preventDefault();
  const amount = parseInt(document.getElementById('creditAmount').value);
  const price = parseInt(document.getElementById('creditPrice').value);
  // ...
}
```

**After**: React controlled components
```typescript
// src/components/CreditManagement.tsx
const [formData, setFormData] = useState({
  amount: '',
  pricePerCredit: '',
  projectType: '',
  verificationHash: '',
});

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const params: IssueCreditsParams = {
    amount: parseInt(formData.amount),
    pricePerCredit: parseInt(formData.pricePerCredit),
    projectType: formData.projectType as ProjectType,
    verificationHash: formData.verificationHash,
  };
  await issueCredits(params);
};
```

### 6. Status Messages

**Before**: Utility function updating DOM
```javascript
function showStatus(elementId, message, type) {
  const element = document.getElementById(elementId);
  element.textContent = message;
  element.className = `status-message ${type}`;
}
```

**After**: Component state
```typescript
const [message, setMessage] = useState<{
  text: string;
  type: 'success' | 'error' | 'loading';
} | null>(null);

{message && (
  <div className={`status-message ${message.type}`}>
    {message.text}
  </div>
)}
```

## File-by-File Mapping

### Component Breakdown

| Original Function | New Component/Hook | File |
|------------------|-------------------|------|
| `connectWallet()` | `useWallet` hook | `src/hooks/useWallet.ts` |
| `registerUser()` | `UserRegistration` component | `src/components/UserRegistration.tsx` |
| `issueCredits()` | `CreditManagement` component | `src/components/CreditManagement.tsx` |
| `createBuyOrder()` | `OrderManagement` component | `src/components/OrderManagement.tsx` |
| `loadAvailableCredits()` | `TradeExecution` component | `src/components/TradeExecution.tsx` |
| `loadUserOrders()` | `TradeExecution` component | `src/components/TradeExecution.tsx` |
| `refreshBalances()` | `BalanceDisplay` component | `src/components/BalanceDisplay.tsx` |
| `depositTokens()` | `BalanceDisplay` component | `src/components/BalanceDisplay.tsx` |
| All contract methods | `useContract` hook | `src/hooks/useContract.ts` |

### Utility Functions

| Original | New Location | Purpose |
|---------|-------------|---------|
| `formatAddress()` | `src/lib/contract.ts` | Format address display |
| `formatTimestamp()` | `src/lib/contract.ts` | Format timestamps |
| `isValidHex()` | `src/lib/contract.ts` | Validate hex strings |
| `getProvider()` | `src/lib/contract.ts` | Get ethers provider |
| `getContract()` | `src/lib/contract.ts` | Get contract instance |

## TypeScript Integration

### Type Definitions Created

All interfaces are defined in `src/types/index.ts`:

- `CreditInfo` - Credit information structure
- `OrderInfo` - Order information structure
- `SystemStats` - System statistics
- `UserBalances` - User balance data
- `WalletState` - Wallet connection state
- `ProjectType` - Enum for project types
- `IssueCreditsParams` - Parameters for issuing credits
- `CreateOrderParams` - Parameters for creating orders
- `TabId` - Valid tab identifiers

### Benefits of TypeScript

1. **Type Safety**: Compile-time error checking
2. **Autocomplete**: Better IDE support
3. **Refactoring**: Safer code changes
4. **Documentation**: Types serve as inline documentation
5. **Maintainability**: Easier to understand code structure

## SDK Integration Points

### FHEVM SDK Hook (`src/hooks/useFHE.ts`)

Placeholder implementation for FHE operations:

```typescript
export const useFHE = () => {
  const initializeFHE = async () => {
    // TODO: Initialize FHEVM SDK
  };

  const encryptValue = async (value: number): Promise<string> => {
    // TODO: Implement encryption
  };

  const decryptValue = async (encryptedValue: string): Promise<number> => {
    // TODO: Implement decryption
  };

  const requestReencryption = async (encryptedValue: bigint) => {
    // TODO: Implement re-encryption request
  };
};
```

### Integration Steps (Future)

1. Install FHEVM SDK package
2. Configure gateway URL
3. Implement encryption in `useFHE.ts`
4. Update components to encrypt inputs
5. Add decryption UI for viewing balances

## Styling

The original CSS (`public/style.css`) has been preserved as `src/App.css` with:
- All cyberpunk dark theme styles maintained
- Same animations and effects
- Identical visual appearance
- Responsive design intact

## Build Process

### Development

**Before**: Simple HTTP server
```bash
# Just open index.html in browser
```

**After**: Vite dev server with hot reload
```bash
npm run dev
# Hot module replacement, TypeScript compilation
```

### Production

**Before**: No build process
```bash
# Deploy static files as-is
```

**After**: Optimized production bundle
```bash
npm run build
# TypeScript compilation + Vite bundling + minification
```

## Benefits of Migration

### Developer Experience

1. **Component Reusability**: Components can be reused across projects
2. **Better Organization**: Clear separation of concerns
3. **Type Safety**: Catch errors at compile time
4. **Modern Tooling**: Vite for fast dev server and builds
5. **Better Testing**: Components can be unit tested

### Code Quality

1. **Maintainability**: Smaller, focused files instead of one huge file
2. **Readability**: Clear component hierarchy
3. **Debugging**: React DevTools support
4. **State Management**: Predictable React state
5. **Error Handling**: Centralized error handling in hooks

### Performance

1. **Code Splitting**: Vite automatically splits code
2. **Tree Shaking**: Unused code is eliminated
3. **Lazy Loading**: Components can be lazy loaded
4. **Optimized Bundle**: Production builds are minified and optimized

## Breaking Changes

### For Users

- **None**: The UI and functionality are identical
- Same workflow and user experience
- Same visual design

### For Developers

- Must use `npm run dev` instead of opening HTML file
- Need to install dependencies with `npm install`
- TypeScript knowledge helpful but not required
- Build step required for production deployment

## Migration Checklist

If you want to apply similar changes to another project:

- [ ] Create React project structure
- [ ] Extract ABI to JSON file
- [ ] Define TypeScript types
- [ ] Create utility functions
- [ ] Implement wallet hook
- [ ] Implement contract hook
- [ ] Convert each UI section to component
- [ ] Migrate event handlers to React
- [ ] Migrate form handling
- [ ] Copy/adapt CSS
- [ ] Update package.json
- [ ] Configure TypeScript
- [ ] Configure build tool (Vite)
- [ ] Update HTML template
- [ ] Create README with instructions
- [ ] Test all functionality

## Backward Compatibility

The original static HTML application is preserved in the `public/` directory:
- `public/index.html` - Original HTML
- `public/app.js` - Original JavaScript
- `public/style.css` - Original CSS

You can still run the legacy version if needed, though the React version is recommended for all new development.

## Next Steps

1. **Install dependencies**: `npm install`
2. **Start dev server**: `npm run dev`
3. **Test all features**: Ensure everything works
4. **Integrate FHEVM SDK**: Add full encryption support
5. **Add tests**: Create unit tests for components
6. **Deploy**: Build and deploy the React version

## Support

For questions about the migration:
- Review this guide
- Check the README-REACT.md for usage
- Compare old and new implementations
- Open an issue if you find bugs
