/**
 * Core type definitions for FHEVM SDK
 */

import type { BrowserProvider, JsonRpcProvider, Signer } from 'ethers';

export type Provider = BrowserProvider | JsonRpcProvider;
export type ContractAddress = string;
export type UserAddress = string;

/**
 * FHEVM Configuration
 */
export interface FhevmConfig {
  /** Network configuration */
  network?: {
    chainId: number;
    name: string;
    rpcUrl: string;
  };

  /** ACL contract address */
  aclAddress?: ContractAddress;

  /** KMS verifier contract address */
  kmsVerifierAddress?: ContractAddress;

  /** Gateway contract address */
  gatewayAddress?: ContractAddress;

  /** Public key for encryption */
  publicKey?: string;

  /** Optional provider */
  provider?: Provider;

  /** Optional signer */
  signer?: Signer;
}

/**
 * FHEVM Instance
 */
export interface FhevmInstance {
  /** Instance from fhevmjs */
  instance: any;

  /** Ethereum provider */
  provider: Provider;

  /** Current signer */
  signer?: Signer;

  /** Network chain ID */
  chainId: number;

  /** Public encryption key */
  publicKey: string;

  /** ACL contract address */
  aclAddress: ContractAddress;

  /** KMS verifier address */
  kmsVerifierAddress: ContractAddress;

  /** Gateway address */
  gatewayAddress: ContractAddress;
}

/**
 * Encrypted Input for contract calls
 */
export interface EncryptedInput {
  /** Encrypted data handles */
  handles: string;

  /** Input proof */
  inputProof: Uint8Array;
}

/**
 * Decrypted Output from contract
 */
export interface DecryptedOutput {
  /** Decrypted value */
  value: bigint | boolean | number;

  /** Original encrypted value */
  encryptedValue: string;
}

/**
 * EIP-712 Signature for user decrypt
 */
export interface EIP712Signature {
  /** Signature domain */
  domain: {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: ContractAddress;
  };

  /** Signature types */
  types: Record<string, Array<{ name: string; type: string }>>;

  /** Signature value */
  value: {
    publicKey: string;
    contractAddress: ContractAddress;
  };

  /** Actual signature */
  signature: string;
}

/**
 * Decrypt permission request
 */
export interface DecryptPermission {
  /** Contract address */
  contractAddress: ContractAddress;

  /** User address */
  userAddress: UserAddress;

  /** Public key for sealing */
  publicKey: string;

  /** EIP-712 signature */
  signature: string;
}

/**
 * Encrypted type enum
 */
export enum EncryptedType {
  EUINT8 = 'euint8',
  EUINT16 = 'euint16',
  EUINT32 = 'euint32',
  EUINT64 = 'euint64',
  EUINT128 = 'euint128',
  EUINT256 = 'euint256',
  EBOOL = 'ebool',
  EADDRESS = 'eaddress'
}

/**
 * Encryption options
 */
export interface EncryptOptions {
  /** Type of encrypted value */
  type?: EncryptedType;

  /** Contract address for encryption */
  contractAddress?: ContractAddress;

  /** User address */
  userAddress?: UserAddress;
}

/**
 * Decryption options
 */
export interface DecryptOptions {
  /** Contract address */
  contractAddress: ContractAddress;

  /** Encrypted handle */
  handle: string;

  /** User private key or signer */
  signer: Signer;

  /** Public key for sealing */
  publicKey?: string;
}

/**
 * Batch encryption input
 */
export interface BatchEncryptInput {
  /** Values to encrypt */
  values: Array<number | bigint | boolean>;

  /** Types for each value */
  types: EncryptedType[];

  /** Contract address */
  contractAddress?: ContractAddress;
}

/**
 * Batch decryption input
 */
export interface BatchDecryptInput {
  /** Contract address */
  contractAddress: ContractAddress;

  /** Encrypted handles */
  handles: string[];

  /** Signer for decryption */
  signer: Signer;
}

/**
 * SDK Error types
 */
export class FhevmError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'FhevmError';
  }
}

export class EncryptionError extends FhevmError {
  constructor(message: string, details?: any) {
    super(message, 'ENCRYPTION_ERROR', details);
    this.name = 'EncryptionError';
  }
}

export class DecryptionError extends FhevmError {
  constructor(message: string, details?: any) {
    super(message, 'DECRYPTION_ERROR', details);
    this.name = 'DecryptionError';
  }
}

export class InitializationError extends FhevmError {
  constructor(message: string, details?: any) {
    super(message, 'INITIALIZATION_ERROR', details);
    this.name = 'InitializationError';
  }
}
