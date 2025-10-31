import React, { useState, useEffect } from 'react';
import { useContract } from '../hooks/useContract';
import { useWallet } from '../hooks/useWallet';
import { UserBalances, SystemStats } from '../types';

export const BalanceDisplay: React.FC = () => {
  const { wallet } = useWallet();
  const { depositTokens, getMyBalances, isUserRegistered, getSystemStats, provider, fhe, encryptionProgress } = useContract();
  const [depositAmount, setDepositAmount] = useState('');
  const [balances, setBalances] = useState<UserBalances | null>(null);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [decrypting, setDecrypting] = useState(false);
  const [decryptedBalances, setDecryptedBalances] = useState<{
    credits: bigint | null;
    tokens: bigint | null;
  }>({ credits: null, tokens: null });
  const [message, setMessage] = useState<{
    text: string;
    type: 'success' | 'error' | 'loading';
  } | null>(null);

  const loadBalances = async () => {
    if (!wallet.address) return;

    try {
      const registered = await isUserRegistered(wallet.address);

      if (!registered) {
        setBalances(null);
        setDecryptedBalances({ credits: null, tokens: null });
        return;
      }

      const userBalances = await getMyBalances();
      setBalances(userBalances);
      // Reset decrypted values when loading new balances
      setDecryptedBalances({ credits: null, tokens: null });
    } catch (err) {
      console.error('Error loading balances:', err);
    }
  };

  const handleDecryptBalances = async () => {
    if (!balances || !provider || !fhe.initialized) {
      setMessage({
        text: 'Cannot decrypt: FHE not initialized or no balances available',
        type: 'error',
      });
      return;
    }

    try {
      setDecrypting(true);
      setMessage({
        text: 'Requesting decryption permission (sign EIP-712 message)...',
        type: 'loading',
      });

      const signer = await provider.getSigner();
      const CONTRACT_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';

      // Decrypt credit balance
      setMessage({
        text: 'Decrypting credit balance...',
        type: 'loading',
      });

      const decryptedCredits = await fhe.decryptValue(
        balances.encryptedCreditBalance.toString(),
        CONTRACT_ADDRESS,
        signer
      );

      // Decrypt token balance
      setMessage({
        text: 'Decrypting token balance...',
        type: 'loading',
      });

      const decryptedTokens = await fhe.decryptValue(
        balances.encryptedTokenBalance.toString(),
        CONTRACT_ADDRESS,
        signer
      );

      setDecryptedBalances({
        credits: decryptedCredits,
        tokens: decryptedTokens,
      });

      setMessage({
        text: 'Balances decrypted successfully!',
        type: 'success',
      });
    } catch (err: any) {
      setMessage({
        text: `Failed to decrypt balances: ${err.message || 'Unknown error'}`,
        type: 'error',
      });
    } finally {
      setDecrypting(false);
    }
  };

  const loadSystemStats = async () => {
    try {
      const systemStats = await getSystemStats();
      setStats(systemStats);
    } catch (err) {
      console.error('Error loading system stats:', err);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
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
        text: 'Depositing tokens...',
        type: 'loading',
      });

      await depositTokens(parseInt(depositAmount));

      setMessage({
        text: 'Tokens deposited successfully!',
        type: 'success',
      });

      setDepositAmount('');
      await loadBalances();
    } catch (err: any) {
      setMessage({
        text: `Failed to deposit tokens: ${err.message || 'Unknown error'}`,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBalances();
    loadSystemStats();
  }, [wallet.address]);

  return (
    <>
      <div className="card">
        <h2>Deposit Tokens</h2>
        <form onSubmit={handleDeposit}>
          <div className="form-group">
            <label htmlFor="depositAmount">Amount:</label>
            <input
              type="number"
              id="depositAmount"
              min="1"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Depositing...' : 'Deposit Tokens'}
          </button>
        </form>
        {encryptionProgress && (
          <div className="status-message loading">
            <span style={{ marginRight: '8px' }}>🔒</span>
            {encryptionProgress}
          </div>
        )}
        {message && <div className={`status-message ${message.type}`}>{message.text}</div>}
      </div>

      <div className="card">
        <h2>My Balances</h2>
        <div className="balance-info">
          {!wallet.address ? (
            <p>Connect wallet to view balances</p>
          ) : !balances ? (
            <p>Please register first to view balances.</p>
          ) : (
            <>
              <div className="balance-item">
                <span className="balance-label">Credit Balance:</span>
                <span className="balance-value">
                  {decryptedBalances.credits !== null ? (
                    <>
                      <span style={{ color: 'var(--primary-cyan)', fontWeight: 'bold' }}>
                        {decryptedBalances.credits.toString()}
                      </span>
                      {' '}
                      <span style={{ fontSize: '0.8em', color: 'var(--text-secondary)' }}>
                        (Decrypted)
                      </span>
                    </>
                  ) : (
                    <>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        Encrypted (Handle: {balances.encryptedCreditBalance.toString().slice(0, 8)}...)
                      </span>
                    </>
                  )}
                </span>
              </div>
              <div className="balance-item">
                <span className="balance-label">Token Balance:</span>
                <span className="balance-value">
                  {decryptedBalances.tokens !== null ? (
                    <>
                      <span style={{ color: 'var(--primary-cyan)', fontWeight: 'bold' }}>
                        {decryptedBalances.tokens.toString()}
                      </span>
                      {' '}
                      <span style={{ fontSize: '0.8em', color: 'var(--text-secondary)' }}>
                        (Decrypted)
                      </span>
                    </>
                  ) : (
                    <>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        Encrypted (Handle: {balances.encryptedTokenBalance.toString().slice(0, 8)}...)
                      </span>
                    </>
                  )}
                </span>
              </div>
              <div className="balance-item">
                <span className="balance-label">Registration Status:</span>
                <span className="balance-value">Registered</span>
              </div>
            </>
          )}
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <button
            className="btn btn-secondary"
            onClick={loadBalances}
            disabled={!wallet.address}
          >
            Refresh Balances
          </button>
          <button
            className="btn btn-primary"
            onClick={handleDecryptBalances}
            disabled={!balances || decrypting || !fhe.initialized}
            style={{
              background: decryptedBalances.credits !== null ? 'var(--success-green)' : undefined
            }}
          >
            {decrypting ? 'Decrypting...' : decryptedBalances.credits !== null ? 'Decrypted ✓' : 'Decrypt Balances'}
          </button>
        </div>
        {!fhe.initialized && wallet.address && (
          <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(255, 165, 0, 0.1)', borderRadius: '8px' }}>
            <small style={{ color: 'orange' }}>
              FHE is initializing... Decryption will be available shortly.
            </small>
          </div>
        )}
        {fhe.initialized && balances && decryptedBalances.credits === null && (
          <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(0, 255, 255, 0.1)', borderRadius: '8px' }}>
            <small style={{ color: 'var(--text-secondary)' }}>
              Click "Decrypt Balances" to view your actual balance values. You will need to sign an EIP-712 message to prove ownership.
            </small>
          </div>
        )}
      </div>

      <div className="card">
        <h2>System Statistics</h2>
        <div className="stats-info">
          {!stats ? (
            <p>Loading system statistics...</p>
          ) : (
            <>
              <div className="stats-item">
                <span className="stats-label">Total Credits Issued:</span>
                <span className="stats-value">{stats.totalCredits.toString()}</span>
              </div>
              <div className="stats-item">
                <span className="stats-label">Total Orders Created:</span>
                <span className="stats-value">{stats.totalOrders.toString()}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};
