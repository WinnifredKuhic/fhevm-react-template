/**
 * useFHE Hook
 * Main hook for accessing FHE client and operations
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { FHEClient, createFHEClient } from '../lib/fhe/client';
import { FHEClientConfig, FHEPublicKey } from '../types/fhe';

interface UseFHEReturn {
  client: FHEClient | null;
  publicKey: FHEPublicKey | null;
  isReady: boolean;
  isLoading: boolean;
  error: Error | null;
  reinitialize: () => Promise<void>;
}

export function useFHE(config?: FHEClientConfig): UseFHEReturn {
  const [client, setClient] = useState<FHEClient | null>(null);
  const [publicKey, setPublicKey] = useState<FHEPublicKey | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const initialize = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const fheClient = await createFHEClient(config || {});
      setClient(fheClient);
      setPublicKey(fheClient.getPublicKey());
      setIsReady(true);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to initialize FHE client');
      setError(error);
      setIsReady(false);
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const reinitialize = useCallback(async () => {
    setClient(null);
    setPublicKey(null);
    setIsReady(false);
    await initialize();
  }, [initialize]);

  return {
    client,
    publicKey,
    isReady,
    isLoading,
    error,
    reinitialize
  };
}
