# Base Network Configuration

## Overview

Base is Coinbase's Ethereum Layer 2 blockchain, offering low-cost, high-speed transactions while maintaining full Ethereum compatibility. This guide covers network configuration for Base mainnet and testnet.

## Network Details

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
    etherscan: { name: 'BaseScan', url: 'https://basescan.org' },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 5022,
    },
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
    etherscan: { name: 'BaseScan', url: 'https://sepolia.basescan.org' },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 1059647,
    },
  },
  testnet: true,
};
```

## Wagmi Configuration

### Basic Setup
```typescript
import { createConfig, http } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { coinbaseWallet, metaMask, walletConnect } from 'wagmi/connectors';

const config = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    coinbaseWallet({
      appName: 'Your App Name',
    }),
    metaMask(),
    walletConnect({
      projectId: process.env.WALLETCONNECT_PROJECT_ID!,
    }),
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});

export default config;
```

### RainbowKit Integration
```typescript
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, baseSepolia } from 'wagmi/chains';

const config = getDefaultConfig({
  appName: 'Your App Name',
  projectId: process.env.WALLETCONNECT_PROJECT_ID!,
  chains: [base, baseSepolia],
  ssr: true,
});

export default config;
```

## Viem Configuration

### Client Setup
```typescript
import { createPublicClient, createWalletClient, http } from 'viem';
import { base, baseSepolia, privateKeyToAccount } from 'viem/accounts';

// Public client for read operations
export const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

// Wallet client for write operations
export const walletClient = createWalletClient({
  chain: base,
  transport: http(),
  account: privateKeyToAccount(process.env.PRIVATE_KEY!),
});
```

### Account Abstraction Setup
```typescript
import { createBundlerClient } from 'viem/account-abstraction';

export const bundlerClient = createBundlerClient({
  transport: http('https://api.coinbase.com/v1/bundler'),
  entryPoint: {
    address: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789', // ERC-4337 v0.7
    version: '0.7',
  },
});
```

## Ethers.js Configuration

### Provider Setup
```typescript
import { ethers } from 'ethers';

// Mainnet provider
export const baseProvider = new ethers.JsonRpcProvider(
  'https://mainnet.base.org',
  {
    chainId: 8453,
    name: 'base',
  }
);

// Testnet provider
export const baseSepoliaProvider = new ethers.JsonRpcProvider(
  'https://sepolia.base.org',
  {
    chainId: 84532,
    name: 'base-sepolia',
  }
);
```

### Signer Setup
```typescript
import { ethers } from 'ethers';

// Connect with MetaMask
export const getSigner = async () => {
  if (!window.ethereum) throw new Error('No wallet found');

  await window.ethereum.request({ method: 'eth_requestAccounts' });

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  // Switch to Base network
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x2105' }], // 8453 in hex
    });
  } catch (error) {
    // Network not added, add it
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: '0x2105',
        chainName: 'Base',
        nativeCurrency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: ['https://mainnet.base.org'],
        blockExplorerUrls: ['https://basescan.org'],
      }],
    });
  }

  return signer;
};
```

## MetaMask Network Addition

### Manual Addition
If users need to manually add Base to MetaMask:

```typescript
const addBaseNetwork = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: '0x2105', // 8453
        chainName: 'Base',
        nativeCurrency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: ['https://mainnet.base.org'],
        blockExplorerUrls: ['https://basescan.org'],
        iconUrls: ['https://avatars.githubusercontent.com/u/108554348?s=200&v=4'],
      }],
    });
  } catch (error) {
    console.error('Failed to add Base network:', error);
  }
};
```

### Automatic Network Switching
```typescript
const switchToBase = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x2105' }],
    });
  } catch (error) {
    if (error.code === 4902) {
      // Network not added, add it
      await addBaseNetwork();
    } else {
      console.error('Failed to switch to Base:', error);
    }
  }
};
```

## Coinbase Wallet Configuration

### Smart Wallet Setup
```typescript
import { coinbaseWallet } from '@rainbow-me/rainbowkit/wallets';

const coinbaseWalletConnector = coinbaseWallet({
  appName: 'Your App Name',
  preference: 'smartWalletOnly', // Forces smart wallet usage
  version: '4', // Use latest version
});
```

### Deep Linking
```typescript
const openCoinbaseWallet = () => {
  const dappUrl = encodeURIComponent(window.location.href);
  const coinbaseWalletUrl = `https://go.cb-w.com/dapp?cb_url=${dappUrl}`;

  window.open(coinbaseWalletUrl, '_blank');
};
```

## RPC Endpoints

### Public RPC Endpoints
- **Mainnet**: `https://mainnet.base.org`
- **Sepolia**: `https://sepolia.base.org`

### Alternative RPC Providers
- **Ankr**: `https://rpc.ankr.com/base`
- **Blast**: `https://base-mainnet.blastapi.io`
- **QuickNode**: `https://base-mainnet.quiknode.pro/`

### Load Balancing
```typescript
const rpcUrls = [
  'https://mainnet.base.org',
  'https://rpc.ankr.com/base',
  'https://base-mainnet.blastapi.io',
];

const getRandomRpcUrl = () => {
  return rpcUrls[Math.floor(Math.random() * rpcUrls.length)];
};
```

## Block Explorers

### BaseScan Integration
```typescript
// Transaction URL
const getTransactionUrl = (txHash: string) => {
  return `https://basescan.org/tx/${txHash}`;
};

// Address URL
const getAddressUrl = (address: string) => {
  return `https://basescan.org/address/${address}`;
};

// Token URL
const getTokenUrl = (tokenAddress: string) => {
  return `https://basescan.org/token/${tokenAddress}`;
};
```

### API Integration
```typescript
const baseScanApi = {
  baseUrl: 'https://api.basescan.org/api',
  apiKey: process.env.BASESCAN_API_KEY,

  async getTransaction(txHash: string) {
    const response = await fetch(
      `${this.baseUrl}?module=transaction&action=gettxreceiptstatus&txhash=${txHash}&apikey=${this.apiKey}`
    );
    return response.json();
  },

  async getBalance(address: string) {
    const response = await fetch(
      `${this.baseUrl}?module=account&action=balance&address=${address}&tag=latest&apikey=${this.apiKey}`
    );
    return response.json();
  },
};
```

## Gas Optimization

### Gas Price Estimation
```typescript
const getGasPrice = async () => {
  const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');

  // Get current gas price
  const gasPrice = await provider.getFeeData();

  return {
    maxFeePerGas: gasPrice.maxFeePerGas,
    maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas,
  };
};
```

### Gas Estimation for Transactions
```typescript
const estimateGas = async (tx: ethers.TransactionRequest) => {
  const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');

  try {
    const gasEstimate = await provider.estimateGas(tx);
    return gasEstimate;
  } catch (error) {
    console.error('Gas estimation failed:', error);
    // Fallback to higher gas limit
    return 21000n; // Basic transfer
  }
};
```

## Environment Variables

### Required Variables
```bash
# RPC Configuration
VITE_BASE_RPC_URL=https://mainnet.base.org
VITE_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# WalletConnect
VITE_WALLETCONNECT_PROJECT_ID=your-project-id

# Coinbase OnchainKit
VITE_ONCHAINKIT_API_KEY=your-api-key

# Block Explorer
VITE_BASESCAN_API_KEY=your-api-key
```

### Development vs Production
```typescript
const isProduction = import.meta.env.PROD;

const rpcUrl = isProduction
  ? 'https://mainnet.base.org'
  : 'https://sepolia.base.org';

const chainId = isProduction ? 8453 : 84532;
```

## Monitoring and Analytics

### Network Health Check
```typescript
const checkNetworkHealth = async () => {
  const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');

  try {
    const blockNumber = await provider.getBlockNumber();
    const gasPrice = await provider.getFeeData();

    return {
      status: 'healthy',
      blockNumber,
      gasPrice: gasPrice.gasPrice,
      timestamp: Date.now(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: Date.now(),
    };
  }
};
```

### Performance Monitoring
```typescript
const monitorRpcPerformance = async (rpcUrl: string) => {
  const startTime = Date.now();

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    await provider.getBlockNumber();

    const responseTime = Date.now() - startTime;

    return {
      rpcUrl,
      responseTime,
      status: 'success',
    };
  } catch (error) {
    return {
      rpcUrl,
      responseTime: Date.now() - startTime,
      status: 'error',
      error: error.message,
    };
  }
};
```

## Troubleshooting

### Common Network Issues

**RPC Connection Failed:**
- Check internet connection
- Try alternative RPC endpoints
- Verify network configuration

**Transaction Not Confirming:**
- Check gas prices and limits
- Verify account balance
- Monitor network congestion

**Wallet Not Connecting:**
- Ensure wallet supports Base
- Check network configuration
- Verify RPC endpoint accessibility

**Smart Contract Errors:**
- Confirm contract deployment on Base
- Verify contract addresses
- Check function signatures

## Migration from Other Networks

### From Ethereum Mainnet
1. Bridge assets using official bridges
2. Update RPC endpoints
3. Test transactions on Base Sepolia first
4. Update contract deployments

### From Other L2s
1. Bridge assets to Ethereum first
2. Then bridge to Base
3. Update contract addresses
4. Test interoperability features

## Resources

- [Base Network Status](https://status.base.org/)
- [Base Bridge](https://bridge.base.org/)
- [Base Faucet](https://faucet.coinbase.com/)
- [BaseScan](https://basescan.org/)

---

*Last updated: October 23, 2025*</content>
<parameter name="filePath">e:\Polymath Universata\Projects\walletsdk\docs\base-docs\network-configuration.md