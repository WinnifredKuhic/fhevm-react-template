import React, { useState } from 'react';
import { useContract } from '../hooks/useContract';
import { useWallet } from '../hooks/useWallet';
import { ProjectType, IssueCreditsParams } from '../types';

export const CreditManagement: React.FC = () => {
  const { wallet } = useWallet();
  const { issueCredits, encryptionProgress } = useContract();
  const [formData, setFormData] = useState({
    amount: '',
    pricePerCredit: '',
    projectType: '' as ProjectType | '',
    verificationHash: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: 'success' | 'error' | 'loading';
  } | null>(null);

  const projectTypes: { value: ProjectType; label: string }[] = [
    { value: 'renewable_energy', label: 'Renewable Energy' },
    { value: 'reforestation', label: 'Reforestation' },
    { value: 'carbon_capture', label: 'Carbon Capture' },
    { value: 'methane_reduction', label: 'Methane Reduction' },
    { value: 'energy_efficiency', label: 'Energy Efficiency' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!wallet.address) {
      setMessage({
        text: 'Please connect your wallet first',
        type: 'error',
      });
      return;
    }

    if (!formData.verificationHash.startsWith('0x')) {
      setMessage({
        text: 'Verification hash must start with 0x',
        type: 'error',
      });
      return;
    }

    try {
      setLoading(true);
      setMessage({
        text: 'Preparing to issue carbon credits...',
        type: 'loading',
      });

      const params: IssueCreditsParams = {
        amount: parseInt(formData.amount),
        pricePerCredit: parseInt(formData.pricePerCredit),
        projectType: formData.projectType as ProjectType,
        verificationHash: formData.verificationHash,
      };

      await issueCredits(params);

      setMessage({
        text: 'Carbon credits issued successfully with encrypted values!',
        type: 'success',
      });

      setFormData({
        amount: '',
        pricePerCredit: '',
        projectType: '',
        verificationHash: '',
      });
    } catch (err: any) {
      setMessage({
        text: `Failed to issue credits: ${err.message || 'Unknown error'}`,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Issue Carbon Credits</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="creditAmount">Amount:</label>
          <input
            type="number"
            id="creditAmount"
            min="1"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="creditPrice">Price per Credit:</label>
          <input
            type="number"
            id="creditPrice"
            min="1"
            value={formData.pricePerCredit}
            onChange={(e) => setFormData({ ...formData, pricePerCredit: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="projectType">Project Type:</label>
          <select
            id="projectType"
            value={formData.projectType}
            onChange={(e) =>
              setFormData({ ...formData, projectType: e.target.value as ProjectType })
            }
            required
          >
            <option value="">Select project type</option>
            {projectTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="verificationHash">Verification Hash:</label>
          <input
            type="text"
            id="verificationHash"
            placeholder="0x..."
            value={formData.verificationHash}
            onChange={(e) =>
              setFormData({ ...formData, verificationHash: e.target.value })
            }
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Issuing...' : 'Issue Credits'}
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
            Note: Amount and price will be encrypted using FHE before submission to ensure privacy.
          </small>
        </div>
      )}
    </div>
  );
};
