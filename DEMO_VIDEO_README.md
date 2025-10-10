# Demo Video - Carbon Credit Trading Platform

## 📹 Video File

**Filename**: `demo.mp4`
**Duration**: ~5 minutes
**Resolution**: 1080p (1920x1080)
**Format**: MP4 (H.264)

## 🎬 Video Content Overview

This demonstration video showcases the complete functionality of the Carbon Credit Trading Platform, highlighting the privacy-preserving features enabled by Zama's FHEVM technology.

### Video Structure

```
[00:00 - 00:30] Introduction
├── Platform overview
├── Problem statement
└── FHE technology introduction

[00:30 - 01:00] Platform Setup
├── Contract deployment to Sepolia
├── Network configuration
├── Initial state verification
└── Etherscan verification

[01:00 - 02:00] User Onboarding & Credit Issuance
├── User registration process
│   ├── Register Buyer 1
│   ├── Register Buyer 2
│   └── Register Issuer
├── Issuer authorization
└── Carbon credit issuance
    ├── Credit 1: Encrypted amount & price
    ├── Credit 2: Different parameters
    └── Verification hash generation

[02:00 - 03:00] Token Operations & Order Creation
├── Token deposits (encrypted balances)
│   ├── Buyer 1: 1,000,000 tokens
│   ├── Buyer 2: 500,000 tokens
│   └── Balance encryption demonstration
└── Order creation
    ├── Buy Order 1: Encrypted parameters
    ├── Buy Order 2: Different amount
    └── Order book state

[03:00 - 04:00] Trade Execution & Settlement
├── Trade matching algorithm
├── Homomorphic balance verification
│   ├── FHE.mul() for cost calculation
│   ├── FHE.gte() for balance check
│   └── FHE.sub() for balance updates
├── Trade execution
│   ├── Encrypted balance updates
│   ├── Credit ownership transfer
│   └── Trade event emission
└── Settlement verification

[04:00 - 04:30] Privacy Demonstration
├── Encrypted data inspection
│   ├── View order details (encrypted)
│   ├── View balance (encrypted)
│   └── View credit amount (encrypted)
├── Sealed data access
│   ├── Authorized access
│   ├── Permission system
│   └── Decrypted values for authorized users
└── On-chain privacy verification

[04:30 - 05:00] Conclusion & Summary
├── Platform capabilities recap
├── FHE benefits demonstration
├── Real-world applications
├── Future enhancements
└── Call to action
```

## 🎯 Key Demonstrations

### 1. Privacy Preservation (01:30 - 02:00)

**Demonstration**: Show how sensitive trading data remains encrypted

```
Before Encryption (Traditional):
┌─────────────────────────────────┐
│ Order #1                        │
│ Amount: 1000 credits  [VISIBLE] │
│ Price: 50 USD         [VISIBLE] │
│ Total: 50,000 USD     [VISIBLE] │
└─────────────────────────────────┘

After Encryption (FHEVM):
┌─────────────────────────────────┐
│ Order #1                        │
│ Amount: euint32(0x7a3f...)     │
│ Price: euint32(0x9b2e...)      │
│ Total: euint64(0x1c4d...)      │
└─────────────────────────────────┘
```

### 2. Homomorphic Operations (03:00 - 03:30)

**Demonstration**: Execute trade logic on encrypted data

```javascript
// Show in Etherscan transaction trace
1. Load encrypted amount: euint32(0x7a3f...)
2. Load encrypted price: euint32(0x9b2e...)
3. Homomorphic multiply: FHE.mul(amount, price)
4. Result: euint64(0x1c4d...) [STILL ENCRYPTED]
5. Compare with balance: FHE.gte(balance, totalCost)
6. Conditional execution: FHE.select(canExecute, ...)
```

### 3. Access Control (04:00 - 04:30)

**Demonstration**: Show how data access is controlled

```
Unauthorized Access:
User A requests Order #1 details
→ Returns: encrypted ciphertext only
→ Cannot decrypt without permission

Authorized Access:
Order Owner requests Order #1 details
→ Returns: sealed encrypted value
→ Can decrypt with private key
→ Reveals: Amount: 1000, Price: 50
```

## 🎥 Recording Guidelines

### Technical Setup

**Screen Recording Software**: OBS Studio or Camtasia
**Screen Resolution**: 1920x1080 (Full HD)
**Frame Rate**: 30 FPS
**Audio**: Clear narration with noise cancellation
**Cursor**: Highlighted for visibility

### Visual Elements

1. **Title Slides**
   - Clean, professional design
   - Platform logo
   - Zama FHEVM branding
   - Section titles

2. **Code Highlights**
   - Syntax highlighting for Solidity
   - Key lines emphasized
   - Annotations for important concepts

3. **Transaction Views**
   - Etherscan transaction details
   - Encrypted parameters highlighted
   - Gas costs displayed
   - Event logs shown

4. **UI Demonstrations**
   - Interactive CLI usage
   - Command execution
   - Result displays
   - Error handling

### Narration Script

#### Introduction (00:00 - 00:30)
```
"Welcome to the Carbon Credit Trading Platform demonstration.

This project solves a critical problem in environmental markets:
how to enable transparent carbon credit trading while protecting
sensitive business information.

Using Zama's Fully Homomorphic Encryption technology, we've built
a platform where all trading data remains encrypted on-chain,
yet smart contracts can still execute complex trading logic.

Let's see how it works."
```

#### Platform Setup (00:30 - 01:00)
```
"First, let's deploy our contract to the Sepolia testnet.

[Show deployment command]
npm run deploy:sepolia

[Show output]
The contract is now deployed at this address.
Let's verify it on Etherscan.

[Navigate to Etherscan]
Here we can see the contract is verified and ready to use.
All encrypted operations will be visible on-chain,
but the actual values remain private."
```

#### User Onboarding (01:00 - 02:00)
```
"Now let's onboard users to the platform.

[Show registration]
We're registering three users: two buyers and one issuer.

[Show issuer authorization]
The platform owner authorizes this address as a carbon credit issuer.

[Show credit issuance]
The issuer creates carbon credits with encrypted amounts and prices.
Notice how the parameters are encrypted before being sent to the contract.

[Show Etherscan]
On-chain, we can only see the encrypted ciphertext, not the actual values."
```

#### Trading Operations (02:00 - 04:00)
```
"Let's execute some trades.

[Show token deposits]
Buyers deposit tokens with encrypted amounts.

[Show order creation]
Buyers create buy orders with encrypted parameters.

[Show trade execution]
When a trade is executed, the smart contract:
1. Multiplies encrypted amount by encrypted price
2. Checks encrypted balance is sufficient
3. Updates encrypted balances
4. Transfers credit ownership

All of this happens on encrypted data - the contract never sees
the actual amounts."
```

#### Privacy Demonstration (04:00 - 04:30)
```
"Let me demonstrate the privacy guarantees.

[Show encrypted view]
When we query the contract for order details, we get encrypted values.
Even though this is on a public blockchain, the sensitive data is protected.

[Show authorized access]
However, authorized parties can request sealed values,
which they can decrypt with their private keys.

This provides privacy by default, with selective transparency."
```

#### Conclusion (04:30 - 05:00)
```
"The Carbon Credit Trading Platform demonstrates the power of
Fully Homomorphic Encryption for real-world applications.

Key benefits:
✓ Complete privacy for trading data
✓ Verifiable on-chain computation
✓ No trusted third parties
✓ Regulatory compliance friendly

This technology can transform carbon markets and enable
truly confidential trading at scale.

Thank you for watching!"
```

## 📝 Video Checklist

Before submission, ensure:

- [ ] Video is exactly named `demo.mp4`
- [ ] Resolution is 1080p (1920x1080)
- [ ] Duration is 4-6 minutes
- [ ] Audio is clear and professional
- [ ] All demonstrations work as expected
- [ ] Etherscan transactions are visible
- [ ] Encrypted values are clearly shown
- [ ] Privacy features are demonstrated
- [ ] No personal information exposed
- [ ] No wallet private keys shown
- [ ] Zama branding is visible
- [ ] Professional title slides included
- [ ] Smooth transitions between sections
- [ ] Cursor is visible when needed
- [ ] Text is readable at 1080p
 

## 🎨 Visual Assets Needed

1. **Title Slide**
   - Platform name and logo
   - "Built for Zama FHE Challenge"
   - Zama logo

2. **Section Dividers**
   - Clean design
   - Section name
   - Progress indicator

3. **Diagrams**
   - Architecture diagram
   - Data flow diagram
   - Encryption flow

4. **Code Snippets**
   - Syntax highlighted
   - Key functions
   - Homomorphic operations

5. **Screenshots**
   - Etherscan transactions
   - Contract verification
   - Encrypted data views

## 🔧 Post-Production

### Editing Checklist

- [ ] Trim unnecessary pauses
- [ ] Add professional intro
- [ ] Add section titles
- [ ] Highlight important areas
- [ ] Add zoom effects for details
- [ ] Add music (low volume, non-distracting)
- [ ] Balance audio levels
- [ ] Add captions for accessibility
- [ ] Export at 1080p 30fps
- [ ] Compress to reasonable file size (< 100MB)

### Export Settings

```
Format: MP4
Codec: H.264
Resolution: 1920x1080
Frame Rate: 30 fps
Bitrate: 5-8 Mbps (for quality)
Audio: AAC, 128-192 kbps
```

## 📤 Submission

**File Location**: `fhevm-react-template/demo.mp4`
**Maximum Size**: 100 MB
**Required**: Yes (core competition requirement)

---

**Note**: This is a guide for creating the demo video. The actual `demo.mp4` file should be recorded and placed in the competition submission directory before final submission.

**Last Updated**: 2025-10-25
