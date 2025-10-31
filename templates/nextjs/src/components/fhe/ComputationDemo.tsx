/**
 * Computation Demo Component
 * Interactive demo for FHE homomorphic computations
 */

'use client';

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useComputation } from '../../hooks/useComputation';
import { FHEOperation } from '../../types/fhe';

export function ComputationDemo() {
  const { compute, result, isComputing, error, reset } = useComputation();

  const [operation, setOperation] = useState<FHEOperation>('add');
  const [operand1, setOperand1] = useState('');
  const [operand2, setOperand2] = useState('');
  const [contractAddress, setContractAddress] = useState('0x0000000000000000000000000000000000000000');

  const handleCompute = async () => {
    try {
      if (!operand1 || !operand2) {
        alert('Please enter both operands');
        return;
      }

      await compute(operation, [operand1, operand2], contractAddress);
    } catch (err) {
      console.error('Computation error:', err);
    }
  };

  return (
    <Card
      title="Homomorphic Computation Demo"
      description="Perform computations on encrypted data"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Operation
          </label>
          <select
            value={operation}
            onChange={(e) => setOperation(e.target.value as FHEOperation)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isComputing}
          >
            <optgroup label="Arithmetic">
              <option value="add">Addition (+)</option>
              <option value="sub">Subtraction (-)</option>
              <option value="mul">Multiplication (×)</option>
              <option value="div">Division (÷)</option>
            </optgroup>
            <optgroup label="Comparison">
              <option value="eq">Equal (==)</option>
              <option value="ne">Not Equal (!=)</option>
              <option value="gt">Greater Than (&gt;)</option>
              <option value="gte">Greater or Equal (&gt;=)</option>
              <option value="lt">Less Than (&lt;)</option>
              <option value="lte">Less or Equal (&lt;=)</option>
            </optgroup>
          </select>
        </div>

        <Input
          label="Operand 1 (Encrypted Handle)"
          value={operand1}
          onChange={(e) => setOperand1(e.target.value)}
          placeholder="0x..."
          disabled={isComputing}
        />

        <Input
          label="Operand 2 (Encrypted Handle)"
          value={operand2}
          onChange={(e) => setOperand2(e.target.value)}
          placeholder="0x..."
          disabled={isComputing}
        />

        <Input
          label="Contract Address"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
          placeholder="0x..."
          disabled={isComputing}
        />

        <div className="flex gap-2">
          <Button
            onClick={handleCompute}
            disabled={!operand1 || !operand2 || isComputing}
            isLoading={isComputing}
          >
            Compute
          </Button>
          <Button
            variant="secondary"
            onClick={reset}
            disabled={!result}
          >
            Reset
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">Error: {error.message}</p>
          </div>
        )}

        {result && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
            <h4 className="font-medium text-blue-900">Computation Complete!</h4>
            <div className="space-y-1 text-sm">
              <p className="text-gray-700">
                <span className="font-medium">Operation:</span> {result.operation}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Operands:</span> {result.operandCount}
              </p>
              <p className="text-gray-700 break-all">
                <span className="font-medium">Result Handle:</span> {result.handle}
              </p>
              <p className="text-gray-700 text-xs">
                <span className="font-medium">Timestamp:</span> {new Date(result.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
