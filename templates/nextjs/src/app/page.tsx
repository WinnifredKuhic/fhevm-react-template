'use client';

import { useState, useEffect } from 'react';
import { useFhevm, useEncrypt, useDecrypt } from '@fhevm/sdk';
import { BrowserProvider, Contract } from 'ethers';
import { CreditIssuer } from '@/components/CreditIssuer';
import { OrderManager } from '@/components/OrderManager';
import { TradeExecutor } from '@/components/TradeExecutor';
import { BalanceViewer } from '@/components/BalanceViewer';

// Import contract ABI (you'll need to add this)
import CarbonCreditTradingABI from '../contracts/CarbonCreditTrading.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';

export default function Home() {
  const { client, isInitialized, isInitializing, error } = useFhevm();
  const [account, setAccount] = useState<string>('');
  const [contract, setContract] = useState<Contract | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (isInitialized && client) {
      connectWallet();
    }
  }, [isInitialized, client]);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert('Please install MetaMask!');
        return;
      }

      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();

      setAccount(accounts[0]);

      if (CONTRACT_ADDRESS) {
        const contractInstance = new Contract(
          CONTRACT_ADDRESS,
          CarbonCreditTradingABI.abi,
          signer
        );
        setContract(contractInstance);
      }

      setIsConnected(true);
    } catch (err) {
      console.error('Failed to connect wallet:', err);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800">Initializing FHEVM...</h2>
          <p className="text-gray-600 mt-2">Setting up encryption...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-800 mb-4">Initialization Error</h2>
          <p className="text-red-600 mb-4">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-xl">
          <div className="text-6xl mb-6">🌱</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Carbon Credit Trading
          </h1>
          <p className="text-gray-600 mb-8">
            Privacy-preserving carbon credit marketplace powered by Zama FHEVM
          </p>
          <button
            onClick={connectWallet}
            className="w-full px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-lg"
          >
            Connect Wallet
          </button>
          <p className="text-sm text-gray-500 mt-4">
            Make sure you&apos;re on Sepolia testnet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">🌱</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Carbon Credit Trading
                </h1>
                <p className="text-sm text-gray-600">
                  Powered by Zama FHEVM
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="font-semibold">Network:</span> Sepolia
              </div>
              <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-mono text-sm">
                {account.slice(0, 6)}...{account.slice(-4)}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Balance Viewer */}
            <BalanceViewer contract={contract} account={account} />

            {/* Credit Issuer */}
            <CreditIssuer contract={contract} account={account} />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Order Manager */}
            <OrderManager contract={contract} account={account} />

            {/* Trade Executor */}
            <TradeExecutor contract={contract} account={account} />
          </div>
        </div>

        {/* Info Footer */}
        <div className="mt-12 p-6 bg-white rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            🔒 Privacy Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-semibold text-green-600 mb-2">
                Encrypted Amounts
              </div>
              <p className="text-gray-600">
                All credit amounts are encrypted on-chain using FHE
              </p>
            </div>
            <div>
              <div className="font-semibold text-blue-600 mb-2">
                Private Pricing
              </div>
              <p className="text-gray-600">
                Order prices remain confidential during trading
              </p>
            </div>
            <div>
              <div className="font-semibold text-purple-600 mb-2">
                Secure Balances
              </div>
              <p className="text-gray-600">
                Token balances protected with homomorphic encryption
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
