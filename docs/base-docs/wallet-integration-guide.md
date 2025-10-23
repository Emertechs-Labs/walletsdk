# Base Wallet Integration Guide

## Overview

This guide covers comprehensive wallet integration for Base, Coinbase's Ethereum Layer 2 blockchain. Base offers low-cost, high-speed transactions while maintaining Ethereum compatibility.

## Supported Wallets

### Coinbase Wallet (Recommended)
Coinbase Wallet is the native wallet for Base and provides the best user experience.

**Features:**
- Native Base support with optimized gas fees
- Built-in Coinbase exchange integration
- Smart wallet capabilities ✅ **FULLY IMPLEMENTED**
- Account abstraction features ✅ **AVAILABLE**

**Integration:**
```typescript
import { coinbaseWallet } from '@rainbow-me/rainbowkit/wallets';

// Already configured in wagmi.ts with smart wallet support
const coinbaseWalletConnector = coinbaseWallet({
  appName: 'Your App Name',
  preference: 'smartWalletOnly', // For smart wallet features
});
```

### MetaMask
MetaMask supports Base through automatic network addition.

**Network Configuration:**
```typescript
// Automatic network addition is handled by the NetworkSwitcher component
// No manual configuration required - the app will prompt users to add Base networks
```

### WalletConnect
Universal wallet connector supporting hundreds of wallets.

**Configuration:**
```typescript
import { walletConnectWallet } from '@rainbow-me/rainbowkit/wallets';

const walletConnect = walletConnectWallet({
  projectId: 'your-project-id',
  qrModalOptions: {
    themeMode: 'light',
  },
});
```

### Rainbow Wallet
Multi-chain wallet with excellent Base support.

### Other Wallets
- Trust Wallet
- Coinbase Wallet mobile
- Rabby Wallet
- Frame

## OnchainKit Integration

Coinbase provides OnchainKit for seamless Base wallet integration.

### Installation
```bash
npm install @coinbase/onchainkit
```

### Basic Setup
```tsx
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { base } from 'wagmi/chains';

function App() {
  return (
    <OnchainKitProvider
      apiKey={process.env.ONCHAINKIT_API_KEY}
      chain={base}
    >
      <YourApp />
    </OnchainKitProvider>
  );
}
```

## Sign-in / Authentication

A recommended, interoperable pattern for authenticating wallet owners on Base is Sign-In With Ethereum (SIWE, EIP-4361). For most externally owned accounts (EOAs) use SIWE to obtain a signed message that your server verifies and exchanges for a session. For smart wallets (ERC-4337 / contract accounts) consider ERC-1271 verification semantics when verifying signatures server-side.

Client-side SIWE snippet (high level):

```typescript
import { useSIWE } from '@polymathuniversata/echain-wallet';

function SignInComponent() {
  const { signInWithEthereum, loading, error } = useSIWE();

  const handleSignIn = async () => {
    const result = await signInWithEthereum({
      domain: window.location.host,
      uri: window.location.origin,
      statement: 'Sign in to Example App',
    });

    if (result) {
      // Send to server for verification
      await fetch('/api/verify', {
        method: 'POST',
        body: JSON.stringify(result),
      });
    }
  };

  return (
    <button onClick={handleSignIn} disabled={loading}>
      Sign in with Ethereum
    </button>
  );
}
```

### Farcaster Sign-in
Decentralized social authentication via Farcaster.

```typescript
import { useFarcasterAuth } from '@polymathuniversata/echain-wallet';

function FarcasterSignInComponent() {
  const { signInWithFarcaster, user, loading } = useFarcasterAuth();

  const handleSignIn = async () => {
    await signInWithFarcaster();
  };

  return (
    <div>
      {!user ? (
        <button onClick={handleSignIn} disabled={loading}>
          Sign in with Farcaster
        </button>
      ) : (
        <div>Welcome, {user.displayName}!</div>
      )}
    </div>
  );
}
```

### Privy Authentication
Passwordless authentication with embedded wallets.

```typescript
import { usePrivyAuth, PrivyProvider } from '@polymathuniversata/echain-wallet';

function App() {
  return (
    <PrivyProvider appId="your-privy-app-id">
      <AuthComponent />
    </PrivyProvider>
  );
}

function AuthComponent() {
  const { signInWithEmail, user, loading } = usePrivyAuth();

  const handleEmailSignIn = async (email: string) => {
    await signInWithEmail(email);
  };

  return (
    <div>
      {!user ? (
        <form onSubmit={(e) => {
          e.preventDefault();
          const email = (e.target as any).email.value;
          handleEmailSignIn(email);
        }}>
          <input name="email" type="email" placeholder="Enter email" />
          <button type="submit" disabled={loading}>
            Sign in with Email
          </button>
        </form>
      ) : (
        <div>Welcome, {user.email}!</div>
      )}
    </div>
  );
}
```

Notes:
- For contract accounts (smart wallets) servers must detect ERC-1271 contract‑based signatures instead of simple ecrecover flows.
- Use short-lived nonces and verify them server side to prevent replay attacks.
- Many frontend stacks (ethers, wagmi, siwe libraries) provide helpers to build this flow.

### Wallet Components
```tsx
import {
  Wallet,
  ConnectWallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import {
  Address,
  Avatar,
  Name,
  Identity,
  EthBalance,
} from '@coinbase/onchainkit/identity';

export function WalletComponents() {
  return (
    <Wallet>
      <ConnectWallet>
        <Avatar className="h-6 w-6" />
        <Name />
      </ConnectWallet>
      <WalletDropdown>
        <Identity hasCopyAddressOnClick>
          <Avatar />
          <Name />
          <Address />
          <EthBalance />
        </Identity>
        <WalletDropdownDisconnect />
      </WalletDropdown>
    </Wallet>
  );
}
```

## Smart Wallets & Account Abstraction

### Coinbase Smart Wallet
Base supports account abstraction through Coinbase's smart wallet technology.

**Features:**
- Gasless transactions ✅ **FULLY IMPLEMENTED**
- Batch transactions ✅ **AVAILABLE**
- Social recovery ✅ **SUPPORTED**
- Multi-signature capabilities ✅ **AVAILABLE**

**Integration:**
```typescript
import { coinbaseWallet } from '@rainbow-me/rainbowkit/wallets';

const smartWallet = coinbaseWallet({
  appName: 'Your App',
  preference: 'smartWalletOnly',
});
```

### ZeroDev Integration
ZeroDev provides advanced account abstraction features.

```typescript
import { createZeroDevManager } from '@polymathuniversata/echain-wallet';

const zeroDevManager = createZeroDevManager({
  projectId: process.env.ZERODEV_PROJECT_ID,
});

// Create Kernel account
const account = await zeroDevManager.createKernelAccount(ownerAddress);

// Send sponsored transaction
await zeroDevManager.sendSponsoredTransaction(account, tx);
```

## AgentKit Integration

Coinbase AgentKit enables AI agents to interact with Base wallets.

### Setup
```typescript
import { createAgentKitManager } from '@polymathuniversata/echain-wallet';

const agentKitManager = createAgentKitManager({
  apiKeyName: process.env.CDP_API_KEY_NAME,
  apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY,
  networkId: 'base-sepolia',
});

// Send transaction via AI agent
await agentKitManager.sendTransaction(toAddress, value);
```

## MiniKit Integration

MiniKit enables seamless wallet integration for Base Apps.

### Setup
```tsx
import { MiniKitProvider } from '@coinbase/onchainkit/minikit';
import { base } from 'wagmi/chains';

function App() {
  return (
    <MiniKitProvider
      apiKey="your-onchainkit-api-key"
      chain={base}
    >
      <YourApp />
    </MiniKitProvider>
  );
}
```

### Wallet Connection
```typescript
import { Wallet } from '@coinbase/onchainkit/wallet';

function YourApp() {
  return (
    <div>
      <Wallet />
      {/* Your app content */}
    </div>
  );
}
```

## Network Configuration

### Base Mainnet
```typescript
export const base = {
  id: 8453,
  name: 'Base',
  network: 'base',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://mainnet.base.org'] },
    public: { http: ['https://mainnet.base.org'] },
  },
  blockExplorers: {
    default: { name: 'BaseScan', url: 'https://basescan.org' },
  },
};
```

### Base Sepolia (Testnet)
```typescript
export const baseSepolia = {
  id: 84532,
  name: 'Base Sepolia',
  network: 'base-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Sepolia Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://sepolia.base.org'] },
    public: { http: ['https://sepolia.base.org'] },
  },
  blockExplorers: {
    default: { name: 'BaseScan', url: 'https://sepolia.basescan.org' },
  },
  testnet: true,
};
```

## Gas Optimization

### Base Fee Structure
Base uses a dynamic fee model similar to Ethereum but with lower costs.

**Tips:**
- Use Base's gas estimation endpoints
- Batch transactions when possible
- Monitor gas prices via BaseScan

### Gas Optimization Hook
Use the built-in gas optimization utilities:

```typescript
import { useGasOptimization } from '@polymathuniversata/echain-wallet';

function TransactionComponent() {
  const {
    estimateGas,
    getOptimizedGasPrice,
    estimateCost,
    batchTransactions,
    isPaymasterAvailable
  } = useGasOptimization();

  const handleTransaction = async (tx: any) => {
    // Get optimized gas settings
    const gasSettings = getOptimizedGasPrice();

    // Estimate gas for the transaction
    const gasEstimate = await estimateGas(tx);

    // Calculate total cost
    const totalCost = estimateCost(gasEstimate, gasSettings.gasPrice);

    // Execute with optimized settings
    // ... transaction execution
  };

  return (
    <div>
      <p>Paymaster Available: {isPaymasterAvailable ? 'Yes' : 'No'}</p>
      <button onClick={() => handleTransaction(txData)}>
        Send Optimized Transaction
      </button>
    </div>
  );
}
```

### Gasless Transactions
Enable gasless transactions for better UX:

```typescript
// Using Coinbase Paymaster
const paymasterUrl = 'https://api.coinbase.com/v1/paymaster';

const userOp = {
  // User operation data
  paymasterAndData: paymasterUrl,
};
```

## Transaction History

### Fetching Transaction History
Get transaction history for Base addresses:

```typescript
import { useTransactionHistory } from '@polymathuniversata/echain-wallet';

function TransactionHistoryComponent() {
  const { transactions, loading, error, refetch } = useTransactionHistory(10);

  if (loading) return <div>Loading transactions...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      {transactions.map((tx) => (
        <div key={tx.hash}>
          <p>Hash: {tx.hash}</p>
          <p>From: {tx.from} → To: {tx.to}</p>
          <p>Value: {tx.value} wei</p>
          <p>Status: {tx.status}</p>
          <p>Gas Used: {tx.gasUsed}</p>
        </div>
      ))}
    </div>
  );
}
```

### Balance Display
Show real-time balances for Base accounts:

```typescript
import { BalanceDisplay } from '@polymathuniversata/echain-wallet';

function BalanceComponent() {
  return (
    <BalanceDisplay
      autoRefresh={true}
      refreshInterval={10000} // 10 seconds
    />
  );
}
```

### Private Key Management
- Never store private keys in localStorage
- Use hardware wallets for high-value assets
- Implement proper key rotation

### Transaction Signing
- Always verify transaction details before signing
- Use typed data signing for complex transactions
- Implement transaction simulation

### Smart Contract Interactions
- Verify contract addresses on BaseScan
- Use multicall for batch operations
- Implement proper error handling

## Testing

### Testnet Setup
```typescript
import { baseSepolia } from 'wagmi/chains';

// Use baseSepolia for testing
const config = createConfig({
  chains: [baseSepolia],
  // ... other config
});
```

### Comprehensive Test Suite
The library includes extensive testing for Base integrations:

```typescript
// Unit tests for Base components
describe('Base Integrations', () => {
  test('Coinbase Wallet connector works', () => {
    // Test smart wallet functionality
  });

  test('MetaMask auto-addition works', () => {
    // Test network addition
  });

  test('WalletConnect v2 integration', () => {
    // Test QR modal and universal support
  });

  test('SIWE authentication', () => {
    // Test Sign-In with Ethereum
  });

  test('Smart wallet managers', () => {
    // Test Coinbase, ZeroDev, AgentKit
  });
});
```

### Faucet Access
- [Base Sepolia Faucet](https://sepoliafaucet.com/)
- [Coinbase Faucet](https://faucet.coinbase.com/)

## Troubleshooting

### Common Issues

**Wallet Not Connecting:**
- Ensure wallet supports Base network
- Check RPC endpoint configuration
- Verify network is added to wallet

**Transaction Failures:**
- Check gas limits and prices
- Verify account has sufficient balance
- Confirm contract addresses are correct

**Smart Wallet Issues:**
- Ensure account is deployed
- Check paymaster configuration
- Verify owner permissions

## Resources

- [Base Documentation](https://docs.base.org/)
- [OnchainKit Docs](https://docs.base.org/onchainkit/)
- [Coinbase Developer Platform](https://docs.cdp.coinbase.com/)
- [BaseScan Explorer](https://basescan.org/)
- [Base Faucet](https://faucet.coinbase.com/)

## Migration Guide

### From Ethereum Mainnet
1. Add Base network to wallet
2. Bridge assets using official bridges
3. Update RPC endpoints in dApp
4. Test transactions on Base Sepolia first

### From Other L2s
1. Bridge assets to Ethereum first
2. Then bridge to Base
3. Update contract deployments
4. Test interoperability features

---

*Last updated: October 23, 2025*</content>
<parameter name="filePath">e:\Polymath Universata\Projects\walletsdk\docs\base-docs\wallet-integration-guide.md