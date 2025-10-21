import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
    getAccountTransactions: jest.fn().mockResolvedValue({
      transactions: mockTransactions,
      links: { next: null },
    }),
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
    it('shows message when no account ID is provided', () => {
      render(<TransactionHistory hederaConfig={mockConfig} />);

      expect(screen.getByText('Please provide an account ID to view transaction history')).toBeInTheDocument();
    });

    it('renders header with title and buttons', () => {
      render(<TransactionHistory hederaConfig={mockConfig} accountId="0.0.12345" />);

      expect(screen.getByText('Transaction History')).toBeInTheDocument();
      expect(screen.getByText('Show Filters')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('displays loading state initially', () => {
      render(<TransactionHistory hederaConfig={mockConfig} accountId="0.0.12345" />);

      expect(screen.getByText('Loading transactions...')).toBeInTheDocument();
    });
  });

  describe('transaction loading', () => {
    it('loads and displays transactions successfully', async () => {
      render(<TransactionHistory hederaConfig={mockConfig} accountId="0.0.12345" />);

      await waitFor(() => {
        // Check for any date string that contains 1/1/2021
        expect(screen.getByText(/1\/1\/2021/)).toBeInTheDocument();
      });

      expect(screen.getByText('Transfer')).toBeInTheDocument();
      expect(screen.getByText('0.0.67890')).toBeInTheDocument();
      expect(screen.getByText('2 HBAR')).toBeInTheDocument();
      expect(screen.getByText('executed')).toBeInTheDocument();
    });

    it('handles loading errors gracefully', async () => {
      const mockServiceInstanceWithError = {
        ...mockServiceInstance,
        getAccountTransactions: jest.fn().mockRejectedValue(new Error('Network error')),
      };
      MockHederaTransactionService.mockImplementation(() => mockServiceInstanceWithError as any);

      render(<TransactionHistory hederaConfig={mockConfig} accountId="0.0.12345" />);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
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

      render(<TransactionHistory hederaConfig={mockConfig} accountId="0.0.12345" />);

      await waitFor(() => {
        expect(screen.getByText('No transactions found')).toBeInTheDocument();
      });
    });
  });

  describe('filtering functionality', () => {
    it('toggles filter visibility', async () => {
      render(<TransactionHistory hederaConfig={mockConfig} accountId="0.0.12345" />);

      await waitFor(() => {
        expect(screen.queryByText('Start Date')).not.toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Show Filters'));
      expect(screen.getByText('Start Date')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Hide Filters'));
      expect(screen.queryByText('Start Date')).not.toBeInTheDocument();
    });

    it('applies date range filters', async () => {
      render(<TransactionHistory hederaConfig={mockConfig} accountId="0.0.12345" />);

      await waitFor(() => {
        expect(screen.getByText(/1\/1\/2021/)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Show Filters'));

      const startDateInput = screen.getByLabelText('Filter transactions by start date');
      const endDateInput = screen.getByLabelText('Filter transactions by end date');

      fireEvent.change(startDateInput, { target: { value: '2021-01-02' } });
      fireEvent.change(endDateInput, { target: { value: '2021-01-02' } });

      fireEvent.click(screen.getByText('Apply Filters'));

      await waitFor(() => {
        expect(screen.getByText('No transactions found')).toBeInTheDocument();
      });
    });

    it('applies amount range filters', async () => {
      render(<TransactionHistory hederaConfig={mockConfig} accountId="0.0.12345" />);

      await waitFor(() => {
        expect(screen.getByText('2 HBAR')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Show Filters'));

      const minAmountInput = screen.getByLabelText('Filter transactions by minimum amount in HBAR');
      const maxAmountInput = screen.getByLabelText('Filter transactions by maximum amount in HBAR');

      fireEvent.change(minAmountInput, { target: { value: '5' } });
      fireEvent.change(maxAmountInput, { target: { value: '10' } });

      fireEvent.click(screen.getByText('Apply Filters'));

      await waitFor(() => {
        expect(screen.getByText('No transactions found')).toBeInTheDocument();
      });
    });

    it('applies status filters', async () => {
      render(<TransactionHistory hederaConfig={mockConfig} accountId="0.0.12345" />);

      await waitFor(() => {
        expect(screen.getByText('executed')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Show Filters'));

      const pendingCheckbox = screen.getByLabelText('Filter by pending status');
      fireEvent.click(pendingCheckbox);

      fireEvent.click(screen.getByText('Apply Filters'));

      await waitFor(() => {
        expect(screen.getByText('No transactions found')).toBeInTheDocument();
      });
    });

    it('applies search filter', async () => {
      render(<TransactionHistory hederaConfig={mockConfig} accountId="0.0.12345" />);

      await waitFor(() => {
        expect(screen.getByText('0.0.67890')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Show Filters'));

      const searchInput = screen.getByLabelText('Search transactions by ID, address, or hash');
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

      fireEvent.click(screen.getByText('Apply Filters'));

      await waitFor(() => {
        expect(screen.getByText('No transactions found')).toBeInTheDocument();
      });
    });

    it('clears all filters', async () => {
      render(<TransactionHistory hederaConfig={mockConfig} accountId="0.0.12345" />);

      await waitFor(() => {
        expect(screen.getByText('2 HBAR')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Show Filters'));

      const searchInput = screen.getByLabelText('Search transactions by ID, address, or hash');
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

      fireEvent.click(screen.getByText('Apply Filters'));

      await waitFor(() => {
        expect(screen.getByText('No transactions found')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Clear Filters'));

      await waitFor(() => {
        expect(screen.getByText('2 HBAR')).toBeInTheDocument();
      });
    });
  });

  describe('sorting functionality', () => {
    it('sorts by timestamp', async () => {
      // Add another transaction for sorting test
      const additionalTransaction = {
        ...mockTransactions[0],
        transaction_id: '0.0.12346@1234567891.000000000',
        consensus_timestamp: '1609459201.123456789', // 1 second later
        transfers: [
          { account: '0.0.12345', amount: -100000000, is_approval: false }, // -1 HBAR
          { account: '0.0.99999', amount: 100000000, is_approval: false },  // +1 HBAR
        ],
      };

      const mockServiceInstanceWithMultiple = {
        ...mockServiceInstance,
        getAccountTransactions: jest.fn().mockResolvedValue({
          transactions: [mockTransactions[0], additionalTransaction],
          links: { next: null },
        }),
      };
      MockHederaTransactionService.mockImplementation(() => mockServiceInstanceWithMultiple as any);

      render(<TransactionHistory hederaConfig={mockConfig} accountId="0.0.12345" />);

      await waitFor(() => {
        expect(screen.getAllByText(/HBAR/)).toHaveLength(2);
      });

      const timestampHeader = screen.getByText('Date/Time ↓');
      fireEvent.click(timestampHeader);

      // Should now be ascending (↑)
      expect(screen.getByText('Date/Time ↑')).toBeInTheDocument();
    });

    it('sorts by amount', async () => {
      const mockServiceInstanceWithMultiple = {
        ...mockServiceInstance,
        getAccountTransactions: jest.fn().mockResolvedValue({
          transactions: [
            {
              ...mockTransactions[0],
              transfers: [
                { account: '0.0.12345', amount: -100000000, is_approval: false }, // -1 HBAR
                { account: '0.0.67890', amount: 100000000, is_approval: false },  // +1 HBAR
              ],
            },
            {
              ...mockTransactions[0],
              transaction_id: '0.0.12346@1234567891.000000000',
              transfers: [
                { account: '0.0.12345', amount: -300000000, is_approval: false }, // -3 HBAR
                { account: '0.0.99999', amount: 300000000, is_approval: false },  // +3 HBAR
              ],
            },
          ],
          links: { next: null },
        }),
      };
      MockHederaTransactionService.mockImplementation(() => mockServiceInstanceWithMultiple as any);

      render(<TransactionHistory hederaConfig={mockConfig} accountId="0.0.12345" />);

      await waitFor(() => {
        expect(screen.getAllByText(/HBAR/)).toHaveLength(2);
      });

      const amountHeader = screen.getByText('Amount');
      fireEvent.click(amountHeader);

      expect(screen.getByText('Amount ↓')).toBeInTheDocument();
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

      render(<TransactionHistory hederaConfig={mockConfig} accountId="0.0.12345" />);

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

      render(<TransactionHistory hederaConfig={mockConfig} accountId="0.0.12345" />);

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
      render(<TransactionHistory hederaConfig={mockConfig} accountId="0.0.12345" />);

      await waitFor(() => {
        expect(screen.getByText('2 HBAR')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Refresh'));

      expect(mockServiceInstance.getAccountTransactions).toHaveBeenCalledTimes(2);
    });

    it('shows loading state during refresh', async () => {
      render(<TransactionHistory hederaConfig={mockConfig} accountId="0.0.12345" />);

      await waitFor(() => {
        expect(screen.getByText('2 HBAR')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Refresh'));

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('transaction type detection', () => {
    it('identifies transfer transactions', async () => {
      render(<TransactionHistory hederaConfig={mockConfig} accountId="0.0.12345" />);

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

      render(<TransactionHistory hederaConfig={mockConfig} accountId="0.0.12345" />);

      await waitFor(() => {
        expect(screen.getByText('Contract Call')).toBeInTheDocument();
      });
    });
  });

  describe('status colors', () => {
    it('displays correct status colors', async () => {
      const statusTests = [
        { status: 'executed', class: 'bg-green-100' },
        { status: 'pending', class: 'bg-yellow-100' },
        { status: 'approved', class: 'bg-blue-100' },
        { status: 'failed', class: 'bg-red-100' },
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

        render(<TransactionHistory hederaConfig={mockConfig} accountId="0.0.12345" />);

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
      render(<TransactionHistory hederaConfig={mockConfig} accountId="0.0.12345" />);

      fireEvent.click(screen.getByText('Show Filters'));

      expect(screen.getByLabelText('Filter transactions by start date')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter transactions by end date')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter transactions by minimum amount in HBAR')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter transactions by maximum amount in HBAR')).toBeInTheDocument();
      expect(screen.getByLabelText('Search transactions by ID, address, or hash')).toBeInTheDocument();
    });

    it('has proper ARIA labels for status checkboxes', async () => {
      render(<TransactionHistory hederaConfig={mockConfig} accountId="0.0.12345" />);

      fireEvent.click(screen.getByText('Show Filters'));

      expect(screen.getByLabelText('Filter by pending status')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by approved status')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by executed status')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by failed status')).toBeInTheDocument();
    });

    it('has proper ARIA labels for type checkboxes', async () => {
      render(<TransactionHistory hederaConfig={mockConfig} accountId="0.0.12345" />);

      fireEvent.click(screen.getByText('Show Filters'));

      expect(screen.getByLabelText('Filter by transfer type')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by contract call type')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by multisig operation type')).toBeInTheDocument();
    });
  });
});