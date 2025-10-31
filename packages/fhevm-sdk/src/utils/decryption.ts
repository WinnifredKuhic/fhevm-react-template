/**
 * Decryption utilities for FHEVM SDK
 * Provides standalone decryption functions that can be used across frameworks
 */

import { FhevmClient } from '../client';
import type { DecryptedOutput, DecryptOptions, ContractAddress } from '../types';
import { DecryptionError } from '../types';

/**
 * Decrypt an encrypted value using user's private key (EIP-712 signature)
 *
 * @param client - FHEVM client instance
 * @param options - Decryption options
 * @returns Decrypted output with value
 *
 * @example
 * ```typescript
 * const decrypted = await decryptOutput(client, {
 *   contractAddress: '0x...',
 *   handle: '0x...',
 *   signer: signer,
 * });
 * console.log('Decrypted value:', decrypted.value);
 * ```
 */
export async function decryptOutput(
  client: FhevmClient,
  options: DecryptOptions
): Promise<DecryptedOutput> {
  if (!client || !client.isInitialized()) {
    throw new DecryptionError('FHEVM client not initialized');
  }

  if (!options.signer) {
    throw new DecryptionError('Signer is required for decryption');
  }

  try {
    return await client.decrypt(options);
  } catch (error) {
    throw new DecryptionError('Failed to decrypt value', error);
  }
}

/**
 * User decrypt - Uses EIP-712 signature for decryption permission
 * Alias for decryptOutput with explicit name
 *
 * @param client - FHEVM client instance
 * @param options - Decryption options
 * @returns Decrypted output
 *
 * @example
 * ```typescript
 * const result = await userDecrypt(client, {
 *   contractAddress: contractAddress,
 *   handle: encryptedHandle,
 *   signer: ethers.getSigner()
 * });
 * ```
 */
export async function userDecrypt(
  client: FhevmClient,
  options: DecryptOptions
): Promise<DecryptedOutput> {
  return await decryptOutput(client, options);
}

/**
 * Public decrypt - Decrypt publicly decryptable values
 * Does not require signature, works for public encrypted data
 *
 * @param client - FHEVM client instance
 * @param contractAddress - Contract address
 * @param handle - Encrypted handle
 * @returns Decrypted value as bigint
 *
 * @example
 * ```typescript
 * const publicValue = await publicDecrypt(
 *   client,
 *   '0x...',
 *   '0x...'
 * );
 * console.log('Public value:', publicValue);
 * ```
 */
export async function publicDecrypt(
  client: FhevmClient,
  contractAddress: ContractAddress,
  handle: string
): Promise<bigint> {
  if (!client || !client.isInitialized()) {
    throw new DecryptionError('FHEVM client not initialized');
  }

  try {
    return await client.publicDecrypt(contractAddress, handle);
  } catch (error) {
    throw new DecryptionError('Failed to public decrypt', error);
  }
}

/**
 * Decrypt multiple handles in batch
 *
 * @param client - FHEVM client instance
 * @param handles - Array of encrypted handles
 * @param contractAddress - Contract address
 * @param signer - Ethers signer
 * @returns Array of decrypted outputs
 *
 * @example
 * ```typescript
 * const decrypted = await decryptBatch(
 *   client,
 *   ['0x...', '0x...', '0x...'],
 *   contractAddress,
 *   signer
 * );
 * ```
 */
export async function decryptBatch(
  client: FhevmClient,
  handles: string[],
  contractAddress: ContractAddress,
  signer: any,
  publicKey?: string
): Promise<DecryptedOutput[]> {
  if (!client || !client.isInitialized()) {
    throw new DecryptionError('FHEVM client not initialized');
  }

  const results: DecryptedOutput[] = [];

  for (const handle of handles) {
    try {
      const decrypted = await decryptOutput(client, {
        contractAddress,
        handle,
        signer,
        publicKey,
      });
      results.push(decrypted);
    } catch (error) {
      throw new DecryptionError(`Failed to decrypt handle ${handle}`, error);
    }
  }

  return results;
}

/**
 * Create EIP-712 signature for decryption permission
 *
 * @param client - FHEVM client instance
 * @param publicKey - User's public key
 * @param contractAddress - Contract address
 * @param signer - Ethers signer
 * @returns Signature string
 *
 * @example
 * ```typescript
 * const signature = await createDecryptionSignature(
 *   client,
 *   publicKey,
 *   contractAddress,
 *   signer
 * );
 * ```
 */
export async function createDecryptionSignature(
  client: FhevmClient,
  publicKey: string,
  contractAddress: ContractAddress,
  signer: any
): Promise<string> {
  if (!client || !client.isInitialized()) {
    throw new DecryptionError('FHEVM client not initialized');
  }

  try {
    const eip712 = client.createEIP712(publicKey, contractAddress);

    const signature = await signer.signTypedData(
      eip712.domain,
      eip712.types,
      eip712.message
    );

    return signature;
  } catch (error) {
    throw new DecryptionError('Failed to create EIP-712 signature', error);
  }
}

/**
 * Get user's public encryption key
 *
 * @param client - FHEVM client instance
 * @returns Public key string
 *
 * @example
 * ```typescript
 * const publicKey = await getPublicKey(client);
 * console.log('Public key:', publicKey);
 * ```
 */
export async function getPublicKey(client: FhevmClient): Promise<string> {
  if (!client || !client.isInitialized()) {
    throw new DecryptionError('FHEVM client not initialized');
  }

  try {
    return await client.getPublicKey();
  } catch (error) {
    throw new DecryptionError('Failed to get public key', error);
  }
}

/**
 * Validate decrypted output structure
 *
 * @param output - Output to validate
 * @returns True if valid
 */
export function isValidDecryptedOutput(output: any): output is DecryptedOutput {
  return (
    typeof output === 'object' &&
    output !== null &&
    'value' in output &&
    (typeof output.value === 'bigint' || typeof output.value === 'number')
  );
}

/**
 * Convert decrypted bigint to number safely
 *
 * @param value - Bigint value
 * @returns Number value
 * @throws If value is too large for JavaScript number
 */
export function bigintToNumber(value: bigint): number {
  if (value > Number.MAX_SAFE_INTEGER) {
    throw new DecryptionError('Value too large to convert to number safely');
  }
  return Number(value);
}

/**
 * Format decrypted value for display
 *
 * @param value - Decrypted value
 * @param decimals - Number of decimal places (for token amounts)
 * @returns Formatted string
 */
export function formatDecryptedValue(value: bigint, decimals: number = 0): string {
  if (decimals === 0) {
    return value.toString();
  }

  const divisor = 10n ** BigInt(decimals);
  const integerPart = value / divisor;
  const fractionalPart = value % divisor;

  return `${integerPart}.${fractionalPart.toString().padStart(decimals, '0')}`;
}
