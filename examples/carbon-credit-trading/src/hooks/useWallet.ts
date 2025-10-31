import { useState, useCallback, useEffect } from 'react';
import { WalletState } from '../types';

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnected: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const chainId = await window.ethereum.request({
        method: 'eth_chainId',
      });

      setWallet({
        address: accounts[0],
        chainId: parseInt(chainId, 16),
        isConnected: true,
      });

      return accounts[0];
    } catch (err: any) {
      if (err.code === 4001) {
        setError('User rejected the connection request');
      } else if (err.code === -32002) {
        setError('Connection request pending. Please check MetaMask.');
      } else {
        setError(err.message || 'Failed to connect wallet');
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setWallet({
      address: null,
      chainId: null,
      isConnected: false,
    });
  }, []);

  const checkConnection = useCallback(async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        return false;
      }

      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      });

      if (accounts.length > 0) {
        const chainId = await window.ethereum.request({
          method: 'eth_chainId',
        });

        setWallet({
          address: accounts[0],
          chainId: parseInt(chainId, 16),
          isConnected: true,
        });

        return true;
      }

      return false;
    } catch (err) {
      console.error('Error checking connection:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    checkConnection();

    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setWallet((prev) => ({
            ...prev,
            address: accounts[0],
            isConnected: true,
          }));
        }
      };

      const handleChainChanged = (chainId: string) => {
        setWallet((prev) => ({
          ...prev,
          chainId: parseInt(chainId, 16),
        }));
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [checkConnection, disconnectWallet]);

  return {
    wallet,
    loading,
    error,
    connectWallet,
    disconnectWallet,
    checkConnection,
  };
};
