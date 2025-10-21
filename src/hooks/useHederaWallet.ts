import { useState, useEffect, useCallback } from 'react';
import { getHederaWalletManager, HederaWalletState } from '../lib/hedera-wallet-manager';
import type { HederaNetwork } from '../types/hedera';

export function useHederaWallet(network: HederaNetwork = 'testnet') {
  const [state, setState] = useState<HederaWalletState>({
    isConnected: false,
    accountId: null,
    walletType: null,
    network,
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const walletManager = getHederaWalletManager(network);

  // Update state when wallet manager state changes
  useEffect(() => {
    const updateState = () => {
      setState(walletManager.getState());
    };

    // Initial state update
    updateState();

    // Set up a polling mechanism to check for state changes
    // In a real implementation, you might want to use events or a more sophisticated state management
    const interval = setInterval(updateState, 1000);

    return () => clearInterval(interval);
  }, [walletManager, network]);

  const connect = useCallback(async (walletType: 'hashpack' | 'blade' | 'kabila') => {
    setIsConnecting(true);
    setError(null);

    try {
      await walletManager.connect(walletType);
      // State will be updated via the useEffect above
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to Hedera wallet';
      setError(errorMessage);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, [walletManager]);

  const disconnect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      await walletManager.disconnect();
      // State will be updated via the useEffect above
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disconnect from Hedera wallet';
      setError(errorMessage);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, [walletManager]);

  const switchNetwork = useCallback(async (newNetwork: HederaNetwork) => {
    setError(null);

    try {
      await walletManager.switchNetwork(newNetwork);
      // State will be updated via the useEffect above
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to switch Hedera network';
      setError(errorMessage);
      throw err;
    }
  }, [walletManager]);

  const getAccountBalance = useCallback(async (accountId?: string) => {
    try {
      return await walletManager.getAccountBalance(accountId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get account balance';
      setError(errorMessage);
      throw err;
    }
  }, [walletManager]);

  const getAccountInfo = useCallback(async (accountId?: string) => {
    try {
      return await walletManager.getAccountInfo(accountId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get account info';
      setError(errorMessage);
      throw err;
    }
  }, [walletManager]);

  const signTransaction = useCallback(async (transaction: any) => {
    try {
      return await walletManager.signTransaction(transaction);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign transaction';
      setError(errorMessage);
      throw err;
    }
  }, [walletManager]);

  const signMessage = useCallback(async (message: string) => {
    try {
      return await walletManager.signMessage(message);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign message';
      setError(errorMessage);
      throw err;
    }
  }, [walletManager]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    ...state,
    isConnecting,
    error,

    // Actions
    connect,
    disconnect,
    switchNetwork,
    getAccountBalance,
    getAccountInfo,
    signTransaction,
    signMessage,
    clearError,

    // Utilities
    formatAccountId: (accountId: string) => {
      if (!accountId) return '';
      return `${accountId.substring(0, 6)}...${accountId.substring(accountId.length - 4)}`;
    },
  };
}