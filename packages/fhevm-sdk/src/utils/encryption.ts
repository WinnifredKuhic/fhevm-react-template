/**
 * Encryption utilities for FHEVM SDK
 * Provides standalone encryption functions that can be used across frameworks
 */

import { FhevmClient } from '../client';
import type { EncryptedInput, EncryptOptions, EncryptedType } from '../types';
import { EncryptionError } from '../types';

/**
 * Encrypt a single value using FHEVM client
 *
 * @param client - FHEVM client instance
 * @param value - Value to encrypt (number, bigint, or boolean)
 * @param options - Encryption options (type, contractAddress, userAddress)
 * @returns Encrypted input with handles and proof
 *
 * @example
 * ```typescript
 * const encrypted = await encryptInput(client, 1000, {
 *   type: 'euint32',
 *   contractAddress: '0x...',
 *   userAddress: '0x...'
 * });
 *
 * // Use in contract call
 * await contract.deposit(encrypted.handles, encrypted.inputProof);
 * ```
 */
export async function encryptInput(
  client: FhevmClient,
  value: number | bigint | boolean,
  options?: EncryptOptions
): Promise<EncryptedInput> {
  if (!client || !client.isInitialized()) {
    throw new EncryptionError('FHEVM client not initialized');
  }

  try {
    return await client.encrypt(value, options);
  } catch (error) {
    throw new EncryptionError('Failed to encrypt value', error);
  }
}

/**
 * Encrypt multiple values in a single batch operation
 *
 * @param client - FHEVM client instance
 * @param values - Array of values to encrypt
 * @param types - Array of encryption types (must match values length)
 * @param contractAddress - Target contract address
 * @param userAddress - User's address
 * @returns Array of encrypted inputs
 *
 * @example
 * ```typescript
 * const [encAmount, encPrice, encQuantity] = await encryptBatch(
 *   client,
 *   [1000, 50, 20],
 *   ['euint32', 'euint32', 'euint16'],
 *   contractAddress,
 *   userAddress
 * );
 * ```
 */
export async function encryptBatch(
  client: FhevmClient,
  values: Array<number | bigint | boolean>,
  types: EncryptedType[],
  contractAddress?: string,
  userAddress?: string
): Promise<EncryptedInput[]> {
  if (!client || !client.isInitialized()) {
    throw new EncryptionError('FHEVM client not initialized');
  }

  if (values.length !== types.length) {
    throw new EncryptionError('Values and types arrays must have the same length');
  }

  try {
    return await client.encryptBatch(values, types, contractAddress, userAddress);
  } catch (error) {
    throw new EncryptionError('Failed to encrypt batch', error);
  }
}

/**
 * Encrypt a boolean value
 *
 * @param client - FHEVM client instance
 * @param value - Boolean value to encrypt
 * @param contractAddress - Target contract address
 * @param userAddress - User's address
 * @returns Encrypted input
 *
 * @example
 * ```typescript
 * const encrypted = await encryptBool(client, true, contractAddress);
 * ```
 */
export async function encryptBool(
  client: FhevmClient,
  value: boolean,
  contractAddress?: string,
  userAddress?: string
): Promise<EncryptedInput> {
  return encryptInput(client, value, {
    type: EncryptedType.EBOOL,
    contractAddress,
    userAddress,
  });
}

/**
 * Encrypt an 8-bit unsigned integer
 */
export async function encryptUint8(
  client: FhevmClient,
  value: number,
  contractAddress?: string,
  userAddress?: string
): Promise<EncryptedInput> {
  if (value < 0 || value > 255) {
    throw new EncryptionError('Value must be between 0 and 255 for euint8');
  }

  return encryptInput(client, value, {
    type: EncryptedType.EUINT8,
    contractAddress,
    userAddress,
  });
}

/**
 * Encrypt a 16-bit unsigned integer
 */
export async function encryptUint16(
  client: FhevmClient,
  value: number,
  contractAddress?: string,
  userAddress?: string
): Promise<EncryptedInput> {
  if (value < 0 || value > 65535) {
    throw new EncryptionError('Value must be between 0 and 65535 for euint16');
  }

  return encryptInput(client, value, {
    type: EncryptedType.EUINT16,
    contractAddress,
    userAddress,
  });
}

/**
 * Encrypt a 32-bit unsigned integer
 */
export async function encryptUint32(
  client: FhevmClient,
  value: number,
  contractAddress?: string,
  userAddress?: string
): Promise<EncryptedInput> {
  if (value < 0 || value > 4294967295) {
    throw new EncryptionError('Value must be between 0 and 4294967295 for euint32');
  }

  return encryptInput(client, value, {
    type: EncryptedType.EUINT32,
    contractAddress,
    userAddress,
  });
}

/**
 * Encrypt a 64-bit unsigned integer
 */
export async function encryptUint64(
  client: FhevmClient,
  value: number | bigint,
  contractAddress?: string,
  userAddress?: string
): Promise<EncryptedInput> {
  const bigValue = BigInt(value);
  if (bigValue < 0n || bigValue > 18446744073709551615n) {
    throw new EncryptionError('Value out of range for euint64');
  }

  return encryptInput(client, bigValue, {
    type: EncryptedType.EUINT64,
    contractAddress,
    userAddress,
  });
}

/**
 * Create encrypted input from raw handles and proof
 * Useful when you already have encrypted data
 *
 * @param handles - Encrypted handles
 * @param inputProof - Input proof
 * @returns Encrypted input object
 */
export function createEncryptedInput(
  handles: string,
  inputProof: string
): EncryptedInput {
  return {
    handles,
    inputProof,
  };
}

/**
 * Validate encrypted input structure
 *
 * @param input - Input to validate
 * @returns True if valid
 */
export function isValidEncryptedInput(input: any): input is EncryptedInput {
  return (
    typeof input === 'object' &&
    input !== null &&
    typeof input.handles === 'string' &&
    typeof input.inputProof === 'string' &&
    input.handles.startsWith('0x') &&
    input.inputProof.startsWith('0x')
  );
}
