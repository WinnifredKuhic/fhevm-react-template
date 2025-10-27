/**
 * FHE Server Library
 * Server-side FHE operations for API routes and backend
 */

import {
  ComputationResult,
  FHEOperation,
  EncryptedValue,
  DecryptedValue
} from './types';

/**
 * Perform homomorphic computation on encrypted values
 */
export async function performComputation(
  operation: FHEOperation,
  operands: string[],
  contractAddress?: string
): Promise<ComputationResult> {
  const response = await fetch('/api/fhe/compute', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      operation,
      operands,
      contractAddress
    }),
  });

  if (!response.ok) {
    throw new Error('Computation failed');
  }

  const data = await response.json();
  return data.result;
}

/**
 * Validate encrypted value format
 */
export function validateEncryptedValue(encrypted: EncryptedValue): boolean {
  if (!encrypted.handles || !encrypted.inputProof) {
    return false;
  }

  // Check if handles and inputProof are valid hex strings
  const hexRegex = /^0x[0-9a-fA-F]+$/;
  if (!hexRegex.test(encrypted.handles) || !hexRegex.test(encrypted.inputProof)) {
    return false;
  }

  return true;
}

/**
 * Batch encrypt multiple values
 */
export async function batchEncrypt(
  values: Array<{ value: number | bigint | boolean; type?: string }>,
  contractAddress: string
): Promise<EncryptedValue[]> {
  const encryptPromises = values.map(async ({ value, type }) => {
    const response = await fetch('/api/fhe/encrypt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        value,
        type: type || 'euint32',
        contractAddress
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to encrypt value: ${value}`);
    }

    const data = await response.json();
    return data.encrypted;
  });

  return Promise.all(encryptPromises);
}

/**
 * Batch decrypt multiple values
 */
export async function batchDecrypt(
  handles: string[],
  contractAddress: string,
  signature?: string,
  userAddress?: string
): Promise<DecryptedValue[]> {
  const decryptPromises = handles.map(async (handle) => {
    const response = await fetch('/api/fhe/decrypt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        handle,
        contractAddress,
        signature,
        userAddress
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to decrypt handle: ${handle}`);
    }

    const data = await response.json();
    return data.decrypted;
  });

  return Promise.all(decryptPromises);
}
