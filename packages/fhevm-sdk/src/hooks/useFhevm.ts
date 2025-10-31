/**
 * React Hooks for FHEVM SDK
 *
 * Provides wagmi-style hooks for easy integration with React applications
 */

import { useState, useCallback, useEffect } from 'react';
import { FhevmClient } from '../client';
import type {
  FhevmConfig,
  EncryptedInput,
  DecryptedOutput,
  EncryptOptions,
  DecryptOptions
} from '../types';

/**
 * Hook for initializing and managing FHEVM client
 *
 * @example
 * ```tsx
 * const { client, isReady, initialize } = useFhevmClient(config);
 *
 * useEffect(() => {
 *   initialize();
 * }, []);
 * ```
 */
export function useFhevmClient(config?: FhevmConfig) {
  const [client, setClient] = useState<FhevmClient | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const initialize = useCallback(async (customConfig?: FhevmConfig) => {
    if (isInitializing) return;

    const finalConfig = customConfig || config;
    if (!finalConfig) {
      setError(new Error('Config is required'));
      return;
    }

    setIsInitializing(true);
    setError(null);

    try {
      const newClient = new FhevmClient(finalConfig);
      await newClient.init();
      setClient(newClient);
      setIsReady(true);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to initialize');
      setError(error);
      console.error('FHEVM initialization error:', error);
    } finally {
      setIsInitializing(false);
    }
  }, [config, isInitializing]);

  return {
    client,
    isReady,
    isInitializing,
    error,
    initialize,
  };
}

/**
 * Hook for encrypting values with FHEVM
 *
 * @example
 * ```tsx
 * const { encrypt, isEncrypting, error } = useFhevmEncrypt(client);
 *
 * const handleEncrypt = async () => {
 *   const encrypted = await encrypt(1000, { type: 'euint32' });
 *   console.log(encrypted.handles);
 * };
 * ```
 */
export function useFhevmEncrypt(client: FhevmClient | null) {
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const encrypt = useCallback(
    async (
      value: number | bigint | boolean,
      options?: EncryptOptions
    ): Promise<EncryptedInput> => {
      if (!client || !client.isInitialized()) {
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
    [client]
  );

  return { encrypt, isEncrypting, error };
}

/**
 * Hook for decrypting FHEVM encrypted values
 *
 * @example
 * ```tsx
 * const { decrypt, isDecrypting, data, error } = useFhevmDecrypt(client);
 *
 * const handleDecrypt = async () => {
 *   const result = await decrypt({
 *     contractAddress: '0x...',
 *     handle: '0x...',
 *     signer: signer
 *   });
 *   console.log('Decrypted value:', result.value);
 * };
 * ```
 */
export function useFhevmDecrypt(client: FhevmClient | null) {
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [data, setData] = useState<DecryptedOutput | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const decrypt = useCallback(
    async (options: DecryptOptions): Promise<DecryptedOutput> => {
      if (!client || !client.isInitialized()) {
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
    [client]
  );

  return { decrypt, isDecrypting, data, error };
}

/**
 * Hook for batch encryption operations
 *
 * @example
 * ```tsx
 * const { encryptBatch, isEncrypting } = useFhevmEncryptBatch(client);
 *
 * const encrypted = await encryptBatch(
 *   [100, 200, 300],
 *   ['euint32', 'euint32', 'euint32']
 * );
 * ```
 */
export function useFhevmEncryptBatch(client: FhevmClient | null) {
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const encryptBatch = useCallback(
    async (
      values: Array<number | bigint | boolean>,
      types: string[],
      contractAddress?: string,
      userAddress?: string
    ): Promise<EncryptedInput[]> => {
      if (!client || !client.isInitialized()) {
        throw new Error('FHEVM client not initialized');
      }

      setIsEncrypting(true);
      setError(null);

      try {
        const result = await client.encryptBatch(
          values,
          types as any,
          contractAddress,
          userAddress
        );
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Batch encryption failed');
        setError(error);
        throw error;
      } finally {
        setIsEncrypting(false);
      }
    },
    [client]
  );

  return { encryptBatch, isEncrypting, error };
}

/**
 * Hook for contract interactions with encrypted parameters
 * Wagmi-style hook for writing to contracts
 *
 * @example
 * ```tsx
 * const { write, isLoading, isSuccess, txHash } = useFhevmContractWrite(contract);
 *
 * await write('transfer', [recipient, encryptedAmount.handles, encryptedAmount.inputProof]);
 * ```
 */
export function useFhevmContractWrite(contract: any) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const write = useCallback(
    async (method: string, args: any[] = []) => {
      if (!contract) {
        throw new Error('Contract not provided');
      }

      setIsLoading(true);
      setIsSuccess(false);
      setError(null);
      setTxHash(null);

      try {
        const tx = await contract[method](...args);
        setTxHash(tx.hash);

        const receipt = await tx.wait();
        setIsSuccess(true);
        return receipt;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Contract write failed');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [contract]
  );

  const reset = useCallback(() => {
    setIsSuccess(false);
    setError(null);
    setTxHash(null);
  }, []);

  return {
    write,
    isLoading,
    isSuccess,
    error,
    txHash,
    reset,
  };
}

/**
 * Hook for reading encrypted contract state
 *
 * @example
 * ```tsx
 * const { read, data, isLoading } = useFhevmContractRead(contract, 'balanceOf');
 *
 * useEffect(() => {
 *   read([userAddress]);
 * }, [userAddress]);
 * ```
 */
export function useFhevmContractRead(contract: any, method: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);

  const read = useCallback(
    async (args: any[] = []) => {
      if (!contract) {
        throw new Error('Contract not provided');
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await contract[method](...args);
        setData(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Contract read failed');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [contract, method]
  );

  return {
    read,
    data,
    isLoading,
    error,
    refetch: read,
  };
}
