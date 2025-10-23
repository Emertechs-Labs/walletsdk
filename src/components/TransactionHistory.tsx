'use client';

import './styles.css';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useHederaProvider } from '../hooks/useHederaProvider';
import type { HederaProviderConfig, MultisigTransaction } from '../types/hedera';
import HederaTransactionService from '../services/hederaTransactionService';

interface TransactionFilters {
  dateRange?: { start: Date; end: Date };
  status?: ('pending' | 'approved' | 'executed' | 'cancelled')[];
  amountRange?: { min: number; max: number };
  type?: ('transfer' | 'contract_call' | 'multisig_operation')[];
  searchQuery?: string;
}

interface TransactionHistoryProps {
  hederaConfig: HederaProviderConfig;
  accountId?: string;
  className?: string;
}

interface TransactionWithDetails extends MultisigTransaction {
  hash?: string;
  blockNumber?: number;
  gasUsed?: string;
  gasPrice?: string;
  confirmations?: number;
  timestamp: number;
}

export function TransactionHistory({ hederaConfig, accountId, className = '' }: TransactionHistoryProps) {
  // Connect to Hedera (for future multisig integration)
  useHederaProvider(hederaConfig);
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([]);
  const [loading, setLoading] = useState(!!accountId); // Start loading if accountId is provided
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  // Filters state
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  // Filter form state
  const [filterForm, setFilterForm] = useState({
    startDate: '',
    endDate: '',
    status: [] as string[],
    minAmount: '',
    maxAmount: '',
    type: [] as string[],
    searchQuery: '',
  });

  // Real-time updates
  const [enableRealTime] = useState(true);

  // Transaction service
  const transactionService = useMemo(() => 
    new HederaTransactionService(hederaConfig),
    [hederaConfig.network]
  );

  const loadTransactions = useCallback(async () => {
    if (!accountId) {
      setError('No account ID provided');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch real transactions from Hedera Mirror Node
      const response = await transactionService.getAccountTransactions({
        accountId,
        limit: pageSize,
      });

      // Convert Hedera transactions to our format
      const convertedTxs: TransactionWithDetails[] = response.transactions.map(tx => ({
        id: tx.transaction_id,
        to: tx.transfers.find(t => t.amount > 0)?.account || '',
        value: (Math.abs(tx.transfers.find(t => t.account === accountId)?.amount || 0) / 100000000).toString(),
        data: tx.memo_base64 || '',
        proposer: tx.transfers.find(t => t.amount < 0)?.account || accountId,
        approvals: [{ 
          signer: accountId, 
          weight: 1, 
          timestamp: new Date(parseFloat(tx.consensus_timestamp) * 1000).getTime() 
        }],
        status: transactionService.convertMirrorTransaction(tx).status as 'pending' | 'approved' | 'executed' | 'cancelled',
        timestamp: new Date(parseFloat(tx.consensus_timestamp) * 1000).getTime(),
        hash: tx.transaction_hash,
        blockNumber: 0, // Hedera doesn't have blocks
        gasUsed: (tx.charged_tx_fee / 100000000).toString(),
        gasPrice: '0',
        confirmations: tx.result === 'SUCCESS' ? 1 : 0,
      }));

      setTransactions(convertedTxs);
    } catch (err) {
      console.error('Failed to load transactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
      
      // Fallback to empty array on error
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [accountId, transactionService, pageSize]);

  // Load transactions
  useEffect(() => {
    if (accountId) {
      loadTransactions();
    }
  }, [accountId, loadTransactions]);

  // Real-time updates with polling
  useEffect(() => {
    if (!enableRealTime || !accountId) return;

    const interval = setInterval(() => {
      loadTransactions();
    }, 10000); // Poll every 10 seconds

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [enableRealTime, accountId, loadTransactions]);

  // Apply filters
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Date range filter
    if (filters.dateRange) {
      filtered = filtered.filter(tx => {
        const txDate = new Date(tx.timestamp);
        return txDate >= filters.dateRange!.start && txDate <= filters.dateRange!.end;
      });
    }

    // Status filter
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(tx => filters.status!.includes(tx.status));
    }

    // Amount range filter
    if (filters.amountRange) {
      filtered = filtered.filter(tx => {
        const amount = parseFloat(tx.value);
        return amount >= filters.amountRange!.min && amount <= filters.amountRange!.max;
      });
    }

    // Type filter
    if (filters.type && filters.type.length > 0) {
      filtered = filtered.filter(tx => {
        if (tx.data && tx.data.startsWith('0x')) {
          return filters.type!.includes('contract_call');
        } else if (tx.approvals.length > 1) {
          return filters.type!.includes('multisig_operation');
        } else {
          return filters.type!.includes('transfer');
        }
      });
    }

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(tx =>
        tx.id.toLowerCase().includes(query) ||
        tx.to.toLowerCase().includes(query) ||
        tx.hash?.toLowerCase().includes(query) ||
        tx.value.includes(query)
      );
    }

    return filtered;
  }, [transactions, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / pageSize);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Apply filters from form
  const applyFilters = () => {
    const newFilters: TransactionFilters = {};

    if (filterForm.startDate || filterForm.endDate) {
      newFilters.dateRange = {
        start: filterForm.startDate ? new Date(filterForm.startDate) : new Date(0),
        end: filterForm.endDate ? new Date(filterForm.endDate) : new Date(),
      };
    }

    if (filterForm.status.length > 0) {
      newFilters.status = filterForm.status as ('pending' | 'approved' | 'executed' | 'cancelled')[];
    }

    if (filterForm.minAmount || filterForm.maxAmount) {
      newFilters.amountRange = {
        min: filterForm.minAmount ? parseFloat(filterForm.minAmount) : 0,
        max: filterForm.maxAmount ? parseFloat(filterForm.maxAmount) : Infinity,
      };
    }

    if (filterForm.type.length > 0) {
      newFilters.type = filterForm.type as ('transfer' | 'contract_call' | 'multisig_operation')[];
    }

    if (filterForm.searchQuery.trim()) {
      newFilters.searchQuery = filterForm.searchQuery.trim();
    }

    setFilters(newFilters);
    setCurrentPage(1);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({});
    setFilterForm({
      startDate: '',
      endDate: '',
      status: [],
      minAmount: '',
      maxAmount: '',
      type: [],
      searchQuery: '',
    });
    setCurrentPage(1);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'executed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get transaction type
  const getTransactionType = (tx: TransactionWithDetails) => {
    if (tx.data && tx.data.startsWith('0x')) {
      return 'Contract Call';
    } else if (tx.approvals.length > 1) {
      return 'Multisig Operation';
    } else {
      return 'Transfer';
    }
  };

  if (!accountId) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please provide an account ID to view transaction history</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`echain-component ${className}`}>
      {/* Header */}
      <div className="echain-header">
        <div className="echain-header-content">
          <h1 className="echain-title">📋 Transaction History</h1>
          <p className="echain-subtitle">Complete transaction history with filtering</p>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="echain-section">
        <div className="echain-status-indicator echain-status-warning">
          Demo Mode
        </div>
      </div>

      {/* Controls */}
      <div className="echain-section">
        <div className="echain-section-title">Transaction Controls</div>
        <div className="echain-form-actions">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="echain-action-button echain-action-button-secondary"
          >
            {showFilters ? '🔽 Hide Filters' : '🔼 Show Filters'}
          </button>
          <button
            onClick={loadTransactions}
            disabled={loading}
            className="echain-action-button echain-action-button-primary"
          >
            {loading ? '⏳ Loading...' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="echain-section">
          <div className="echain-section-title">Filter Transactions</div>
          <div className="echain-form-grid">
            {/* Date Range */}
            <div>
              <label htmlFor="filter-start-date" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                id="filter-start-date"
                type="date"
                value={filterForm.startDate}
                onChange={(e) => setFilterForm(prev => ({ ...prev, startDate: e.target.value }))}
                title="Filter transactions by start date"
                aria-label="Filter transactions by start date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="filter-end-date" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                id="filter-end-date"
                type="date"
                value={filterForm.endDate}
                onChange={(e) => setFilterForm(prev => ({ ...prev, endDate: e.target.value }))}
                title="Filter transactions by end date"
                aria-label="Filter transactions by end date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Amount Range */}
            <div>
              <label htmlFor="filter-min-amount" className="block text-sm font-medium text-gray-700 mb-1">Min Amount (HBAR)</label>
              <input
                id="filter-min-amount"
                type="number"
                value={filterForm.minAmount}
                onChange={(e) => setFilterForm(prev => ({ ...prev, minAmount: e.target.value }))}
                placeholder="0"
                title="Filter transactions by minimum amount in HBAR"
                aria-label="Filter transactions by minimum amount in HBAR"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="filter-max-amount" className="block text-sm font-medium text-gray-700 mb-1">Max Amount (HBAR)</label>
              <input
                id="filter-max-amount"
                type="number"
                value={filterForm.maxAmount}
                onChange={(e) => setFilterForm(prev => ({ ...prev, maxAmount: e.target.value }))}
                placeholder="1000"
                title="Filter transactions by maximum amount in HBAR"
                aria-label="Filter transactions by maximum amount in HBAR"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="space-y-1">
                {['pending', 'approved', 'executed', 'failed'].map(status => (
                  <label key={status} htmlFor={`status-${status}`} className="flex items-center">
                    <input
                      id={`status-${status}`}
                      type="checkbox"
                      checked={filterForm.status.includes(status)}
                      onChange={(e) => {
                        const newStatus = e.target.checked
                          ? [...filterForm.status, status]
                          : filterForm.status.filter(s => s !== status);
                        setFilterForm(prev => ({ ...prev, status: newStatus }));
                      }}
                      aria-label={`Filter by ${status} status`}
                      title={`Filter by ${status} status`}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm capitalize">{status}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <div className="space-y-1">
                {['transfer', 'contract_call', 'multisig_operation'].map(type => (
                  <label key={type} htmlFor={`type-${type}`} className="flex items-center">
                    <input
                      id={`type-${type}`}
                      type="checkbox"
                      checked={filterForm.type.includes(type)}
                      onChange={(e) => {
                        const newType = e.target.checked
                          ? [...filterForm.type, type]
                          : filterForm.type.filter(t => t !== type);
                        setFilterForm(prev => ({ ...prev, type: newType }));
                      }}
                      aria-label={`Filter by ${type.replace('_', ' ')} type`}
                      title={`Filter by ${type.replace('_', ' ')} type`}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm capitalize">{type.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Search */}
            <div>
              <label htmlFor="filter-search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                id="filter-search"
                type="text"
                value={filterForm.searchQuery}
                onChange={(e) => setFilterForm(prev => ({ ...prev, searchQuery: e.target.value }))}
                placeholder="Transaction ID, address, hash..."
                title="Search transactions by ID, address, or hash"
                aria-label="Search transactions by ID, address, or hash"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter Actions */}
            <div className="echain-form-actions">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Clear
              </button>
              <button
                onClick={applyFilters}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="echain-section">
          <div className="echain-status-indicator echain-status-error">
            Error: {error}
          </div>
        </div>
      )}

      {/* Transaction Table */}
      <div className="echain-section">
        <div className="echain-section-title">Recent Transactions</div>
        <div className="echain-transaction-history">
          <div className="echain-transaction-header">
            <span>Transaction</span>
            <span>Amount</span>
            <span>Status</span>
          </div>
          {loading ? (
            <div className="echain-loading-container">
              <div className="echain-loading"></div>
              <p className="echain-loading-text">Loading transactions...</p>
            </div>
          ) : paginatedTransactions.length === 0 ? (
            <div className="echain-empty-state">
              <div className="echain-empty-icon">📄</div>
              <h3 className="echain-empty-title">No transactions found</h3>
              <p className="echain-empty-description">
                {Object.keys(filters).length > 0 ? 'Try adjusting your filters.' : 'Your transaction history will appear here.'}
              </p>
            </div>
          ) : (
            paginatedTransactions.map((tx) => (
              <div key={tx.id} className="echain-transaction-row">
                <div className="echain-transaction-info">
                  <div className={`echain-status-dot ${getStatusColor(tx.status).includes('green') ? 'echain-status-success' :
                    getStatusColor(tx.status).includes('yellow') ? 'echain-status-warning' :
                    getStatusColor(tx.status).includes('red') ? 'echain-status-error' : 'echain-status-info'}`}></div>
                  <div>
                    <div className="echain-transaction-type">{getTransactionType(tx)}</div>
                    <div className="echain-transaction-time">{new Date(tx.timestamp).toLocaleString()}</div>
                  </div>
                </div>
                <div className="echain-transaction-amount">{tx.value} HBAR</div>
                <div className={`echain-transaction-status ${getStatusColor(tx.status).includes('green') ? 'echain-status-confirmed' :
                  getStatusColor(tx.status).includes('yellow') ? 'echain-status-pending' :
                  getStatusColor(tx.status).includes('red') ? 'echain-status-failed' :
                  getStatusColor(tx.status).includes('blue') ? 'echain-status-info' : 'echain-status-confirmed'}`}>
                  {tx.status}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="echain-section">
          <div className="echain-pagination">
            <div className="echain-pagination-info">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredTransactions.length)} of {filteredTransactions.length} transactions
            </div>
            <div className="echain-pagination-controls">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="echain-pagination-button"
              >
                Previous
              </button>
              <span className="echain-pagination-current">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="echain-pagination-button"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}