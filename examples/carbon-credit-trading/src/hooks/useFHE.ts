import { useState, useCallback, useRef } from 'react';
import { BrowserProvider, Signer } from 'ethers';
import { FhevmClient, EncryptedType, EncryptedInput } from '@fhevm/sdk';
import {
  GATEWAY_URL,
  ACL_ADDRESS,
  KMS_VERIFIER_ADDRESS,
  inferEncryptedType,
  handleFHEError,
  prepareEncryptedInput,
} from '../lib/fhevm';

interface EncryptResult {
  handles: string;
  inputProof: string;
}

/**
 * Hook for FHE (Fully Homomorphic Encryption) operations
 * Provides encryption, decryption, and re-encryption capabilities using @fhevm/sdk
 */
export const useFHE = () => {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<FhevmClient | null>(null);

  /**
   * Initialize FHEVM client with provider
   */
  const initializeFHE = useCallback(async (provider: BrowserProvider) => {
    try {
      setLoading(true);
      setError(null);

      // Get network information
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      // Get signer
      const signer = await provider.getSigner();

      // Create FHEVM client
      const client = new FhevmClient({
        provider,
        signer,
        network: {
          chainId,
          name: network.name,
          rpcUrl: 'http://localhost:8545', // Local hardhat network
        },
        gatewayAddress: GATEWAY_URL,
        aclAddress: ACL_ADDRESS,
        kmsVerifierAddress: KMS_VERIFIER_ADDRESS,
      });

      // Initialize the client
      await client.init();

      clientRef.current = client;
      setInitialized(true);
      return true;
    } catch (err) {
      const errorMessage = handleFHEError(err);
      setError(errorMessage);
      console.error('Failed to initialize FHE:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Encrypt a numeric value for contract input
   */
  const encryptValue = useCallback(
    async (
      value: number,
      contractAddress: string,
      userAddress?: string
    ): Promise<EncryptResult> => {
      if (!initialized || !clientRef.current) {
        throw new Error('FHE not initialized. Please initialize first.');
      }

      try {
        // Determine the appropriate encrypted type
        const type = inferEncryptedType(value);

        // Encrypt the value
        const encrypted = await clientRef.current.encrypt(value, {
          type,
          contractAddress,
          userAddress,
        });

        // Convert to format expected by contract
        return prepareEncryptedInput(encrypted.handles, encrypted.inputProof);
      } catch (err) {
        const errorMessage = handleFHEError(err);
        console.error('Encryption failed:', err);
        throw new Error(errorMessage);
      }
    },
    [initialized]
  );

  /**
   * Encrypt multiple values at once (batch operation)
   */
  const encryptBatch = useCallback(
    async (
      values: number[],
      contractAddress: string,
      userAddress?: string
    ): Promise<EncryptResult[]> => {
      if (!initialized || !clientRef.current) {
        throw new Error('FHE not initialized. Please initialize first.');
      }

      try {
        // Determine types for all values
        const types = values.map(inferEncryptedType);

        // Encrypt all values
        const encryptedBatch = await clientRef.current.encryptBatch(
          values,
          types,
          contractAddress,
          userAddress
        );

        // Convert all to contract format
        return encryptedBatch.map((encrypted) =>
          prepareEncryptedInput(encrypted.handles, encrypted.inputProof)
        );
      } catch (err) {
        const errorMessage = handleFHEError(err);
        console.error('Batch encryption failed:', err);
        throw new Error(errorMessage);
      }
    },
    [initialized]
  );

  /**
   * Decrypt an encrypted value using user's signature (EIP-712)
   */
  const decryptValue = useCallback(
    async (
      handle: string,
      contractAddress: string,
      signer: Signer
    ): Promise<bigint> => {
      if (!initialized || !clientRef.current) {
        throw new Error('FHE not initialized. Please initialize first.');
      }

      try {
        // Get public key for decryption
        const publicKey = await clientRef.current.getPublicKey();

        // Request decryption with user signature
        const decrypted = await clientRef.current.decrypt({
          contractAddress,
          handle,
          signer,
          publicKey,
        });

        return BigInt(decrypted.value);
      } catch (err) {
        const errorMessage = handleFHEError(err);
        console.error('Decryption failed:', err);
        throw new Error(errorMessage);
      }
    },
    [initialized]
  );

  /**
   * Request re-encryption for user viewing
   * This creates an EIP-712 signature for the gateway to re-encrypt
   * the value so only the user can decrypt it
   */
  const requestReencryption = useCallback(
    async (
      handle: string,
      contractAddress: string,
      signer: Signer
    ): Promise<bigint | null> => {
      if (!initialized || !clientRef.current) {
        throw new Error('FHE not initialized. Please initialize first.');
      }

      try {
        // This is the same as decryptValue - re-encryption happens internally
        // The gateway re-encrypts the value with the user's public key
        const result = await decryptValue(handle, contractAddress, signer);
        return result;
      } catch (err) {
        const errorMessage = handleFHEError(err);
        console.error('Re-encryption failed:', err);
        setError(errorMessage);
        return null;
      }
    },
    [initialized, decryptValue]
  );

  /**
   * Get the FHEVM client instance (for advanced usage)
   */
  const getClient = useCallback(() => {
    return clientRef.current;
  }, []);

  /**
   * Get the public encryption key
   */
  const getPublicKey = useCallback(async (): Promise<string | null> => {
    if (!initialized || !clientRef.current) {
      return null;
    }

    try {
      return await clientRef.current.getPublicKey();
    } catch (err) {
      console.error('Failed to get public key:', err);
      return null;
    }
  }, [initialized]);

  /**
   * Reset the FHE state (useful when switching accounts)
   */
  const reset = useCallback(() => {
    clientRef.current = null;
    setInitialized(false);
    setLoading(false);
    setError(null);
  }, []);

  return {
    initialized,
    loading,
    error,
    initializeFHE,
    encryptValue,
    encryptBatch,
    decryptValue,
    requestReencryption,
    getClient,
    getPublicKey,
    reset,
  };
};
