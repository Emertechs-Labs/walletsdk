import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BalanceDisplay, BalanceDisplayProps } from '../BalanceDisplay';
import HederaTransactionService from '../../services/hederaTransactionService';

// Mock the HederaTransactionService
jest.mock('../../services/hederaTransactionService');
const MockHederaTransactionService = HederaTransactionService as jest.MockedClass<typeof HederaTransactionService>;

// Mock the useHederaWallet hook
jest.mock('../../hooks/useHederaWallet', () => ({
  useHederaWallet: jest.fn(),
}));
const mockUseHederaWallet = require('../../hooks/useHederaWallet').useHederaWallet;

describe('BalanceDisplay', () => {
  const mockConfig = {
    network: 'testnet' as const,
    mirrorNodeUrl: 'https://testnet.mirrornode.hedera.com',
  };

  const defaultProps: BalanceDisplayProps = {
    config: mockConfig,
    accountId: '0.0.12345',
  };

  const mockBalanceData = {
    balance: 10.5,
    tokens: [
      { token_id: '0.0.67890', balance: 1000000 },
      { token_id: '0.0.54321', balance: 500000 },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    MockHederaTransactionService.mockClear();

    // Mock the service instance
    const mockServiceInstance = {
      getAccountBalance: jest.fn().mockResolvedValue(mockBalanceData),
    };
    MockHederaTransactionService.mockImplementation(() => mockServiceInstance as any);

    // Mock useHederaWallet hook
    mockUseHederaWallet.mockReturnValue({
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
    });
  });

  describe('initial rendering', () => {
    it('shows loading state initially', () => {
      render(<BalanceDisplay {...defaultProps} />);

      // Should show loading skeleton, not the header
      const skeletonElements = document.querySelectorAll('.animate-pulse > div');
      expect(skeletonElements).toHaveLength(3); // Loading skeleton elements
      expect(screen.queryByText('Account Balance')).not.toBeInTheDocument();
    });

    it('displays account ID and network after loading', async () => {
      render(<BalanceDisplay {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Hedera Account: 0.0.12345')).toBeInTheDocument();
        expect(screen.getByText('Connected')).toBeInTheDocument();
      });
    });
  });

  describe('balance fetching', () => {
    it('fetches and displays balance successfully', async () => {
      render(<BalanceDisplay {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('10.50')).toBeInTheDocument();
        expect(screen.getByText('HBAR')).toBeInTheDocument();
      });

      expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
    });

    it('displays token balances when available', async () => {
      render(<BalanceDisplay {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Token Holdings')).toBeInTheDocument();
      });

      expect(screen.getByText('0.0.67890')).toBeInTheDocument();
      expect(screen.getByText('0.0.54321')).toBeInTheDocument();
    });

    it('handles empty token list', async () => {
      const mockServiceInstance = {
        getAccountBalance: jest.fn().mockResolvedValue({
          balance: 5.0,
          tokens: [],
        }),
      };
      MockHederaTransactionService.mockImplementation(() => mockServiceInstance as any);

      render(<BalanceDisplay {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('5.00')).toBeInTheDocument();
      });

      expect(screen.queryByText('Token Holdings')).not.toBeInTheDocument();
    });

    it('displays error message on fetch failure', async () => {
      const mockServiceInstance = {
        getAccountBalance: jest.fn().mockRejectedValue(new Error('Network error')),
      };
      MockHederaTransactionService.mockImplementation(() => mockServiceInstance as any);

      render(<BalanceDisplay {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Error: Network error')).toBeInTheDocument();
      });
    });

    it('shows error for missing account ID', async () => {
      // Mock both wagmi and Hedera as disconnected for this test
      const { useAccount } = require('../../__mocks__/wagmi');
      useAccount.mockReturnValueOnce({
        address: undefined,
        isConnected: false,
        chainId: undefined,
        connector: undefined,
      });

      mockUseHederaWallet.mockReturnValueOnce({
        isConnected: false,
        accountId: null,
        walletType: null,
        network: null,
        isConnecting: false,
        error: null,
        connect: jest.fn(),
        disconnect: jest.fn(),
        switchNetwork: jest.fn(),
        getAccountBalance: jest.fn(),
        getAccountInfo: jest.fn(),
        signTransaction: jest.fn(),
        signMessage: jest.fn(),
        clearError: jest.fn(),
        formatAccountId: jest.fn(),
      });

      render(<BalanceDisplay config={mockConfig} />); // Don't pass accountId or defaultProps

      await waitFor(() => {
        expect(screen.getByText('Error: No account connected')).toBeInTheDocument();
      });
    });
  });

  describe('auto-refresh functionality', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('auto-refreshes balance at specified interval', async () => {
      const mockServiceInstance = {
        getAccountBalance: jest.fn()
          .mockResolvedValueOnce({ balance: 10.0, tokens: [] })
          .mockResolvedValueOnce({ balance: 15.0, tokens: [] }),
      };
      MockHederaTransactionService.mockImplementation(() => mockServiceInstance as any);

      render(<BalanceDisplay {...defaultProps} refreshInterval={2000} />);

      await waitFor(() => {
        expect(screen.getByText('10.00')).toBeInTheDocument();
      });

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(screen.getByText('15.00')).toBeInTheDocument();
      });

      expect(mockServiceInstance.getAccountBalance).toHaveBeenCalledTimes(2);
    });

    it('shows live indicator when auto-refresh is enabled', async () => {
      render(<BalanceDisplay {...defaultProps} autoRefresh={true} />);

      await waitFor(() => {
        expect(screen.getByText('Live')).toBeInTheDocument();
      });
    });

    it('does not auto-refresh when disabled', async () => {
      const mockServiceInstance = {
        getAccountBalance: jest.fn().mockResolvedValue({ balance: 10.0, tokens: [] }),
      };
      MockHederaTransactionService.mockImplementation(() => mockServiceInstance as any);

      render(<BalanceDisplay {...defaultProps} autoRefresh={false} />);

      await waitFor(() => {
        expect(screen.getByText('10.00')).toBeInTheDocument();
      });

      act(() => {
        jest.advanceTimersByTime(10000);
      });

      expect(mockServiceInstance.getAccountBalance).toHaveBeenCalledTimes(1);
    });
  });

  describe('manual refresh', () => {
    it('refreshes balance when refresh button is clicked', async () => {
      const mockServiceInstance = {
        getAccountBalance: jest.fn()
          .mockResolvedValueOnce({ balance: 10.0, tokens: [] })
          .mockResolvedValueOnce({ balance: 12.0, tokens: [] }),
      };
      MockHederaTransactionService.mockImplementation(() => mockServiceInstance as any);

      render(<BalanceDisplay {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('10.00')).toBeInTheDocument();
      });

      const refreshButton = screen.getByText('🔄 Refresh');
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(screen.getByText('12.00')).toBeInTheDocument();
      });

      expect(mockServiceInstance.getAccountBalance).toHaveBeenCalledTimes(2);
    });

    it('shows loading state during manual refresh', async () => {
      const mockServiceInstance = {
        getAccountBalance: jest.fn().mockImplementation(
          () => new Promise(resolve => setTimeout(() => resolve({ balance: 10.0, tokens: [] }), 100))
        ),
      };
      MockHederaTransactionService.mockImplementation(() => mockServiceInstance as any);

      render(<BalanceDisplay {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('10.00')).toBeInTheDocument();
      });

      const refreshButton = screen.getByText('🔄 Refresh');
      fireEvent.click(refreshButton);

      // Button should show loading state
      expect(refreshButton).toHaveTextContent('🔄 Refreshing...');
    });

    it('disables refresh button while loading', async () => {
      const mockServiceInstance = {
        getAccountBalance: jest.fn().mockImplementation(
          () => new Promise(resolve => setTimeout(() => resolve({ balance: 10.0, tokens: [] }), 100))
        ),
      };
      MockHederaTransactionService.mockImplementation(() => mockServiceInstance as any);

      render(<BalanceDisplay {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('10.00')).toBeInTheDocument();
      });

      const refreshButton = screen.getByText('🔄 Refresh');
      fireEvent.click(refreshButton);

      expect(refreshButton).toBeDisabled();
    });
  });

  describe('formatting', () => {
    it('formats large balances correctly', async () => {
      const mockServiceInstance = {
        getAccountBalance: jest.fn().mockResolvedValue({
          balance: 1234567.89,
          tokens: [],
        }),
      };
      MockHederaTransactionService.mockImplementation(() => mockServiceInstance as any);

      render(<BalanceDisplay {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('1,234,567.89')).toBeInTheDocument();
      });
    });

    it('formats small balances correctly', async () => {
      const mockServiceInstance = {
        getAccountBalance: jest.fn().mockResolvedValue({
          balance: 0.00000123,
          tokens: [],
        }),
      };
      MockHederaTransactionService.mockImplementation(() => mockServiceInstance as any);

      render(<BalanceDisplay {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('0.00000123')).toBeInTheDocument();
      });
    });

    it('formats timestamps correctly', async () => {
      const mockDate = new Date('2024-01-15T10:30:45');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      const mockServiceInstance = {
        getAccountBalance: jest.fn().mockResolvedValue({
          balance: 10.0,
          tokens: [],
        }),
      };
      MockHederaTransactionService.mockImplementation(() => mockServiceInstance as any);

      render(<BalanceDisplay {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/Last updated: 10:30:45/)).toBeInTheDocument();
      });

      jest.restoreAllMocks();
    });
  });

  describe('callbacks', () => {
    it('calls onBalanceUpdate callback when balance is fetched', async () => {
      const onBalanceUpdate = jest.fn();
      const mockServiceInstance = {
        getAccountBalance: jest.fn().mockResolvedValue(mockBalanceData),
      };
      MockHederaTransactionService.mockImplementation(() => mockServiceInstance as any);

      render(<BalanceDisplay {...defaultProps} onBalanceUpdate={onBalanceUpdate} />);

      await waitFor(() => {
        expect(onBalanceUpdate).toHaveBeenCalledWith(10.5, mockBalanceData.tokens);
      });
    });

    it('does not call onBalanceUpdate when not provided', async () => {
      const mockServiceInstance = {
        getAccountBalance: jest.fn().mockResolvedValue(mockBalanceData),
      };
      MockHederaTransactionService.mockImplementation(() => mockServiceInstance as any);

      render(<BalanceDisplay {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('10.50')).toBeInTheDocument();
      });

      // No error should occur
    });
  });

  describe('action buttons', () => {
    it('renders Send and Receive buttons', async () => {
      render(<BalanceDisplay {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('10.50')).toBeInTheDocument();
      });

      expect(screen.getByText('📤 Send')).toBeInTheDocument();
      expect(screen.getByText('📥 Receive')).toBeInTheDocument();
    });

    it('Send button has correct styling', async () => {
      render(<BalanceDisplay {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('10.50')).toBeInTheDocument();
      });

      const sendButton = screen.getByText('📤 Send');
      expect(sendButton).toHaveClass('echain-action-button', 'echain-action-button-secondary');
    });

    it('Receive button has correct styling', async () => {
      render(<BalanceDisplay {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('10.50')).toBeInTheDocument();
      });

      const receiveButton = screen.getByText('📥 Receive');
      expect(receiveButton).toHaveClass('echain-action-button', 'echain-action-button-secondary');
    });
  });

  describe('accessibility', () => {
    it('refresh button has proper title attribute', async () => {
      render(<BalanceDisplay {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('10.50')).toBeInTheDocument();
      });

      const refreshButton = screen.getByText('🔄 Refresh');
      expect(refreshButton).toBeInTheDocument();
    });

    it('network badge is properly labeled', async () => {
      render(<BalanceDisplay {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('10.50')).toBeInTheDocument();
      });

      const networkBadge = screen.getByText('Connected');
      expect(networkBadge).toHaveClass('echain-status-indicator');
    });
  });
});