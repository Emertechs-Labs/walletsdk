# Component API Reference

This document provides comprehensive API documentation for all React components included in the Echain Wallet SDK.

## Overview

All components are built with TypeScript, follow React best practices, and include comprehensive accessibility features. Components are tree-shakeable and can be imported individually.

```typescript
import { BalanceDisplay, NetworkSwitcher } from '@polymathuniversata/echain-wallet/components';
```

## Core Components

### BalanceDisplay

Real-time balance display component with automatic formatting and refresh capabilities.

#### Props

```typescript
interface BalanceDisplayProps {
  /** Hedera account ID for balance queries */
  accountId?: string;

  /** Ethereum/Base address for balance queries */
  address?: string;

  /** Network to query ('hedera-mainnet', 'hedera-testnet', 'ethereum', 'base') */
  network?: string;

  /** Whether to show token balances in addition to HBAR/ETH */
  showTokens?: boolean;

  /** Auto-refresh interval in milliseconds */
  refreshInterval?: number;

  /** Custom CSS class name */
  className?: string;

  /** Callback fired when balance updates */
  onBalanceUpdate?: (balance: BalanceData) => void;

  /** Callback fired on refresh button click */
  onRefresh?: () => void;

  /** Callback fired on error */
  onError?: (error: Error) => void;
}
```

#### Usage Examples

```typescript
// Basic Hedera balance display
<BalanceDisplay
  accountId="0.0.12345"
  network="hedera-testnet"
/>

// Ethereum/Base balance display
<BalanceDisplay
  address="0x1234567890123456789012345678901234567890"
  network="base"
  showTokens={true}
/>

// With custom refresh interval
<BalanceDisplay
  accountId="0.0.12345"
  refreshInterval={30000} // 30 seconds
  onBalanceUpdate={(balance) => console.log('Balance updated:', balance)}
/>
```

#### Features

- **Real-time Updates**: Automatic balance refreshing with configurable intervals
- **Multi-Network**: Support for Hedera, Ethereum, and Base networks
- **Token Support**: Display both native currency and token balances
- **Error Handling**: Graceful error states with retry functionality
- **Loading States**: Skeleton loading animations during data fetch
- **Accessibility**: Full ARIA support and keyboard navigation
- **TypeScript**: Complete type safety with comprehensive interfaces

### NetworkSwitcher

Network selection component with seamless switching between supported blockchains.

#### Props

```typescript
interface NetworkSwitcherProps {
  /** Currently selected network */
  value?: string;

  /** Available networks to display */
  networks?: NetworkOption[];

  /** Whether the switcher is disabled */
  disabled?: boolean;

  /** Custom CSS class name */
  className?: string;

  /** Callback fired when network changes */
  onChange?: (network: string) => void;

  /** Size variant */
  size?: 'sm' | 'md' | 'lg';

  /** Display variant */
  variant?: 'dropdown' | 'buttons' | 'tabs';
}
```

#### Network Options

```typescript
interface NetworkOption {
  id: string;
  name: string;
  icon?: React.ComponentType;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}
```

#### Usage Examples

```typescript
// Basic network switcher
<NetworkSwitcher
  networks={['ethereum', 'base', 'hedera-mainnet', 'hedera-testnet']}
  onChange={(network) => console.log('Switched to:', network)}
/>

// Custom network options
const customNetworks = [
  {
    id: 'base-sepolia',
    name: 'Base Sepolia',
    rpcUrl: 'https://sepolia.base.org',
    blockExplorer: 'https://sepolia.basescan.org',
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 }
  }
];

<NetworkSwitcher
  networks={customNetworks}
  variant="dropdown"
  size="lg"
/>
```

#### Features

- **Multi-Network**: Support for Ethereum, Base, and Hedera networks
- **Auto-Detection**: Automatically detects and adds networks to wallets
- **Visual Feedback**: Network status indicators and connection states
- **Responsive**: Adapts to different screen sizes
- **Accessible**: Full keyboard navigation and screen reader support

### TransactionHistory

Complete transaction history display with filtering, sorting, and pagination.

#### Props

```typescript
interface TransactionHistoryProps {
  /** Hedera account ID or Ethereum address */
  accountId?: string;

  /** Network to query */
  network?: string;

  /** Hedera provider configuration */
  hederaConfig?: HederaProviderConfig;

  /** Number of transactions per page */
  pageSize?: number;

  /** Enable real-time updates */
  enableRealTime?: boolean;

  /** Real-time update interval */
  updateInterval?: number;

  /** Custom CSS class name */
  className?: string;

  /** Transaction filters */
  filters?: TransactionFilters;

  /** Callback for transaction selection */
  onTransactionSelect?: (transaction: Transaction) => void;

  /** Callback for filter changes */
  onFiltersChange?: (filters: TransactionFilters) => void;
}
```

#### Transaction Filters

```typescript
interface TransactionFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: ('pending' | 'approved' | 'executed' | 'cancelled')[];
  amountRange?: {
    min: number;
    max: number;
  };
  type?: ('transfer' | 'contract_call' | 'multisig_operation')[];
  searchQuery?: string;
}
```

#### Usage Examples

```typescript
// Basic transaction history
<TransactionHistory
  accountId="0.0.12345"
  network="hedera-testnet"
/>

// With custom filters
<TransactionHistory
  accountId="0.0.12345"
  filters={{
    dateRange: {
      start: new Date('2024-01-01'),
      end: new Date()
    },
    status: ['executed', 'pending']
  }}
  onTransactionSelect={(tx) => console.log('Selected:', tx)}
/>

// Real-time updates
<TransactionHistory
  accountId="0.0.12345"
  enableRealTime={true}
  updateInterval={10000} // 10 seconds
/>
```

#### Features

- **Multi-Network**: Support for Hedera, Ethereum, and Base transactions
- **Advanced Filtering**: Date range, amount, status, and type filters
- **Real-time Updates**: Live transaction monitoring with polling
- **Pagination**: Efficient handling of large transaction lists
- **Sorting**: Multiple sort options (date, amount, status)
- **Search**: Full-text search across transaction data
- **Export**: CSV export functionality
- **Responsive**: Mobile-friendly table design

## Modal Components

### UnifiedConnectModal

Universal wallet connection modal supporting all integrated wallet types.

#### Props

```typescript
interface UnifiedConnectModalProps {
  /** Ethereum/Base wallet configuration */
  ethereumOptions?: {
    appName: string;
    projectId: string;
    chains?: Chain[];
    wallets?: WalletType[];
  };

  /** Hedera wallet configuration */
  hederaOptions?: {
    networks?: ('mainnet' | 'testnet' | 'previewnet')[];
    dAppMetadata?: DAppMetadata;
    wallets?: HederaWalletType[];
  };

  /** Modal open state */
  open?: boolean;

  /** Callback for modal state changes */
  onOpenChange?: (open: boolean) => void;

  /** Custom CSS class name */
  className?: string;

  /** Theme configuration */
  theme?: 'light' | 'dark' | 'auto';
}
```

#### Usage Examples

```typescript
// Basic usage
<UnifiedConnectModal />

// With custom configuration
<UnifiedConnectModal
  ethereumOptions={{
    appName: 'My DApp',
    projectId: process.env.WALLETCONNECT_PROJECT_ID,
    chains: [mainnet, base]
  }}
  hederaOptions={{
    networks: ['testnet'],
    dAppMetadata: {
      name: 'My DApp',
      description: 'Wallet connection demo',
      icons: ['https://myapp.com/icon.png']
    }
  }}
/>

// Controlled modal
const [open, setOpen] = useState(false);

<UnifiedConnectModal
  open={open}
  onOpenChange={setOpen}
/>
```

#### Features

- **Universal Support**: Single modal for all wallet types
- **Multi-Network**: Simultaneous Ethereum/Base and Hedera support
- **QR Codes**: WalletConnect QR modal for mobile wallets
- **Auto-Detection**: Detects installed wallet extensions
- **Recent Wallets**: Shows recently connected wallets
- **Error Handling**: Clear error messages and recovery options

### ConnectModal

Legacy component for backward compatibility. Consider using `UnifiedConnectModal` for new implementations.

## Utility Components

### WalletTroubleshooting

Diagnostic component for wallet connection issues and troubleshooting.

#### Props

```typescript
interface WalletTroubleshootingProps {
  /** Wallet type being troubleshot */
  walletType?: string;

  /** Network being used */
  network?: string;

  /** Custom CSS class name */
  className?: string;

  /** Callback for diagnostic actions */
  onDiagnosticComplete?: (results: DiagnosticResults) => void;
}
```

#### Features

- **Connection Diagnostics**: Tests wallet connectivity and permissions
- **Network Validation**: Verifies network configuration
- **Permission Checks**: Validates required wallet permissions
- **Step-by-Step Guide**: Interactive troubleshooting wizard
- **Error Reporting**: Generates diagnostic reports for support

## Component Architecture

### Design Principles

1. **Composition**: Components are built using composition over inheritance
2. **Customization**: Extensive customization through props and CSS variables
3. **Accessibility**: WCAG 2.1 AA compliance with full keyboard navigation
4. **Performance**: Optimized rendering with memoization and lazy loading
5. **Type Safety**: Complete TypeScript coverage with strict typing

### Styling

Components use CSS modules with CSS variables for theming:

```css
/* Component-specific variables */
--wallet-primary-color: #007acc;
--wallet-border-radius: 8px;
--wallet-font-family: 'Inter', sans-serif;

/* Theme variants */
--wallet-theme-light: {
  --wallet-bg-color: #ffffff;
  --wallet-text-color: #000000;
};

--wallet-theme-dark: {
  --wallet-bg-color: #1a1a1a;
  --wallet-text-color: #ffffff;
};
```

### Theming

Components support multiple theme variants:

```typescript
// Light theme (default)
<BalanceDisplay theme="light" />

// Dark theme
<BalanceDisplay theme="dark" />

// Auto theme (follows system preference)
<BalanceDisplay theme="auto" />
```

## Error Boundaries

All components include built-in error boundaries:

```typescript
import { WalletErrorBoundary } from '@polymathuniversata/echain-wallet';

<WalletErrorBoundary fallback={<div>Something went wrong</div>}>
  <BalanceDisplay accountId="0.0.12345" />
</WalletErrorBoundary>
```

## Performance Considerations

### Bundle Optimization

Components are tree-shakeable and can be imported individually:

```typescript
// Import only what you need
import BalanceDisplay from '@polymathuniversata/echain-wallet/components/BalanceDisplay';
import NetworkSwitcher from '@polymathuniversata/echain-wallet/components/NetworkSwitcher';

// Or import multiple
import { BalanceDisplay, NetworkSwitcher } from '@polymathuniversata/echain-wallet/components';
```

### Lazy Loading

Components support dynamic imports for code splitting:

```typescript
const BalanceDisplay = lazy(() =>
  import('@polymathuniversata/echain-wallet/components/BalanceDisplay')
);
```

### Memoization

Components use React.memo and useMemo for performance:

```typescript
// Components automatically memoize expensive computations
<BalanceDisplay
  accountId={accountId} // Memoized based on accountId changes
  refreshInterval={30000}
/>
```

## Accessibility

### ARIA Support

All components include comprehensive ARIA attributes:

- **Labels**: Proper labeling for screen readers
- **Descriptions**: Helpful descriptions for complex interactions
- **Live Regions**: Announcements for dynamic content updates
- **Focus Management**: Proper focus handling and keyboard navigation

### Keyboard Navigation

- **Tab Order**: Logical tab order through interactive elements
- **Enter/Space**: Activation of buttons and interactive elements
- **Arrow Keys**: Navigation through lists and menus
- **Escape**: Modal dismissal and menu closure

### Screen Reader Support

- **Semantic HTML**: Proper use of semantic elements
- **ARIA Roles**: Appropriate ARIA roles for custom components
- **Status Messages**: Screen reader announcements for state changes
- **Error Messages**: Clear error announcements

## Testing

Components include comprehensive test suites:

```bash
# Run component tests
npm test -- --testPathPattern=components

# Run specific component tests
npm test -- BalanceDisplay.test.tsx

# Run with coverage
npm run test:coverage
```

### Test Categories

- **Unit Tests**: Individual component functionality
- **Integration Tests**: Component interaction testing
- **Accessibility Tests**: a11y compliance validation
- **Performance Tests**: Rendering performance benchmarks

## Migration Guide

### From v0.x to v1.x

```typescript
// Old API (v0.x)
import { ConnectModal } from '@polymathuniversata/echain-wallet';

// New API (v1.x)
import { UnifiedConnectModal } from '@polymathuniversata/echain-wallet';

// Migration
// Before
<ConnectModal ethereumOptions={...} />

// After
<UnifiedConnectModal ethereumOptions={...} />
```

## Support

For component-specific issues and questions:

- **Documentation**: [Component Guides](../components/)
- **GitHub Issues**: [Report Bugs](https://github.com/Emertechs-Labs/Echain/issues)
- **Discord**: [Community Support](https://discord.gg/echain)

---

*Last updated: October 23, 2025*</content>
<parameter name="filePath">e:\Polymath Universata\Projects\walletsdk\docs\api\components.md