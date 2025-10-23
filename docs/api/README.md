# API Reference

Welcome to the comprehensive API reference for the Echain Wallet SDK. This documentation provides detailed information about all components, hooks, services, and types available in the SDK.

## Overview

The Echain Wallet SDK provides a complete toolkit for integrating multi-network wallet functionality into your applications. The SDK supports Ethereum, Base, and Hedera networks with unified APIs for wallet connections, transactions, authentication, and more.

## Quick Start

```typescript
import {
  useWalletConnection,
  useUniversalWallet,
  BalanceDisplay,
  NetworkSwitcher
} from '@polymathuniversata/echain-wallet';

// Use hooks in your components
function App() {
  const { isConnected, connect } = useWalletConnection();

  return (
    <div>
      {!isConnected ? (
        <button onClick={() => connect('metamask')}>
          Connect Wallet
        </button>
      ) : (
        <div>
          <BalanceDisplay />
          <NetworkSwitcher />
        </div>
      )}
    </div>
  );
}
```

## Architecture

The SDK is organized into several key areas:

- **[Components](./components.md)**: React components for wallet UI
- **[Hooks](./hooks.md)**: React hooks for wallet functionality
- **[Services](./services.md)**: Service classes for business logic
- **[Types](./types.md)**: TypeScript type definitions

## Core Concepts

### Multi-Network Support

The SDK provides unified APIs across multiple blockchain networks:

- **Ethereum**: Full EVM compatibility with MetaMask, WalletConnect
- **Base**: Optimized Base network integration
- **Hedera**: Native Hedera Hashgraph support with HashPack, Blade

### Unified Wallet API

Single API surface for all wallet operations:

```typescript
const { connect, sendTransaction, signMessage } = useUniversalWallet();

// Works across all supported networks
await connect('metamask');
await sendTransaction({ to: '0x...', value: '1.0' });
```

### Authentication Integration

Built-in support for multiple auth providers:

```typescript
const { login, user } = useAuth();

// Login with various providers
await login('privy');
await login('farcaster');
```

### Multisig Support

Advanced multi-signature wallet functionality:

```typescript
const { submitTransaction, confirmTransaction } = useMultisig();

// Submit transaction for approval
const txId = await submitTransaction({ to: '0x...', value: '1.0' });

// Confirm with other owners
await confirmTransaction(txId);
```

## Component Categories

### UI Components

Pre-built React components for common wallet operations:

- `BalanceDisplay` - Real-time balance display
- `NetworkSwitcher` - Network selection interface
- `TransactionHistory` - Transaction list with filtering
- `UnifiedConnectModal` - Universal wallet connection modal

### Hook Categories

Specialized hooks for different functionality:

- **Connection**: `useWalletConnection`, `useUniversalWallet`
- **Network**: `useHederaProvider`, `useHederaWallet`
- **Authentication**: `useAuth`
- **Multisig**: `useMultisig`
- **Utilities**: `useWalletHelpers`, `useUserWallets`

### Service Classes

Backend service classes for complex operations:

- `AuthService` - Authentication management
- `HederaTransactionService` - Hedera network operations
- `UserService` - User data management
- `MultisigManager` - Multisig wallet operations
- `BaseWalletManager` - Base network operations

## Configuration

### SDK Initialization

```typescript
import { initializeSDK } from '@polymathuniversata/echain-wallet';

await initializeSDK({
  apiKeys: {
    walletConnect: 'your-project-id',
    privy: 'your-privy-app-id',
    hedera: {
      accountId: 'your-hedera-account',
      privateKey: 'your-private-key'
    }
  },
  networks: ['ethereum', 'base', 'hedera-mainnet'],
  defaultNetwork: 'base'
});
```

### Provider Setup

Wrap your app with the SDK provider:

```typescript
import { WalletProvider } from '@polymathuniversata/echain-wallet';

function App() {
  return (
    <WalletProvider config={sdkConfig}>
      <YourApp />
    </WalletProvider>
  );
}
```

## Error Handling

The SDK provides comprehensive error handling:

```typescript
try {
  await wallet.connect('metamask');
} catch (error) {
  if (error.code === 'CONNECTION_FAILED') {
    console.error('Failed to connect wallet');
  } else if (error.code === 'NETWORK_MISMATCH') {
    console.error('Network not supported');
  }
}
```

## TypeScript Support

Full TypeScript support with comprehensive type definitions:

```typescript
import type {
  WalletInfo,
  Transaction,
  Network,
  User
} from '@polymathuniversata/echain-wallet/types';

// All APIs are fully typed
const wallet: WalletInfo = await connectWallet();
const transactions: Transaction[] = await getTransactionHistory();
```

## Performance Optimization

### Tree Shaking

Import only what you need for optimal bundle size:

```typescript
// Import specific components
import BalanceDisplay from '@polymathuniversata/echain-wallet/components/BalanceDisplay';

// Import specific hooks
import { useWalletConnection } from '@polymathuniversata/echain-wallet/hooks';

// Import specific services
import { AuthService } from '@polymathuniversata/echain-wallet/services';
```

### Code Splitting

Use dynamic imports for large components:

```typescript
const TransactionHistory = lazy(() =>
  import('@polymathuniversata/echain-wallet/components/TransactionHistory')
);
```

### Caching and Memoization

The SDK automatically optimizes performance:

- Automatic memoization of expensive operations
- Intelligent caching of network requests
- Debounced updates for real-time data
- Lazy loading of non-critical features

## Security Considerations

### Best Practices

1. **Never store private keys** in client-side code
2. **Validate all inputs** before processing
3. **Use HTTPS** for all network requests
4. **Implement proper error handling** to avoid information leakage
5. **Regularly update** to the latest SDK version

### Secure Configuration

```typescript
const config = {
  // Use environment variables for sensitive data
  apiKeys: {
    hedera: {
      accountId: process.env.HEDERA_ACCOUNT_ID,
      privateKey: process.env.HEDERA_PRIVATE_KEY
    }
  },

  // Enable security features
  security: {
    enableCSRF: true,
    tokenRotation: true,
    secureStorage: true
  }
};
```

## Testing

### Unit Testing

```typescript
import { renderHook } from '@testing-library/react';
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

### Integration Testing

```typescript
import { WalletProvider } from '../components/WalletProvider';

const renderWithProvider = (component: React.ReactElement) =>
  render(
    <WalletProvider config={testConfig}>
      {component}
    </WalletProvider>
  );
```

## Migration Guides

### From v0.x to v1.x

Key changes in v1.x:

1. **Unified API**: Single `useUniversalWallet` hook replaces multiple network-specific hooks
2. **Improved Types**: More comprehensive TypeScript definitions
3. **Better Error Handling**: Consistent error types across all APIs
4. **Enhanced Security**: Additional security features and validations

### Breaking Changes

- `useWallet` → `useUniversalWallet`
- `ConnectModal` → `UnifiedConnectModal`
- Type definitions moved to `/types` export

## Support and Resources

### Documentation

- **[Components](./components.md)**: Detailed component documentation
- **[Hooks](./hooks.md)**: Hook usage examples and API reference
- **[Services](./services.md)**: Service class documentation
- **[Types](./types.md)**: Complete type definitions

### Community Resources

- **GitHub Issues**: [Report bugs and request features](https://github.com/Emertechs-Labs/Echain/issues)
- **Discord**: [Community support and discussions](https://discord.gg/echain)
- **Stack Overflow**: Tag questions with `echain-wallet-sdk`

### Examples

- **[Basic Integration](../base-docs/wallet-integration-guide.md)**: Getting started guide
- **[Advanced Usage](../base-docs/smart-wallets-account-abstraction.md)**: Advanced features
- **[Testing Strategies](../base-docs/testing-strategies.md)**: Testing best practices

## Version Information

- **Current Version**: 1.0.2
- **Test Coverage**: 24.5%
- **Supported Networks**: Ethereum, Base, Hedera
- **React Version**: 16.8+
- **TypeScript Version**: 4.5+

## Changelog

### v1.0.2 (Latest)
- Enhanced Base network integration
- Improved error handling and recovery
- Added comprehensive TypeScript types
- Performance optimizations and bug fixes

### v1.0.1
- Initial Base network support
- Multisig wallet functionality
- Unified authentication providers

### v1.0.0
- Complete SDK rewrite with unified API
- Multi-network support (Ethereum, Hedera)
- Comprehensive component library

---

*Last updated: October 23, 2025*

For more detailed information, explore the individual API documentation sections linked above.</content>
<parameter name="filePath">e:\Polymath Universata\Projects\walletsdk\docs\api\README.md