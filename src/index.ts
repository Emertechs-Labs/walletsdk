// Core wallet functionality
export { useBaseWallet, baseWalletManager } from './lib/base-wallet-manager';
export type { WalletState, WalletConfig } from './lib/base-wallet-manager';

// RPC management
export { baseRPCManager, getBasePublicClient, getBaseWalletClient, getBaseRPCStats } from './lib/base-rpc-manager';
export type { BaseRPCManager } from './lib/base-rpc-manager';

// Hooks
export { useWalletConnection } from './hooks/useWalletConnection';
export { useWalletHelpers, useConnectWallet } from './hooks/useWalletHelpers';
export { useHederaProvider } from './hooks/useHederaProvider';
export { useAuth } from './hooks/useAuth';
export { useUserWallets } from './hooks/useUserWallets';
export { useUniversalWallet } from './hooks/useUniversalWallet';

// Components
export { UnifiedConnectButton } from './components/UnifiedConnectButton';
export { UnifiedConnectModal } from './components/UnifiedConnectModal';
export { MultisigDashboard } from './components/MultisigDashboard';
export { WalletTroubleshooting } from './components/WalletTroubleshooting';
export { TransactionHistory } from './components/TransactionHistory';
export { BalanceDisplay } from './components/BalanceDisplay';
export { NetworkSwitcher, NetworkBadge } from './components/NetworkSwitcher';

// Services
export { default as HederaTransactionService } from './services/hederaTransactionService';
export { authService } from './services/authService';
export { userService } from './services/userService';

// Firebase setup
export { initializeFirebase } from './lib/firebase';
export type { FirebaseConfig } from './lib/firebase';

// Types
export type {
  HederaProviderConfig,
  MultisigConfig,
  HederaNetwork,
  Signer,
  MultisigState,
  MultisigTransaction,
  TransactionProposal,
} from './types/hedera';

// Configuration
export { config, getConfig } from './lib/wagmi';
export { baseSepolia as defaultChain } from 'wagmi/chains';