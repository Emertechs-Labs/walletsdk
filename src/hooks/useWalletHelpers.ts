import { useConnect, useAccount, useDisconnect, useSwitchChain, useChainId } from 'wagmi';
import { useState, useEffect } from 'react';
import { config } from '../lib/wagmi';

export const useConnectWallet = () => {
  const { connect, connectors } = useConnect({
    config
  });

  const connectWallet = async () => {
    try {
      // Get the first available connector (usually MetaMask)
      const connector = connectors[0];
      if (connector) {
        connect({ connector });
      } else {
        // If no connectors available, suggest installing MetaMask
        if (typeof window !== 'undefined') {
          window.open('https://metamask.io/download.html', '_blank');
        }
        throw new Error('No wallet connectors available');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  return { connectWallet };
};

export function useWalletHelpers() {
  const { address, isConnected, isConnecting, isDisconnected } = useAccount();
  const { connect, connectors, isPending: isConnectPending, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitchPending, error: switchError } = useSwitchChain();

  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');

  // Update connection status based on account state
  useEffect(() => {
    if (isConnecting || isConnectPending) {
      setConnectionStatus('connecting');
    } else if (isConnected) {
      setConnectionStatus('connected');
    } else if (isDisconnected) {
      setConnectionStatus('disconnected');
    }

    if (connectError) {
      setConnectionStatus('error');
    }
  }, [isConnecting, isConnected, isDisconnected, isConnectPending, connectError]);

  // Function to connect wallet
  const connectWallet = async () => {
    try {
      const injected = connectors.find((c) => c.id === 'injected');
      if (injected) {
        connect({ connector: injected });
      } else if (connectors.length > 0) {
        connect({ connector: connectors[0] });
      } else {
        // If no connectors available, suggest installing MetaMask
        if (typeof window !== 'undefined') {
          window.open('https://metamask.io/download.html', '_blank');
        }
        throw new Error('No wallet connectors available');
      }
    } catch (error) {
      console.error('Connection error:', error);
      setConnectionStatus('error');
    }
  };

  // Function to disconnect wallet
  const disconnectWallet = () => {
    try {
      disconnect();
      setConnectionStatus('disconnected');
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  // Function to ensure connected to Base Sepolia
  const ensureBaseSepoliaNetwork = async () => {
    if (!chainId || chainId !== 84532) {
      try {
        await switchChain({ chainId: 84532 });
        return true;
      } catch (error) {
        console.error('Network switch error:', error);
        return false;
      }
    }
    return true;
  };

  // Format address for display
  const formatAddress = (addr?: string) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // Format value from wei to ETH
  const formatEth = (wei: bigint) => {
    return (Number(wei) / 1e18).toFixed(4);
  };

  return {
    address,
    isConnected,
    connectionStatus,
    connectWallet,
    disconnectWallet,
    ensureBaseSepoliaNetwork,
    formatAddress,
    formatEth,
    chainId,
    connectError,
    switchError,
    isNetworkSwitchPending: isSwitchPending
  };
}