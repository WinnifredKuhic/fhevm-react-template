/**
 * FHE Key Management Library
 * Utilities for managing FHE public keys
 */

import { FHEPublicKey } from './types';

/**
 * Fetch public key from the API
 */
export async function fetchPublicKey(contractAddress: string): Promise<FHEPublicKey> {
  const response = await fetch(`/api/keys?contractAddress=${contractAddress}`);

  if (!response.ok) {
    throw new Error('Failed to fetch public key');
  }

  const data = await response.json();
  return data.publicKey;
}

/**
 * Generate or regenerate public key
 */
export async function generatePublicKey(
  contractAddress: string,
  regenerate: boolean = false
): Promise<FHEPublicKey> {
  const response = await fetch('/api/keys', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contractAddress,
      regenerate
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate public key');
  }

  const data = await response.json();
  return data.publicKey;
}

/**
 * Validate public key format
 */
export function validatePublicKey(publicKey: FHEPublicKey): boolean {
  if (!publicKey.key || !publicKey.contractAddress) {
    return false;
  }

  // Check if key is a valid hex string
  const hexRegex = /^0x[0-9a-fA-F]+$/;
  if (!hexRegex.test(publicKey.key)) {
    return false;
  }

  // Check if contract address is valid
  const addressRegex = /^0x[0-9a-fA-F]{40}$/;
  if (!addressRegex.test(publicKey.contractAddress)) {
    return false;
  }

  return true;
}

/**
 * Cache for storing public keys
 */
class PublicKeyCache {
  private cache: Map<string, FHEPublicKey> = new Map();
  private ttl: number = 3600000; // 1 hour in milliseconds

  set(contractAddress: string, publicKey: FHEPublicKey): void {
    this.cache.set(contractAddress, publicKey);

    // Auto-expire after TTL
    setTimeout(() => {
      this.cache.delete(contractAddress);
    }, this.ttl);
  }

  get(contractAddress: string): FHEPublicKey | undefined {
    return this.cache.get(contractAddress);
  }

  has(contractAddress: string): boolean {
    return this.cache.has(contractAddress);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const publicKeyCache = new PublicKeyCache();
