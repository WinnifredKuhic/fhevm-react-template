/**
 * Core FHEVM functionality
 * Framework-agnostic core logic for FHEVM operations
 */

import { createInstance, type FhevmInstance as FhevmjsInstance } from 'fhevmjs';
import type { FhevmConfig, EncryptedType, ContractAddress } from '../types';
import { InitializationError } from '../types';

/**
 * Core FHEVM class with framework-agnostic functionality
 *
 * This class provides the foundational FHEVM operations that can be used
 * across different frameworks (React, Vue, vanilla JS, etc.)
 *
 * @example
 * ```typescript
 * const fhevm = new FhevmCore({
 *   provider: ethersProvider,
 *   network: { chainId: 11155111 }
 * });
 * await fhevm.initialize();
 * ```
 */
export class FhevmCore {
  private instance: FhevmjsInstance | null = null;
  private config: FhevmConfig;
  private initialized: boolean = false;

  constructor(config: FhevmConfig) {
    if (!config.provider) {
      throw new InitializationError('Provider is required');
    }
    this.config = config;
  }

  /**
   * Initialize the FHEVM instance with network configuration
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      const chainId = this.config.network?.chainId ||
        (await this.config.provider.getNetwork()).chainId;

      this.instance = await createInstance({
        chainId: Number(chainId),
        networkUrl: this.config.network?.rpcUrl || '',
        gatewayUrl: this.config.gatewayAddress || '',
        aclAddress: this.config.aclAddress,
        kmsVerifierAddress: this.config.kmsVerifierAddress,
      });

      this.initialized = true;
    } catch (error) {
      throw new InitializationError(
        'Failed to initialize FHEVM instance',
        error
      );
    }
  }

  /**
   * Get the underlying FHEVM instance
   */
  getInstance(): FhevmjsInstance {
    if (!this.initialized || !this.instance) {
      throw new InitializationError(
        'FHEVM instance not initialized. Call initialize() first.'
      );
    }
    return this.instance;
  }

  /**
   * Check if the FHEVM instance is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get the current configuration
   */
  getConfig(): FhevmConfig {
    return this.config;
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<FhevmConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Reset the FHEVM instance
   */
  reset(): void {
    this.instance = null;
    this.initialized = false;
  }
}
