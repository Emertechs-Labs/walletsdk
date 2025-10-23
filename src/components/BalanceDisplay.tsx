/**
 * Balance Display Component
 * Shows real-time HBAR and token balances with auto-refresh
 */

'use client';

import './styles.css';

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
    <div className="echain-component">
      {/* Header */}
      <div className="echain-header">
        <div className="echain-header-content">
          <h1 className="echain-title">💰 Balance Display</h1>
          <p className="echain-subtitle">Real-time balance with automatic refresh</p>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="echain-section">
        <div className="echain-status-indicator echain-status-success">
          Connected
        </div>
      </div>

      {/* Balance Display */}
      <div className="echain-balance-display">
        <div className="echain-balance-icon">💰</div>
        <div className="echain-balance-title">Current Balance</div>
        <div className="echain-balance-amount">
          {walletType === 'hedera'
            ? formatBalance(hbarBalance)
            : formatBalance(tokenBalances.find(t => t.token_id === 'eth')?.balance || 0)
          }
        </div>
        <div className="echain-balance-currency">
          {walletType === 'hedera' ? 'HBAR' : 'ETH'}
        </div>
      </div>

      {/* Account Info */}
      <div className="echain-section">
        <div className="echain-section-title">Account Information</div>
        <div className="echain-section-description">
          {walletType === 'hedera' ? 'Hedera Account' : 'Ethereum Address'}: {activeAccountId}
        </div>
        {lastUpdated && (
          <div className="echain-section-description">
            Last updated: {formatTimestamp(lastUpdated)}
            {autoRefresh && (
              <span className="echain-status-indicator echain-status-info echain-live-indicator">
                Live
              </span>
            )}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="echain-section">
          <div className="echain-status-indicator echain-status-error">
            Error: {error}
          </div>
        </div>
      )}

      {/* Token Balances */}
      {tokenBalances.length > 0 && (
        <div className="echain-section">
          <div className="echain-section-title">Token Holdings</div>
          <div className="echain-token-list">
            {tokenBalances
              .filter(token => token.token_id !== 'eth' || walletType !== 'ethereum')
              .map((token) => (
                <div
                  key={token.token_id}
                  className="echain-token-item"
                >
                  <div className="echain-token-info">
                    <div className="echain-token-name">
                      {token.symbol || token.name || (walletType === 'hedera' ? 'Hedera Token' : 'ERC-20 Token')}
                    </div>
                    <div className="echain-token-id">
                      {token.token_id}
                    </div>
                  </div>
                  <div className="echain-token-amount">
                    <div className="echain-token-value">
                      {formatBalance(token.balance / Math.pow(10, token.decimals || (walletType === 'hedera' ? 0 : 18)))}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="echain-section echain-actions-section">
        <div className="echain-actions-grid">
          <button
            onClick={() => fetchBalance(true)}
            disabled={loading || refreshing}
            className="echain-action-button echain-action-button-primary"
          >
            {refreshing ? '🔄 Refreshing...' : '🔄 Refresh'}
          </button>
          <button className="echain-action-button echain-action-button-secondary">
            📤 Send
          </button>
          <button className="echain-action-button echain-action-button-secondary">
            📥 Receive
          </button>
        </div>
      </div>
    </div>
  );
}

export default BalanceDisplay;
