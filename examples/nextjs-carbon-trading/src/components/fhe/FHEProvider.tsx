/**
 * FHE Provider Component
 * Context provider for FHE client and operations
 */

'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useFHE } from '../../hooks/useFHE';
import { FHEClient } from '../../lib/fhe/client';
import { FHEClientConfig, FHEPublicKey } from '../../types/fhe';

interface FHEContextValue {
  client: FHEClient | null;
  publicKey: FHEPublicKey | null;
  isReady: boolean;
  isLoading: boolean;
  error: Error | null;
  reinitialize: () => Promise<void>;
}

const FHEContext = createContext<FHEContextValue | undefined>(undefined);

interface FHEProviderProps {
  children: ReactNode;
  config?: FHEClientConfig;
}

export function FHEProvider({ children, config }: FHEProviderProps) {
  const fheState = useFHE(config);

  return (
    <FHEContext.Provider value={fheState}>
      {children}
    </FHEContext.Provider>
  );
}

export function useFHEContext(): FHEContextValue {
  const context = useContext(FHEContext);
  if (context === undefined) {
    throw new Error('useFHEContext must be used within a FHEProvider');
  }
  return context;
}
