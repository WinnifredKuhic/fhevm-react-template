/**
 * FHE Type Definitions
 * TypeScript types for Fully Homomorphic Encryption operations
 */

export type FHEType = 'euint8' | 'euint16' | 'euint32' | 'euint64' | 'euint128' | 'ebool';

export type FHEOperation = 'add' | 'sub' | 'mul' | 'div' | 'eq' | 'ne' | 'gte' | 'lte' | 'gt' | 'lt';

export interface EncryptedValue {
  handles: string;
  inputProof: string;
  type: FHEType;
  contractAddress: string;
}

export interface DecryptedValue {
  value: number | bigint | boolean;
  handle: string;
  contractAddress: string;
  verified: boolean;
}

export interface FHEPublicKey {
  key: string;
  contractAddress: string;
  version: string;
  algorithm: string;
  generatedAt: number;
}

export interface FHEClientConfig {
  provider?: any;
  network?: {
    chainId: number;
    name?: string;
    rpcUrl?: string;
  };
  contractAddress?: string;
}

export interface ComputationResult {
  handle: string;
  operation: FHEOperation;
  operandCount: number;
  contractAddress: string;
  timestamp: number;
}

export interface EncryptionOptions {
  type?: FHEType;
  contractAddress: string;
}

export interface DecryptionOptions {
  contractAddress: string;
  handle: string;
  signature?: string;
  userAddress?: string;
}

export interface FHEClientState {
  isInitialized: boolean;
  isLoading: boolean;
  error: Error | null;
  publicKey: FHEPublicKey | null;
}
