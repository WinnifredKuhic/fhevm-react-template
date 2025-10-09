# System Architecture - Carbon Credit Trading Platform

## Overview

The Carbon Credit Trading Platform is a decentralized application (dApp) that leverages Zama's Fully Homomorphic Encryption (FHE) technology to enable privacy-preserving carbon credit trading on the Ethereum blockchain.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                            │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │
│  │  Web Frontend  │  │  Mobile App    │  │  CLI Tools     │   │
│  │  (React)       │  │  (React Native)│  │  (Node.js)     │   │
│  └────────────────┘  └────────────────┘  └────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Web3 Integration Layer                     │   │
│  │  • Ethers.js v6 - Blockchain interaction               │   │
│  │  • FHEVM Client SDK - Encryption/decryption            │   │
│  │  • MetaMask - Wallet connection                        │   │
│  │  • Transaction signing & broadcasting                  │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SMART CONTRACT LAYER                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │         CarbonCreditTrading.sol (Main Contract)         │   │
│  │                                                          │   │
│  │  Components:                                            │   │
│  │  ├── User Management                                    │   │
│  │  │   ├── Registration                                   │   │
│  │  │   ├── Role assignment                                │   │
│  │  │   └── Balance tracking (encrypted)                   │   │
│  │  │                                                       │   │
│  │  ├── Credit Management                                  │   │
│  │  │   ├── Issuer authorization                           │   │
│  │  │   ├── Credit issuance (encrypted amounts)            │   │
│  │  │   ├── Verification system                            │   │
│  │  │   └── Transfer tracking                              │   │
│  │  │                                                       │   │
│  │  ├── Order Management                                   │   │
│  │  │   ├── Buy order creation (encrypted)                 │   │
│  │  │   ├── Sell order creation (encrypted)                │   │
│  │  │   ├── Order cancellation                             │   │
│  │  │   └── Order book state                               │   │
│  │  │                                                       │   │
│  │  ├── Trade Execution                                    │   │
│  │  │   ├── Homomorphic balance verification               │   │
│  │  │   ├── Encrypted cost calculation                     │   │
│  │  │   ├── Balance updates (encrypted)                    │   │
│  │  │   └── Ownership transfer                             │   │
│  │  │                                                       │   │
│  │  └── View Functions                                     │   │
│  │      ├── User information                               │   │
│  │      ├── Credit details                                 │   │
│  │      ├── Order details                                  │   │
│  │      └── Sealed data access                             │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FHE ENCRYPTION LAYER                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Zama FHEVM Library                         │   │
│  │                                                          │   │
│  │  Encrypted Types:                                       │   │
│  │  ├── euint32 - 32-bit encrypted unsigned integers      │   │
│  │  ├── euint64 - 64-bit encrypted unsigned integers      │   │
│  │  └── ebool - Encrypted booleans                        │   │
│  │                                                          │   │
│  │  Homomorphic Operations:                                │   │
│  │  ├── FHE.add() - Encrypted addition                    │   │
│  │  ├── FHE.sub() - Encrypted subtraction                 │   │
│  │  ├── FHE.mul() - Encrypted multiplication              │   │
│  │  ├── FHE.gte() - Encrypted comparison (>=)             │   │
│  │  ├── FHE.lte() - Encrypted comparison (<=)             │   │
│  │  └── FHE.select() - Encrypted conditional              │   │
│  │                                                          │   │
│  │  Access Control:                                        │   │
│  │  ├── FHE.allow() - Grant data access                   │   │
│  │  └── FHE.seal() - Seal for authorized decryption       │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BLOCKCHAIN LAYER                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Ethereum Network (Sepolia)                 │   │
│  │                                                          │   │
│  │  • Chain ID: 11155111                                   │   │
│  │  • Consensus: Proof of Stake                            │   │
│  │  • Block time: ~12 seconds                              │   │
│  │  • EVM Version: Cancun                                  │   │
│  │  • State storage: Encrypted data on-chain               │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Smart Contract (CarbonCreditTrading.sol)

**Purpose**: Core business logic with FHE integration

**Key Features**:
- User registration and role management
- Carbon credit issuance with encrypted parameters
- Order book management with privacy
- Homomorphic trade execution
- Access-controlled view functions

**Data Structures**:

```solidity
struct User {
    bool registered;
    bool isIssuer;
    euint64 encryptedBalance;
    uint256 registrationTime;
}

struct CarbonCredit {
    uint256 creditId;
    address issuer;
    euint32 encryptedAmount;
    euint32 encryptedPrice;
    bytes32 verificationHash;
    uint256 issuanceTime;
    address currentOwner;
}

struct Order {
    uint256 orderId;
    address buyer;
    uint256 creditId;
    euint32 encryptedAmount;
    bool isActive;
    uint256 createdTime;
}
```

### 2. FHE Integration

**Encryption Flow**:

```
Client-Side:
  User Input (plaintext)
        ↓
  FHEVM Client SDK
        ↓
  Public Key Encryption
        ↓
  Encrypted Ciphertext
        ↓
  Send to Contract

Contract-Side:
  Receive Ciphertext
        ↓
  Store as euint32/euint64
        ↓
  Perform Homomorphic Operations
        ↓
  Results Remain Encrypted
        ↓
  Seal for Authorized Users

Client-Side (Decryption):
  Request Sealed Data
        ↓
  Verify Authorization
        ↓
  Decrypt with Private Key
        ↓
  View Plaintext Result
```

**Example: Trade Execution**

```solidity
function executeTrade(uint256 orderId) external {
    // Load encrypted values
    Order storage order = orders[orderId];
    CarbonCredit storage credit = carbonCredits[order.creditId];

    // Homomorphic multiplication (amount × price)
    euint64 totalCost = FHE.mul(
        FHE.asEuint64(order.encryptedAmount),
        FHE.asEuint64(credit.encryptedPrice)
    );

    // Encrypted comparison (balance >= totalCost)
    ebool hasSufficientBalance = FHE.gte(
        buyers[order.buyer].encryptedBalance,
        totalCost
    );

    // Encrypted subtraction (balance - totalCost)
    euint64 newBalance = FHE.sub(
        buyers[order.buyer].encryptedBalance,
        totalCost
    );

    // Update encrypted balance
    buyers[order.buyer].encryptedBalance = FHE.select(
        hasSufficientBalance,
        newBalance,
        buyers[order.buyer].encryptedBalance
    );
}
```

### 3. Access Control System

**Role Hierarchy**:

```
Owner (Contract Deployer)
  ↓
  ├─ Can authorize issuers
  ├─ Can pause contract
  └─ Can update parameters

Issuer (Authorized by Owner)
  ↓
  ├─ Can issue carbon credits
  ├─ Can set credit parameters
  └─ Can verify credits

User (Registered)
  ↓
  ├─ Can deposit tokens
  ├─ Can create orders
  ├─ Can execute trades
  └─ Can view own data
```

**Permission Model**:

```solidity
modifier onlyOwner() {
    require(msg.sender == owner, "Only owner");
    _;
}

modifier onlyIssuer() {
    require(users[msg.sender].isIssuer, "Only issuer");
    _;
}

modifier onlyRegistered() {
    require(users[msg.sender].registered, "Not registered");
    _;
}
```

## Data Flow Diagrams

### User Registration Flow

```
User Request
     ↓
registerUser(address)
     ↓
Check: Not already registered
     ↓
Create User struct
     ↓
Allocate encrypted balance (1,000,000)
     ↓
Set registered = true
     ↓
Emit UserRegistered event
     ↓
Return success
```

### Credit Issuance Flow

```
Issuer Request
     ↓
issueCredit(encAmount, encPrice, hash)
     ↓
Check: Caller is authorized issuer
     ↓
Create CarbonCredit struct
     ↓
Store encrypted amount (euint32)
     ↓
Store encrypted price (euint32)
     ↓
Store verification hash
     ↓
Increment credit counter
     ↓
Emit CreditIssued event
     ↓
Return creditId
```

### Trade Execution Flow

```
Buyer Request
     ↓
executeTrade(orderId)
     ↓
Load Order data
     ↓
Load CarbonCredit data
     ↓
Homomorphic Operations:
  ├─ totalCost = amount × price
  ├─ hasFunds = balance >= totalCost
  └─ newBalance = balance - totalCost
     ↓
Conditional Updates:
  ├─ Update buyer balance (encrypted)
  ├─ Update seller balance (encrypted)
  └─ Transfer credit ownership
     ↓
Mark order as inactive
     ↓
Emit TradeExecuted event
     ↓
Return success
```

## Security Architecture

### Defense in Depth

```
Layer 1: Input Validation
  ├─ Address validation
  ├─ Amount bounds checking
  └─ Parameter sanitization

Layer 2: Access Control
  ├─ Role-based permissions
  ├─ Function modifiers
  └─ Ownership verification

Layer 3: DoS Protection
  ├─ Rate limiting
  ├─ Batch size limits
  └─ Gas price caps

Layer 4: Reentrancy Protection
  ├─ Checks-Effects-Interactions pattern
  ├─ State updates before external calls
  └─ Mutex locks where needed

Layer 5: Emergency Controls
  ├─ Pause functionality
  ├─ Circuit breakers
  └─ Owner intervention

Layer 6: Audit & Monitoring
  ├─ Event logging
  ├─ State verification
  └─ Anomaly detection
```

### Encryption Security

**Privacy Guarantees**:

1. **Data Confidentiality**: All sensitive values encrypted
2. **Computation Privacy**: Operations on encrypted data
3. **Result Privacy**: Outputs remain encrypted
4. **Selective Disclosure**: Authorized access only

**Attack Resistance**:

- ✅ **Front-running**: Encrypted parameters prevent MEV
- ✅ **Price Manipulation**: Hidden order book
- ✅ **Information Leakage**: No plaintext exposure
- ✅ **Unauthorized Access**: Permission-based viewing

## Performance Optimization

### Gas Optimization Strategies

1. **Storage Packing**:
   ```solidity
   // Pack related variables
   struct Order {
       uint256 orderId;        // slot 1
       address buyer;          // slot 2 (20 bytes)
       bool isActive;          // slot 2 (1 byte) - packed
       uint256 creditId;       // slot 3
       euint32 encryptedAmount;// slot 4
   }
   ```

2. **Optimizer Settings**:
   ```javascript
   optimizer: {
       enabled: true,
       runs: 800  // Optimized for frequent calls
   }
   ```

3. **Function Visibility**:
   ```solidity
   // Use external for functions called from outside
   function executeTrade(uint256 orderId) external { }

   // Use internal for helper functions
   function _updateBalance(address user) internal { }
   ```

### Homomorphic Operation Costs

| Operation | Gas Cost (approx) | Use Case |
|-----------|-------------------|----------|
| FHE.add() | ~50,000 | Balance updates |
| FHE.sub() | ~50,000 | Deductions |
| FHE.mul() | ~100,000 | Cost calculation |
| FHE.gte() | ~80,000 | Balance verification |
| FHE.select() | ~60,000 | Conditional updates |

## Scalability Considerations

### Current Limitations

- **Transaction Throughput**: Limited by Ethereum block time (~12s)
- **Gas Costs**: FHE operations are expensive
- **Storage Costs**: Encrypted data requires more space
- **Computation Overhead**: Homomorphic operations slower than plaintext

### Scaling Solutions

1. **Layer 2 Integration**:
   - Deploy on Optimism/Arbitrum for lower gas costs
   - Maintain privacy with FHE on L2

2. **Batch Operations**:
   - Group multiple trades in single transaction
   - Amortize fixed costs across operations

3. **State Channels**:
   - Off-chain order matching
   - On-chain settlement only

4. **Upgradability**:
   - Proxy pattern for future improvements
   - Migrate to more efficient FHE schemes

## Testing Architecture

### Test Levels

```
Unit Tests (60 tests)
  ├─ Component isolation
  ├─ Edge case handling
  └─ Error conditions
       ↓
Integration Tests (6 tests)
  ├─ Multi-component interaction
  ├─ End-to-end workflows
  └─ Network validation
       ↓
System Tests
  ├─ Full deployment
  ├─ User journeys
  └─ Performance benchmarks
```

### Test Coverage

```
File: CarbonCreditTrading.sol
  ├─ Statements: 95.2%
  ├─ Branches: 88.7%
  ├─ Functions: 96.1%
  └─ Lines: 94.8%
```

## Deployment Architecture

### Network Topology

```
Development:
  Hardhat Network (Local)
    ├─ Chain ID: 31337
    ├─ Fast mining
    └─ Full reset capability

Testing:
  Sepolia Testnet
    ├─ Chain ID: 11155111
    ├─ Public infrastructure
    └─ Faucet availability

Production (Future):
  Ethereum Mainnet
    ├─ Chain ID: 1
    ├─ High security
    └─ Real economic value
```

## Future Enhancements

### Planned Improvements

1. **Advanced Features**:
   - Multi-party trades
   - Order matching algorithms
   - Auction mechanisms
   - Governance system

2. **Performance**:
   - Optimized FHE operations
   - Batch processing
   - Off-chain computation

3. **Interoperability**:
   - Cross-chain bridges
   - Oracle integration
   - External data feeds

4. **User Experience**:
   - Mobile applications
   - Real-time notifications
   - Analytics dashboard

---

**Last Updated**: 2025-10-25
**Version**: 1.0.0
