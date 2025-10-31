/**
 * Encryption utilities for FHEVM SDK
 * Provides standalone encryption functions
 */

import { FhevmClient } from './client';
import type { EncryptedInput, EncryptOptions } from './types';

/**
 * Encrypt input value using FHEVM client
 *
 * @param client - FHEVM client instance
 * @param value - Value to encrypt
 * @param options - Encryption options
 * @returns Encrypted input with handles and proof
 *
 * @example
 * ```typescript
 * const encrypted = await encryptInput(client, 1000, {
 *   type: 'euint32',
 *   contractAddress: '0x...'
 * });
 * ```
 */
export async function encryptInput(
  client: FhevmClient,
  value: number | bigint | boolean,
  options?: EncryptOptions
): Promise<EncryptedInput> {
  return await client.encrypt(value, options);
}

/**
 * Encrypt multiple values in batch
 *
 * @param client - FHEVM client instance
 * @param values - Array of values to encrypt
 * @param types - Array of encryption types
 * @param contractAddress - Contract address
 * @param userAddress - User address
 * @returns Array of encrypted inputs
 */
export async function encryptBatch(
  client: FhevmClient,
  values: Array<number | bigint | boolean>,
  types: string[],
  contractAddress?: string,
  userAddress?: string
): Promise<EncryptedInput[]> {
  return await client.encryptBatch(values, types as any, contractAddress, userAddress);
}
