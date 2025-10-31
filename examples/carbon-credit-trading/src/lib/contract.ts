import { BrowserProvider, Contract, Eip1193Provider } from 'ethers';
import CONTRACT_ABI from './abi.json';

export const CONTRACT_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';

export const getProvider = async (): Promise<BrowserProvider | null> => {
  if (typeof window.ethereum === 'undefined') {
    return null;
  }
  return new BrowserProvider(window.ethereum as Eip1193Provider);
};

export const getContract = async (provider: BrowserProvider): Promise<Contract> => {
  const signer = await provider.getSigner();
  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};

export const formatAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatTimestamp = (timestamp: bigint): string => {
  return new Date(Number(timestamp) * 1000).toLocaleDateString();
};

export const isValidHex = (hex: string): boolean => {
  return /^0x[0-9a-fA-F]+$/.test(hex);
};
