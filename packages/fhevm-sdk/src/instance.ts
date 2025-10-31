/**
 * FHEVM Instance utilities
 * Helper functions for creating and managing FHEVM instances
 */

import { FhevmClient } from './client';
import type { FhevmConfig, FhevmInstance, Provider } from './types';

let globalInstance: FhevmClient | null = null;

/**
 * Create a new FHEVM instance
 *
 * @param config - FHEVM configuration
 * @returns Initialized FHEVM client instance
 *
 * @example
 * ```typescript
 * const instance = await createFhevmInstance({
 *   provider: ethersProvider,
 *   network: { chainId: 11155111 }
 * });
 * ```
 */
export async function createFhevmInstance(config: FhevmConfig): Promise<FhevmClient> {
  const client = new FhevmClient(config);
  await client.init();
  return client;
}

/**
 * Initialize FHEVM - convenient wrapper around createFhevmInstance
 * Also sets the global instance
 *
 * @param config - FHEVM configuration
 * @returns Initialized FHEVM client instance
 *
 * @example
 * ```typescript
 * const fhevm = await initFhevm({
 *   provider,
 *   network: { chainId: 11155111 }
 * });
 * ```
 */
export async function initFhevm(config: FhevmConfig): Promise<FhevmClient> {
  const client = await createFhevmInstance(config);
  globalInstance = client;
  return client;
}

/**
 * Get the global FHEVM instance
 * Throws if instance hasn't been initialized
 *
 * @returns Global FHEVM client instance
 */
export function getFhevmInstance(): FhevmClient {
  if (!globalInstance) {
    throw new Error(
      'FHEVM instance not initialized. Call initFhevm() first or use FhevmProvider in React.'
    );
  }
  return globalInstance;
}

/**
 * Reset the global instance
 * Useful for testing or re-initialization
 */
export function resetFhevmInstance(): void {
  globalInstance = null;
}
