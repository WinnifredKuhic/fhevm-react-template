'use client';

import { useState } from 'react';
import { useEncrypt } from '@fhevm/sdk';
import { ethers } from 'ethers';

interface CreditIssuerProps {
  contract: any;
  account: string;
}

export function CreditIssuer({ contract, account }: CreditIssuerProps) {
  const { encrypt, isEncrypting } = useEncrypt();
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [verificationData, setVerificationData] = useState('');
  const [isIssuing, setIsIssuing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleIssueCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!contract || !amount || !price || !verificationData) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setIsIssuing(true);

      // Encrypt amount and price
      console.log('Encrypting amount:', amount);
      const encryptedAmount = await encrypt(parseInt(amount), {
        type: 'euint32',
        contractAddress: await contract.getAddress(),
        userAddress: account,
      });

      console.log('Encrypting price:', price);
      const encryptedPrice = await encrypt(parseInt(price), {
        type: 'euint32',
        contractAddress: await contract.getAddress(),
        userAddress: account,
      });

      // Create verification hash
      const verificationHash = ethers.keccak256(
        ethers.toUtf8Bytes(verificationData)
      );

      console.log('Issuing credit...');
      const tx = await contract.issueCredit(
        encryptedAmount.handles,
        encryptedAmount.inputProof,
        encryptedPrice.handles,
        encryptedPrice.inputProof,
        verificationHash
      );

      console.log('Transaction sent:', tx.hash);
      await tx.wait();

      setSuccessMessage(`Credit issued successfully! TX: ${tx.hash.slice(0, 10)}...`);
      setAmount('');
      setPrice('');
      setVerificationData('');
    } catch (err: any) {
      console.error('Failed to issue credit:', err);
      alert(`Error: ${err.message || 'Failed to issue credit'}`);
    } finally {
      setIsIssuing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center mb-6">
        <div className="text-3xl mr-3">🌱</div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Issue Carbon Credit</h2>
          <p className="text-sm text-gray-600">Create new encrypted credits</p>
        </div>
      </div>

      <form onSubmit={handleIssueCredit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Credit Amount (tons CO₂)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g., 1000"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={isIssuing || isEncrypting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price per Credit (tokens)
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g., 50"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={isIssuing || isEncrypting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Verification Data
          </label>
          <input
            type="text"
            value={verificationData}
            onChange={(e) => setVerificationData(e.target.value)}
            placeholder="e.g., Project-XYZ-2024"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={isIssuing || isEncrypting}
          />
          <p className="text-xs text-gray-500 mt-1">
            This will be hashed for on-chain verification
          </p>
        </div>

        <button
          type="submit"
          disabled={isIssuing || isEncrypting}
          className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isEncrypting
            ? '🔒 Encrypting...'
            : isIssuing
            ? '⏳ Issuing Credit...'
            : '✨ Issue Credit'}
        </button>

        {successMessage && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">{successMessage}</p>
          </div>
        )}
      </form>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>🔒 Privacy Note:</strong> Amount and price are encrypted using FHE
          before being sent to the blockchain. Only authorized parties can decrypt these values.
        </p>
      </div>
    </div>
  );
}
