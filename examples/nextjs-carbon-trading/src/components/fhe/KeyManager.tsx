/**
 * Key Manager Component
 * Manage FHE public keys
 */

'use client';

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { fetchPublicKey, generatePublicKey } from '../../lib/fhe/keys';
import { FHEPublicKey } from '../../types/fhe';
import { useFHEContext } from './FHEProvider';

export function KeyManager() {
  const { publicKey: contextPublicKey, isReady } = useFHEContext();

  const [contractAddress, setContractAddress] = useState('0x0000000000000000000000000000000000000000');
  const [publicKey, setPublicKey] = useState<FHEPublicKey | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchKey = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const key = await fetchPublicKey(contractAddress);
      setPublicKey(key);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch public key');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateKey = async (regenerate: boolean = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const key = await generatePublicKey(contractAddress, regenerate);
      setPublicKey(key);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate public key');
    } finally {
      setIsLoading(false);
    }
  };

  const displayKey = publicKey || contextPublicKey;

  return (
    <Card
      title="Public Key Manager"
      description="Manage FHE public keys for encryption"
    >
      <div className="space-y-4">
        <Input
          label="Contract Address"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
          placeholder="0x..."
          disabled={isLoading}
        />

        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={handleFetchKey}
            disabled={isLoading || !contractAddress}
            isLoading={isLoading}
          >
            Fetch Key
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleGenerateKey(false)}
            disabled={isLoading || !contractAddress}
          >
            Generate Key
          </Button>
          <Button
            variant="outline"
            onClick={() => handleGenerateKey(true)}
            disabled={isLoading || !contractAddress}
          >
            Regenerate Key
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">Error: {error}</p>
          </div>
        )}

        {displayKey && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
            <h4 className="font-medium text-gray-900">Public Key Information</h4>
            <div className="space-y-2 text-sm">
              <div>
                <p className="font-medium text-gray-700">Contract Address:</p>
                <p className="text-gray-600 font-mono text-xs break-all">
                  {displayKey.contractAddress}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Public Key:</p>
                <p className="text-gray-600 font-mono text-xs break-all">
                  {displayKey.key}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="font-medium text-gray-700">Version:</p>
                  <p className="text-gray-600">{displayKey.version}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Algorithm:</p>
                  <p className="text-gray-600">{displayKey.algorithm}</p>
                </div>
              </div>
              <div>
                <p className="font-medium text-gray-700">Generated:</p>
                <p className="text-gray-600">
                  {new Date(displayKey.generatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {!displayKey && !error && !isLoading && (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600">No public key loaded. Fetch or generate a key to begin.</p>
          </div>
        )}

        {isReady && contextPublicKey && !publicKey && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">Using public key from FHE context</p>
          </div>
        )}
      </div>
    </Card>
  );
}
