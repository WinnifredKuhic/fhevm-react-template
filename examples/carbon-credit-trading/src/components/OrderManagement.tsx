import React, { useState } from 'react';
import { useContract } from '../hooks/useContract';
import { useWallet } from '../hooks/useWallet';
import { CreateOrderParams } from '../types';

export const OrderManagement: React.FC = () => {
  const { wallet } = useWallet();
  const { createBuyOrder, encryptionProgress } = useContract();
  const [formData, setFormData] = useState({
    creditId: '',
    amount: '',
    maxPrice: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: 'success' | 'error' | 'loading';
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!wallet.address) {
      setMessage({
        text: 'Please connect your wallet first',
        type: 'error',
      });
      return;
    }

    try {
      setLoading(true);
      setMessage({
        text: 'Preparing buy order...',
        type: 'loading',
      });

      const params: CreateOrderParams = {
        creditId: parseInt(formData.creditId),
        amount: parseInt(formData.amount),
        maxPricePerCredit: parseInt(formData.maxPrice),
      };

      await createBuyOrder(params);

      setMessage({
        text: 'Buy order created successfully with encrypted values!',
        type: 'success',
      });

      setFormData({
        creditId: '',
        amount: '',
        maxPrice: '',
      });
    } catch (err: any) {
      setMessage({
        text: `Failed to create order: ${err.message || 'Unknown error'}`,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Create Buy Order</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="creditId">Credit ID:</label>
          <input
            type="number"
            id="creditId"
            min="1"
            value={formData.creditId}
            onChange={(e) => setFormData({ ...formData, creditId: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="orderAmount">Amount:</label>
          <input
            type="number"
            id="orderAmount"
            min="1"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="maxPrice">Max Price per Credit:</label>
          <input
            type="number"
            id="maxPrice"
            min="1"
            value={formData.maxPrice}
            onChange={(e) => setFormData({ ...formData, maxPrice: e.target.value })}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating Order...' : 'Create Order'}
        </button>
      </form>
      {encryptionProgress && (
        <div className="status-message loading">
          <span style={{ marginRight: '8px' }}>🔒</span>
          {encryptionProgress}
        </div>
      )}
      {message && (
        <div className={`status-message ${message.type}`}>{message.text}</div>
      )}
      {!loading && !encryptionProgress && (
        <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(0, 255, 255, 0.1)', borderRadius: '8px' }}>
          <small style={{ color: 'var(--text-secondary)' }}>
            Note: Order amount and max price will be encrypted using FHE to protect your trading strategy.
          </small>
        </div>
      )}
    </div>
  );
};
