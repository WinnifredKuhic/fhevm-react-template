/**
 * useEncryption Hook
 * Hook for encrypting values using FHE
 */

'use client';

import { useState, useCallback } from 'react';
import { EncryptedValue, EncryptionOptions } from '../types/fhe';
import { FHEClient } from '../lib/fhe/client';

interface UseEncryptionReturn {
  encrypt: (value: number | bigint | boolean, options: EncryptionOptions) => Promise<EncryptedValue>;
  encryptedValue: EncryptedValue | null;
  isEncrypting: boolean;
  error: Error | null;
  reset: () => void;
}

export function useEncryption(client?: FHEClient | null): UseEncryptionReturn {
  const [encryptedValue, setEncryptedValue] = useState<EncryptedValue | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const encrypt = useCallback(async (
    value: number | bigint | boolean,
    options: EncryptionOptions
  ): Promise<EncryptedValue> => {
    setIsEncrypting(true);
    setError(null);

    try {
      let encrypted: EncryptedValue;

      if (client) {
        encrypted = await client.encrypt(value, options);
      } else {
        // Fallback to API if no client provided
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
        encrypted = data.encrypted;
      }

      setEncryptedValue(encrypted);
      return encrypted;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Encryption failed');
      setError(error);
      throw error;
    } finally {
      setIsEncrypting(false);
    }
  }, [client]);

  const reset = useCallback(() => {
    setEncryptedValue(null);
    setError(null);
  }, []);

  return {
    encrypt,
    encryptedValue,
    isEncrypting,
    error,
    reset
  };
}
