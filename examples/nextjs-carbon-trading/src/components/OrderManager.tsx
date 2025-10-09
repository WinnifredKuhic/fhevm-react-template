'use client';

import { useState } from 'react';
import { useEncrypt } from '@fhevm/sdk';

interface OrderManagerProps {
  contract: any;
  account: string;
}

export function OrderManager({ contract, account }: OrderManagerProps) {
  const { encrypt, isEncrypting } = useEncrypt();
  const [creditId, setCreditId] = useState('');
  const [orderAmount, setOrderAmount] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!contract || !creditId || !orderAmount) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setIsCreating(true);

      // Encrypt order amount
      console.log('Encrypting order amount:', orderAmount);
      const encryptedAmount = await encrypt(parseInt(orderAmount), {
        type: 'euint32',
        contractAddress: await contract.getAddress(),
        userAddress: account,
      });

      console.log('Creating buy order...');
      const tx = await contract.createBuyOrder(
        parseInt(creditId),
        encryptedAmount.handles,
        encryptedAmount.inputProof
      );

      console.log('Transaction sent:', tx.hash);
      const receipt = await tx.wait();

      // Extract order ID from events
      const orderEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === 'OrderCreated';
        } catch {
          return false;
        }
      });

      let orderId = 'unknown';
      if (orderEvent) {
        const parsed = contract.interface.parseLog(orderEvent);
        orderId = parsed?.args?.orderId?.toString() || 'unknown';
      }

      setSuccessMessage(`Order #${orderId} created! TX: ${tx.hash.slice(0, 10)}...`);
      setCreditId('');
      setOrderAmount('');
    } catch (err: any) {
      console.error('Failed to create order:', err);
      alert(`Error: ${err.message || 'Failed to create order'}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center mb-6">
        <div className="text-3xl mr-3">📋</div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Create Buy Order</h2>
          <p className="text-sm text-gray-600">Place encrypted order for credits</p>
        </div>
      </div>

      <form onSubmit={handleCreateOrder} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Credit ID
          </label>
          <input
            type="number"
            value={creditId}
            onChange={(e) => setCreditId(e.target.value)}
            placeholder="e.g., 1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isCreating || isEncrypting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Order Amount (credits)
          </label>
          <input
            type="number"
            value={orderAmount}
            onChange={(e) => setOrderAmount(e.target.value)}
            placeholder="e.g., 100"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isCreating || isEncrypting}
          />
        </div>

        <button
          type="submit"
          disabled={isCreating || isEncrypting}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isEncrypting
            ? '🔒 Encrypting...'
            : isCreating
            ? '⏳ Creating Order...'
            : '🛒 Create Buy Order'}
        </button>

        {successMessage && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">{successMessage}</p>
          </div>
        )}
      </form>

      <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <p className="text-xs text-purple-800">
          <strong>🔐 Privacy:</strong> Order amount is encrypted. Other users cannot see
          how many credits you&apos;re ordering.
        </p>
      </div>
    </div>
  );
}
