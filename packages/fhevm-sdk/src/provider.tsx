/**
 * React Provider for FHEVM SDK
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { FhevmClient } from './client';
import type { FhevmConfig, FhevmInstance, EncryptedInput, DecryptedOutput, DecryptOptions } from './types';
import { InitializationError } from './types';

interface FhevmContextValue {
  client: FhevmClient | null;
  isInitialized: boolean;
  isInitializing: boolean;
  error: Error | null;
  initialize: (config?: Partial<FhevmConfig>) => Promise<void>;
}

const FhevmContext = createContext<FhevmContextValue | undefined>(undefined);

interface FhevmProviderProps {
  config?: FhevmConfig;
  children: React.ReactNode;
}

/**
 * FHEVM Provider Component
 *
 * Wraps your app to provide FHEVM functionality throughout the component tree
 *
 * @example
 * ```tsx
 * <FhevmProvider config={{ network: { chainId: 11155111 } }}>
 *   <App />
 * </FhevmProvider>
 * ```
 */
export function FhevmProvider({ config, children }: FhevmProviderProps) {
  const [client, setClient] = useState<FhevmClient | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const initialize = useCallback(async (userConfig?: Partial<FhevmConfig>) => {
    if (isInitializing || isInitialized) return;

    setIsInitializing(true);
    setError(null);

    try {
      const finalConfig = { ...config, ...userConfig };

      if (!finalConfig.provider) {
        throw new InitializationError('Provider is required');
      }

      const newClient = new FhevmClient(finalConfig as FhevmConfig);
      await newClient.init();

      setClient(newClient);
      setIsInitialized(true);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to initialize FHEVM');
      setError(error);
      console.error('FHEVM initialization failed:', error);
    } finally {
      setIsInitializing(false);
    }
  }, [config, isInitializing, isInitialized]);

  useEffect(() => {
    if (config?.provider && !isInitialized && !isInitializing) {
      initialize();
    }
  }, [config?.provider, initialize, isInitialized, isInitializing]);

  const value: FhevmContextValue = {
    client,
    isInitialized,
    isInitializing,
    error,
    initialize,
  };

  return <FhevmContext.Provider value={value}>{children}</FhevmContext.Provider>;
}

/**
 * Hook to access FHEVM client
 *
 * @example
 * ```tsx
 * const { client, isInitialized } = useFhevm();
 * ```
 */
export function useFhevm() {
  const context = useContext(FhevmContext);

  if (context === undefined) {
    throw new Error('useFhevm must be used within FhevmProvider');
  }

  return context;
}

/**
 * Hook for encrypting values
 *
 * @example
 * ```tsx
 * const { encrypt, isEncrypting } = useEncrypt();
 * const encrypted = await encrypt(1000, { type: 'euint32' });
 * ```
 */
export function useEncrypt() {
  const { client, isInitialized } = useFhevm();
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const encrypt = useCallback(
    async (
      value: number | bigint | boolean,
      options?: any
    ): Promise<EncryptedInput> => {
      if (!client || !isInitialized) {
        throw new Error('FHEVM client not initialized');
      }

      setIsEncrypting(true);
      setError(null);

      try {
        const result = await client.encrypt(value, options);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Encryption failed');
        setError(error);
        throw error;
      } finally {
        setIsEncrypting(false);
      }
    },
    [client, isInitialized]
  );

  return { encrypt, isEncrypting, error };
}

/**
 * Hook for decrypting values
 *
 * @example
 * ```tsx
 * const { decrypt, data, isDecrypting } = useDecrypt();
 * await decrypt({ contractAddress, handle, signer });
 * console.log(data?.value);
 * ```
 */
export function useDecrypt() {
  const { client, isInitialized } = useFhevm();
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [data, setData] = useState<DecryptedOutput | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const decrypt = useCallback(
    async (options: DecryptOptions): Promise<DecryptedOutput> => {
      if (!client || !isInitialized) {
        throw new Error('FHEVM client not initialized');
      }

      setIsDecrypting(true);
      setError(null);

      try {
        const result = await client.decrypt(options);
        setData(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Decryption failed');
        setError(error);
        throw error;
      } finally {
        setIsDecrypting(false);
      }
    },
    [client, isInitialized]
  );

  return { decrypt, data, isDecrypting, error };
}

/**
 * Hook for contract interactions with encrypted parameters
 *
 * @example
 * ```tsx
 * const { call, isLoading } = useContractWrite(contract);
 * await call('transfer', [recipient, encryptedAmount.handles, encryptedAmount.inputProof]);
 * ```
 */
export function useContractWrite(contract: any) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const call = useCallback(
    async (method: string, args: any[]) => {
      setIsLoading(true);
      setError(null);
      setTxHash(null);

      try {
        const tx = await contract[method](...args);
        setTxHash(tx.hash);
        const receipt = await tx.wait();
        return receipt;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Contract call failed');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [contract]
  );

  return { call, isLoading, error, txHash };
}
