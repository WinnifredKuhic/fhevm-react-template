/**
 * useComputation Hook
 * Hook for performing homomorphic computations on encrypted data
 */

'use client';

import { useState, useCallback } from 'react';
import { ComputationResult, FHEOperation } from '../types/fhe';
import { performComputation } from '../lib/fhe/server';

interface UseComputationReturn {
  compute: (operation: FHEOperation, operands: string[], contractAddress?: string) => Promise<ComputationResult>;
  result: ComputationResult | null;
  isComputing: boolean;
  error: Error | null;
  reset: () => void;
}

export function useComputation(): UseComputationReturn {
  const [result, setResult] = useState<ComputationResult | null>(null);
  const [isComputing, setIsComputing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const compute = useCallback(async (
    operation: FHEOperation,
    operands: string[],
    contractAddress?: string
  ): Promise<ComputationResult> => {
    setIsComputing(true);
    setError(null);

    try {
      const computationResult = await performComputation(operation, operands, contractAddress);
      setResult(computationResult);
      return computationResult;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Computation failed');
      setError(error);
      throw error;
    } finally {
      setIsComputing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    compute,
    result,
    isComputing,
    error,
    reset
  };
}
