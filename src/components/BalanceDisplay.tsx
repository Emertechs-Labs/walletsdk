/**
 * Balance Display Component
 * Shows real-time HBAR and token balances with auto-refresh
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { HederaProviderConfig } from '../types/hedera';
import HederaTransactionService from '../services/hederaTransactionService';
import { useHederaWallet } from '../hooks/useHederaWallet';

export interface BalanceDisplayProps {
  config?: HederaProviderConfig; // Optional for Hedera, not needed for Ethereum
  accountId?: string; // Optional - will use connected wallet if not provided
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
  onBalanceUpdate?: (balance: number, tokens: TokenBalance[]) => void;
}

export interface TokenBalance {
  token_id: string;
  balance: number;
  decimals?: number;
  symbol?: string;
  name?: string;
}

export function BalanceDisplay({
  config,
  accountId,
  autoRefresh = true,
  refreshInterval = 10000, // 10 seconds default
  onBalanceUpdate,
}: BalanceDisplayProps) {
  // Wallet connections
  const { address: ethAddress, isConnected: ethIsConnected } = useAccount();
  const { data: ethBalance } = useBalance({ address: ethAddress });
  const { isConnected: hederaIsConnected, accountId: hederaAccountId, getAccountBalance: getHederaBalance } = useHederaWallet();

  const [hbarBalance, setHbarBalance] = useState<number>(0);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [walletType, setWalletType] = useState<'ethereum' | 'hedera' | null>(null);

  // Determine which wallet/account to use
  const activeAccountId = accountId ||
    (hederaIsConnected ? hederaAccountId : null) ||
    (ethIsConnected ? ethAddress : null);

  const activeWalletType = accountId && accountId.trim() !== ''
    ? (accountId.includes('.') ? 'hedera' : 'ethereum') // Simple heuristic
    : hederaIsConnected
      ? 'hedera'
      : ethIsConnected
        ? 'ethereum'
        : null;

  // Update wallet type when connections change
  useEffect(() => {
    setWalletType(activeWalletType);
  }, [activeWalletType]);

  const transactionService = config ? new HederaTransactionService(config) : null;

  const fetchBalance = useCallback(async (isManualRefresh = false) => {
    if (!activeAccountId) {
      setError('No account connected');
      setLoading(false);
      return;
    }

    if (isManualRefresh) {
      setRefreshing(true);
    }

    try {
      setError(null);

      if (activeWalletType === 'hedera') {
        // Fetch Hedera balance
        if (transactionService) {
          const balanceData = await transactionService.getAccountBalance(activeAccountId);

          setHbarBalance(balanceData.balance);
          setTokenBalances(balanceData.tokens.map(token => ({
            token_id: token.token_id,
            balance: token.balance,
          })));
        } else if (getHederaBalance) {
          // Use wallet manager method
          const balance = await getHederaBalance(activeAccountId);
          setHbarBalance(Number(balance.toString()) / 1e8); // Convert tinybars to HBAR
          setTokenBalances([]); // Token balances not available via wallet manager yet
        }
      } else if (activeWalletType === 'ethereum') {
        // For Ethereum, we mainly show ETH balance for now
        // In a full implementation, you'd integrate with token contracts
        if (ethBalance) {
          setHbarBalance(0); // No HBAR for Ethereum
          setTokenBalances([{
            token_id: 'eth',
            balance: Number(ethBalance.value.toString()) / 1e18,
            decimals: 18,
            symbol: 'ETH',
            name: 'Ethereum',
          }]);
        }
      }

      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch balance');
      console.error('Balance fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []); // Remove all dependencies to prevent infinite loops

  // Call onBalanceUpdate when balances change
  useEffect(() => {
    if (onBalanceUpdate && lastUpdated) {
      onBalanceUpdate(hbarBalance, tokenBalances);
    }
  }, [onBalanceUpdate, hbarBalance, tokenBalances, lastUpdated]);

  // Initial fetch
  useEffect(() => {
    fetchBalance();
  }, []); // Call fetchBalance on mount, it will handle the account check internally

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchBalance, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]); // Remove fetchBalance dependency

  const formatBalance = (balance: number): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(balance);
  };

  const formatTimestamp = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  if (loading && !lastUpdated) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {walletType === 'hedera' ? 'Account Balance' : 'Wallet Balance'}
          </h2>
          <p className="text-sm text-gray-500 font-mono">{activeAccountId}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
            walletType === 'hedera'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-purple-100 text-purple-800'
          }`}>
            {walletType === 'hedera' ? (config?.network || 'hedera') : 'ethereum'}
          </span>
          <button
            onClick={() => fetchBalance(true)}
            disabled={loading || refreshing}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
            title="Refresh balance"
          >
            <svg
              className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Balance Display */}
      <div className="px-6 py-6">
        {walletType === 'hedera' ? (
          // Hedera HBAR Balance
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-bold text-gray-900">
              {formatBalance(hbarBalance)}
            </span>
            <span className="text-2xl font-semibold text-gray-500">HBAR</span>
          </div>
        ) : (
          // Ethereum ETH Balance
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-bold text-gray-900">
              {formatBalance(tokenBalances.find(t => t.token_id === 'eth')?.balance || 0)}
            </span>
            <span className="text-2xl font-semibold text-gray-500">ETH</span>
          </div>
        )}
        {lastUpdated && (
          <p className="mt-1 text-sm text-gray-500">
            Last updated: {formatTimestamp(lastUpdated)}
            {autoRefresh && (
              <span className="ml-2 inline-flex items-center">
                <span className="flex h-2 w-2 relative mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Live
              </span>
            )}
          </p>
        )}
      </div>

      {/* Token Balances */}
      {tokenBalances.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            {walletType === 'hedera' ? 'Token Balances' : 'Token Holdings'}
          </h3>
          <div className="space-y-2">
            {tokenBalances
              .filter(token => token.token_id !== 'eth' || walletType !== 'ethereum') // Don't show ETH twice
              .map((token) => (
              <div
                key={token.token_id}
                className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {token.symbol || token.name || (walletType === 'hedera' ? 'Hedera Token' : 'ERC-20 Token')}
                  </p>
                  <p className="text-xs font-mono text-gray-500">{token.token_id}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatBalance(token.balance / Math.pow(10, token.decimals || (walletType === 'hedera' ? 0 : 18)))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex space-x-2">
        <button className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
          Send
        </button>
        <button className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
          Receive
        </button>
      </div>
    </div>
  );
}

export default BalanceDisplay;
