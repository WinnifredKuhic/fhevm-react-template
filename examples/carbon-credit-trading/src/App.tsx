import React, { useState, useEffect } from 'react';
import { useWallet } from './hooks/useWallet';
import { useContract } from './hooks/useContract';
import { formatAddress, CONTRACT_ADDRESS } from './lib/contract';
import { UserRegistration } from './components/UserRegistration';
import { CreditManagement } from './components/CreditManagement';
import { OrderManagement } from './components/OrderManagement';
import { TradeExecution } from './components/TradeExecution';
import { BalanceDisplay } from './components/BalanceDisplay';
import './App.css';

type TabId = 'register' | 'issue' | 'trade' | 'orders' | 'balances';

function App() {
  const { wallet, loading: walletLoading, error: walletError, connectWallet } = useWallet();
  const { initialize, error: contractError, fhe, encryptionProgress } = useContract();
  const [activeTab, setActiveTab] = useState<TabId>('register');
  const [connectionStatus, setConnectionStatus] = useState<{
    text: string;
    type: 'success' | 'error' | 'loading';
  }>({
    text: 'Ready to connect wallet',
    type: 'success',
  });

  useEffect(() => {
    if (wallet.isConnected && wallet.address) {
      initialize();
      setConnectionStatus({
        text: `Connected to ${formatAddress(wallet.address)}`,
        type: 'success',
      });
    }
  }, [wallet.isConnected, wallet.address, initialize]);

  useEffect(() => {
    if (walletError) {
      setConnectionStatus({
        text: walletError,
        type: 'error',
      });
    }
  }, [walletError]);

  useEffect(() => {
    if (contractError) {
      setConnectionStatus({
        text: contractError,
        type: 'error',
      });
    }
  }, [contractError]);

  const handleConnectWallet = async () => {
    setConnectionStatus({
      text: 'Connecting to wallet...',
      type: 'loading',
    });
    await connectWallet();
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: 'register', label: 'Register' },
    { id: 'issue', label: 'Issue Credits' },
    { id: 'trade', label: 'Trade' },
    { id: 'orders', label: 'My Orders' },
    { id: 'balances', label: 'Balances' },
  ];

  return (
    <div className="container">
      <header>
        <h1>Carbon Credit Trading Platform</h1>
        <div className="wallet-section">
          {!wallet.isConnected ? (
            <button
              id="connectWallet"
              className="btn btn-primary"
              onClick={handleConnectWallet}
              disabled={walletLoading}
            >
              {walletLoading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          ) : (
            <div className="wallet-info">
              <span id="walletAddress">{formatAddress(wallet.address!)}</span>
              <span id="networkInfo">
                Network: {wallet.chainId === 31337 ? 'Hardhat Local' : `Chain ${wallet.chainId}`}
              </span>
            </div>
          )}
        </div>
      </header>

      <main>
        <div className="status-section">
          <div className="status-card">
            <h3>Connection Status</h3>
            <p className={`status-message ${connectionStatus.type}`}>{connectionStatus.text}</p>
            {wallet.isConnected && (
              <div style={{ marginTop: '10px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px',
                  background: fhe.initialized ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 165, 0, 0.1)',
                  borderRadius: '6px',
                  border: `1px solid ${fhe.initialized ? 'var(--success-green)' : 'orange'}`
                }}>
                  <span style={{ fontSize: '1.2em' }}>
                    {fhe.initialized ? '🔒' : '⏳'}
                  </span>
                  <span style={{
                    fontSize: '0.9em',
                    color: fhe.initialized ? 'var(--success-green)' : 'orange'
                  }}>
                    FHE Encryption: {fhe.initialized ? 'Ready' : 'Initializing...'}
                  </span>
                </div>
                {fhe.error && (
                  <div style={{ marginTop: '8px', color: 'var(--error-red)', fontSize: '0.85em' }}>
                    FHE Error: {fhe.error}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="status-card" style={{ marginTop: '20px' }}>
            <h3>Local Network Setup</h3>
            <ol style={{ marginLeft: '20px', color: 'var(--text-secondary)' }}>
              <li>
                <strong>Add Hardhat Network to MetaMask:</strong>
              </li>
              <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                <li>Network Name: Hardhat Local</li>
                <li>RPC URL: http://127.0.0.1:8546</li>
                <li>Chain ID: 31337</li>
                <li>Currency Symbol: ETH</li>
              </ul>
              <li style={{ marginTop: '10px' }}>
                <strong>Import Test Account:</strong>
              </li>
              <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                <li>Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80</li>
                <li>Address: 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266</li>
                <li>Balance: 10,000 ETH</li>
              </ul>
              <li style={{ marginTop: '10px' }}>Connect wallet and start trading!</li>
            </ol>
            <div
              style={{
                marginTop: '15px',
                padding: '10px',
                background: 'rgba(0, 255, 255, 0.1)',
                borderRadius: '8px',
                border: '1px solid var(--primary-cyan)',
              }}
            >
              <strong style={{ color: 'var(--primary-cyan)' }}>Contract Address:</strong>
              <br />
              <code style={{ color: 'var(--text-primary)' }}>{CONTRACT_ADDRESS}</code>
            </div>
          </div>
        </div>

        <div className="tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={`tab-content ${activeTab === 'register' ? 'active' : ''}`}>
          <UserRegistration />
        </div>

        <div className={`tab-content ${activeTab === 'issue' ? 'active' : ''}`}>
          <CreditManagement />
        </div>

        <div className={`tab-content ${activeTab === 'trade' ? 'active' : ''}`}>
          <OrderManagement />
          <TradeExecution />
        </div>

        <div className={`tab-content ${activeTab === 'orders' ? 'active' : ''}`}>
          <TradeExecution />
        </div>

        <div className={`tab-content ${activeTab === 'balances' ? 'active' : ''}`}>
          <BalanceDisplay />
        </div>
      </main>
    </div>
  );
}

export default App;
