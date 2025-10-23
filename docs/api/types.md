# Types API Reference

This document provides comprehensive API documentation for all TypeScript types, interfaces, and enums included in the Echain Wallet SDK.

## Overview

All types are exported from the main package and can be imported individually or as a namespace.

```typescript
import type { WalletInfo, Transaction, Network } from '@polymathuniversata/echain-wallet/types';
```

## Core Types

### Wallet Types

#### WalletInfo

Represents information about a connected wallet.

```typescript
interface WalletInfo {
  /** Unique wallet identifier */
  id: string;

  /** Wallet name (e.g., 'MetaMask', 'HashPack') */
  name: string;

  /** Wallet type */
  type: WalletType;

  /** Connected account address */
  address: string;

  /** Connected network */
  network: Network;

  /** Wallet capabilities */
  capabilities: WalletCapabilities;

  /** Connection metadata */
  metadata: WalletMetadata;
}
```

#### WalletType

Enumeration of supported wallet types.

```typescript
enum WalletType {
  METAMASK = 'metamask',
  WALLETCONNECT = 'walletconnect',
  COINBASE = 'coinbase',
  HASHPACK = 'hashpack',
  BLADER = 'blader',
  PRIVY = 'privy',
  FARCASTER = 'farcaster'
}
```

#### WalletCapabilities

Defines what operations a wallet can perform.

```typescript
interface WalletCapabilities {
  /** Can sign transactions */
  signTransaction: boolean;

  /** Can sign messages */
  signMessage: boolean;

  /** Can sign typed data (EIP-712) */
  signTypedData: boolean;

  /** Supports multiple accounts */
  multiAccount: boolean;

  /** Supports network switching */
  networkSwitching: boolean;

  /** Supports token detection */
  tokenDetection: boolean;
}
```

#### WalletMetadata

Additional wallet connection metadata.

```typescript
interface WalletMetadata {
  /** Wallet version */
  version?: string;

  /** Connection timestamp */
  connectedAt: Date;

  /** Last activity timestamp */
  lastActivity?: Date;

  /** Connection source */
  source: 'extension' | 'mobile' | 'web';

  /** Device information */
  device?: {
    platform: string;
    userAgent: string;
  };
}
```

### Network Types

#### Network

Represents a blockchain network configuration.

```typescript
interface Network {
  /** Unique network identifier */
  id: string;

  /** Network name */
  name: string;

  /** Chain ID (for EVM networks) */
  chainId?: number;

  /** Network type */
  type: NetworkType;

  /** RPC endpoints */
  rpcUrls: string[];

  /** Block explorer URLs */
  blockExplorerUrls: string[];

  /** Native currency information */
  nativeCurrency: NativeCurrency;

  /** Network status */
  status: NetworkStatus;

  /** Additional configuration */
  config: NetworkConfig;
}
```

#### NetworkType

Enumeration of supported network types.

```typescript
enum NetworkType {
  ETHEREUM = 'ethereum',
  BASE = 'base',
  HEDERA = 'hedera',
  POLYGON = 'polygon',
  ARBITRUM = 'arbitrum',
  OPTIMISM = 'optimism'
}
```

#### NetworkStatus

Network availability status.

```typescript
enum NetworkStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  DEPRECATED = 'deprecated'
}
```

#### NativeCurrency

Information about the network's native currency.

```typescript
interface NativeCurrency {
  /** Currency name */
  name: string;

  /** Currency symbol */
  symbol: string;

  /** Number of decimals */
  decimals: number;

  /** Currency logo URL */
  logoUrl?: string;
}
```

#### NetworkConfig

Additional network-specific configuration.

```typescript
interface NetworkConfig {
  /** Block time in seconds */
  blockTime: number;

  /** Gas price strategy */
  gasPrice: GasPriceStrategy;

  /** Confirmations required */
  confirmations: number;

  /** Maximum gas limit */
  maxGasLimit: string;

  /** Network features */
  features: NetworkFeatures;
}
```

### Transaction Types

#### Transaction

Represents a blockchain transaction.

```typescript
interface Transaction {
  /** Transaction hash */
  hash: string;

  /** Transaction index in block */
  index?: number;

  /** Block number */
  blockNumber?: number;

  /** Block hash */
  blockHash?: string;

  /** Transaction timestamp */
  timestamp: Date;

  /** Sender address */
  from: string;

  /** Recipient address */
  to?: string;

  /** Transaction value */
  value: string;

  /** Gas price */
  gasPrice?: string;

  /** Gas limit */
  gasLimit?: string;

  /** Gas used */
  gasUsed?: string;

  /** Transaction fee */
  fee?: string;

  /** Transaction status */
  status: TransactionStatus;

  /** Transaction type */
  type: TransactionType;

  /** Transaction data */
  data?: string;

  /** Logs emitted */
  logs?: TransactionLog[];

  /** Network information */
  network: string;

  /** Additional metadata */
  metadata?: TransactionMetadata;
}
```

#### TransactionStatus

Transaction execution status.

```typescript
enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  DROPPED = 'dropped'
}
```

#### TransactionType

Type of transaction.

```typescript
enum TransactionType {
  TRANSFER = 'transfer',
  CONTRACT_CALL = 'contract_call',
  CONTRACT_DEPLOY = 'contract_deploy',
  TOKEN_TRANSFER = 'token_transfer',
  NFT_TRANSFER = 'nft_transfer',
  SWAP = 'swap',
  STAKE = 'stake',
  UNSTAKE = 'unstake'
}
```

#### TransactionLog

Transaction event log.

```typescript
interface TransactionLog {
  /** Log index */
  index: number;

  /** Contract address */
  address: string;

  /** Event topics */
  topics: string[];

  /** Log data */
  data: string;

  /** Decoded event data */
  decoded?: {
    event: string;
    args: Record<string, any>;
  };
}
```

### Token Types

#### Token

Represents an ERC-20 or HTS token.

```typescript
interface Token {
  /** Token contract address */
  address: string;

  /** Token name */
  name: string;

  /** Token symbol */
  symbol: string;

  /** Token decimals */
  decimals: number;

  /** Total supply */
  totalSupply?: string;

  /** Token logo URL */
  logoUrl?: string;

  /** Token type */
  type: TokenType;

  /** Network information */
  network: string;

  /** Token metadata */
  metadata?: TokenMetadata;
}
```

#### TokenType

Type of token standard.

```typescript
enum TokenType {
  ERC20 = 'erc20',
  ERC721 = 'erc721',
  ERC1155 = 'erc1155',
  HTS = 'hts',
  HTS_NFT = 'hts_nft'
}
```

#### TokenBalance

Token balance information.

```typescript
interface TokenBalance {
  /** Token information */
  token: Token;

  /** Balance amount */
  balance: string;

  /** Formatted balance */
  formatted: string;

  /** USD value */
  usdValue?: number;

  /** Price per token */
  price?: number;

  /** Last updated timestamp */
  lastUpdated: Date;
}
```

### User Types

#### User

User account information.

```typescript
interface User {
  /** Unique user ID */
  id: string;

  /** User email */
  email?: string;

  /** User name */
  name?: string;

  /** User avatar URL */
  avatar?: string;

  /** User bio */
  bio?: string;

  /** User preferences */
  preferences: UserPreferences;

  /** Associated wallets */
  wallets: WalletAssociation[];

  /** User role */
  role: UserRole;

  /** Account creation timestamp */
  createdAt: Date;

  /** Last login timestamp */
  lastLogin?: Date;

  /** Account status */
  status: AccountStatus;
}
```

#### UserPreferences

User customization preferences.

```typescript
interface UserPreferences {
  /** Preferred theme */
  theme: 'light' | 'dark' | 'auto';

  /** Preferred currency */
  currency: string;

  /** Language preference */
  language: string;

  /** Notification settings */
  notifications: NotificationSettings;

  /** Privacy settings */
  privacy: PrivacySettings;
}
```

#### WalletAssociation

Wallet linked to user account.

```typescript
interface WalletAssociation {
  /** Wallet address */
  address: string;

  /** Network */
  network: string;

  /** Wallet type */
  type: WalletType;

  /** Association timestamp */
  linkedAt: Date;

  /** Wallet label */
  label?: string;

  /** Primary wallet flag */
  isPrimary: boolean;
}
```

#### UserRole

User permission level.

```typescript
enum UserRole {
  USER = 'user',
  PREMIUM = 'premium',
  ADMIN = 'admin',
  DEVELOPER = 'developer'
}
```

### Authentication Types

#### AuthProvider

Supported authentication providers.

```typescript
enum AuthProvider {
  PRIVY = 'privy',
  FARCASTER = 'farcaster',
  METAMASK = 'metamask',
  WALLETCONNECT = 'walletconnect',
  EMAIL = 'email',
  PHONE = 'phone'
}
```

#### AuthState

Authentication state information.

```typescript
interface AuthState {
  /** Authentication status */
  isAuthenticated: boolean;

  /** Current user */
  user: User | null;

  /** Authentication loading state */
  isLoading: boolean;

  /** Authentication error */
  error: AuthError | null;

  /** Session information */
  session: SessionInfo;
}
```

#### SessionInfo

User session details.

```typescript
interface SessionInfo {
  /** Session ID */
  id: string;

  /** Session start time */
  startedAt: Date;

  /** Session expiry time */
  expiresAt: Date;

  /** Session provider */
  provider: AuthProvider;

  /** IP address */
  ipAddress?: string;

  /** User agent */
  userAgent?: string;
}
```

### Multisig Types

#### MultisigWallet

Multi-signature wallet configuration.

```typescript
interface MultisigWallet {
  /** Contract address */
  address: string;

  /** Owner addresses */
  owners: string[];

  /** Required confirmations */
  required: number;

  /** Daily spending limit */
  dailyLimit: string;

  /** Current nonce */
  nonce: number;

  /** Wallet name */
  name?: string;

  /** Wallet description */
  description?: string;
}
```

#### MultisigTransaction

Multi-signature transaction data.

```typescript
interface MultisigTransaction {
  /** Transaction ID */
  id: string;

  /** Destination address */
  to: string;

  /** Transaction value */
  value: string;

  /** Transaction data */
  data: string;

  /** Executed status */
  executed: boolean;

  /** Confirmation count */
  confirmations: number;

  /** Required confirmations */
  required: number;

  /** Submission timestamp */
  submittedAt: Date;

  /** Execution timestamp */
  executedAt?: Date;

  /** Submitter address */
  submitter: string;

  /** Confirming addresses */
  confirmedBy: string[];
}
```

### Error Types

#### WalletError

Base wallet error class.

```typescript
class WalletError extends Error {
  constructor(
    message: string,
    public code: WalletErrorCode,
    public details?: any
  ) {
    super(message);
    this.name = 'WalletError';
  }
}
```

#### WalletErrorCode

Wallet error codes.

```typescript
enum WalletErrorCode {
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  DISCONNECTED = 'DISCONNECTED',
  NETWORK_MISMATCH = 'NETWORK_MISMATCH',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  SIGNATURE_REJECTED = 'SIGNATURE_REJECTED',
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  UNSUPPORTED_OPERATION = 'UNSUPPORTED_OPERATION'
}
```

#### AuthError

Authentication error class.

```typescript
class AuthError extends Error {
  constructor(
    message: string,
    public code: AuthErrorCode,
    public provider?: AuthProvider
  ) {
    super(message);
    this.name = 'AuthError';
  }
}
```

#### AuthErrorCode

Authentication error codes.

```typescript
enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  PROVIDER_ERROR = 'PROVIDER_ERROR',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  USER_CANCELLED = 'USER_CANCELLED',
  UNSUPPORTED_PROVIDER = 'UNSUPPORTED_PROVIDER'
}
```

### Hedera-Specific Types

#### HederaAccount

Hedera account information.

```typescript
interface HederaAccount {
  /** Account ID */
  accountId: string;

  /** Public key */
  publicKey: string;

  /** Account balance */
  balance: Hbar;

  /** Token balances */
  tokenBalances: TokenBalance[];

  /** Account properties */
  properties: AccountProperties;

  /** Staking information */
  staking?: StakingInfo;
}
```

#### HederaTransaction

Hedera transaction data.

```typescript
interface HederaTransaction {
  /** Transaction ID */
  transactionId: string;

  /** Transaction hash */
  hash: string;

  /** Transaction type */
  type: HederaTransactionType;

  /** Sender account */
  sender: string;

  /** Recipient account */
  recipient?: string;

  /** Transaction amount */
  amount?: Hbar;

  /** Transaction fee */
  fee: Hbar;

  /** Consensus timestamp */
  consensusTimestamp: Date;

  /** Transaction status */
  status: TransactionStatus;

  /** Memo field */
  memo?: string;
}
```

#### HederaTransactionType

Hedera transaction types.

```typescript
enum HederaTransactionType {
  CRYPTO_TRANSFER = 'CRYPTO_TRANSFER',
  TOKEN_TRANSFER = 'TOKEN_TRANSFER',
  CONTRACT_CALL = 'CONTRACT_CALL',
  CONTRACT_CREATE = 'CONTRACT_CREATE',
  TOKEN_CREATE = 'TOKEN_CREATE',
  TOKEN_MINT = 'TOKEN_MINT',
  TOKEN_BURN = 'TOKEN_BURN'
}
```

### Configuration Types

#### SDKConfig

Main SDK configuration.

```typescript
interface SDKConfig {
  /** API keys and secrets */
  apiKeys: {
    walletConnect?: string;
    privy?: string;
    farcaster?: string;
    hedera?: HederaCredentials;
  };

  /** Network configurations */
  networks: Network[];

  /** Default network */
  defaultNetwork: string;

  /** UI configuration */
  ui: UIConfig;

  /** Feature flags */
  features: FeatureFlags;

  /** Logging configuration */
  logging: LoggingConfig;
}
```

#### UIConfig

UI customization options.

```typescript
interface UIConfig {
  /** Theme configuration */
  theme: 'light' | 'dark' | 'auto';

  /** Modal configuration */
  modals: {
    size: 'sm' | 'md' | 'lg';
    position: 'center' | 'top' | 'bottom';
    backdrop: boolean;
  };

  /** Component styling */
  components: {
    borderRadius: string;
    fontFamily: string;
    primaryColor: string;
  };
}
```

#### FeatureFlags

Feature toggle configuration.

```typescript
interface FeatureFlags {
  /** Enable multisig functionality */
  multisig: boolean;

  /** Enable NFT support */
  nfts: boolean;

  /** Enable DeFi integrations */
  defi: boolean;

  /** Enable analytics tracking */
  analytics: boolean;

  /** Enable debug mode */
  debug: boolean;
}
```

## Type Guards

The SDK provides utility functions for type checking:

```typescript
import { isWalletInfo, isTransaction, isNetwork } from '@polymathuniversata/echain-wallet/types';

// Type guards
if (isWalletInfo(wallet)) {
  console.log('Valid wallet info:', wallet.name);
}

if (isTransaction(tx)) {
  console.log('Valid transaction:', tx.hash);
}

if (isNetwork(network)) {
  console.log('Valid network:', network.name);
}
```

## Utility Types

### Partial and Required Types

```typescript
// Make all properties optional
type PartialWallet = Partial<WalletInfo>;

// Make all properties required
type RequiredNetwork = Required<Network>;

// Make specific properties optional
type OptionalAddressWallet = Omit<WalletInfo, 'address'> & Partial<Pick<WalletInfo, 'address'>>;
```

### Union Types

```typescript
// Supported wallet connection methods
type ConnectionMethod = 'extension' | 'walletconnect' | 'mobile';

// Transaction result types
type TransactionResult = TransactionResponse | TransactionReceipt | string;
```

### Generic Types

```typescript
// Generic API response
interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
  timestamp: Date;
}

// Usage
type WalletResponse = ApiResponse<WalletInfo>;
type TransactionResponse = ApiResponse<Transaction>;
```

### Mapped Types

```typescript
// Create readonly version of types
type ReadonlyWallet = Readonly<WalletInfo>;

// Extract specific properties
type WalletBasic = Pick<WalletInfo, 'id' | 'name' | 'address'>;

// Exclude specific properties
type WalletWithoutMetadata = Omit<WalletInfo, 'metadata'>;
```

## Type Assertions

Safe type assertions with runtime checks:

```typescript
import { assertIsWalletInfo, assertIsNetwork } from '@polymathuniversata/echain-wallet/types';

// Safe type assertion
function processWallet(wallet: unknown) {
  assertIsWalletInfo(wallet);
  // TypeScript now knows wallet is WalletInfo
  console.log(wallet.name);
}
```

## Migration Guide

### From v0.x to v1.x

```typescript
// Old types (v0.x)
import { Wallet, Transaction } from '@polymathuniversata/echain-wallet';

// New types (v1.x)
import type { WalletInfo, Transaction } from '@polymathuniversata/echain-wallet/types';

// Migration
// Before
const wallet: Wallet = { ... };

// After
const wallet: WalletInfo = { ... };
```

## Support

For type-related issues and questions:

- **Documentation**: [Type Definitions](../types/)
- **GitHub Issues**: [Report Bugs](https://github.com/Emertechs-Labs/Echain/issues)
- **Discord**: [Community Support](https://discord.gg/echain)

---

*Last updated: October 23, 2025*</content>
<parameter name="filePath">e:\Polymath Universata\Projects\api\types.md