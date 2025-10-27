/**
 * Encryption Demo Component
 * Interactive demo for FHE encryption operations
 */

'use client';

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useEncryption } from '../../hooks/useEncryption';
import { useFHEContext } from './FHEProvider';

export function EncryptionDemo() {
  const { client, isReady } = useFHEContext();
  const { encrypt, encryptedValue, isEncrypting, error, reset } = useEncryption(client);

  const [value, setValue] = useState('');
  const [contractAddress, setContractAddress] = useState('0x0000000000000000000000000000000000000000');
  const [encryptionType, setEncryptionType] = useState<'euint8' | 'euint16' | 'euint32' | 'euint64'>('euint32');

  const handleEncrypt = async () => {
    try {
      const numValue = parseInt(value, 10);
      if (isNaN(numValue)) {
        alert('Please enter a valid number');
        return;
      }

      await encrypt(numValue, {
        type: encryptionType,
        contractAddress
      });
    } catch (err) {
      console.error('Encryption error:', err);
    }
  };

  return (
    <Card
      title="Encryption Demo"
      description="Encrypt values using Fully Homomorphic Encryption"
    >
      <div className="space-y-4">
        <Input
          label="Value to Encrypt"
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter a number"
          disabled={!isReady || isEncrypting}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Encryption Type
          </label>
          <select
            value={encryptionType}
            onChange={(e) => setEncryptionType(e.target.value as any)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!isReady || isEncrypting}
          >
            <option value="euint8">euint8 (0-255)</option>
            <option value="euint16">euint16 (0-65535)</option>
            <option value="euint32">euint32 (0-4294967295)</option>
            <option value="euint64">euint64 (Large numbers)</option>
          </select>
        </div>

        <Input
          label="Contract Address"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
          placeholder="0x..."
          disabled={!isReady || isEncrypting}
        />

        <div className="flex gap-2">
          <Button
            onClick={handleEncrypt}
            disabled={!isReady || !value || isEncrypting}
            isLoading={isEncrypting}
          >
            Encrypt
          </Button>
          <Button
            variant="secondary"
            onClick={reset}
            disabled={!encryptedValue}
          >
            Reset
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">Error: {error.message}</p>
          </div>
        )}

        {encryptedValue && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
            <h4 className="font-medium text-green-900">Encryption Successful!</h4>
            <div className="space-y-1 text-sm">
              <p className="text-gray-700">
                <span className="font-medium">Type:</span> {encryptedValue.type}
              </p>
              <p className="text-gray-700 break-all">
                <span className="font-medium">Handles:</span> {encryptedValue.handles}
              </p>
              <p className="text-gray-700 break-all">
                <span className="font-medium">Proof:</span> {encryptedValue.inputProof}
              </p>
            </div>
          </div>
        )}

        {!isReady && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700">Initializing FHE client...</p>
          </div>
        )}
      </div>
    </Card>
  );
}
