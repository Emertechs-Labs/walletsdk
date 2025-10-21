// Mock for wagmi
export const useAccount = jest.fn();
export const useConnect = jest.fn();
export const useDisconnect = jest.fn();
export const useSwitchChain = jest.fn();
export const WagmiProvider = jest.fn(({ children }: { children: any }) => children);
export const createConfig = jest.fn();
export const http = jest.fn();
export const webSocket = jest.fn();
export const fallback = jest.fn();

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