// Mock for @rainbow-me/rainbowkit
export const connectorsForWallets = jest.fn(() => []);
export const metaMaskWallet = jest.fn(() => ({}));
export const walletConnectWallet = jest.fn(() => ({}));
export const coinbaseWallet = jest.fn(() => ({}));
export const RainbowKitProvider = jest.fn(({ children }: { children: any }) => children);
export const ConnectButton = jest.fn(() => null);