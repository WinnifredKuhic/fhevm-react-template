'use client';

import { useState, useEffect } from 'react';
import { useDecrypt } from '@fhevm/sdk';
import { BrowserProvider } from 'ethers';

interface BalanceViewerProps {
  contract: any;
  account: string;
}

export function BalanceViewer({ contract, account }: BalanceViewerProps) {
  const { decrypt, data, isDecrypting } = useDecrypt();
  const [balanceHandle, setBalanceHandle] = useState<string>('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [isCheckingRegistration, setIsCheckingRegistration] = useState(true);

  useEffect(() => {
    checkRegistration();
  }, [contract, account]);

  const checkRegistration = async () => {
    if (!contract || !account) return;

    try {
      setIsCheckingRegistration(true);
      const userInfo = await contract.getUserInfo(account);
      setIsRegistered(userInfo.registered);
    } catch (err) {
      console.error('Failed to check registration:', err);
      setIsRegistered(false);
    } finally {
      setIsCheckingRegistration(false);
    }
  };

  const handleViewBalance = async () => {
    if (!contract || !account) return;

    try {
      // Get balance handle from contract
      const user = await contract.users(account);
      const handle = user.encryptedBalance;

      setBalanceHandle(handle);

      // Decrypt balance
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      await decrypt({
        contractAddress: await contract.getAddress(),
        handle,
        signer,
      });
    } catch (err: any) {
      console.error('Failed to view balance:', err);
      alert(`Error: ${err.message || 'Failed to view balance'}`);
    }
  };

  if (isCheckingRegistration) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!isRegistered) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-8">
          <div className="text-5xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Not Registered
          </h3>
          <p className="text-sm text-gray-600">
            You need to be registered by the contract owner to use this platform
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center mb-6">
        <div className="text-3xl mr-3">💰</div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Token Balance</h2>
          <p className="text-sm text-gray-600">View your encrypted balance</p>
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={handleViewBalance}
          disabled={isDecrypting}
          className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isDecrypting ? '🔓 Decrypting...' : '👁️ View Balance'}
        </button>

        {data && (
          <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-indigo-600 font-semibold mb-2">
                Your Token Balance
              </div>
              <div className="text-4xl font-bold text-indigo-900 mb-2">
                {data.value.toString()}
              </div>
              <div className="text-xs text-indigo-600">tokens</div>
            </div>
          </div>
        )}

        {balanceHandle && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-xs text-gray-600 font-semibold mb-1">
              Encrypted Handle:
            </p>
            <p className="text-xs text-gray-800 font-mono break-all">
              {balanceHandle.slice(0, 20)}...{balanceHandle.slice(-20)}
            </p>
          </div>
        )}

        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            <strong>🔐 Privacy:</strong> Your balance is stored encrypted on-chain.
            Decryption requires your private key signature (EIP-712).
          </p>
        </div>
      </div>
    </div>
  );
}
