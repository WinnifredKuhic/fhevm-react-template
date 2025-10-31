'use client';

import { useState } from 'react';

interface TradeExecutorProps {
  contract: any;
  account: string;
}

export function TradeExecutor({ contract, account }: TradeExecutorProps) {
  const [orderId, setOrderId] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleExecuteTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!contract || !orderId) {
      alert('Please enter an order ID');
      return;
    }

    try {
      setIsExecuting(true);

      console.log('Executing trade for order:', orderId);
      const tx = await contract.executeTrade(parseInt(orderId));

      console.log('Transaction sent:', tx.hash);
      await tx.wait();

      setSuccessMessage(`Trade executed! TX: ${tx.hash.slice(0, 10)}...`);
      setOrderId('');
    } catch (err: any) {
      console.error('Failed to execute trade:', err);
      alert(`Error: ${err.message || 'Failed to execute trade'}`);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center mb-6">
        <div className="text-3xl mr-3">⚡</div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Execute Trade</h2>
          <p className="text-sm text-gray-600">Process order with FHE operations</p>
        </div>
      </div>

      <form onSubmit={handleExecuteTrade} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Order ID
          </label>
          <input
            type="number"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="e.g., 1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isExecuting}
          />
        </div>

        <button
          type="submit"
          disabled={isExecuting}
          className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isExecuting ? '⏳ Executing...' : '⚡ Execute Trade'}
        </button>

        {successMessage && (
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-purple-800 text-sm">{successMessage}</p>
          </div>
        )}
      </form>

      <div className="mt-6 space-y-3">
        <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
          <p className="text-xs text-purple-800 font-semibold mb-2">
            🔐 Homomorphic Operations:
          </p>
          <ul className="text-xs text-purple-700 space-y-1 ml-4">
            <li>• FHE.mul(amount, price) - Calculate cost</li>
            <li>• FHE.gte(balance, cost) - Verify funds</li>
            <li>• FHE.sub(balance, cost) - Update balance</li>
          </ul>
          <p className="text-xs text-purple-600 mt-2">
            All operations happen on encrypted data!
          </p>
        </div>
      </div>
    </div>
  );
}
