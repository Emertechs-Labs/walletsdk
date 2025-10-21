import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWalletHelpers } from '../../hooks/useWalletHelpers';

// Mock wagmi hooks
jest.mock('wagmi', () => ({
  useAccount: jest.fn(),
  useConnect: jest.fn(),
  useDisconnect: jest.fn(),
  useChainId: jest.fn(),
  useSwitchChain: jest.fn(),
}));

import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';

const mockUseAccount = useAccount as jest.MockedFunction<typeof useAccount>;
const mockUseConnect = useConnect as jest.MockedFunction<typeof useConnect>;
const mockUseDisconnect = useDisconnect as jest.MockedFunction<typeof useDisconnect>;
const mockUseChainId = useChainId as jest.MockedFunction<typeof useChainId>;
const mockUseSwitchChain = useSwitchChain as jest.MockedFunction<typeof useSwitchChain>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useWalletHelpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mocks with complete wagmi v2 API
    mockUseAccount.mockReturnValue({
      address: undefined,
      addresses: undefined,
      chain: undefined,
      chainId: undefined,
      connector: undefined,
      isConnected: false,
      isReconnecting: false,
      isConnecting: false,
      isDisconnected: true,
      status: 'disconnected',
    });

    mockUseConnect.mockReturnValue({
      connect: jest.fn(),
      connectAsync: jest.fn(),
      connectors: [],
      data: undefined,
      error: null,
      variables: undefined,
      isError: false,
      isIdle: true,
      isPending: false,
      isSuccess: false,
      isPaused: false,
      reset: jest.fn(),
      context: undefined,
      failureCount: 0,
      failureReason: null,
      submittedAt: 0,
      status: 'idle',
    });

    mockUseDisconnect.mockReturnValue({
      disconnect: jest.fn(),
      disconnectAsync: jest.fn(),
      data: undefined,
      error: null,
      variables: undefined,
      isError: false,
      isIdle: true,
      isPending: false,
      isSuccess: false,
      isPaused: false,
      reset: jest.fn(),
      context: undefined,
      failureCount: 0,
      failureReason: null,
      submittedAt: 0,
      connectors: [],
      status: 'idle',
    });

    mockUseChainId.mockReturnValue(1);
    mockUseSwitchChain.mockReturnValue({
      switchChain: jest.fn(),
      switchChainAsync: jest.fn(),
      data: undefined,
      error: null,
      variables: undefined,
      isError: false,
      isIdle: true,
      isPending: false,
      isSuccess: false,
      isPaused: false,
      reset: jest.fn(),
      context: undefined,
      failureCount: 0,
      failureReason: null,
      submittedAt: 0,
      chains: [{
        id: 1,
        name: 'Ethereum',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: { default: { http: ['https://cloudflare-eth.com'] }, public: { http: ['https://cloudflare-eth.com'] } },
        blockExplorers: { default: { name: 'Etherscan', url: 'https://etherscan.io' } },
      } as any],
      status: 'idle',
    });
  });

  it('should return wallet helper functions', () => {
    const { result } = renderHook(() => useWalletHelpers(), {
      wrapper: createWrapper(),
    });

    expect(result.current).toHaveProperty('connectWallet');
    expect(result.current).toHaveProperty('disconnectWallet');
    expect(result.current).toHaveProperty('ensureBaseSepoliaNetwork');
    expect(result.current).toHaveProperty('isConnected');
    expect(result.current).toHaveProperty('address');
    expect(result.current).toHaveProperty('connectionStatus');
  });

  it('should handle wallet connection', async () => {
    const mockConnect = jest.fn();
    mockUseConnect.mockReturnValue({
      connect: mockConnect,
      connectAsync: jest.fn(),
      connectors: [{
        id: 'metaMask',
        name: 'MetaMask',
        type: 'injected',
        uid: 'metaMask',
        emitter: { on: jest.fn(), off: jest.fn(), emit: jest.fn(), uid: 'test', _emitter: {}, once: jest.fn(), listenerCount: jest.fn() } as any,
        connect: jest.fn(),
        disconnect: jest.fn(),
        getAccounts: jest.fn(),
        getChainId: jest.fn(),
        getProvider: jest.fn(),
        isAuthorized: jest.fn(),
        switchChain: jest.fn(),
        watchAsset: jest.fn(),
        onAccountsChanged: jest.fn(),
        onChainChanged: jest.fn(),
        onDisconnect: jest.fn(),
      }],
      data: undefined,
      error: null,
      variables: undefined,
      isError: false,
      isIdle: true,
      isPending: false,
      isSuccess: false,
      isPaused: false,
      reset: jest.fn(),
      context: undefined,
      failureCount: 0,
      failureReason: null,
      submittedAt: 0,
      status: 'idle',
    });

    const { result } = renderHook(() => useWalletHelpers(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.connectWallet();
    });

    expect(mockConnect).toHaveBeenCalled();
  });

  it('should handle wallet disconnection', async () => {
    const mockDisconnect = jest.fn();
    mockUseDisconnect.mockReturnValue({
      disconnect: mockDisconnect,
      disconnectAsync: jest.fn(),
      data: undefined,
      error: null,
      variables: undefined,
      isError: false,
      isIdle: true,
      isPending: false,
      isSuccess: false,
      isPaused: false,
      reset: jest.fn(),
      context: undefined,
      failureCount: 0,
      failureReason: null,
      submittedAt: 0,
      connectors: [],
      status: 'idle',
    });

    const { result } = renderHook(() => useWalletHelpers(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.disconnectWallet();
    });

    expect(mockDisconnect).toHaveBeenCalled();
  });
});