# Smart Wallets & Account Abstraction on Base

## Overview

Base supports advanced account abstraction features through smart wallets, enabling gasless transactions, batch operations, social recovery, and enhanced user experiences. This guide covers implementing smart wallets on Base using Coinbase's infrastructure.

## What is Account Abstraction?

Account abstraction allows users to use smart contracts as their accounts instead of externally owned accounts (EOAs). This enables:

- **Gasless Transactions**: Pay fees in ERC-20 tokens
- **Batch Transactions**: Execute multiple actions in one transaction
- **Social Recovery**: Recover accounts without seed phrases
- **Enhanced Security**: Multi-signature and time-locked operations

## Coinbase Smart Wallet

### Overview
Coinbase Smart Wallet provides a seamless account abstraction experience with built-in features for Base.

### Setup
```typescript
import { coinbaseWallet } from '@rainbow-me/rainbowkit/wallets';

const smartWallet = coinbaseWallet({
  appName: 'Your App Name',
  preference: 'smartWalletOnly', // Forces smart wallet usage
});
```

### Features
- **Automatic Account Creation**: No manual setup required
- **Gasless Transactions**: Sponsored by Coinbase
- **Cross-Device Sync**: Seamless experience across devices
- **Enhanced Security**: Advanced key management

## AgentKit Smart Wallet Provider

### Configuration
```typescript
import { CdpSmartWalletProvider } from '@coinbase/agentkit';

const smartWalletProvider = await CdpSmartWalletProvider.configureWithWallet({
  apiKeyId: process.env.CDP_API_KEY_ID!,
  apiKeySecret: process.env.CDP_API_KEY_SECRET!,
  networkId: 'base-mainnet',
  walletSecret: process.env.CDP_WALLET_SECRET,
  owner: 'owner-private-key-or-address',
  idempotencyKey: 'unique-smart-wallet-key', // Optional
});
```

### Using Existing Smart Wallet
```typescript
const smartWalletProvider = await CdpSmartWalletProvider.configureWithWallet({
  apiKeyId: process.env.CDP_API_KEY_ID!,
  apiKeySecret: process.env.CDP_API_KEY_SECRET!,
  networkId: 'base-mainnet',
  walletSecret: process.env.CDP_WALLET_SECRET,
  address: '0x...', // Existing smart wallet address
});
```

## ZeroDev Integration

### Overview
ZeroDev provides powerful account abstraction tools with support for Base.

### Setup
```typescript
import { ZeroDevWalletProvider } from '@coinbase/agentkit';

const zeroDevProvider = await ZeroDevWalletProvider.configureWithWallet({
  signer: evmWalletProvider.toSigner(),
  projectId: process.env.ZERODEV_PROJECT_ID!,
  entryPointVersion: '0.7',
  networkId: 'base-mainnet',
});
```

### Features
- **Kernel Accounts**: ERC-4337 compliant smart accounts
- **Session Keys**: Temporary permissions for dApps
- **Multi-Sig**: Advanced signature schemes
- **Paymasters**: Gas abstraction services

## ERC-4337 Implementation

### Account Abstraction Stack
Base supports the full ERC-4337 account abstraction stack:

1. **User Operations**: Pseudo-transactions that users sign
2. **Entry Point**: Smart contract that executes user operations
3. **Account Contracts**: Smart contract wallets
4. **Paymasters**: Contracts that can sponsor gas fees

### Basic User Operation
```typescript
import { encodeFunctionData } from 'viem';

const userOp = {
  sender: '0x...', // Smart account address
  nonce: 0n,
  initCode: '0x', // Empty if account already deployed
  callData: encodeFunctionData({
    abi: erc20Abi,
    functionName: 'transfer',
    args: ['0x...', 1000000n], // recipient, amount
  }),
  callGasLimit: 100000n,
  verificationGasLimit: 100000n,
  preVerificationGas: 21000n,
  maxFeePerGas: 1000000000n,
  maxPriorityFeePerGas: 1000000000n,
  paymasterAndData: '0x', // Empty for self-paying
  signature: '0x',
};
```

### Bundler Integration
```typescript
import { createBundlerClient } from 'viem/account-abstraction';

// Connect to a bundler (e.g., Coinbase's bundler)
const bundlerClient = createBundlerClient({
  transport: http('https://api.coinbase.com/v1/bundler'),
  entryPoint: {
    address: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789', // ERC-4337 Entry Point
    version: '0.7',
  },
});

// Send user operation
const userOpHash = await bundlerClient.sendUserOperation({
  userOp,
  entryPoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
});
```

## Paymasters

### Coinbase Paymaster
Coinbase provides a paymaster service for sponsoring transactions on Base.

```typescript
const paymasterUrl = 'https://api.coinbase.com/v1/paymaster';

// Get paymaster data
const paymasterData = await fetch(paymasterUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.COINBASE_PAYMASTER_TOKEN}`,
  },
  body: JSON.stringify({
    userOp: userOp,
    entryPoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
  }),
});

const { paymasterAndData } = await paymasterData.json();

// Update user operation
userOp.paymasterAndData = paymasterAndData;
```

### Custom Paymaster Implementation
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@account-abstraction/contracts/core/BasePaymaster.sol";

contract CustomPaymaster is BasePaymaster {
    mapping(address => uint256) public balances;

    function validatePaymasterUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 maxCost
    ) external override returns (bytes memory context, uint256 validationData) {
        // Custom validation logic
        address user = address(uint160(userOp.sender));

        if (balances[user] < maxCost) {
            return ("", SIG_VALIDATION_FAILED);
        }

        return ("", SIG_VALIDATION_SUCCESS);
    }

    function deposit(address user) external payable {
        balances[user] += msg.value;
    }
}
```

## Batch Transactions

### Multiple Operations in One Transaction
```typescript
import { encodeFunctionData, encodeAbiParameters } from 'viem';

// Multiple transfers
const transfer1 = encodeFunctionData({
  abi: erc20Abi,
  functionName: 'transfer',
  args: ['0x...', 1000000n],
});

const transfer2 = encodeFunctionData({
  abi: erc20Abi,
  functionName: 'transfer',
  args: ['0x...', 2000000n],
});

// Batch execute
const batchCall = encodeFunctionData({
  abi: [{
    inputs: [{ name: 'calls', type: 'bytes[]' }],
    name: 'executeBatch',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  }],
  functionName: 'executeBatch',
  args: [[transfer1, transfer2]],
});

const userOp = {
  // ... other fields
  callData: batchCall,
};
```

## Social Recovery

### Recovery Mechanism Setup
```solidity
contract RecoverableAccount {
    address[] public guardians;
    uint256 public recoveryThreshold;
    mapping(address => bool) public recoveryRequests;

    function setupRecovery(
        address[] calldata _guardians,
        uint256 _threshold
    ) external onlyOwner {
        guardians = _guardians;
        recoveryThreshold = _threshold;
    }

    function initiateRecovery(address newOwner) external {
        require(isGuardian(msg.sender), "Not a guardian");

        recoveryRequests[newOwner] = true;

        // Check if threshold met
        if (countRecoveryRequests(newOwner) >= recoveryThreshold) {
            _transferOwnership(newOwner);
        }
    }
}
```

### Recovery with AgentKit
```typescript
import { setupSocialRecovery } from '@coinbase/agentkit';

const recoveryTx = await setupSocialRecovery(smartWalletProvider, {
  guardians: ['0x...', '0x...', '0x...'], // Guardian addresses
  threshold: 2, // Require 2 out of 3 guardians
  recoveryDelay: 86400, // 24 hours delay
});
```

## Session Keys

### Temporary Permissions
Session keys allow dApps to perform actions on behalf of users without requiring constant signatures.

```typescript
import { createSessionKey } from '@zerodev/sdk';

const sessionKey = createSessionKey({
  signer: userSigner,
  sessionKeyAddress: '0x...', // Generated session key
  permissions: [{
    target: '0x...', // Contract address
    functionSelector: '0xa9059cbb', // transfer function
    valueLimit: 1000000000000000000n, // 1 ETH limit
    expiry: Math.floor(Date.now() / 1000) + 3600, // 1 hour
  }],
});
```

## Multi-Signature Wallets

### Gnosis Safe Integration
```typescript
import { getSafeContract } from '@gnosis.pm/safe-contracts';

const safeContract = getSafeContract({
  ethAdapter,
  safeAddress: '0x...',
});

// Execute transaction with multiple signatures
const safeTransaction = await safeContract.createTransaction({
  to: '0x...',
  value: '1000000000000000000',
  data: '0x',
});

const signatures = await collectSignatures(safeTransaction, signers);

await safeContract.executeTransaction(
  safeTransaction,
  signatures
);
```

## Gas Optimization

### Sponsored Transactions
```typescript
// Using Coinbase's gas station
const gasSponsoredTx = await smartWalletProvider.sendTransaction({
  to: '0x...',
  value: '0.1',
  sponsored: true, // Enable gas sponsorship
});
```

### Gas Estimation for User Operations
```typescript
const gasEstimate = await bundlerClient.estimateUserOperationGas({
  userOp: {
    ...userOp,
    signature: '0x', // Dummy signature for estimation
  },
  entryPoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
});

userOp.callGasLimit = gasEstimate.callGasLimit;
userOp.verificationGasLimit = gasEstimate.verificationGasLimit;
userOp.preVerificationGas = gasEstimate.preVerificationGas;
```

## Security Considerations

### Smart Account Security
- **Owner Validation**: Always validate owner permissions
- **Replay Protection**: Use nonces to prevent replay attacks
- **Access Control**: Implement proper role-based access
- **Upgradeability**: Plan for contract upgrades

### Paymaster Security
- **Sponsorship Limits**: Set maximum sponsorship amounts
- **Rate Limiting**: Prevent abuse of sponsored transactions
- **Verification**: Validate user operations before sponsorship

### Session Key Security
- **Limited Permissions**: Grant minimal required permissions
- **Time Bounds**: Set appropriate expiration times
- **Revocation**: Allow users to revoke session keys

## Testing Smart Wallets

### Unit Testing
```typescript
describe('Smart Wallet', () => {
  test('should create user operation', async () => {
    const userOp = createUserOperation({
      to: '0x...',
      value: '0.1',
    });

    expect(userOp.sender).toBeDefined();
    expect(userOp.callData).toBeDefined();
  });

  test('should estimate gas correctly', async () => {
    const estimate = await estimateUserOpGas(userOp);
    expect(estimate.callGasLimit).toBeGreaterThan(0n);
  });
});
```

### Integration Testing
```typescript
describe('Smart Wallet Integration', () => {
  test('should execute batch transaction', async () => {
    const batchTx = await executeBatch(walletProvider, [
      { to: '0x...', value: '0.01' },
      { to: '0x...', value: '0.02' },
    ]);

    expect(batchTx.success).toBe(true);
    expect(batchTx.hash).toBeDefined();
  });
});
```

## Deployment and Monitoring

### Contract Deployment
```typescript
import { deployContract } from '@coinbase/agentkit';

const deployment = await deployContract(walletProvider, {
  bytecode: smartAccountBytecode,
  abi: smartAccountAbi,
  constructorArgs: [entryPointAddress, ownerAddress],
});
```

### Event Monitoring
```typescript
import { createPublicClient } from 'viem';

const client = createPublicClient({
  transport: http('https://mainnet.base.org'),
});

// Monitor user operation events
const unwatch = client.watchContractEvent({
  address: entryPointAddress,
  event: parseAbiItem('event UserOperationEvent(bytes32 indexed userOpHash, address indexed sender, address indexed paymaster, uint256 nonce, bool success, uint256 actualGasCost, uint256 actualGasUsed)'),
  onLogs: (logs) => {
    logs.forEach((log) => {
      console.log('User operation executed:', log.args);
    });
  },
});
```

## Best Practices

### User Experience
- **Clear Communication**: Explain gasless transactions to users
- **Fallback Options**: Provide EOA fallback for advanced users
- **Progress Indicators**: Show transaction progress clearly

### Development
- **Modular Design**: Separate account logic from application logic
- **Comprehensive Testing**: Test all account abstraction features
- **Security Audits**: Audit smart contracts and account logic

### Performance
- **Gas Optimization**: Minimize gas costs for user operations
- **Batch Operations**: Combine multiple actions when possible
- **Caching**: Cache account state to reduce RPC calls

## Troubleshooting

### Common Issues

**Account Not Deployed:**
- Check if account has sufficient balance for deployment
- Verify entry point contract address
- Ensure init code is correct

**Transaction Reverts:**
- Check user operation parameters
- Verify contract addresses and function signatures
- Review gas limits and paymaster settings

**Paymaster Errors:**
- Confirm paymaster has sufficient balance
- Check paymaster validation logic
- Verify paymaster contract is approved

## Resources

- [ERC-4337 Specification](https://eips.ethereum.org/EIPS/eip-4337)
- [Base Account Abstraction Docs](https://docs.base.org/learn/onchain-app-development/account-abstraction/)
- [Coinbase Smart Wallet](https://www.coinbase.com/wallet/smart-wallet)
- [ZeroDev Documentation](https://docs.zerodev.app/)
- [Gnosis Safe](https://safe.global/)

---

*Last updated: October 23, 2025*</content>
<parameter name="filePath">e:\Polymath Universata\Projects\walletsdk\docs\base-docs\smart-wallets-account-abstraction.md