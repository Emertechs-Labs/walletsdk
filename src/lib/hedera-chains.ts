import { defineChain } from 'viem';

// Hedera Testnet configuration
export const hederaTestnet = defineChain({
  id: 296, // Hedera testnet chain ID
  name: 'Hedera Testnet',
  network: 'hedera-testnet',
  nativeCurrency: {
    decimals: 8,
    name: 'HBAR',
    symbol: 'HBAR',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.hashio.io/api'],
    },
    public: {
      http: ['https://testnet.hashio.io/api'],
    },
  },
  blockExplorers: {
    default: {
      name: 'HashScan Testnet',
      url: 'https://hashscan.io/testnet',
    },
  },
  testnet: true,
});

// Hedera Mainnet configuration
export const hederaMainnet = defineChain({
  id: 295, // Hedera mainnet chain ID
  name: 'Hedera Mainnet',
  network: 'hedera-mainnet',
  nativeCurrency: {
    decimals: 8,
    name: 'HBAR',
    symbol: 'HBAR',
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.hashio.io/api'],
    },
    public: {
      http: ['https://mainnet.hashio.io/api'],
    },
  },
  blockExplorers: {
    default: {
      name: 'HashScan',
      url: 'https://hashscan.io',
    },
  },
  testnet: false,
});