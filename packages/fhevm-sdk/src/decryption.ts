/**
 * Decryption utilities for FHEVM SDK
 * Provides standalone decryption functions
 */

import { FhevmClient } from './client';
import type { DecryptedOutput, DecryptOptions, ContractAddress } from './types';

/**
 * Decrypt output value using FHEVM client (user decrypt with EIP-712)
 *
 * @param client - FHEVM client instance
 * @param options - Decryption options
 * @returns Decrypted output value
 *
 * @example
 * ```typescript
 * const decrypted = await decryptOutput(client, {
 *   contractAddress: '0x...',
 *   handle: '0x...',
 *   signer: signer
 * });
 * console.log(decrypted.value);
 * ```
 */
export async function decryptOutput(
  client: FhevmClient,
  options: DecryptOptions
): Promise<DecryptedOutput> {
  return await client.decrypt(options);
}

/**
 * User decrypt - alias for decryptOutput
 * Uses EIP-712 signature for decryption permission
 */
export async function userDecrypt(
  client: FhevmClient,
  options: DecryptOptions
): Promise<DecryptedOutput> {
  return await decryptOutput(client, options);
}

/**
 * Public decrypt - for publicly decryptable values
 *
 * @param client - FHEVM client instance
 * @param contractAddress - Contract address
 * @param handle - Encrypted handle
 * @returns Decrypted value as bigint
 *
 * @example
 * ```typescript
 * const value = await publicDecrypt(client, '0x...', '0x...');
 * ```
 */
export async function publicDecrypt(
  client: FhevmClient,
  contractAddress: ContractAddress,
  handle: string
): Promise<bigint> {
  return await client.publicDecrypt(contractAddress, handle);
}
