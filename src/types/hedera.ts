import { Hbar } from '@hashgraph/sdk';

export type HederaNetwork = 'testnet' | 'mainnet' | 'previewnet';

export interface HederaProviderConfig {
  network: HederaNetwork;
  operatorId?: string;
  operatorKey?: string;
  maxQueryPayment?: number;
  maxTransactionFee?: number;
}

export interface Signer {
  signerAddress: string;
  weight: number;
  active: boolean;
}

export interface SignerInfo {
  address: string;
  weight: number;
  active: boolean;
}

export interface MultisigTransaction {
  id: string;
  to: string;
  value: string;
  data: string;
  proposer: string;
  approvals: Approval[];
  status: 'pending' | 'approved' | 'executed' | 'cancelled';
  timestamp: number;
  executionTime?: number;
}

export interface MultisigState {
  threshold: number;
  signerCount: number;
  totalWeight: number;
  pendingTransactions: number;
  executedTransactions: number;
}

export interface TransactionProposal {
  id: string;
  to: string;
  value: string;
  data: string;
  proposer: string;
  approvals: Approval[];
  status: 'pending' | 'approved' | 'executed' | 'cancelled';
  timestamp: number;
  executionTime?: number;
}

export interface Approval {
  signer: string;
  weight: number;
  timestamp: number;
}

export interface MultisigConfig {
  contractId: string;
  signers: Signer[];
  threshold: number;
  timelock?: number; // seconds
}

export interface ProposeTransactionParams {
  to: string;
  value: string;
  data?: string;
  delay?: number;
}

export interface UseHederaProviderReturn {
  provider: any; // HederaProvider instance
  isConnected: boolean;
  accountId: string | null;
  balance: Hbar | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  error: string | null;
}

export interface UseMultisigReturn {
  isInitialized: boolean;
  multisigState: MultisigState | null;
  signers: SignerInfo[];
  pendingTransactions: MultisigTransaction[];
  proposeTransaction: (proposal: TransactionProposal) => Promise<string>;
  approveTransaction: (transactionId: string) => Promise<void>;
  executeTransaction: (transactionId: string) => Promise<void>;
  addSigner: (signerAddress: string, weight: number) => Promise<void>;
  removeSigner: (signerAddress: string) => Promise<void>;
  updateThreshold: (newThreshold: number) => Promise<void>;
  loadMultisigState: () => Promise<void>;
  error: string | null;
  isLoading: boolean;
}