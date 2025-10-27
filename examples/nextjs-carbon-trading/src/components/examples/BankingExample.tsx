/**
 * Banking Example Component
 * Demonstrates FHE usage for private banking operations
 */

'use client';

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useEncryption } from '../../hooks/useEncryption';
import { useComputation } from '../../hooks/useComputation';
import { useFHEContext } from '../fhe/FHEProvider';

export function BankingExample() {
  const { client, isReady } = useFHEContext();
  const { encrypt, isEncrypting } = useEncryption(client);
  const { compute, isComputing } = useComputation();

  const [accountBalance, setAccountBalance] = useState('10000');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');

  const [encryptedBalance, setEncryptedBalance] = useState<string | null>(null);
  const [operationResult, setOperationResult] = useState<string | null>(null);
  const [operationLog, setOperationLog] = useState<string[]>([]);

  const contractAddress = '0x1234567890123456789012345678901234567890';

  const addLog = (message: string) => {
    setOperationLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleInitialize = async () => {
    try {
      const encrypted = await encrypt(parseInt(accountBalance, 10), {
        type: 'euint64',
        contractAddress
      });
      setEncryptedBalance(encrypted.handles);
      addLog(`Account initialized with encrypted balance: ${accountBalance}`);
      setOperationResult('Account initialized successfully');
    } catch (err) {
      addLog(`Error initializing account: ${err}`);
    }
  };

  const handleDeposit = async () => {
    if (!encryptedBalance) {
      alert('Please initialize account first');
      return;
    }

    try {
      const encryptedDeposit = await encrypt(parseInt(depositAmount, 10), {
        type: 'euint64',
        contractAddress
      });

      const result = await compute('add', [encryptedBalance, encryptedDeposit.handles], contractAddress);
      setEncryptedBalance(result.handle);
      addLog(`Deposited ${depositAmount} into account`);
      setOperationResult(`Deposit successful. New encrypted balance handle: ${result.handle.substring(0, 20)}...`);
      setDepositAmount('');
    } catch (err) {
      addLog(`Error processing deposit: ${err}`);
    }
  };

  const handleWithdraw = async () => {
    if (!encryptedBalance) {
      alert('Please initialize account first');
      return;
    }

    try {
      const encryptedWithdraw = await encrypt(parseInt(withdrawAmount, 10), {
        type: 'euint64',
        contractAddress
      });

      // First check if balance >= withdrawal amount
      const comparisonResult = await compute('gte', [encryptedBalance, encryptedWithdraw.handles], contractAddress);
      addLog(`Balance check completed`);

      // Perform subtraction
      const result = await compute('sub', [encryptedBalance, encryptedWithdraw.handles], contractAddress);
      setEncryptedBalance(result.handle);
      addLog(`Withdrew ${withdrawAmount} from account`);
      setOperationResult(`Withdrawal successful. New encrypted balance handle: ${result.handle.substring(0, 20)}...`);
      setWithdrawAmount('');
    } catch (err) {
      addLog(`Error processing withdrawal: ${err}`);
    }
  };

  const handleTransfer = async () => {
    if (!encryptedBalance || !recipientAddress) {
      alert('Please initialize account and enter recipient address');
      return;
    }

    try {
      const encryptedTransfer = await encrypt(parseInt(transferAmount, 10), {
        type: 'euint64',
        contractAddress
      });

      // Check if balance >= transfer amount
      await compute('gte', [encryptedBalance, encryptedTransfer.handles], contractAddress);
      addLog(`Transfer authorization check completed`);

      // Deduct from sender
      const result = await compute('sub', [encryptedBalance, encryptedTransfer.handles], contractAddress);
      setEncryptedBalance(result.handle);

      addLog(`Transferred ${transferAmount} to ${recipientAddress.substring(0, 10)}...`);
      setOperationResult(`Transfer successful to ${recipientAddress.substring(0, 20)}...`);
      setTransferAmount('');
    } catch (err) {
      addLog(`Error processing transfer: ${err}`);
    }
  };

  const isProcessing = isEncrypting || isComputing;

  return (
    <Card
      title="Private Banking Example"
      description="Secure banking operations with encrypted balances and transactions"
    >
      <div className="space-y-6">
        {/* Initialize Account */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-3">Initialize Account</h4>
          <div className="space-y-3">
            <Input
              label="Initial Balance"
              type="number"
              value={accountBalance}
              onChange={(e) => setAccountBalance(e.target.value)}
              disabled={!!encryptedBalance || isProcessing}
              placeholder="Enter initial balance"
            />
            <Button
              onClick={handleInitialize}
              disabled={!!encryptedBalance || !isReady || isProcessing}
              isLoading={isProcessing}
            >
              Initialize Encrypted Account
            </Button>
          </div>
        </div>

        {/* Deposit */}
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium text-green-900 mb-3">Deposit Funds</h4>
          <div className="space-y-3">
            <Input
              label="Deposit Amount"
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              disabled={!encryptedBalance || isProcessing}
              placeholder="Enter amount to deposit"
            />
            <Button
              variant="primary"
              onClick={handleDeposit}
              disabled={!encryptedBalance || !depositAmount || isProcessing}
              isLoading={isProcessing}
            >
              Deposit
            </Button>
          </div>
        </div>

        {/* Withdraw */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-900 mb-3">Withdraw Funds</h4>
          <div className="space-y-3">
            <Input
              label="Withdrawal Amount"
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              disabled={!encryptedBalance || isProcessing}
              placeholder="Enter amount to withdraw"
            />
            <Button
              variant="primary"
              onClick={handleWithdraw}
              disabled={!encryptedBalance || !withdrawAmount || isProcessing}
              isLoading={isProcessing}
            >
              Withdraw
            </Button>
          </div>
        </div>

        {/* Transfer */}
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h4 className="font-medium text-purple-900 mb-3">Transfer Funds</h4>
          <div className="space-y-3">
            <Input
              label="Transfer Amount"
              type="number"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              disabled={!encryptedBalance || isProcessing}
              placeholder="Enter amount to transfer"
            />
            <Input
              label="Recipient Address"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              disabled={!encryptedBalance || isProcessing}
              placeholder="0x..."
            />
            <Button
              variant="primary"
              onClick={handleTransfer}
              disabled={!encryptedBalance || !transferAmount || !recipientAddress || isProcessing}
              isLoading={isProcessing}
            >
              Transfer
            </Button>
          </div>
        </div>

        {/* Current Balance Display */}
        {encryptedBalance && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Current Encrypted Balance</h4>
            <p className="text-xs font-mono text-gray-600 break-all">{encryptedBalance}</p>
            <p className="text-sm text-gray-500 mt-2">Balance is encrypted and private</p>
          </div>
        )}

        {/* Operation Result */}
        {operationResult && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">{operationResult}</p>
          </div>
        )}

        {/* Operation Log */}
        {operationLog.length > 0 && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Operation Log</h4>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {operationLog.map((log, index) => (
                <p key={index} className="text-xs text-gray-600 font-mono">
                  {log}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
