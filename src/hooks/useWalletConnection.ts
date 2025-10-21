import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useEffect, useState } from 'react';

export function useWalletConnection() {
  const { address, isConnected, connector } = useAccount();
  const { connect, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Clear error when connection succeeds
  useEffect(() => {
    if (isConnected) {
      setConnectionError(null);
    }
  }, [isConnected]);

  // Handle connection errors
  useEffect(() => {
    if (error) {
      let errorMessage = 'Failed to connect to wallet';

      if (error.message.includes('User rejected')) {
        errorMessage = 'Connection rejected by user';
      } else if (error.message.includes('MetaMask')) {
        errorMessage = 'MetaMask connection failed. Please ensure MetaMask is installed and unlocked.';
      } else if (error.message.includes('network')) {
        errorMessage = 'Network connection error. Please check your network settings.';
      }

      setConnectionError(errorMessage);
    }
  }, [error]);

  const connectWallet = async (connectorId?: string) => {
    try {
      setConnectionError(null);

      const targetConnector = connectorId
        ? connectors.find(c => c.id === connectorId)
        : connectors.find(c => c.name === 'MetaMask') || connectors[0];

      if (!targetConnector) {
        setConnectionError('No wallet connector found');
        return;
      }

      await connect({ connector: targetConnector });
    } catch (err) {
      console.error('Wallet connection error:', err);
      setConnectionError('Failed to connect to wallet');
    }
  };

  const disconnectWallet = () => {
    disconnect();
    setConnectionError(null);
  };

  return {
    address,
    isConnected,
    connector,
    connectWallet,
    disconnectWallet,
    isPending,
    connectionError,
    clearError: () => setConnectionError(null),
  };
}