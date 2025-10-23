# Hooks API Reference

This document provides comprehensive API documentation for all React hooks included in the Echain Wallet SDK.

## Overview

All hooks are built with TypeScript, follow React best practices, and include comprehensive error handling. Hooks are tree-shakeable and can be imported individually.

```typescript
import { useWalletConnection, useUniversalWallet } from '@polymathuniversata/echain-wallet/hooks';
```

## Core Hooks

### useWalletConnection

Primary hook for managing wallet connections across all supported networks.

#### Return Value

```typescript
interface UseWalletConnectionReturn {
  /** Current connection status */
  isConnected: boolean;

  /** Connected wallet information */
  wallet: WalletInfo | null;

  /** Current network */
  network: string | null;

  /** Connection loading state */
  isConnecting: boolean;

  /** Available wallet connectors */
  connectors: Connector[];

  /** Connect to a wallet */
  connect: (connectorId: string, options?: ConnectOptions) => Promise<void>;

  /** Disconnect current wallet */
  disconnect: () => Promise<void>;

  /** Switch network */
  switchNetwork: (networkId: string) => Promise<void>;

  /** Connection error */
  error: Error | null;

  /** Clear error state */
  clearError: () => void;
}
```

#### Usage Examples

```typescript
import { useWalletConnection } from '@polymathuniversata/echain-wallet/hooks';

function WalletConnector() {
  const {
    isConnected,
    wallet,
    network,
    isConnecting,
    connectors,
    connect,
    disconnect,
    switchNetwork,
    error
  } = useWalletConnection();

  if (isConnected) {
    return (
      <div>
        <p>Connected to {wallet?.name} on {network}</p>
        <button onClick={disconnect}>Disconnect</button>
        <button onClick={() => switchNetwork('base')}>Switch to Base</button>
      </div>
    );
  }

  return (
    <div>
      {connectors.map((connector) => (
        <button
          key={connector.id}
          onClick={() => connect(connector.id)}
          disabled={isConnecting}
        >
          Connect {connector.name}
        </button>
      ))}
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
```

#### Features

- **Multi-Network**: Support for Ethereum, Base, and Hedera networks
- **Auto-Reconnection**: Automatic reconnection on page refresh
- **Error Recovery**: Comprehensive error handling with recovery options
- **Type Safety**: Full TypeScript support with strict typing
- **Performance**: Optimized re-renders with proper memoization

### useUniversalWallet

Unified wallet management hook supporting all wallet types and networks.

#### Parameters

```typescript
interface UseUniversalWalletOptions {
  /** Auto-connect on mount */
  autoConnect?: boolean;

  /** Preferred networks */
  networks?: string[];

  /** Enable real-time balance updates */
  enableBalanceUpdates?: boolean;

  /** Balance update interval */
  balanceUpdateInterval?: number;

  /** Enable transaction monitoring */
  enableTransactionMonitoring?: boolean;
}
```

#### Return Value

```typescript
interface UseUniversalWalletReturn {
  /** Wallet connection state */
  connection: {
    isConnected: boolean;
    wallet: UniversalWalletInfo | null;
    network: string | null;
    isConnecting: boolean;
  };

  /** Balance information */
  balance: {
    native: string;
    tokens: TokenBalance[];
    isLoading: boolean;
    lastUpdated: Date | null;
  };

  /** Transaction state */
  transactions: {
    list: Transaction[];
    isLoading: boolean;
    hasMore: boolean;
    loadMore: () => Promise<void>;
  };

  /** Actions */
  actions: {
    connect: (walletType: string, options?: ConnectOptions) => Promise<void>;
    disconnect: () => Promise<void>;
    switchNetwork: (networkId: string) => Promise<void>;
    sendTransaction: (tx: TransactionRequest) => Promise<TransactionResult>;
    signMessage: (message: string) => Promise<string>;
    refreshBalance: () => Promise<void>;
  };

  /** Error state */
  error: WalletError | null;

  /** Clear error */
  clearError: () => void;
}
```

#### Usage Examples

```typescript
import { useUniversalWallet } from '@polymathuniversata/echain-wallet/hooks';

function UniversalWalletDemo() {
  const {
    connection,
    balance,
    transactions,
    actions,
    error
  } = useUniversalWallet({
    autoConnect: true,
    networks: ['base', 'hedera-testnet'],
    enableBalanceUpdates: true,
    balanceUpdateInterval: 30000
  });

  if (!connection.isConnected) {
    return (
      <button onClick={() => actions.connect('metamask')}>
        Connect Wallet
      </button>
    );
  }

  return (
    <div>
      <h2>Wallet: {connection.wallet?.name}</h2>
      <p>Network: {connection.network}</p>

      <div>
        <h3>Balance</h3>
        <p>Native: {balance.native}</p>
        <button onClick={actions.refreshBalance}>Refresh</button>
      </div>

      <div>
        <h3>Recent Transactions</h3>
        {transactions.list.map((tx) => (
          <div key={tx.hash}>
            {tx.hash}: {tx.value} {tx.status}
          </div>
        ))}
        {transactions.hasMore && (
          <button onClick={transactions.loadMore}>Load More</button>
        )}
      </div>

      <button onClick={actions.disconnect}>Disconnect</button>
    </div>
  );
}
```

#### Features

- **Universal Support**: Single hook for all wallet types and networks
- **Real-time Updates**: Live balance and transaction monitoring
- **Transaction Management**: Send, sign, and monitor transactions
- **Network Switching**: Seamless network switching with state preservation
- **Error Handling**: Comprehensive error states with recovery
- **Performance**: Efficient state management and minimal re-renders

### useAuth

Authentication management hook with support for multiple auth providers.

#### Parameters

```typescript
interface UseAuthOptions {
  /** Auto-authenticate on mount */
  autoAuth?: boolean;

  /** Required auth providers */
  providers?: AuthProvider[];

  /** Redirect URL after auth */
  redirectUrl?: string;

  /** Enable persistent sessions */
  persistent?: boolean;
}
```

#### Return Value

```typescript
interface UseAuthReturn {
  /** Authentication state */
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  /** Authentication methods */
  login: (provider: AuthProvider, options?: LoginOptions) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;

  /** Session management */
  session: {
    expiresAt: Date | null;
    isExpired: boolean;
    timeRemaining: number;
  };

  /** Error state */
  error: AuthError | null;
  clearError: () => void;
}
```

#### Usage Examples

```typescript
import { useAuth } from '@polymathuniversata/echain-wallet/hooks';

function AuthDemo() {
  const { user, isAuthenticated, login, logout, error } = useAuth({
    autoAuth: true,
    providers: ['privy', 'farcaster']
  });

  if (isAuthenticated) {
    return (
      <div>
        <p>Welcome, {user?.name}!</p>
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => login('privy')}>
        Login with Privy
      </button>
      <button onClick={() => login('farcaster')}>
        Login with Farcaster
      </button>
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
```

#### Features

- **Multi-Provider**: Support for Privy, Farcaster, and custom providers
- **Session Management**: Automatic token refresh and session persistence
- **Security**: Secure token storage and CSRF protection
- **Error Handling**: Comprehensive authentication error handling

### useMultisig

Multi-signature wallet management hook for secure transaction approval workflows.

#### Parameters

```typescript
interface UseMultisigOptions {
  /** Multisig contract address */
  contractAddress?: string;

  /** Required confirmations */
  requiredConfirmations?: number;

  /** Auto-refresh interval */
  refreshInterval?: number;

  /** Enable real-time updates */
  enableRealTime?: boolean;
}
```

#### Return Value

```typescript
interface UseMultisigReturn {
  /** Multisig wallet state */
  wallet: {
    address: string;
    owners: string[];
    required: number;
    nonce: number;
  } | null;

  /** Pending transactions */
  pendingTransactions: MultisigTransaction[];

  /** Transaction actions */
  submitTransaction: (tx: TransactionRequest) => Promise<string>;
  confirmTransaction: (txId: string) => Promise<void>;
  executeTransaction: (txId: string) => Promise<void>;
  revokeConfirmation: (txId: string) => Promise<void>;

  /** Loading states */
  isLoading: boolean;
  isSubmitting: boolean;

  /** Error state */
  error: MultisigError | null;
  clearError: () => void;
}
```

#### Usage Examples

```typescript
import { useMultisig } from '@polymathuniversata/echain-wallet/hooks';

function MultisigDashboard() {
  const {
    wallet,
    pendingTransactions,
    submitTransaction,
    confirmTransaction,
    executeTransaction,
    isLoading
  } = useMultisig({
    contractAddress: '0x123...',
    requiredConfirmations: 2,
    enableRealTime: true
  });

  const handleSubmitTx = async () => {
    try {
      const txId = await submitTransaction({
        to: '0x456...',
        value: '1000000000000000000', // 1 ETH
        data: '0x'
      });
      console.log('Transaction submitted:', txId);
    } catch (error) {
      console.error('Failed to submit:', error);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Multisig Wallet: {wallet?.address}</h2>
      <p>Owners: {wallet?.owners.length}, Required: {wallet?.required}</p>

      <button onClick={handleSubmitTx}>Submit Transaction</button>

      <h3>Pending Transactions</h3>
      {pendingTransactions.map((tx) => (
        <div key={tx.id}>
          <p>To: {tx.to}, Value: {tx.value}</p>
          <p>Confirmations: {tx.confirmations}/{wallet?.required}</p>
          <button onClick={() => confirmTransaction(tx.id)}>
            Confirm
          </button>
          {tx.confirmations >= wallet!.required && (
            <button onClick={() => executeTransaction(tx.id)}>
              Execute
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
```

#### Features

- **Secure Approvals**: Multi-signature transaction approval workflow
- **Real-time Updates**: Live monitoring of transaction confirmations
- **Batch Operations**: Submit and confirm multiple transactions
- **Gas Optimization**: Efficient gas usage for multisig operations
- **Audit Trail**: Complete transaction history and approval tracking

## Network-Specific Hooks

### useHederaProvider

Hedera-specific provider hook for network operations.

#### Return Value

```typescript
interface UseHederaProviderReturn {
  /** Hedera client instance */
  client: Client | null;

  /** Network information */
  network: {
    name: string;
    ledgerId: string;
    nodeAddresses: string[];
  } | null;

  /** Connection state */
  isConnected: boolean;
  isConnecting: boolean;

  /** Network operations */
  queryTransaction: (transactionId: string) => Promise<TransactionRecord>;
  getAccountBalance: (accountId: string) => Promise<Hbar>;
  getAccountInfo: (accountId: string) => Promise<AccountInfo>;

  /** Error state */
  error: HederaError | null;
  clearError: () => void;
}
```

### useHederaWallet

Hedera Hashgraph wallet management hook.

#### Return Value

```typescript
interface UseHederaWalletReturn {
  /** Wallet connection */
  isConnected: boolean;
  accountId: string | null;
  publicKey: string | null;

  /** Balance information */
  balance: Hbar | null;
  tokens: TokenBalance[];

  /** Transaction methods */
  transferHbar: (to: string, amount: Hbar) => Promise<TransactionResponse>;
  transferToken: (tokenId: string, to: string, amount: number) => Promise<TransactionResponse>;

  /** Signing methods */
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;

  /** Connection methods */
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;

  /** Error state */
  error: HederaWalletError | null;
  clearError: () => void;
}
```

## Utility Hooks

### useWalletHelpers

Utility hook providing common wallet operations and helpers.

#### Return Value

```typescript
interface UseWalletHelpersReturn {
  /** Address validation */
  isValidAddress: (address: string, network?: string) => boolean;

  /** Address formatting */
  formatAddress: (address: string, format?: AddressFormat) => string;

  /** Balance formatting */
  formatBalance: (balance: string | number, decimals?: number) => string;

  /** Network utilities */
  getNetworkById: (id: string) => NetworkInfo | null;
  getSupportedNetworks: () => NetworkInfo[];

  /** Transaction utilities */
  estimateGas: (tx: TransactionRequest) => Promise<string>;
  getTransactionUrl: (hash: string, network: string) => string;

  /** Conversion utilities */
  toWei: (amount: string | number) => string;
  fromWei: (amount: string) => string;

  /** Clipboard utilities */
  copyToClipboard: (text: string) => Promise<void>;
}
```

#### Usage Examples

```typescript
import { useWalletHelpers } from '@polymathuniversata/echain-wallet/hooks';

function WalletUtils() {
  const {
    formatAddress,
    formatBalance,
    isValidAddress,
    copyToClipboard
  } = useWalletHelpers();

  const address = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
  const balance = '1234567890123456789'; // 1.234567890123456789 ETH

  return (
    <div>
      <p>Address: {formatAddress(address, 'short')}</p>
      <p>Balance: {formatBalance(balance, 18)} ETH</p>
      <p>Valid: {isValidAddress(address) ? 'Yes' : 'No'}</p>
      <button onClick={() => copyToClipboard(address)}>
        Copy Address
      </button>
    </div>
  );
}
```

### useUserWallets

Hook for managing multiple user wallets and switching between them.

#### Return Value

```typescript
interface UseUserWalletsReturn {
  /** Available wallets */
  wallets: UserWallet[];

  /** Currently active wallet */
  activeWallet: UserWallet | null;

  /** Wallet management */
  addWallet: (wallet: WalletConfig) => Promise<void>;
  removeWallet: (walletId: string) => Promise<void>;
  setActiveWallet: (walletId: string) => Promise<void>;

  /** Wallet switching */
  switchWallet: (walletId: string) => Promise<void>;

  /** Loading state */
  isLoading: boolean;

  /** Error state */
  error: UserWalletError | null;
  clearError: () => void;
}
```

## Hook Architecture

### Design Principles

1. **Composition**: Hooks can be composed together for complex functionality
2. **Error Boundaries**: Built-in error handling with recovery mechanisms
3. **Performance**: Optimized with proper dependency arrays and memoization
4. **Type Safety**: Complete TypeScript coverage with strict typing
5. **Testing**: Comprehensive test coverage for all hook functionality

### Error Handling

All hooks include comprehensive error handling:

```typescript
const { data, error, isLoading } = useWalletConnection();

useEffect(() => {
  if (error) {
    console.error('Wallet connection error:', error);
    // Handle error (show toast, retry, etc.)
  }
}, [error]);
```

### Performance Optimization

Hooks use optimized patterns:

```typescript
// Proper dependency arrays
useEffect(() => {
  // Effect logic
}, [dependency1, dependency2]);

// Memoized computations
const formattedBalance = useMemo(() =>
  formatBalance(balance, decimals),
  [balance, decimals]
);

// Debounced updates
const debouncedUpdate = useDebounce(updateFunction, 500);
```

### Testing

Hooks include comprehensive test utilities:

```typescript
import { renderHook, act } from '@testing-library/react';
import { useWalletConnection } from '../hooks/useWalletConnection';

describe('useWalletConnection', () => {
  it('should connect to wallet', async () => {
    const { result } = renderHook(() => useWalletConnection());

    await act(async () => {
      await result.current.connect('metamask');
    });

    expect(result.current.isConnected).toBe(true);
  });
});
```

## Migration Guide

### From v0.x to v1.x

```typescript
// Old API (v0.x)
import { useWallet } from '@polymathuniversata/echain-wallet';

// New API (v1.x)
import { useUniversalWallet } from '@polymathuniversata/echain-wallet/hooks';

// Migration
// Before
const { connect, disconnect } = useWallet();

// After
const { actions } = useUniversalWallet();
actions.connect('metamask');
actions.disconnect();
```

## Support

For hook-specific issues and questions:

- **Documentation**: [Hook Guides](../hooks/)
- **GitHub Issues**: [Report Bugs](https://github.com/Emertechs-Labs/Echain/issues)
- **Discord**: [Community Support](https://discord.gg/echain)

---

*Last updated: October 23, 2025*</content>
<parameter name="filePath">e:\Polymath Universata\Projects\walletsdk\docs\api\hooks.md