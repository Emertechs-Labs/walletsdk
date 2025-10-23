// Mock for useHederaWallet hook
export const useHederaWallet = jest.fn(() => ({
  isConnected: false,
  accountId: null,
  walletType: null,
  network: 'testnet',
  isConnecting: false,
  error: null,
  connect: jest.fn(),
  disconnect: jest.fn(),
  switchNetwork: jest.fn(),
  getAccountBalance: jest.fn().mockResolvedValue(BigInt('1000000000')), // 10 HBAR in tinybars
  getAccountInfo: jest.fn(),
  signTransaction: jest.fn(),
  signMessage: jest.fn(),
  clearError: jest.fn(),
  formatAccountId: jest.fn((accountId: string) => accountId),
}));