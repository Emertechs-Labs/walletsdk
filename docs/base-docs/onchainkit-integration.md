# Coinbase OnchainKit Integration

## Overview

OnchainKit provides a comprehensive suite of components and utilities for building applications on Base. This guide focuses on wallet integration using OnchainKit.

## Installation

```bash
npm install @coinbase/onchainkit
```

## Provider Setup

### Basic Configuration
```tsx
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { base, baseSepolia } from 'wagmi/chains';

function App() {
  return (
    <OnchainKitProvider
      apiKey={process.env.ONCHAINKIT_API_KEY}
      chain={base} // or baseSepolia for testnet
      config={{
        appearance: {
          name: 'Your App Name',
          logo: 'https://your-logo.com',
          mode: 'auto',
          theme: 'default',
        },
        wallet: {
          display: 'modal',
          termsUrl: 'https://your-terms.com',
          privacyUrl: 'https://your-privacy.com',
        },
      }}
    >
      <YourApp />
    </OnchainKitProvider>
  );
}
```

## Wallet Components

### Basic Wallet Component
```tsx
import { Wallet } from '@coinbase/onchainkit/wallet';

export function AppWallet() {
  return <Wallet />;
}
```

### Advanced Wallet with Custom UI
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
import { color } from '@coinbase/onchainkit/theme';

export function CustomWallet() {
  return (
    <div className="flex justify-end">
      <Wallet>
        <ConnectWallet>
          <Avatar className="h-6 w-6" />
          <Name />
        </ConnectWallet>
        <WalletDropdown>
          <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
            <Avatar />
            <Name />
            <Address className={color.foregroundMuted} />
            <EthBalance />
          </Identity>
          <WalletDropdownDisconnect />
        </WalletDropdown>
      </Wallet>
    </div>
  );
}
```

## Identity Components

### Avatar Component
```tsx
import { Avatar } from '@coinbase/onchainkit/identity';

// Default avatar
<Avatar />

// Custom size
<Avatar className="h-8 w-8" />

// With loading state
<Avatar loadingComponent={<div>Loading...</div>} />
```

### Name Component
```tsx
import { Name } from '@coinbase/onchainkit/identity';

// Display ENS name or address
<Name />

// With custom styling
<Name className="text-lg font-bold" />

// With ENS resolution
<Name address="0x..." />
```

### Address Component
```tsx
import { Address } from '@coinbase/onchainkit/identity';

// Basic address display
<Address />

// With copy functionality
<Address hasCopyAddressOnClick />

// Shortened address
<Address address="0x1234567890abcdef..." />
```

### Balance Component
```tsx
import { EthBalance } from '@coinbase/onchainkit/identity';

// ETH balance display
<EthBalance />

// Custom address
<EthBalance address="0x..." />

// With custom formatting
<EthBalance className="text-green-600" />
```

## Advanced Wallet Features

### Wallet Dropdown Components
```tsx
import {
  WalletDropdownBasename,
  WalletDropdownFundLink,
  WalletDropdownLink,
} from '@coinbase/onchainkit/wallet';

// Basename integration
<WalletDropdownBasename />

// Funding link
<WalletDropdownFundLink />

// Custom link
<WalletDropdownLink
  icon="external"
  href="https://your-link.com"
>
  Your Link
</WalletDropdownLink>
```

### Advanced Wallet Actions
```tsx
import {
  WalletAdvancedAddressDetails,
  WalletAdvancedTokenHoldings,
  WalletAdvancedTransactionActions,
  WalletAdvancedWalletActions,
} from '@coinbase/onchainkit/wallet';

export function AdvancedWallet() {
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
        <WalletAdvancedWalletActions />
        <WalletAdvancedAddressDetails />
        <WalletAdvancedTransactionActions />
        <WalletAdvancedTokenHoldings />
        <WalletDropdownDisconnect />
      </WalletDropdown>
    </Wallet>
  );
}
```

## MiniKit Integration

### MiniKit Provider Setup
```tsx
import { MiniKitProvider } from '@coinbase/onchainkit/minikit';
import { base } from 'wagmi/chains';

function App() {
  return (
    <MiniKitProvider
      apiKey="your-onchainkit-api-key"
      chain={base}
    >
      <YourMiniApp />
    </MiniKitProvider>
  );
}
```

### MiniKit Wallet Usage
```tsx
import { Wallet } from '@coinbase/onchainkit/wallet';

function YourMiniApp() {
  return (
    <div>
      <h1>Your Mini App</h1>
      <Wallet />
    </div>
  );
}
```

## Sign-In with Ethereum (SIWE)

### SIWE Integration
```tsx
import { ConnectWallet } from '@coinbase/onchainkit/wallet';
import { base } from 'wagmi/chains';
import { createSiweMessage } from 'viem/siwe';
import { useSignMessage } from 'wagmi';

export function SiweWallet() {
  const { signMessage } = useSignMessage();

  const handleConnect = () => {
    const message = createSiweMessage({
      address: 'user-address',
      chainId: base.id,
      domain: 'your-app.com',
      uri: 'https://your-app.com',
      nonce: 'random-nonce',
      version: '1',
    });

    signMessage({ message });
  };

  return (
    <ConnectWallet onConnect={handleConnect}>
      <Avatar className="h-6 w-6" />
      <Name />
    </ConnectWallet>
  );
}
```

## Configuration Options

### Appearance Configuration
```typescript
const onchainKitConfig = {
  appearance: {
    name: 'Your App',
    logo: 'https://your-logo.com',
    mode: 'auto', // 'light' | 'dark' | 'auto'
    theme: 'default', // 'default' | 'custom'
  },
};
```

### Wallet Configuration
```typescript
const walletConfig = {
  display: 'modal', // 'modal' | 'button'
  termsUrl: 'https://your-terms.com',
  privacyUrl: 'https://your-privacy.com',
  supportedWallets: {
    coinbaseWallet: true,
    metaMask: true,
    walletConnect: true,
    rainbow: true,
    trust: true,
    rabby: true,
    frame: true,
  },
};
```

## Error Handling

### Connection Error Handling
```tsx
import { useOnchainKit } from '@coinbase/onchainkit';

export function WalletWithErrorHandling() {
  const { error, isConnecting } = useOnchainKit();

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <Wallet>
      <ConnectWallet disabled={isConnecting}>
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </ConnectWallet>
    </Wallet>
  );
}
```

## Styling and Theming

### Using Theme Colors
```tsx
import { color } from '@coinbase/onchainkit/theme';

export function ThemedWallet() {
  return (
    <Wallet>
      <ConnectWallet className={color.primary}>
        <Avatar className="h-6 w-6" />
        <Name className={color.foreground} />
      </ConnectWallet>
    </Wallet>
  );
}
```

### Custom CSS Classes
```tsx
export function CustomStyledWallet() {
  return (
    <Wallet>
      <ConnectWallet className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
        <Avatar className="h-5 w-5 mr-2" />
        <Name />
      </ConnectWallet>
    </Wallet>
  );
}
```

## Testing

### Unit Testing Components
```typescript
import { render, screen } from '@testing-library/react';
import { Wallet } from '@coinbase/onchainkit/wallet';

test('renders wallet component', () => {
  render(<Wallet />);
  expect(screen.getByRole('button')).toBeInTheDocument();
});
```

### Integration Testing
```typescript
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { baseSepolia } from 'wagmi/chains';

const TestWrapper = ({ children }) => (
  <OnchainKitProvider
    apiKey="test-api-key"
    chain={baseSepolia}
  >
    {children}
  </OnchainKitProvider>
);

// Use TestWrapper in your tests
```

## Best Practices

### Performance Optimization
- Lazy load wallet components
- Use React.memo for custom components
- Minimize re-renders with proper state management

### Security Considerations
- Always validate transaction data
- Use proper error boundaries
- Implement rate limiting for API calls

### User Experience
- Provide clear connection instructions
- Handle network switching gracefully
- Show loading states during operations

## Troubleshooting

### Common Issues

**Wallet Not Appearing:**
- Check if OnchainKitProvider is properly configured
- Verify API key is valid
- Ensure wallet is supported

**Styling Issues:**
- Check CSS class conflicts
- Verify theme configuration
- Use browser dev tools to inspect elements

**Connection Problems:**
- Verify network configuration
- Check wallet compatibility
- Review error messages in console

## Resources

- [OnchainKit Documentation](https://docs.base.org/onchainkit/)
- [OnchainKit GitHub](https://github.com/coinbase/onchainkit)
- [Base Documentation](https://docs.base.org/)
- [Coinbase Developer Platform](https://docs.cdp.coinbase.com/)

---

*Last updated: October 23, 2025*</content>
<parameter name="filePath">e:\Polymath Universata\Projects\walletsdk\docs\base-docs\onchainkit-integration.md