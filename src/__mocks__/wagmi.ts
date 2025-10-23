// Mock for wagmi
export const useAccount = jest.fn(() => ({
  address: '0x1234567890123456789012345678901234567890',
  isConnected: true,
  chainId: 84532,
  connector: { id: 'mock', name: 'Mock Wallet' },
}));

export const useBalance = jest.fn(() => ({
  data: {
    decimals: 18,
    formatted: '1.5',
    symbol: 'ETH',
    value: BigInt('1500000000000000000'),
  },
  isLoading: false,
  error: null,
}));

export const useConnect = jest.fn(() => ({
  connect: jest.fn(),
  connectors: [],
  isLoading: false,
  pendingConnector: null,
}));

export const useDisconnect = jest.fn(() => ({
  disconnect: jest.fn(),
  isLoading: false,
}));

export const useChainId = jest.fn(() => 84532); // Base Sepolia

export const useSwitchChain = jest.fn(() => ({
  switchChain: jest.fn(),
  chains: [],
  isLoading: false,
  error: null,
}));

export const WagmiProvider = jest.fn(({ children }: { children: any }) => children);
export const createConfig = jest.fn(() => ({}));
export const http = jest.fn(() => 'http://mock');
export const webSocket = jest.fn(() => 'ws://mock');
export const fallback = jest.fn(() => 'fallback');

// Mock chains
export const baseSepolia = {
  id: 84532,
  name: 'Base Sepolia',
  network: 'base-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
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