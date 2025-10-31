/**
 * FHEVM utility functions for encryption and decryption operations
 */

import { EncryptedType } from '@fhevm/sdk';

/**
 * Gateway URL for FHEVM operations
 * In production, this should be configured based on the network
 */
export const GATEWAY_URL = 'http://localhost:8545';

/**
 * ACL contract address for access control
 * Should be deployed and configured for your network
 */
export const ACL_ADDRESS = '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6';

/**
 * KMS Verifier contract address
 * Used for key management and verification
 */
export const KMS_VERIFIER_ADDRESS = '0x8f86403A4DE0BB5791fa46B8e795C547942fE4Cf';

/**
 * Determine the appropriate encrypted type based on value size
 * @param value - The numeric value to encrypt
 * @returns The appropriate EncryptedType
 */
export function inferEncryptedType(value: number): EncryptedType {
  if (value < 256) return EncryptedType.EUINT8;
  if (value < 65536) return EncryptedType.EUINT16;
  if (value < 4294967296) return EncryptedType.EUINT32;
  return EncryptedType.EUINT64;
}

/**
 * Convert encrypted input proof to hex string for contract calls
 * @param proof - The input proof Uint8Array
 * @returns Hex string representation
 */
export function proofToHex(proof: Uint8Array): string {
  return '0x' + Array.from(proof)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Validate contract address format
 * @param address - The address to validate
 * @returns true if valid
 */
export function isValidContractAddress(address: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(address);
}

/**
 * Format encrypted value for display
 * @param value - The encrypted value (bigint or string)
 * @returns Formatted string
 */
export function formatEncryptedValue(value: bigint | string): string {
  const str = typeof value === 'bigint' ? value.toString(16) : value;
  if (str.length <= 12) return str;
  return `${str.slice(0, 6)}...${str.slice(-6)}`;
}

/**
 * Format decrypted value for display
 * @param value - The decrypted value
 * @returns Formatted string
 */
export function formatDecryptedValue(value: bigint | number | boolean): string {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'bigint') return value.toString();
  return value.toLocaleString();
}

/**
 * Error handler for FHE operations
 * @param error - The error object
 * @returns User-friendly error message
 */
export function handleFHEError(error: any): string {
  if (error.message?.includes('not initialized')) {
    return 'FHE not initialized. Please wait for initialization to complete.';
  }
  if (error.message?.includes('user rejected')) {
    return 'User rejected the signature request.';
  }
  if (error.message?.includes('network')) {
    return 'Network error. Please check your connection.';
  }
  return error.message || 'An unknown error occurred';
}

/**
 * Check if a value needs encryption
 * @param value - The value to check
 * @returns true if encryption is needed
 */
export function needsEncryption(value: number | string): boolean {
  const numValue = typeof value === 'string' ? parseInt(value) : value;
  return !isNaN(numValue) && numValue >= 0;
}

/**
 * Prepare encrypted input for contract call
 * @param handles - Encrypted handles
 * @param inputProof - Input proof
 * @returns Object ready for contract call
 */
export function prepareEncryptedInput(handles: string, inputProof: Uint8Array) {
  return {
    handles,
    inputProof: proofToHex(inputProof),
  };
}

/**
 * Wait for a specified time (useful for rate limiting)
 * @param ms - Milliseconds to wait
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry an async operation with exponential backoff
 * @param fn - The async function to retry
 * @param maxRetries - Maximum number of retries
 * @param baseDelay - Base delay in milliseconds
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await delay(baseDelay * Math.pow(2, i));
      }
    }
  }

  throw lastError;
}
