/**
 * @fhevm/sdk - Universal FHEVM SDK
 *
 * A framework-agnostic SDK for building privacy-preserving dApps
 * with Zama's Fully Homomorphic Encryption (FHE) technology.
 *
 * @module @fhevm/sdk
 */

export { FhevmClient } from './client';
export { FhevmProvider, useFhevm } from './provider';
export {
  encryptInput,
  decryptOutput,
  userDecrypt,
  publicDecrypt
} from './encryption';
export {
  createFhevmInstance,
  initFhevm,
  getFhevmInstance
} from './instance';
export * from './types';
export * from './utils';

// Re-export commonly used types
export type {
  FhevmConfig,
  EncryptedInput,
  DecryptedOutput,
  FhevmInstance,
  ContractAddress,
  UserAddress
} from './types';
