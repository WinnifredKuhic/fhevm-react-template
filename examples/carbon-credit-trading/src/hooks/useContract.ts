import { useState, useCallback } from 'react';
import { Contract, BrowserProvider } from 'ethers';
import { getProvider, getContract, CONTRACT_ADDRESS } from '../lib/contract';
import { useFHE } from './useFHE';
import {
  CreditInfo,
  OrderInfo,
  SystemStats,
  UserBalances,
  IssueCreditsParams,
  CreateOrderParams,
} from '../types';

export const useContract = () => {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [encryptionProgress, setEncryptionProgress] = useState<string | null>(null);

  // Get FHE hooks for encryption/decryption
  const fhe = useFHE();

  const initialize = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const newProvider = await getProvider();
      if (!newProvider) {
        throw new Error('No Ethereum provider found');
      }
      setProvider(newProvider);
      const newContract = await getContract(newProvider);
      setContract(newContract);

      // Initialize FHE after contract is ready
      setEncryptionProgress('Initializing FHE encryption...');
      const fheInitialized = await fhe.initializeFHE(newProvider);
      if (!fheInitialized) {
        console.warn('FHE initialization failed, encryption will not be available');
      }
      setEncryptionProgress(null);

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize contract');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fhe]);

  const registerUser = useCallback(async () => {
    if (!contract) throw new Error('Contract not initialized');
    const tx = await contract.registerUser();
    await tx.wait();
  }, [contract]);

  const isUserRegistered = useCallback(
    async (address: string): Promise<boolean> => {
      if (!contract) throw new Error('Contract not initialized');
      return await contract.isUserRegistered(address);
    },
    [contract]
  );

  const issueCredits = useCallback(
    async (params: IssueCreditsParams) => {
      if (!contract) throw new Error('Contract not initialized');
      if (!provider) throw new Error('Provider not initialized');

      try {
        setEncryptionProgress('Encrypting amount...');
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();

        // Encrypt amount and price
        const encryptedAmount = await fhe.encryptValue(
          params.amount,
          CONTRACT_ADDRESS,
          userAddress
        );

        setEncryptionProgress('Encrypting price...');
        const encryptedPrice = await fhe.encryptValue(
          params.pricePerCredit,
          CONTRACT_ADDRESS,
          userAddress
        );

        setEncryptionProgress('Submitting transaction...');

        // Call contract with encrypted values
        const tx = await contract.issueCarbonCredits(
          encryptedAmount.handles,
          encryptedAmount.inputProof,
          encryptedPrice.handles,
          encryptedPrice.inputProof,
          params.projectType,
          params.verificationHash
        );

        setEncryptionProgress('Waiting for confirmation...');
        await tx.wait();
        setEncryptionProgress(null);
      } catch (err) {
        setEncryptionProgress(null);
        throw err;
      }
    },
    [contract, provider, fhe]
  );

  const createBuyOrder = useCallback(
    async (params: CreateOrderParams) => {
      if (!contract) throw new Error('Contract not initialized');
      if (!provider) throw new Error('Provider not initialized');

      try {
        setEncryptionProgress('Encrypting order amount...');
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();

        // Encrypt amount and max price
        const encryptedAmount = await fhe.encryptValue(
          params.amount,
          CONTRACT_ADDRESS,
          userAddress
        );

        setEncryptionProgress('Encrypting max price...');
        const encryptedMaxPrice = await fhe.encryptValue(
          params.maxPricePerCredit,
          CONTRACT_ADDRESS,
          userAddress
        );

        setEncryptionProgress('Submitting order...');

        // Call contract with encrypted values
        const tx = await contract.createBuyOrder(
          params.creditId,
          encryptedAmount.handles,
          encryptedAmount.inputProof,
          encryptedMaxPrice.handles,
          encryptedMaxPrice.inputProof
        );

        setEncryptionProgress('Waiting for confirmation...');
        await tx.wait();
        setEncryptionProgress(null);
      } catch (err) {
        setEncryptionProgress(null);
        throw err;
      }
    },
    [contract, provider, fhe]
  );

  const depositTokens = useCallback(
    async (amount: number) => {
      if (!contract) throw new Error('Contract not initialized');
      if (!provider) throw new Error('Provider not initialized');

      try {
        setEncryptionProgress('Encrypting deposit amount...');
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();

        // Encrypt deposit amount
        const encryptedAmount = await fhe.encryptValue(
          amount,
          CONTRACT_ADDRESS,
          userAddress
        );

        setEncryptionProgress('Submitting deposit...');

        // Call contract with encrypted value
        const tx = await contract.depositTokens(
          encryptedAmount.handles,
          encryptedAmount.inputProof
        );

        setEncryptionProgress('Waiting for confirmation...');
        await tx.wait();
        setEncryptionProgress(null);
      } catch (err) {
        setEncryptionProgress(null);
        throw err;
      }
    },
    [contract, provider, fhe]
  );

  const getCreditInfo = useCallback(
    async (creditId: number): Promise<CreditInfo> => {
      if (!contract) throw new Error('Contract not initialized');
      const info = await contract.getCreditInfo(creditId);
      return {
        issuer: info.issuer,
        isActive: info.isActive,
        timestamp: info.timestamp,
        projectType: info.projectType,
        verificationHash: info.verificationHash,
      };
    },
    [contract]
  );

  const getOrderInfo = useCallback(
    async (orderId: number): Promise<OrderInfo> => {
      if (!contract) throw new Error('Contract not initialized');
      const info = await contract.getOrderInfo(orderId);
      return {
        buyer: info.buyer,
        seller: info.seller,
        isActive: info.isActive,
        isFulfilled: info.isFulfilled,
        timestamp: info.timestamp,
        creditId: info.creditId,
      };
    },
    [contract]
  );

  const getSystemStats = useCallback(async (): Promise<SystemStats> => {
    if (!contract) throw new Error('Contract not initialized');
    const stats = await contract.getSystemStats();
    return {
      totalCredits: stats.totalCredits,
      totalOrders: stats.totalOrders,
    };
  }, [contract]);

  const getMyBalances = useCallback(async (): Promise<UserBalances> => {
    if (!contract) throw new Error('Contract not initialized');
    const balances = await contract.getMyBalances();
    return {
      encryptedCreditBalance: balances.encryptedCreditBalance,
      encryptedTokenBalance: balances.encryptedTokenBalance,
    };
  }, [contract]);

  const getMyOrderIds = useCallback(async (): Promise<bigint[]> => {
    if (!contract) throw new Error('Contract not initialized');
    return await contract.getMyOrderIds();
  }, [contract]);

  const getMyCreditIds = useCallback(async (): Promise<bigint[]> => {
    if (!contract) throw new Error('Contract not initialized');
    return await contract.getMyCreditIds();
  }, [contract]);

  const cancelOrder = useCallback(
    async (orderId: number) => {
      if (!contract) throw new Error('Contract not initialized');
      const tx = await contract.cancelOrder(orderId);
      await tx.wait();
    },
    [contract]
  );

  const executeTrade = useCallback(
    async (orderId: number) => {
      if (!contract) throw new Error('Contract not initialized');
      const tx = await contract.executeTrade(orderId);
      await tx.wait();
    },
    [contract]
  );

  return {
    provider,
    contract,
    loading,
    error,
    encryptionProgress,
    initialize,
    registerUser,
    isUserRegistered,
    issueCredits,
    createBuyOrder,
    depositTokens,
    getCreditInfo,
    getOrderInfo,
    getSystemStats,
    getMyBalances,
    getMyOrderIds,
    getMyCreditIds,
    cancelOrder,
    executeTrade,
    fhe,
  };
};
