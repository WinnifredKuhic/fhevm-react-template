/**
 * FHE Client Library
 * Client-side FHE operations for browser environments
 */

import {
  FHEClientConfig,
  EncryptedValue,
  DecryptedValue,
  FHEPublicKey,
  EncryptionOptions,
  DecryptionOptions,
  FHEType
} from './types';

export class FHEClient {
  private config: FHEClientConfig;
  private publicKey: FHEPublicKey | null = null;
  private initialized: boolean = false;

  constructor(config: FHEClientConfig) {
    this.config = config;
  }

  /**
   * Initialize the FHE client
   */
  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Fetch public key
      await this.loadPublicKey();
      this.initialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize FHE client: ${error}`);
    }
  }

  /**
   * Load public key from the API
   */
  private async loadPublicKey(): Promise<void> {
    const contractAddress = this.config.contractAddress || '0x0000000000000000000000000000000000000000';
    const response = await fetch(`/api/keys?contractAddress=${contractAddress}`);

    if (!response.ok) {
      throw new Error('Failed to load public key');
    }

    const data = await response.json();
    this.publicKey = data.publicKey;
  }

  /**
   * Encrypt a value
   */
  async encrypt(
    value: number | bigint | boolean,
    options: EncryptionOptions
  ): Promise<EncryptedValue> {
    if (!this.initialized) {
      await this.init();
    }

    const response = await fetch('/api/fhe/encrypt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        value,
        type: options.type || 'euint32',
        contractAddress: options.contractAddress
      }),
    });

    if (!response.ok) {
      throw new Error('Encryption failed');
    }

    const data = await response.json();
    return data.encrypted;
  }

  /**
   * Decrypt a value
   */
  async decrypt(options: DecryptionOptions): Promise<DecryptedValue> {
    if (!this.initialized) {
      await this.init();
    }

    const response = await fetch('/api/fhe/decrypt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      throw new Error('Decryption failed');
    }

    const data = await response.json();
    return data.decrypted;
  }

  /**
   * Get the current public key
   */
  getPublicKey(): FHEPublicKey | null {
    return this.publicKey;
  }

  /**
   * Check if client is initialized
   */
  isReady(): boolean {
    return this.initialized;
  }
}

/**
 * Create and initialize an FHE client instance
 */
export async function createFHEClient(config: FHEClientConfig): Promise<FHEClient> {
  const client = new FHEClient(config);
  await client.init();
  return client;
}
