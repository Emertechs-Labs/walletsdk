import { useState, useEffect, useCallback } from 'react';
import { Hbar } from '@hashgraph/sdk';
import { HederaProvider } from '../lib/hedera-provider';
import type { HederaProviderConfig, UseHederaProviderReturn } from '../types/hedera';

export function useHederaProvider(config: HederaProviderConfig): UseHederaProviderReturn {
  const [provider, setProvider] = useState<HederaProvider | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [balance, setBalance] = useState<Hbar | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize provider
  useEffect(() => {
    const initProvider = () => {
      try {
        const newProvider = new HederaProvider(config);
        setProvider(newProvider);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize Hedera provider');
      }
    };

    initProvider();
  }, [config.network, config.operatorId, config.operatorKey]);

  // Connect to Hedera network
  const connect = useCallback(async () => {
    if (!provider) {
      setError('Provider not initialized');
      return;
    }

    try {
      setError(null);
      await provider.connect();
      setIsConnected(true);

      // If we have an operator ID, get account info
      if (config.operatorId) {
        setAccountId(config.operatorId);
        try {
          const accountBalance = await provider.getAccountBalance(config.operatorId);
          setBalance(accountBalance);
        } catch (balanceError) {
          console.warn('Failed to get account balance:', balanceError);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to Hedera');
      setIsConnected(false);
    }
  }, [provider, config.operatorId]);

  // Disconnect from Hedera network
  const disconnect = useCallback(async () => {
    if (provider) {
      try {
        await provider.disconnect();
      } catch (err) {
        console.warn('Error during disconnect:', err);
      }
    }
    setIsConnected(false);
    setAccountId(null);
    setBalance(null);
    setError(null);
  }, [provider]);

  return {
    provider,
    isConnected,
    accountId,
    balance,
    connect,
    disconnect,
    error,
  };
}