# Services API Reference

This document provides comprehensive API documentation for all service classes included in the Echain Wallet SDK.

## Overview

Services are singleton classes that handle business logic, API communication, and data management. All services are built with TypeScript and include comprehensive error handling.

```typescript
import { AuthService, HederaTransactionService } from '@polymathuniversata/echain-wallet/services';
```

## Core Services

### AuthService

Authentication service managing user sessions, tokens, and multi-provider authentication.

#### Constructor

```typescript
constructor(config: AuthServiceConfig);
```

#### Configuration

```typescript
interface AuthServiceConfig {
  /** Firebase configuration */
  firebase: FirebaseConfig;

  /** Supported auth providers */
  providers: AuthProvider[];

  /** Session configuration */
  session: {
    persistent: boolean;
    refreshThreshold: number; // minutes before expiry to refresh
  };

  /** Security configuration */
  security: {
    enableCSRF: boolean;
    tokenRotation: boolean;
  };
}
```

#### Methods

```typescript
interface AuthService {
  /** Initialize the service */
  initialize(): Promise<void>;

  /** Authenticate with a provider */
  login(provider: AuthProvider, options?: LoginOptions): Promise<User>;

  /** End user session */
  logout(): Promise<void>;

  /** Get current user */
  getCurrentUser(): Promise<User | null>;

  /** Refresh authentication token */
  refreshToken(): Promise<string>;

  /** Check if user is authenticated */
  isAuthenticated(): boolean;

  /** Listen to auth state changes */
  onAuthStateChange(callback: (user: User | null) => void): () => void;

  /** Validate session */
  validateSession(): Promise<boolean>;

  /** Get user permissions */
  getUserPermissions(userId: string): Promise<Permission[]>;

  /** Update user profile */
  updateProfile(updates: Partial<UserProfile>): Promise<void>;
}
```

#### Usage Examples

```typescript
import { AuthService } from '@polymathuniversata/echain-wallet/services';

// Initialize service
const authService = new AuthService({
  firebase: firebaseConfig,
  providers: ['privy', 'farcaster'],
  session: {
    persistent: true,
    refreshThreshold: 5
  }
});

await authService.initialize();

// Login with Privy
try {
  const user = await authService.login('privy', {
    redirectUrl: '/dashboard'
  });
  console.log('Logged in as:', user.name);
} catch (error) {
  console.error('Login failed:', error);
}

// Listen to auth changes
const unsubscribe = authService.onAuthStateChange((user) => {
  if (user) {
    console.log('User authenticated:', user);
  } else {
    console.log('User logged out');
  }
});

// Cleanup
unsubscribe();
```

#### Features

- **Multi-Provider Support**: Privy, Farcaster, and custom providers
- **Session Management**: Automatic token refresh and session persistence
- **Security**: CSRF protection and secure token storage
- **Real-time Updates**: Live authentication state monitoring
- **Error Recovery**: Comprehensive error handling with recovery options

### HederaTransactionService

Service for managing Hedera Hashgraph transactions, queries, and network operations.

#### Constructor

```typescript
constructor(config: HederaTransactionServiceConfig);
```

#### Configuration

```typescript
interface HederaTransactionServiceConfig {
  /** Network configuration */
  network: 'mainnet' | 'testnet' | 'previewnet';

  /** Operator credentials */
  operator: {
    accountId: string;
    privateKey: string;
  };

  /** Service configuration */
  options: {
    maxRetries: number;
    timeout: number;
    enableMonitoring: boolean;
  };
}
```

#### Methods

```typescript
interface HederaTransactionService {
  /** Initialize the service */
  initialize(): Promise<void>;

  /** Create and execute a transaction */
  executeTransaction(transaction: HederaTransaction): Promise<TransactionReceipt>;

  /** Query transaction status */
  queryTransaction(transactionId: string): Promise<TransactionRecord>;

  /** Get account balance */
  getAccountBalance(accountId: string): Promise<Hbar>;

  /** Get account information */
  getAccountInfo(accountId: string): Promise<AccountInfo>;

  /** Transfer HBAR */
  transferHbar(from: string, to: string, amount: Hbar): Promise<TransactionResponse>;

  /** Transfer tokens */
  transferToken(
    tokenId: string,
    from: string,
    to: string,
    amount: number
  ): Promise<TransactionResponse>;

  /** Create token */
  createToken(token: TokenCreateTransaction): Promise<TokenId>;

  /** Mint tokens */
  mintToken(tokenId: string, amount: number): Promise<TransactionResponse>;

  /** Burn tokens */
  burnToken(tokenId: string, amount: number): Promise<TransactionResponse>;

  /** Associate token with account */
  associateToken(accountId: string, tokenId: string): Promise<TransactionResponse>;

  /** Dissociate token from account */
  dissociateToken(accountId: string, tokenId: string): Promise<TransactionResponse>;

  /** Get token balance */
  getTokenBalance(accountId: string, tokenId: string): Promise<number>;

  /** Get token information */
  getTokenInfo(tokenId: string): Promise<TokenInfo>;

  /** Create smart contract */
  createContract(bytecode: string, constructorParams?: any[]): Promise<ContractId>;

  /** Call smart contract function */
  callContractFunction(
    contractId: string,
    functionName: string,
    params?: any[]
  ): Promise<ContractFunctionResult>;

  /** Query smart contract */
  queryContractFunction(
    contractId: string,
    functionName: string,
    params?: any[]
  ): Promise<ContractFunctionResult>;
}
```

#### Usage Examples

```typescript
import { HederaTransactionService } from '@polymathuniversata/echain-wallet/services';

// Initialize service
const hederaService = new HederaTransactionService({
  network: 'testnet',
  operator: {
    accountId: process.env.HEDERA_ACCOUNT_ID,
    privateKey: process.env.HEDERA_PRIVATE_KEY
  },
  options: {
    maxRetries: 3,
    timeout: 30000,
    enableMonitoring: true
  }
});

await hederaService.initialize();

// Transfer HBAR
try {
  const response = await hederaService.transferHbar(
    '0.0.12345',
    '0.0.67890',
    Hbar.from(10)
  );
  console.log('Transfer successful:', response.transactionId);
} catch (error) {
  console.error('Transfer failed:', error);
}

// Query account balance
const balance = await hederaService.getAccountBalance('0.0.12345');
console.log('Account balance:', balance.toString());

// Create a token
const tokenId = await hederaService.createToken({
  name: 'My Token',
  symbol: 'MTK',
  decimals: 2,
  initialSupply: 1000000,
  treasuryAccountId: '0.0.12345'
});
console.log('Token created:', tokenId.toString());
```

#### Features

- **Transaction Management**: Complete transaction lifecycle management
- **Token Operations**: Full token creation, minting, and transfer support
- **Smart Contracts**: Deploy and interact with smart contracts
- **Network Monitoring**: Real-time transaction monitoring and status updates
- **Error Recovery**: Automatic retry logic and error recovery
- **Performance**: Optimized network requests and caching

### UserService

Service for managing user data, profiles, and wallet associations.

#### Constructor

```typescript
constructor(config: UserServiceConfig);
```

#### Configuration

```typescript
interface UserServiceConfig {
  /** Firebase configuration */
  firebase: FirebaseConfig;

  /** Data validation rules */
  validation: {
    enableEmailValidation: boolean;
    enablePhoneValidation: boolean;
    requireProfileCompletion: boolean;
  };

  /** Cache configuration */
  cache: {
    ttl: number; // Time to live in seconds
    maxSize: number; // Maximum cache size
  };
}
```

#### Methods

```typescript
interface UserService {
  /** Initialize the service */
  initialize(): Promise<void>;

  /** Create a new user */
  createUser(userData: CreateUserData): Promise<User>;

  /** Get user by ID */
  getUserById(userId: string): Promise<User | null>;

  /** Get user by wallet address */
  getUserByWallet(walletAddress: string): Promise<User | null>;

  /** Update user profile */
  updateUser(userId: string, updates: Partial<UserProfile>): Promise<User>;

  /** Delete user */
  deleteUser(userId: string): Promise<void>;

  /** Associate wallet with user */
  associateWallet(userId: string, wallet: WalletAssociation): Promise<void>;

  /** Remove wallet association */
  removeWallet(userId: string, walletAddress: string): Promise<void>;

  /** Get user's wallets */
  getUserWallets(userId: string): Promise<WalletAssociation[]>;

  /** Search users */
  searchUsers(query: UserSearchQuery): Promise<User[]>;

  /** Get user statistics */
  getUserStats(userId: string): Promise<UserStats>;

  /** Export user data */
  exportUserData(userId: string): Promise<UserDataExport>;

  /** Validate user data */
  validateUserData(userData: Partial<UserProfile>): ValidationResult;
}
```

#### Usage Examples

```typescript
import { UserService } from '@polymathuniversata/echain-wallet/services';

// Initialize service
const userService = new UserService({
  firebase: firebaseConfig,
  validation: {
    enableEmailValidation: true,
    requireProfileCompletion: false
  },
  cache: {
    ttl: 300, // 5 minutes
    maxSize: 1000
  }
});

await userService.initialize();

// Create a new user
const newUser = await userService.createUser({
  email: 'user@example.com',
  name: 'John Doe',
  wallets: [{
    address: '0x123...',
    network: 'ethereum',
    type: 'metamask'
  }]
});

// Associate additional wallet
await userService.associateWallet(newUser.id, {
  address: '0.0.456...',
  network: 'hedera',
  type: 'hashpack'
});

// Get user with wallets
const user = await userService.getUserById(newUser.id);
console.log('User wallets:', user.wallets);

// Update profile
await userService.updateUser(user.id, {
  bio: 'Blockchain enthusiast',
  avatar: 'https://example.com/avatar.jpg'
});
```

#### Features

- **User Management**: Complete CRUD operations for user profiles
- **Wallet Associations**: Multi-wallet support with network tracking
- **Data Validation**: Comprehensive input validation and sanitization
- **Caching**: Performance optimization with intelligent caching
- **Search**: Advanced user search and filtering capabilities
- **Privacy**: GDPR-compliant data handling and export features

## Manager Classes

### MultisigManager

Manager class for multi-signature wallet operations and approval workflows.

#### Constructor

```typescript
constructor(config: MultisigManagerConfig);
```

#### Configuration

```typescript
interface MultisigManagerConfig {
  /** Web3 provider */
  provider: ethers.Provider;

  /** Multisig contract address */
  contractAddress: string;

  /** Signer for transactions */
  signer: ethers.Signer;

  /** Approval configuration */
  approvals: {
    requiredConfirmations: number;
    timelock: number; // seconds
    maxDailyLimit: string; // ETH
  };

  /** Monitoring configuration */
  monitoring: {
    enableRealTime: boolean;
    pollInterval: number;
  };
}
```

#### Methods

```typescript
interface MultisigManager {
  /** Initialize the manager */
  initialize(): Promise<void>;

  /** Get multisig wallet information */
  getWalletInfo(): Promise<MultisigWalletInfo>;

  /** Submit a transaction for approval */
  submitTransaction(tx: MultisigTransaction): Promise<string>;

  /** Confirm a pending transaction */
  confirmTransaction(txId: string): Promise<void>;

  /** Revoke confirmation */
  revokeConfirmation(txId: string): Promise<void>;

  /** Execute approved transaction */
  executeTransaction(txId: string): Promise<TransactionReceipt>;

  /** Get pending transactions */
  getPendingTransactions(): Promise<MultisigTransaction[]>;

  /** Get transaction details */
  getTransaction(txId: string): Promise<MultisigTransaction>;

  /** Get confirmation status */
  getConfirmations(txId: string): Promise<Confirmation[]>;

  /** Add owner to multisig */
  addOwner(owner: string): Promise<string>;

  /** Remove owner from multisig */
  removeOwner(owner: string): Promise<string>;

  /** Change required confirmations */
  changeRequirement(required: number): Promise<string>;

  /** Get daily spending limit */
  getDailyLimit(): Promise<string>;

  /** Set daily spending limit */
  setDailyLimit(limit: string): Promise<string>;
}
```

#### Usage Examples

```typescript
import { MultisigManager } from '@polymathuniversata/echain-wallet/lib';

// Initialize manager
const multisigManager = new MultisigManager({
  provider: ethers.provider,
  contractAddress: '0x123...',
  signer: signer,
  approvals: {
    requiredConfirmations: 2,
    timelock: 86400, // 24 hours
    maxDailyLimit: '100' // 100 ETH
  },
  monitoring: {
    enableRealTime: true,
    pollInterval: 10000
  }
});

await multisigManager.initialize();

// Submit transaction
const txId = await multisigManager.submitTransaction({
  to: '0x456...',
  value: ethers.parseEther('1.0'),
  data: '0x'
});

// Confirm transaction
await multisigManager.confirmTransaction(txId);

// Execute if enough confirmations
const confirmations = await multisigManager.getConfirmations(txId);
if (confirmations.length >= 2) {
  await multisigManager.executeTransaction(txId);
}
```

#### Features

- **Approval Workflows**: Multi-step transaction approval process
- **Security Controls**: Timelocks, daily limits, and owner management
- **Real-time Monitoring**: Live updates on transaction status
- **Batch Operations**: Submit and confirm multiple transactions
- **Audit Trail**: Complete history of all operations

### BaseWalletManager

Manager for Base network wallet operations and integrations.

#### Constructor

```typescript
constructor(config: BaseWalletManagerConfig);
```

#### Configuration

```typescript
interface BaseWalletManagerConfig {
  /** RPC configuration */
  rpc: {
    url: string;
    chainId: number;
    blockTime: number;
  };

  /** Wallet configuration */
  wallet: {
    type: 'metamask' | 'walletconnect' | 'coinbase';
    autoConnect: boolean;
  };

  /** Gas configuration */
  gas: {
    maxFeePerGas: string;
    maxPriorityFeePerGas: string;
    gasLimitBuffer: number;
  };
}
```

#### Methods

```typescript
interface BaseWalletManager {
  /** Initialize the manager */
  initialize(): Promise<void>;

  /** Connect wallet */
  connect(options?: ConnectOptions): Promise<string>;

  /** Disconnect wallet */
  disconnect(): Promise<void>;

  /** Get wallet address */
  getAddress(): Promise<string>;

  /** Get wallet balance */
  getBalance(): Promise<string>;

  /** Send transaction */
  sendTransaction(tx: TransactionRequest): Promise<TransactionResponse>;

  /** Sign message */
  signMessage(message: string): Promise<string>;

  /** Sign typed data */
  signTypedData(data: TypedData): Promise<string>;

  /** Estimate gas */
  estimateGas(tx: TransactionRequest): Promise<string>;

  /** Get transaction receipt */
  getTransactionReceipt(hash: string): Promise<TransactionReceipt>;

  /** Switch to Base network */
  switchToBase(): Promise<void>;

  /** Add Base network to wallet */
  addBaseNetwork(): Promise<void>;
}
```

## Service Architecture

### Design Principles

1. **Singleton Pattern**: Services are typically singletons for consistent state
2. **Dependency Injection**: Services accept configuration through constructors
3. **Error Handling**: Comprehensive error handling with custom error types
4. **Observability**: Built-in logging and monitoring capabilities
5. **Testability**: Services designed for easy unit testing and mocking

### Error Handling

Services use custom error classes:

```typescript
class ServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

// Usage
try {
  await authService.login('invalid-provider');
} catch (error) {
  if (error instanceof ServiceError) {
    console.error(`Service error ${error.code}:`, error.message);
  }
}
```

### Initialization Pattern

Services follow a consistent initialization pattern:

```typescript
class ExampleService {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Initialization logic
    await this.setupConnections();
    await this.loadConfiguration();

    this.initialized = true;
  }

  private async setupConnections(): Promise<void> {
    // Setup connections
  }

  private async loadConfiguration(): Promise<void> {
    // Load config
  }
}
```

### Event System

Services include event emission for state changes:

```typescript
import { EventEmitter } from 'events';

class AuthService extends EventEmitter {
  async login(provider: string) {
    // Login logic
    this.emit('login', { user, provider });
  }
}

// Usage
authService.on('login', ({ user, provider }) => {
  console.log(`User ${user.name} logged in with ${provider}`);
});
```

### Testing

Services include comprehensive test utilities:

```typescript
import { AuthService } from '../services/AuthService';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService(mockConfig);
  });

  it('should initialize successfully', async () => {
    await expect(service.initialize()).resolves.toBeUndefined();
  });

  it('should login user', async () => {
    const user = await service.login('privy');
    expect(user).toBeDefined();
    expect(user.name).toBe('Test User');
  });
});
```

## Migration Guide

### From v0.x to v1.x

```typescript
// Old API (v0.x)
import { WalletService } from '@polymathuniversata/echain-wallet';

// New API (v1.x)
import { AuthService, HederaTransactionService } from '@polymathuniversata/echain-wallet/services';

// Migration
// Before
const walletService = new WalletService(config);

// After
const authService = new AuthService(authConfig);
const hederaService = new HederaTransactionService(hederaConfig);
```

## Support

For service-specific issues and questions:

- **Documentation**: [Service Guides](../services/)
- **GitHub Issues**: [Report Bugs](https://github.com/Emertechs-Labs/Echain/issues)
- **Discord**: [Community Support](https://discord.gg/echain)

---

*Last updated: October 23, 2025*</content>
<parameter name="filePath">e:\Polymath Universata\Projects\walletsdk\docs\api\services.md