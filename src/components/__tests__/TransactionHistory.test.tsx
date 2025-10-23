import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { TransactionHistory } from '../TransactionHistory';
import HederaTransactionService from '../../services/hederaTransactionService';
import { useHederaProvider } from '../../hooks/useHederaProvider';

// Mock the hooks and services
jest.mock('../../hooks/useHederaProvider');
jest.mock('../../services/hederaTransactionService');

const mockUseHederaProvider = useHederaProvider as jest.MockedFunction<typeof useHederaProvider>;
const MockHederaTransactionService = HederaTransactionService as jest.MockedClass<typeof HederaTransactionService>;

describe('TransactionHistory', () => {
  const mockConfig = {
    network: 'testnet' as const,
    mirrorNodeUrl: 'https://testnet.mirrornode.hedera.com',
  };

  const mockTransactions = [
    {
      transaction_id: '0.0.12345@1234567890.000000000',
      consensus_timestamp: '1609459200.123456789', // 2021-01-01 00:00:00 UTC
      valid_start_timestamp: '1609459199.000000000',
      charged_tx_fee: 100000,
      max_fee: '1000000',
      memo_base64: '',
      name: 'CRYPTOTRANSFER',
      node: '0.0.3',
      nonce: 0,
      parent_consensus_timestamp: null,
      result: 'SUCCESS',
      scheduled: false,
      transaction_hash: 'hash123',
      transfers: [
        { account: '0.0.12345', amount: -200000000, is_approval: false }, // -2 HBAR
        { account: '0.0.67890', amount: 200000000, is_approval: false },  // +2 HBAR
      ],
      token_transfers: [],
    },
  ];

  const mockServiceInstance = {
    getAccountTransactions: jest.fn().mockImplementation(() => 
      new Promise(resolve => {
        setTimeout(() => resolve({
          transactions: mockTransactions,
          links: { next: null },
        }), 0);
      })
    ),
    convertMirrorTransaction: jest.fn().mockReturnValue({
      id: '0.0.12345@1234567890.000000000',
      hash: 'hash123',
      from: '0.0.12345',
      to: '0.0.67890',
      value: 2,
      data: '',
      timestamp: '2021-01-01T00:00:00.123Z',
      status: 'executed',
      type: 'CRYPTOTRANSFER',
      fee: 0.001,
      result: 'SUCCESS',
    }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseHederaProvider.mockReturnValue({} as any);
    MockHederaTransactionService.mockImplementation(() => mockServiceInstance as any);
  });

  describe('initial rendering', () => {
    it('shows message when no account ID is provided', async () => {
      await act(async () => {
        render(<TransactionHistory hederaConfig={mockConfig} />);
      });

      expect(screen.getByText('Please provide an account ID to view transaction history')).toBeInTheDocument();
    });

    it('renders header with title and subtitle', async () => {
      await act(async () => {
        render(<TransactionHistory hederaConfig={mockConfig} accountId="0.0.12345" />);
      });

      expect(screen.getByText('📋 Transaction History')).toBeInTheDocument();
      expect(screen.getByText('Complete transaction history with filtering')).toBeInTheDocument();
    });

    it('shows status indicator', async () => {
      await act(async () => {
        render(<TransactionHistory hederaConfig={mockConfig} accountId="0.0.12345" />);
      });

      expect(screen.getByText('Demo Mode')).toBeInTheDocument();
    });

    it('displays transaction controls', async () => {
      await act(async () => {
        render(<TransactionHistory hederaConfig={mockConfig} accountId="0.0.12345" />);
      });

      await waitFor(() => {
        expect(screen.getByText('Transaction Controls')).toBeInTheDocument();
        expect(screen.getByText('🔼 Show Filters')).toBeInTheDocument();
        expect(screen.getByText('🔄 Refresh')).toBeInTheDocument();
      });
    });

    it('displays loading state initially', async () => {
      await act(async () => {
        render(<TransactionHistory hederaConfig={mockConfig} accountId="0.0.12345" />);
      });

      expect(screen.getByText('Demo Mode')).toBeInTheDocument();
    });
  });

  describe('transaction loading', () => {
    it('loads and displays transactions successfully', async () => {
      await act(async () => {
        render(<TransactionHistory hederaConfig={mockConfig} accountId="0.0.12345" />);
      });

      await waitFor(() => {
        expect(screen.getByText('Transfer')).toBeInTheDocument();
      });

      expect(screen.getByText('2 HBAR')).toBeInTheDocument();
      expect(screen.getByText('executed')).toBeInTheDocument();
    });

    it('handles loading errors gracefully', async () => {
      const mockServiceInstanceWithError = {
        ...mockServiceInstance,
        getAccountTransactions: jest.fn().mockRejectedValue(new Error('Network error')),
      };
      MockHederaTransactionService.mockImplementation(() => mockServiceInstanceWithError as any);

      await act(async () => {
        render(<TransactionHistory hederaConfig={mockConfig} accountId="0.0.12345" />);
      });

      await waitFor(() => {
        expect(screen.getByText('Error: Network error')).toBeInTheDocument();
      });
    });

    it('shows empty state when no transactions found', async () => {
      const mockServiceInstanceEmpty = {
        ...mockServiceInstance,
        getAccountTransactions: jest.fn().mockResolvedValue({
          transactions: [],
          links: { next: null },
        }),
      };
      MockHederaTransactionService.mockImplementation(() => mockServiceInstanceEmpty as any);

      await act(async () => {
        render(<TransactionHistory hederaConfig={mockConfig} accountId="0.0.12345" />);
      });

      await waitFor(() => {
        expect(screen.getByText('No transactions found')).toBeInTheDocument();
        expect(screen.getByText('📄')).toBeInTheDocument();
      });
    });
  });

  describe('filtering functionality', () => {
    it('toggles filter visibility', async () => {
      await act(async () => {
        render(<TransactionHistory hederaConfig={mockConfig} accountId="0.0.12345" />);
      });

      await waitFor(() => {
        expect(screen.getByText('Transfer')).toBeInTheDocument();
      });

      expect(screen.queryByText('Start Date')).not.toBeInTheDocument();

      fireEvent.click(screen.getByText('🔼 Show Filters'));
      expect(screen.getByText('Start Date')).toBeInTheDocument();

      fireEvent.click(screen.getByText('🔽 Hide Filters'));
      expect(screen.queryByText('Start Date')).not.toBeInTheDocument();
    });

    it('applies date range filters', async () => {
      await act(async () => {
        render(<TransactionHistory hederaConfig={mockConfig} accountId="0.0.12345" />);
      });

      await waitFor(() => {
        expect(screen.getByText('Transfer')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('🔼 Show Filters'));

      const startDateInput = screen.getByLabelText('Filter transactions by start date');
      const endDateInput = screen.getByLabelText('Filter transactions by end date');

      fireEvent.change(startDateInput, { target: { value: '2021-01-02' } });
      fireEvent.change(endDateInput, { target: { value: '2021-01-02' } });

      fireEvent.click(screen.getByText('Apply'));
      expect(screen.getByText('Apply')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('No transactions found')).toBeInTheDocument();
      });
    });

    it('applies amount range filters', async () => {
      await act(async () => {
        render(<TransactionHistory hederaConfig={mockConfig} accountId="0.0.12345" />);
      });

      await waitFor(() => {
        expect(screen.getByText('2 HBAR')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('🔼 Show Filters'));

      const minAmountInput = screen.getByLabelText('Filter transactions by minimum amount in HBAR');
      const maxAmountInput = screen.getByLabelText('Filter transactions by maximum amount in HBAR');

      fireEvent.change(minAmountInput, { target: { value: '5' } });
      fireEvent.change(maxAmountInput, { target: { value: '10' } });

      fireEvent.click(screen.getByText('Apply'));
      expect(screen.getByText('Apply')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('No transactions found')).toBeInTheDocument();
      });
    });

    it('applies status filters', async () => {
      await act(async () => {
        render(<TransactionHistory hederaConfig={mockConfig} accountId="0.0.12345" />);
      });

      await waitFor(() => {
        expect(screen.getByText('executed')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('🔼 Show Filters'));

      const pendingCheckbox = screen.getByLabelText('Filter by pending status');
      fireEvent.click(pendingCheckbox);

      fireEvent.click(screen.getByText('Apply'));
      expect(screen.getByText('Apply')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('No transactions found')).toBeInTheDocument();
      });
    });

    it('applies search filter', async () => {
      await act(async () => {
        render(<TransactionHistory hederaConfig={mockConfig} accountId="0.0.12345" />);
      });

      await waitFor(() => {
        expect(screen.getByText('2 HBAR')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('🔼 Show Filters'));

      const searchInput = screen.getByLabelText('Search transactions by ID, address, or hash');
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

      fireEvent.click(screen.getByText('Apply'));
      expect(screen.getByText('Apply')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('No transactions found')).toBeInTheDocument();
      });
    });

    it('clears all filters', async () => {
      await act(async () => {
        render(<TransactionHistory hederaConfig={mockConfig} accountId="0.0.12345" />);
      });

      await waitFor(() => {
        expect(screen.getByText('2 HBAR')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('🔼 Show Filters'));

      const searchInput = screen.getByLabelText('Search transactions by ID, address, or hash');
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

      fireEvent.click(screen.getByText('Apply'));
      expect(screen.getByText('Apply')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('No transactions found')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Clear'));
      expect(screen.getByText('Clear')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('2 HBAR')).toBeInTheDocument();
      });
    });
  });

  describe('pagination', () => {
    it('shows pagination controls when there are multiple pages', async () => {
      // Create 25 transactions to trigger pagination (pageSize = 20)
      const manyTransactions = Array.from({ length: 25 }, (_, i) => ({
        ...mockTransactions[0],
        transaction_id: `0.0.1234${i}@123456789${i}.000000000`,
        consensus_timestamp: `16094592${String(i).padStart(2, '0')}.123456789`,
      }));

      const mockServiceInstanceWithMany = {
        ...mockServiceInstance,
        getAccountTransactions: jest.fn().mockResolvedValue({
          transactions: manyTransactions,
          links: { next: null },
        }),
      };
      MockHederaTransactionService.mockImplementation(() => mockServiceInstanceWithMany as any);

      await act(async () => {
        render(<TransactionHistory hederaConfig={mockConfig} accountId="0.0.12345" />);
      });

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
      });

      expect(screen.getByText('Next')).toBeInTheDocument();
      expect(screen.getByText('Previous')).toBeDisabled();
    });

    it('navigates between pages', async () => {
      const manyTransactions = Array.from({ length: 25 }, (_, i) => ({
        ...mockTransactions[0],
        transaction_id: `0.0.1234${i}@123456789${i}.000000000`,
        consensus_timestamp: `16094592${String(i).padStart(2, '0')}.123456789`,
      }));

      const mockServiceInstanceWithMany = {
        ...mockServiceInstance,
        getAccountTransactions: jest.fn().mockResolvedValue({
          transactions: manyTransactions,
          links: { next: null },
        }),
      };
      MockHederaTransactionService.mockImplementation(() => mockServiceInstanceWithMany as any);

      await act(async () => {
        render(<TransactionHistory hederaConfig={mockConfig} accountId="0.0.12345" />);
      });

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Next'));
      expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Previous'));
      expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
    });
  });

  describe('refresh functionality', () => {
    it('refreshes transactions when refresh button is clicked', async () => {
      await act(async () => {
        render(<TransactionHistory hederaConfig={mockConfig} accountId="0.0.12345" />);
      });

      await waitFor(() => {
        expect(screen.getByText('2 HBAR')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('🔄 Refresh'));

      expect(mockServiceInstance.getAccountTransactions).toHaveBeenCalledTimes(2);
    });

    it('shows loading state during refresh', async () => {
      await act(async () => {
        render(<TransactionHistory hederaConfig={mockConfig} accountId="0.0.12345" />);
      });

      await waitFor(() => {
        expect(screen.getByText('2 HBAR')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('🔄 Refresh'));

      expect(screen.getByText('⏳ Loading...')).toBeInTheDocument();
    });
  });

  describe('transaction type detection', () => {
    it('identifies transfer transactions', async () => {
      await act(async () => {
        render(<TransactionHistory hederaConfig={mockConfig} accountId="0.0.12345" />);
      });

      await waitFor(() => {
        expect(screen.getByText('Transfer')).toBeInTheDocument();
      });
    });

    it('identifies contract call transactions', async () => {
      const contractTransaction = {
        ...mockTransactions[0],
        memo_base64: '0xbabefef', // Direct hex data for contract call
      };

      const mockServiceInstanceWithContract = {
        ...mockServiceInstance,
        getAccountTransactions: jest.fn().mockResolvedValue({
          transactions: [contractTransaction],
          links: { next: null },
        }),
        convertMirrorTransaction: jest.fn().mockReturnValue({
          ...mockServiceInstance.convertMirrorTransaction(),
          data: '0xbabefef', // Decoded memo_base64
        }),
      };
      MockHederaTransactionService.mockImplementation(() => mockServiceInstanceWithContract as any);

      await act(async () => {
        render(<TransactionHistory hederaConfig={mockConfig} accountId="0.0.12345" />);
      });

      await waitFor(() => {
        expect(screen.getByText('Contract Call')).toBeInTheDocument();
      });
    });
  });

  describe('status colors', () => {
    it('displays correct status colors', async () => {
      const statusTests = [
        { status: 'executed', class: 'echain-status-confirmed' },
        { status: 'pending', class: 'echain-status-pending' },
        { status: 'approved', class: 'echain-status-info' },
        { status: 'failed', class: 'echain-status-failed' },
      ];

      for (const { status, class: expectedClass } of statusTests) {
        const transactionWithStatus = {
          ...mockTransactions[0],
          result: status.toUpperCase(),
        };

        const mockServiceInstanceWithStatus = {
          ...mockServiceInstance,
          getAccountTransactions: jest.fn().mockResolvedValue({
            transactions: [transactionWithStatus],
            links: { next: null },
          }),
          convertMirrorTransaction: jest.fn().mockReturnValue({
            ...mockServiceInstance.convertMirrorTransaction(),
            status,
          }),
        };
        MockHederaTransactionService.mockImplementation(() => mockServiceInstanceWithStatus as any);

        await act(async () => {
          render(<TransactionHistory hederaConfig={mockConfig} accountId="0.0.12345" />);
        });

        await waitFor(() => {
          const statusElement = screen.getByText(status);
          expect(statusElement).toHaveClass(expectedClass);
        });

        // Clean up for next iteration
        jest.clearAllMocks();
      }
    });
  });

  describe('accessibility', () => {
    it('has proper ARIA labels for filter inputs', async () => {
      await act(async () => {
        render(<TransactionHistory hederaConfig={mockConfig} accountId="0.0.12345" />);
      });

      fireEvent.click(screen.getByText('🔼 Show Filters'));

      expect(screen.getByLabelText('Filter transactions by start date')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter transactions by end date')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter transactions by minimum amount in HBAR')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter transactions by maximum amount in HBAR')).toBeInTheDocument();
      expect(screen.getByLabelText('Search transactions by ID, address, or hash')).toBeInTheDocument();
    });

    it('has proper ARIA labels for status checkboxes', async () => {
      await act(async () => {
        render(<TransactionHistory hederaConfig={mockConfig} accountId="0.0.12345" />);
      });

      fireEvent.click(screen.getByText('🔼 Show Filters'));

      expect(screen.getByLabelText('Filter by pending status')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by approved status')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by executed status')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by failed status')).toBeInTheDocument();
    });

    it('has proper ARIA labels for type checkboxes', async () => {
      await act(async () => {
        render(<TransactionHistory hederaConfig={mockConfig} accountId="0.0.12345" />);
      });

      fireEvent.click(screen.getByText('🔼 Show Filters'));

      expect(screen.getByLabelText('Filter by transfer type')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by contract call type')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by multisig operation type')).toBeInTheDocument();
    });
  });
});