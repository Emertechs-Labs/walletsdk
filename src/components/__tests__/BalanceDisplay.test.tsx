import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BalanceDisplay, BalanceDisplayProps } from '../BalanceDisplay';
import HederaTransactionService from '../../services/hederaTransactionService';

// Mock the HederaTransactionService
jest.mock('../../services/hederaTransactionService');
const MockHederaTransactionService = HederaTransactionService as jest.MockedClass<typeof HederaTransactionService>;

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
  });

  describe('initial rendering', () => {
    it('shows loading state initially', () => {
      render(<BalanceDisplay {...defaultProps} />);

      expect(screen.getByText('Account Balance')).toBeInTheDocument();
      expect(screen.getAllByRole('presentation')).toHaveLength(3); // Loading skeleton elements
    });

    it('displays account ID and network', () => {
      render(<BalanceDisplay {...defaultProps} />);

      expect(screen.getByText('0.0.12345')).toBeInTheDocument();
      expect(screen.getByText('testnet')).toBeInTheDocument();
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
        expect(screen.getByText('Token Balances')).toBeInTheDocument();
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

      expect(screen.queryByText('Token Balances')).not.toBeInTheDocument();
    });

    it('displays error message on fetch failure', async () => {
      const mockServiceInstance = {
        getAccountBalance: jest.fn().mockRejectedValue(new Error('Network error')),
      };
      MockHederaTransactionService.mockImplementation(() => mockServiceInstance as any);

      render(<BalanceDisplay {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('shows error for missing account ID', async () => {
      render(<BalanceDisplay {...defaultProps} accountId="" />);

      await waitFor(() => {
        expect(screen.getByText('No account ID provided')).toBeInTheDocument();
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

      const refreshButton = screen.getByTitle('Refresh balance');
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

      const refreshButton = screen.getByTitle('Refresh balance');
      fireEvent.click(refreshButton);

      // Button should show loading state
      expect(refreshButton.querySelector('.animate-spin')).toBeInTheDocument();
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

      const refreshButton = screen.getByTitle('Refresh balance');
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

      expect(screen.getByText('Send')).toBeInTheDocument();
      expect(screen.getByText('Receive')).toBeInTheDocument();
    });

    it('Send button has correct styling', async () => {
      render(<BalanceDisplay {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('10.50')).toBeInTheDocument();
      });

      const sendButton = screen.getByText('Send');
      expect(sendButton).toHaveClass('bg-blue-600', 'hover:bg-blue-700');
    });

    it('Receive button has correct styling', async () => {
      render(<BalanceDisplay {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('10.50')).toBeInTheDocument();
      });

      const receiveButton = screen.getByText('Receive');
      expect(receiveButton).toHaveClass('bg-white', 'border-gray-300', 'hover:bg-gray-50');
    });
  });

  describe('accessibility', () => {
    it('refresh button has proper title attribute', async () => {
      render(<BalanceDisplay {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('10.50')).toBeInTheDocument();
      });

      const refreshButton = screen.getByTitle('Refresh balance');
      expect(refreshButton).toBeInTheDocument();
    });

    it('network badge is properly labeled', async () => {
      render(<BalanceDisplay {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('10.50')).toBeInTheDocument();
      });

      const networkBadge = screen.getByText('testnet');
      expect(networkBadge).toHaveClass('capitalize');
    });
  });
});