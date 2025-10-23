# Troubleshooting Guide for Base Wallet Integration

## Overview

This guide helps you diagnose and resolve common issues when integrating wallets with Base. Each section covers specific problem areas with step-by-step solutions.

## Connection Issues

### Wallet Not Connecting

**Symptoms:**
- Connect button doesn't respond
- Modal opens but no wallets appear
- "Connection failed" error

**Solutions:**

#### 1. Check Browser Compatibility
```typescript
// Check if wallet is available
const checkWalletAvailability = () => {
  const { ethereum } = window as any;

  if (!ethereum) {
    console.error('No Ethereum wallet detected');
    return false;
  }

  // Check for Coinbase Wallet
  if (ethereum.isCoinbaseWallet) {
    console.log('Coinbase Wallet detected');
    return true;
  }

  // Check for MetaMask
  if (ethereum.isMetaMask) {
    console.log('MetaMask detected');
    return true;
  }

  console.warn('Unknown wallet detected');
  return true;
};
```

#### 2. Verify Network Configuration
```typescript
// Check current network
const checkNetwork = async () => {
  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    const chainIdNum = parseInt(chainId, 16);

    console.log('Current chain ID:', chainIdNum);

    // Base mainnet: 8453
    // Base Sepolia: 84532
    if (chainIdNum === 8453) {
      console.log('Connected to Base mainnet');
    } else if (chainIdNum === 84532) {
      console.log('Connected to Base Sepolia');
    } else {
      console.warn('Not connected to Base network');
    }
  } catch (error) {
    console.error('Failed to get chain ID:', error);
  }
};
```

#### 3. Handle Connection Errors
```typescript
const connectWallet = async (connector: any) => {
  try {
    await connector.connect();
    console.log('Wallet connected successfully');
  } catch (error: any) {
    console.error('Connection failed:', error);

    // Handle specific error types
    if (error.code === 4001) {
      // User rejected connection
      alert('Please approve the connection in your wallet');
    } else if (error.code === -32002) {
      // Request already pending
      alert('Connection request already pending. Check your wallet.');
    } else {
      alert(`Connection failed: ${error.message}`);
    }
  }
};
```

### Network Switching Issues

**Symptoms:**
- Network switch fails
- Wrong network selected
- "Network not added" error

**Solutions:**

#### 1. Add Base Network to Wallet
```typescript
const addBaseNetwork = async () => {
  const baseMainnet = {
    chainId: '0x2105', // 8453 in hex
    chainName: 'Base',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://mainnet.base.org'],
    blockExplorerUrls: ['https://basescan.org'],
  };

  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [baseMainnet],
    });
    console.log('Base network added successfully');
  } catch (error: any) {
    console.error('Failed to add Base network:', error);
  }
};
```

#### 2. Switch to Base Network
```typescript
const switchToBase = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x2105' }], // Base mainnet
    });
    console.log('Switched to Base network');
  } catch (error: any) {
    // Network not added to wallet
    if (error.code === 4902) {
      console.log('Base network not added, adding now...');
      await addBaseNetwork();
    } else {
      console.error('Failed to switch network:', error);
    }
  }
};
```

## Transaction Issues

### Transaction Not Sending

**Symptoms:**
- Transaction stuck in pending
- "Insufficient funds" error
- Gas estimation fails

**Solutions:**

#### 1. Check Account Balance
```typescript
const checkBalance = async (address: string) => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(address);
    const balanceInEth = ethers.utils.formatEther(balance);

    console.log(`Balance: ${balanceInEth} ETH`);

    if (balance.lt(ethers.utils.parseEther('0.001'))) {
      alert('Insufficient balance. Please add funds to your wallet.');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to check balance:', error);
    return false;
  }
};
```

#### 2. Fix Gas Estimation Issues
```typescript
const sendTransactionWithRetry = async (tx: any, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // Get current gas price
      const feeData = await provider.getFeeData();

      // Estimate gas with buffer
      const gasEstimate = await provider.estimateGas(tx);
      const gasLimit = gasEstimate.mul(120).div(100); // 20% buffer

      const txWithGas = {
        ...tx,
        gasLimit,
        maxFeePerGas: feeData.maxFeePerGas || feeData.gasPrice,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || ethers.utils.parseUnits('2', 'gwei'),
      };

      const txResponse = await signer.sendTransaction(txWithGas);
      console.log(`Transaction sent: ${txResponse.hash}`);

      return txResponse;
    } catch (error: any) {
      console.error(`Attempt ${attempt} failed:`, error);

      if (attempt === maxRetries) {
        throw error;
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
};
```

#### 3. Handle Pending Transactions
```typescript
const checkPendingTransaction = async (txHash: string) => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const tx = await provider.getTransaction(txHash);

    if (!tx) {
      console.log('Transaction not found');
      return null;
    }

    if (tx.blockNumber) {
      console.log(`Transaction confirmed in block ${tx.blockNumber}`);
      return tx;
    } else {
      console.log('Transaction still pending');

      // Wait for confirmation
      const receipt = await provider.waitForTransaction(txHash);
      console.log('Transaction confirmed:', receipt);
      return receipt;
    }
  } catch (error) {
    console.error('Failed to check transaction:', error);
    return null;
  }
};
```

### Smart Wallet Issues

**Symptoms:**
- Smart wallet deployment fails
- User operations rejected
- Paymaster errors

**Solutions:**

#### 1. Debug Smart Wallet Deployment
```typescript
const debugSmartWalletDeployment = async (smartWallet: any) => {
  try {
    console.log('Smart wallet address:', smartWallet.address);
    console.log('Is deployed:', smartWallet.isDeployed);

    if (!smartWallet.isDeployed) {
      console.log('Deploying smart wallet...');

      const deployTx = await smartWallet.deploy();
      console.log('Deployment transaction:', deployTx.hash);

      const receipt = await deployTx.wait();
      console.log('Deployment confirmed:', receipt);

      return receipt;
    }
  } catch (error: any) {
    console.error('Smart wallet deployment failed:', error);

    // Check common issues
    if (error.message.includes('insufficient funds')) {
      console.error('Owner account has insufficient funds for deployment');
    } else if (error.message.includes('nonce')) {
      console.error('Nonce issue - try resetting account');
    }

    throw error;
  }
};
```

#### 2. Fix User Operation Issues
```typescript
const debugUserOperation = async (userOp: any, entryPoint: any) => {
  try {
    // Validate user operation
    const validationResult = await entryPoint.callStatic.simulateValidation(userOp);

    if (validationResult.success) {
      console.log('User operation validation passed');
    } else {
      console.error('User operation validation failed:', validationResult.returnInfo);
    }

    // Estimate gas
    const gasEstimate = await entryPoint.callStatic.simulateHandleOp(userOp, ethers.constants.AddressZero, '0x');

    console.log('Gas estimate:', gasEstimate);

    return validationResult;
  } catch (error: any) {
    console.error('User operation debug failed:', error);

    // Parse error details
    if (error.errorName === 'ValidationResult') {
      console.error('Validation error:', error.errorArgs);
    } else if (error.errorName === 'ExecutionResult') {
      console.error('Execution error:', error.errorArgs);
    }

    throw error;
  }
};
```

#### 3. Handle Paymaster Issues
```typescript
const debugPaymaster = async (userOp: any, paymasterAddress: string) => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    // Check paymaster balance
    const paymasterBalance = await provider.getBalance(paymasterAddress);
    console.log('Paymaster balance:', ethers.utils.formatEther(paymasterBalance));

    // Check paymaster contract
    const paymasterContract = new ethers.Contract(
      paymasterAddress,
      ['function verifyPaymasterUserOp((bytes32,uint256,uint256,uint256,uint256,address,address,uint256,bytes,bytes) userOp, bytes32 userOpHash, uint256 maxCost) external view returns (bytes memory context, uint256 validationData)'],
      provider
    );

    const userOpHash = await getUserOpHash(userOp);
    const maxCost = ethers.utils.parseEther('0.1'); // Example max cost

    const result = await paymasterContract.callStatic.verifyPaymasterUserOp(
      userOp,
      userOpHash,
      maxCost
    );

    console.log('Paymaster verification result:', result);

    return result;
  } catch (error: any) {
    console.error('Paymaster debug failed:', error);
    throw error;
  }
};
```

## OnchainKit Issues

### Component Not Rendering

**Symptoms:**
- OnchainKit components don't appear
- Console errors about missing providers
- Styling issues

**Solutions:**

#### 1. Check Provider Setup
```typescript
// Ensure proper provider hierarchy
const App = () => {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <OnchainKitProvider
            apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
            chain={base}
          >
            {/* Your app components */}
          </OnchainKitProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
```

#### 2. Verify API Key Configuration
```typescript
const checkOnchainKitConfig = () => {
  const apiKey = process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY;

  if (!apiKey) {
    console.error('Missing OnchainKit API key');
    return false;
  }

  if (!apiKey.startsWith('key_')) {
    console.error('Invalid OnchainKit API key format');
    return false;
  }

  console.log('OnchainKit API key configured correctly');
  return true;
};
```

#### 3. Debug Component Issues
```typescript
// Add error boundaries
class OnchainKitErrorBoundary extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('OnchainKit error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h3>OnchainKit Error</h3>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### AgentKit Issues

**Symptoms:**
- Agent actions fail
- Wallet interactions don't work
- Authentication errors

**Solutions:**

#### 1. Check Agent Configuration
```typescript
const debugAgentKit = async () => {
  try {
    const agent = new AgentKit({
      apiKey: process.env.AGENTKIT_API_KEY,
      wallet: signer,
      chain: base,
    });

    console.log('AgentKit initialized successfully');

    // Test basic functionality
    const balance = await agent.getBalance();
    console.log('Agent balance:', balance);

    return agent;
  } catch (error: any) {
    console.error('AgentKit initialization failed:', error);

    if (error.message.includes('API key')) {
      console.error('Check your AgentKit API key');
    } else if (error.message.includes('wallet')) {
      console.error('Wallet not properly configured');
    }

    throw error;
  }
};
```

#### 2. Handle Agent Actions
```typescript
const executeAgentAction = async (agent: any, action: string, params: any) => {
  try {
    console.log(`Executing agent action: ${action}`, params);

    const result = await agent.execute(action, params);

    console.log('Agent action result:', result);
    return result;
  } catch (error: any) {
    console.error(`Agent action ${action} failed:`, error);

    // Handle specific action errors
    if (action === 'swap' && error.message.includes('insufficient')) {
      console.error('Insufficient funds for swap');
    } else if (action === 'bridge' && error.message.includes('network')) {
      console.error('Network not supported for bridging');
    }

    throw error;
  }
};
```

## Common Error Codes

### Ethereum RPC Errors

| Error Code | Description | Solution |
|------------|-------------|----------|
| 4001 | User rejected request | Ask user to approve in wallet |
| -32002 | Request already pending | Wait for existing request to complete |
| -32005 | Request rate limited | Implement retry with backoff |
| -32603 | Internal error | Check RPC endpoint and try again |
| 4902 | Chain not added | Add the chain to wallet first |

### Base-Specific Errors

| Error | Description | Solution |
|-------|-------------|----------|
| CALL_EXCEPTION | Contract call failed | Check contract address and method signature |
| INSUFFICIENT_FUNDS | Not enough ETH | Add funds to wallet |
| NETWORK_ERROR | Network connectivity issue | Check internet connection and RPC endpoint |
| NONCE_TOO_LOW | Incorrect nonce | Reset account in wallet or wait for pending tx |

## Debugging Tools

### Browser Developer Tools

#### Console Logging
```typescript
// Enable verbose logging
localStorage.setItem('debug', 'wagmi:*');
localStorage.setItem('debug', 'rainbowkit:*');

// Custom logging utility
const logger = {
  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[WalletSDK] ${message}`, ...args);
    }
  },
  info: (message: string, ...args: any[]) => {
    console.info(`[WalletSDK] ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WalletSDK] ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[WalletSDK] ${message}`, ...args);
  },
};
```

#### Network Tab Analysis
- Check for failed RPC requests
- Verify API endpoints are correct
- Monitor request/response sizes

#### Application Tab
- Inspect local storage for wallet data
- Check service workers
- Verify indexedDB for persistent data

### External Debugging Tools

#### Tenderly Debugger
```typescript
// Add Tenderly for transaction debugging
const tenderlyConfig = {
  project: 'your-project',
  username: 'your-username',
};

const debugWithTenderly = async (txHash: string) => {
  const tenderlyUrl = `https://dashboard.tenderly.co/${tenderlyConfig.username}/${tenderlyConfig.project}/simulator/${txHash}`;
  console.log('Debug transaction at:', tenderlyUrl);
  window.open(tenderlyUrl, '_blank');
};
```

#### Etherscan/BaseScan
```typescript
const checkTransactionOnExplorer = (txHash: string, isMainnet = true) => {
  const baseUrl = isMainnet
    ? 'https://basescan.org'
    : 'https://sepolia.basescan.org';

  const explorerUrl = `${baseUrl}/tx/${txHash}`;
  console.log('View transaction at:', explorerUrl);
  window.open(explorerUrl, '_blank');
};
```

## Performance Issues

### Slow Loading Times

**Symptoms:**
- Components take long to render
- Network requests are slow
- High memory usage

**Solutions:**

#### 1. Optimize Bundle Size
```typescript
// Use dynamic imports for heavy components
const UnifiedConnectModal = lazy(() =>
  import('../components/UnifiedConnectModal')
);

// Code splitting
const WalletRoutes = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <Routes>
      <Route path="/connect" element={<UnifiedConnectModal />} />
      <Route path="/balance" element={<BalanceDisplay />} />
    </Routes>
  </Suspense>
);
```

#### 2. Cache RPC Requests
```typescript
// Implement request caching
const rpcCache = new Map();

const cachedRpcCall = async (method: string, params: any[]) => {
  const key = JSON.stringify({ method, params });

  if (rpcCache.has(key)) {
    return rpcCache.get(key);
  }

  const result = await window.ethereum.request({ method, params });
  rpcCache.set(key, result);

  // Expire cache after 30 seconds
  setTimeout(() => rpcCache.delete(key), 30000);

  return result;
};
```

#### 3. Optimize Re-renders
```typescript
// Use React.memo for expensive components
const BalanceDisplay = memo(({ address, balance }: BalanceDisplayProps) => {
  return (
    <div className="balance-display">
      <span>Address: {address}</span>
      <span>Balance: {balance} ETH</span>
    </div>
  );
});

// Use useMemo for expensive calculations
const processedTransactions = useMemo(() => {
  return transactions.map(tx => ({
    ...tx,
    formattedValue: ethers.utils.formatEther(tx.value),
    timestamp: new Date(tx.timestamp * 1000),
  }));
}, [transactions]);
```

## Environment-Specific Issues

### Development Environment

#### Local Node Issues
```bash
# Check if local node is running
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  http://localhost:8545

# Reset local node state
rm -rf .hardhat
npx hardhat node
```

#### Hot Reload Problems
```typescript
// Disable hot reload for wallet connections
if (process.env.NODE_ENV === 'development') {
  // Force page reload on wallet connection changes
  window.addEventListener('beforeunload', () => {
    localStorage.removeItem('wagmi.wallet');
  });
}
```

### Production Environment

#### Build Optimization
```javascript
// webpack.config.js or next.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        wallet: {
          test: /[\\/]node_modules[\\/](wagmi|@wagmi|ethers|@ethersproject)[\\/]/,
          name: 'wallet-vendor',
          chunks: 'all',
        },
      },
    },
  },
};
```

#### CDN Issues
```typescript
// Fallback RPC endpoints
const rpcEndpoints = [
  'https://mainnet.base.org',
  'https://base-mainnet.publicnode.com',
  'https://base.blockpi.network/v1/rpc/public',
];

const getWorkingRpcUrl = async () => {
  for (const url of rpcEndpoints) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1,
        }),
      });

      if (response.ok) {
        return url;
      }
    } catch (error) {
      console.warn(`RPC endpoint ${url} failed:`, error);
    }
  }

  throw new Error('No working RPC endpoint found');
};
```

## Getting Help

### Community Resources

1. **Base Discord**: Join the Base developer community
2. **Stack Overflow**: Search for similar issues
3. **GitHub Issues**: Check existing bug reports
4. **Base Documentation**: Official guides and API docs

### Support Checklist

Before contacting support, gather this information:
- Browser and version
- Wallet type and version
- Network (mainnet/testnet)
- Console error messages
- Steps to reproduce
- Expected vs actual behavior

### Debug Report Generator
```typescript
const generateDebugReport = () => {
  const report = {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    wallet: {
      isConnected: false,
      address: null,
      chainId: null,
      walletType: null,
    },
    errors: [],
    network: {
      isOnline: navigator.onLine,
      rpcUrl: null,
    },
  };

  // Check wallet status
  if (window.ethereum) {
    report.wallet.walletType = window.ethereum.isMetaMask ? 'MetaMask' :
                              window.ethereum.isCoinbaseWallet ? 'Coinbase' : 'Unknown';
  }

  // Collect recent errors
  const originalError = console.error;
  console.error = (...args) => {
    report.errors.push(args.join(' '));
    originalError(...args);
  };

  return report;
};
```

## Prevention Best Practices

### Error Boundaries
```typescript
class WalletErrorBoundary extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // Log to error reporting service
    reportError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="wallet-error">
          <h3>Wallet Connection Error</h3>
          <p>Please refresh the page and try again.</p>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Graceful Degradation
```typescript
const WalletProviderWithFallback = ({ children }: any) => {
  const [walletError, setWalletError] = useState(false);

  if (walletError) {
    return (
      <div className="wallet-fallback">
        <h3>Wallet Unavailable</h3>
        <p>Please install a Web3 wallet to continue.</p>
        <a href="https://metamask.io" target="_blank" rel="noopener noreferrer">
          Install MetaMask
        </a>
      </div>
    );
  }

  try {
    return (
      <WagmiProvider config={wagmiConfig}>
        {children}
      </WagmiProvider>
    );
  } catch (error) {
    setWalletError(true);
    return null;
  }
};
```

---

*Last updated: October 23, 2025*</content>
<parameter name="filePath">e:\Polymath Universata\Projects\walletsdk\docs\base-docs\troubleshooting-guide.md