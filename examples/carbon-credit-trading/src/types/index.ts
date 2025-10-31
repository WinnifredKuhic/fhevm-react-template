export interface CreditInfo {
  issuer: string;
  isActive: boolean;
  timestamp: bigint;
  projectType: string;
  verificationHash: string;
}

export interface OrderInfo {
  buyer: string;
  seller: string;
  isActive: boolean;
  isFulfilled: boolean;
  timestamp: bigint;
  creditId: bigint;
}

export interface SystemStats {
  totalCredits: bigint;
  totalOrders: bigint;
}

export interface UserBalances {
  encryptedCreditBalance: bigint;
  encryptedTokenBalance: bigint;
}

export interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
}

export type ProjectType =
  | 'renewable_energy'
  | 'reforestation'
  | 'carbon_capture'
  | 'methane_reduction'
  | 'energy_efficiency';

export interface IssueCreditsParams {
  amount: number;
  pricePerCredit: number;
  projectType: ProjectType;
  verificationHash: string;
}

export interface CreateOrderParams {
  creditId: number;
  amount: number;
  maxPricePerCredit: number;
}

export interface TabId {
  id: 'register' | 'issue' | 'trade' | 'orders' | 'balances';
  label: string;
}
