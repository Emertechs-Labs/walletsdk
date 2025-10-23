# Security Considerations for Base Wallet Integration

## Overview

Security is paramount when building wallet integrations on Base. This guide covers essential security practices, common vulnerabilities, and best practices for secure wallet implementation.

## Core Security Principles

### 1. Never Store Private Keys
```typescript
// ❌ BAD: Never store private keys
const privateKey = '0x...'; // This is a security risk
localStorage.setItem('privateKey', privateKey);

// ✅ GOOD: Use wallet providers that handle keys securely
const signer = await walletProvider.getSigner();
```

### 2. Validate All Inputs
```typescript
// ✅ GOOD: Validate transaction parameters
const validateTransaction = (tx: any) => {
  if (!tx.to || !ethers.isAddress(tx.to)) {
    throw new Error('Invalid recipient address');
  }
  if (tx.value && tx.value < 0n) {
    throw new Error('Invalid transaction value');
  }
  if (tx.data && !ethers.isHexString(tx.data)) {
    throw new Error('Invalid transaction data');
  }
};
```

### 3. Use HTTPS Only
```typescript
// ✅ GOOD: Always use HTTPS in production
const rpcUrl = process.env.NODE_ENV === 'production'
  ? 'https://mainnet.base.org'
  : 'http://localhost:8545'; // Only for local development
```

## Wallet Security

### Private Key Management

#### Hardware Wallet Integration
```typescript
import { LedgerConnector } from '@wagmi/core/connectors/ledger';

const ledgerConnector = new LedgerConnector({
  chains: [base],
  options: {
    projectId: 'your-project-id',
  },
});
```

#### Key Derivation Security
```typescript
import { HDNodeWallet } from 'ethers';

// ✅ GOOD: Use secure entropy for wallet generation
const entropy = crypto.getRandomValues(new Uint8Array(32));
const wallet = HDNodeWallet.fromEntropy(entropy);

// ❌ BAD: Weak entropy generation
const weakWallet = HDNodeWallet.fromPhrase('weak password');
```

### Smart Wallet Security

#### Account Abstraction Security
```typescript
// Validate user operations before signing
const validateUserOperation = (userOp: UserOperation) => {
  // Check sender address
  if (!ethers.isAddress(userOp.sender)) {
    throw new Error('Invalid sender address');
  }

  // Validate call data
  if (userOp.callData && userOp.callData.length > 0) {
    try {
      // Attempt to decode call data
      const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
        ['address', 'uint256', 'bytes'],
        userOp.callData
      );
    } catch {
      throw new Error('Invalid call data');
    }
  }

  // Check gas limits
  if (userOp.callGasLimit > 10000000n) { // 10M gas limit
    throw new Error('Gas limit too high');
  }
};
```

#### Paymaster Security
```typescript
// Validate paymaster sponsorship
const validatePaymaster = async (userOp: UserOperation, paymasterAddress: string) => {
  // Check if paymaster is trusted
  const trustedPaymasters = [
    '0x...', // Coinbase paymaster
    '0x...', // Your trusted paymaster
  ];

  if (!trustedPaymasters.includes(paymasterAddress)) {
    throw new Error('Untrusted paymaster');
  }

  // Verify paymaster can sponsor the transaction
  const paymasterBalance = await provider.getBalance(paymasterAddress);
  const estimatedCost = await estimateUserOpCost(userOp);

  if (paymasterBalance < estimatedCost) {
    throw new Error('Paymaster insufficient balance');
  }
};
```

## Transaction Security

### Transaction Validation
```typescript
const validateAndSendTransaction = async (tx: TransactionRequest) => {
  // 1. Validate addresses
  if (!ethers.isAddress(tx.to)) {
    throw new Error('Invalid recipient address');
  }

  // 2. Check balance
  const balance = await provider.getBalance(tx.from || signer.address);
  const estimatedGas = await provider.estimateGas(tx);
  const gasCost = estimatedGas * tx.gasPrice;

  if (balance < (tx.value || 0n) + gasCost) {
    throw new Error('Insufficient balance');
  }

  // 3. Simulate transaction
  try {
    await provider.call(tx);
  } catch (error) {
    throw new Error(`Transaction simulation failed: ${error.message}`);
  }

  // 4. Send transaction
  const txResponse = await signer.sendTransaction(tx);

  // 5. Wait for confirmation
  const receipt = await txResponse.wait();

  return receipt;
};
```

### Gas Security
```typescript
// Secure gas estimation
const getSecureGasEstimate = async (tx: TransactionRequest) => {
  const gasEstimate = await provider.estimateGas(tx);

  // Add buffer for gas spikes
  const gasBuffer = gasEstimate * 120n / 100n; // 20% buffer

  // Cap maximum gas limit
  const maxGasLimit = 5000000n; // 5M gas
  const secureGasLimit = gasBuffer > maxGasLimit ? maxGasLimit : gasBuffer;

  return secureGasLimit;
};

// Secure gas price
const getSecureGasPrice = async () => {
  const feeData = await provider.getFeeData();

  // Use EIP-1559 fees when available
  if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
    return {
      maxFeePerGas: feeData.maxFeePerGas * 120n / 100n, // 20% buffer
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
    };
  }

  // Fallback to legacy gas price
  return {
    gasPrice: feeData.gasPrice * 120n / 100n,
  };
};
```

## API Security

### RPC Endpoint Security
```typescript
// Use authenticated RPC endpoints when available
const secureRpcConfig = {
  url: 'https://mainnet.base.org',
  headers: {
    'Authorization': `Bearer ${process.env.RPC_API_KEY}`,
  },
};

// Rate limiting
const rateLimiter = new Map();

const checkRateLimit = (userId: string) => {
  const now = Date.now();
  const userRequests = rateLimiter.get(userId) || [];

  // Keep only requests from last hour
  const recentRequests = userRequests.filter(time => now - time < 3600000);

  if (recentRequests.length >= 100) { // 100 requests per hour
    throw new Error('Rate limit exceeded');
  }

  recentRequests.push(now);
  rateLimiter.set(userId, recentRequests);
};
```

### API Key Management
```typescript
// Secure API key storage
const apiKeys = {
  coinbase: process.env.COINBASE_API_KEY,
  onchainkit: process.env.ONCHAINKIT_API_KEY,
  walletconnect: process.env.WALLETCONNECT_PROJECT_ID,
};

// Validate API keys on startup
const validateApiKeys = () => {
  const requiredKeys = ['coinbase', 'onchainkit', 'walletconnect'];

  for (const key of requiredKeys) {
    if (!apiKeys[key]) {
      throw new Error(`Missing required API key: ${key}`);
    }
  }
};
```

## Frontend Security

### Content Security Policy (CSP)
```html
<!-- Add CSP headers -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://mainnet.base.org;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://mainnet.base.org https://api.coinbase.com;
">
```

### Secure Local Storage
```typescript
// Encrypt sensitive data before storing
import CryptoJS from 'crypto-js';

const encryptData = (data: string, key: string) => {
  return CryptoJS.AES.encrypt(data, key).toString();
};

const decryptData = (encryptedData: string, key: string) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// ✅ GOOD: Store encrypted preferences only
const storeUserPreferences = (preferences: any) => {
  const encrypted = encryptData(JSON.stringify(preferences), userKey);
  localStorage.setItem('userPreferences', encrypted);
};

// ❌ BAD: Never store sensitive wallet data
// localStorage.setItem('privateKey', privateKey);
```

### Input Sanitization
```typescript
// Sanitize user inputs
const sanitizeAddress = (address: string) => {
  if (!address || typeof address !== 'string') {
    throw new Error('Invalid address input');
  }

  // Remove whitespace and convert to lowercase
  const cleanAddress = address.trim().toLowerCase();

  // Validate Ethereum address format
  if (!ethers.isAddress(cleanAddress)) {
    throw new Error('Invalid Ethereum address');
  }

  return cleanAddress;
};

const sanitizeAmount = (amount: string) => {
  const numAmount = parseFloat(amount);

  if (isNaN(numAmount) || numAmount <= 0) {
    throw new Error('Invalid amount');
  }

  // Convert to wei with proper decimal handling
  return ethers.parseEther(numAmount.toString());
};
```

## Smart Contract Security

### Contract Address Validation
```typescript
// Whitelist of trusted contracts
const TRUSTED_CONTRACTS = new Set([
  '0x...', // Your deployed contracts
  '0x4200000000000000000000000000000000000006', // WETH on Base
  '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base
]);

const validateContractAddress = (address: string) => {
  if (!TRUSTED_CONTRACTS.has(address.toLowerCase())) {
    throw new Error('Contract address not in whitelist');
  }
};
```

### Function Signature Validation
```typescript
// Validate function calls
const validateFunctionCall = (contractAddress: string, functionName: string, params: any[]) => {
  validateContractAddress(contractAddress);

  // Whitelist of allowed functions
  const ALLOWED_FUNCTIONS = {
    '0x...': ['transfer', 'approve', 'swap'],
  };

  const allowedFunctions = ALLOWED_FUNCTIONS[contractAddress];
  if (!allowedFunctions || !allowedFunctions.includes(functionName)) {
    throw new Error(`Function ${functionName} not allowed for contract ${contractAddress}`);
  }

  // Validate parameters based on function
  switch (functionName) {
    case 'transfer':
      if (!ethers.isAddress(params[0]) || typeof params[1] !== 'bigint') {
        throw new Error('Invalid transfer parameters');
      }
      break;
    // Add validation for other functions
  }
};
```

## Session Management

### Secure Session Handling
```typescript
// Implement secure session management
class SecureSession {
  private sessionKey: string;
  private expiry: number;

  constructor() {
    this.sessionKey = this.generateSessionKey();
    this.expiry = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
  }

  private generateSessionKey(): string {
    return crypto.getRandomValues(new Uint8Array(32))
      .reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '');
  }

  isValid(): boolean {
    return Date.now() < this.expiry;
  }

  getKey(): string {
    if (!this.isValid()) {
      throw new Error('Session expired');
    }
    return this.sessionKey;
  }

  renew(): void {
    this.expiry = Date.now() + (24 * 60 * 60 * 1000);
  }
}
```

## Error Handling Security

### Secure Error Messages
```typescript
// Don't leak sensitive information in errors
const handleError = (error: any) => {
  // Log full error internally
  console.error('Internal error:', error);

  // Return sanitized error to user
  if (error.code === 'INSUFFICIENT_FUNDS') {
    return 'Insufficient balance for transaction';
  } else if (error.code === 'INVALID_ADDRESS') {
    return 'Invalid recipient address';
  } else {
    return 'Transaction failed. Please try again.';
  }
};
```

## Monitoring and Auditing

### Transaction Monitoring
```typescript
// Monitor all transactions
const monitorTransaction = async (txHash: string, userId: string) => {
  try {
    const receipt = await provider.waitForTransaction(txHash);

    // Log successful transaction
    await logEvent('transaction_success', {
      txHash,
      userId,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed,
    });

    // Check for suspicious activity
    if (receipt.gasUsed > 500000n) {
      await alertSecurityTeam('high_gas_transaction', { txHash, userId });
    }

  } catch (error) {
    // Log failed transaction
    await logEvent('transaction_failed', {
      txHash,
      userId,
      error: error.message,
    });
  }
};
```

### Security Audits
```typescript
// Regular security checks
const runSecurityAudit = async () => {
  const issues = [];

  // Check for exposed API keys
  if (process.env.COINBASE_API_KEY?.startsWith('sk-')) {
    issues.push('API key may be exposed');
  }

  // Check contract balances
  const contracts = await getDeployedContracts();
  for (const contract of contracts) {
    const balance = await provider.getBalance(contract.address);
    if (balance > ethers.parseEther('100')) {
      issues.push(`Contract ${contract.address} has high balance: ${ethers.formatEther(balance)} ETH`);
    }
  }

  // Check user permissions
  const users = await getAllUsers();
  for (const user of users) {
    if (user.role === 'admin' && !user.twoFactorEnabled) {
      issues.push(`Admin user ${user.id} missing 2FA`);
    }
  }

  return issues;
};
```

## Compliance Considerations

### KYC/AML Integration
```typescript
// Integrate with compliance services
const checkCompliance = async (userId: string, transaction: any) => {
  // Check user's KYC status
  const kycStatus = await getKycStatus(userId);
  if (!kycStatus.verified) {
    throw new Error('KYC verification required');
  }

  // Check transaction against AML rules
  const amlResult = await checkAmlRules(transaction);
  if (amlResult.flagged) {
    await reportSuspiciousActivity(userId, transaction, amlResult.reasons);
    throw new Error('Transaction flagged for review');
  }
};
```

### Geographic Restrictions
```typescript
// Implement geographic restrictions if required
const checkGeoRestrictions = async (userId: string) => {
  const userLocation = await getUserLocation(userId);
  const restrictedCountries = ['CU', 'IR', 'KP', 'SY']; // Example restricted countries

  if (restrictedCountries.includes(userLocation.country)) {
    throw new Error('Service not available in your region');
  }
};
```

## Incident Response

### Security Incident Plan
```typescript
const handleSecurityIncident = async (incident: SecurityIncident) => {
  // 1. Isolate affected systems
  await isolateAffectedSystems(incident.affectedSystems);

  // 2. Notify security team
  await notifySecurityTeam(incident);

  // 3. Assess damage
  const assessment = await assessIncidentImpact(incident);

  // 4. Communicate with users if necessary
  if (assessment.userImpact) {
    await notifyAffectedUsers(assessment);
  }

  // 5. Implement fixes
  await implementSecurityFixes(assessment.recommendations);

  // 6. Document incident
  await documentIncident(incident, assessment);
};
```

## Best Practices Summary

### Development
- Use TypeScript for type safety
- Implement comprehensive input validation
- Follow principle of least privilege
- Regular security code reviews

### Deployment
- Use HTTPS everywhere
- Implement proper CORS policies
- Regular dependency updates
- Automated security scanning

### Monitoring
- Log security events
- Monitor for suspicious activity
- Regular security audits
- Incident response planning

### User Education
- Clear security warnings
- Best practices guidance
- Recovery options
- Support channels

## Resources

- [OWASP Web3 Security](https://owasp.org/www-project-web3-top-10/)
- [Ethereum Security Best Practices](https://consensys.github.io/smart-contract-best-practices/)
- [Coinbase Security Guidelines](https://docs.cdp.coinbase.com/security/)
- [Base Security Documentation](https://docs.base.org/docs/security/)

---

*Last updated: October 23, 2025*</content>
<parameter name="filePath">e:\Polymath Universata\Projects\walletsdk\docs\base-docs\security-considerations.md