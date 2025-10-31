'use client';

import { FhevmProvider } from '@fhevm/sdk';
import { useEffect, useState } from 'react';
import { BrowserProvider } from 'ethers';

export function Providers({ children }: { children: React.ReactNode }) {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const ethersProvider = new BrowserProvider(window.ethereum);
      setProvider(ethersProvider);
    }
  }, []);

  if (!provider) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Connecting to Wallet...</h2>
        <p className="text-gray-600">Please make sure MetaMask is installed</p>
      </div>
    </div>;
  }

  return (
    <FhevmProvider
      config={{
        provider,
        network: {
          chainId: 11155111,
          name: 'sepolia',
          rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || '',
        },
      }}
    >
      {children}
    </FhevmProvider>
  );
}
