/**
 * Utility functions for FHEVM SDK
 */

import type { EncryptedType, ContractAddress } from './types';

/**
 * Validate Ethereum address format
 *
 * @param address - Address to validate
 * @returns True if valid Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate encrypted handle format
 *
 * @param handle - Handle to validate
 * @returns True if valid handle format
 */
export function isValidHandle(handle: string): boolean {
  return /^0x[a-fA-F0-9]+$/.test(handle);
}

/**
 * Get the bit size for an encrypted type
 *
 * @param type - Encrypted type
 * @returns Bit size of the type
 */
export function getTypeSize(type: EncryptedType | string): number {
  switch (type) {
    case 'euint8':
      return 8;
    case 'euint16':
      return 16;
    case 'euint32':
      return 32;
    case 'euint64':
      return 64;
    case 'euint128':
      return 128;
    case 'euint256':
      return 256;
    case 'ebool':
      return 1;
    case 'eaddress':
      return 160;
    default:
      throw new Error(`Unknown encrypted type: ${type}`);
  }
}

/**
 * Get the maximum value for an encrypted type
 *
 * @param type - Encrypted type
 * @returns Maximum value for the type
 */
export function getTypeMaxValue(type: EncryptedType | string): bigint {
  const size = getTypeSize(type);
  if (type === 'ebool') return 1n;
  return (2n ** BigInt(size)) - 1n;
}

/**
 * Validate value fits within encrypted type
 *
 * @param value - Value to validate
 * @param type - Encrypted type
 * @returns True if value fits within type bounds
 */
export function isValidValueForType(
  value: number | bigint | boolean,
  type: EncryptedType | string
): boolean {
  if (type === 'ebool') {
    return typeof value === 'boolean';
  }

  const numValue = typeof value === 'bigint' ? value : BigInt(value);
  const maxValue = getTypeMaxValue(type);

  return numValue >= 0n && numValue <= maxValue;
}

/**
 * Format encrypted handle for display
 *
 * @param handle - Encrypted handle
 * @param length - Number of characters to show on each end
 * @returns Formatted handle string
 */
export function formatHandle(handle: string, length: number = 6): string {
  if (handle.length <= length * 2 + 3) {
    return handle;
  }
  return `${handle.slice(0, length)}...${handle.slice(-length)}`;
}

/**
 * Format address for display
 *
 * @param address - Ethereum address
 * @param length - Number of characters to show on each end
 * @returns Formatted address string
 */
export function formatAddress(address: string, length: number = 6): string {
  if (address.length <= length * 2 + 3) {
    return address;
  }
  return `${address.slice(0, length)}...${address.slice(-length)}`;
}

/**
 * Sleep utility for async operations
 *
 * @param ms - Milliseconds to sleep
 */
export async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry an async operation with exponential backoff
 *
 * @param fn - Function to retry
 * @param maxRetries - Maximum number of retries
 * @param baseDelay - Base delay in milliseconds
 * @returns Result of the function
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await sleep(delay);
      }
    }
  }

  throw lastError || new Error('Operation failed after retries');
}
