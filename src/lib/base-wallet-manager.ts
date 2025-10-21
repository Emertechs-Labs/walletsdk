import { useEffect, useState, useCallback } from 'react';
import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { getBaseWalletClient } from './base-rpc-manager';

interface WalletState {
  isConnected: boolean;
  address: `0x${string}` | undefined;
  chainId: number | undefined;
  isConnecting: boolean;
  isReconnecting: boolean;
  error: Error | null;
  lastConnectionAttempt: number;
  connectionAttempts: number;
}

interface WalletConfig {
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
  onConnect?: (address: `0x${string}`) => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  onChainSwitch?: (chainId: number) => void;
}

class BaseWalletManager {
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private config: WalletConfig = {
    autoReconnect: true,
    maxReconnectAttempts: 5,
    reconnectDelay: 2000
  };
  private connectionState: WalletState = {
    isConnected: false,
    address: undefined,
    chainId: undefined,
    isConnecting: false,
    isReconnecting: false,
    error: null,
    lastConnectionAttempt: 0,
    connectionAttempts: 0
  };

  constructor(config?: Partial<WalletConfig>) {
    this.config = { ...this.config, ...config };
  }

  // Update configuration
  updateConfig(config: Partial<WalletConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // Get current wallet state
  getState(): WalletState {
    return { ...this.connectionState };
  }

  // Connect wallet with enhanced error handling
  async connect(_connectorId?: string): Promise<void> {
    this.connectionState.isConnecting = true;
    this.connectionState.lastConnectionAttempt = Date.now();
    this.connectionState.connectionAttempts++;

    try {
      // Implementation will be handled by the React hook
      this.connectionState.error = null;
    } catch (error) {
      this.connectionState.error = error as Error;
      this.config.onError?.(error as Error);
      throw error;
    } finally {
      this.connectionState.isConnecting = false;
    }
  }

  // Disconnect wallet
  async disconnect(): Promise<void> {
    try {
      this.connectionState.isConnected = false;
      this.connectionState.address = undefined;
      this.connectionState.chainId = undefined;
      this.connectionState.error = null;
      this.connectionState.connectionAttempts = 0;

      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }

      this.config.onDisconnect?.();
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  }

  // Switch to Base network
  async switchToBase(): Promise<void> {
    try {
      const walletClient = getBaseWalletClient();

      // Check if already on Base
      if (this.connectionState.chainId === baseSepolia.id) {
        return;
      }

      // Attempt to switch chain
      await walletClient.switchChain({ id: baseSepolia.id });
      this.connectionState.chainId = baseSepolia.id;
      this.config.onChainSwitch?.(baseSepolia.id);
    } catch (error) {
      // If switch fails, try to add the chain
      try {
        const walletClient = getBaseWalletClient();
        await walletClient.addChain({ chain: baseSepolia });
        await walletClient.switchChain({ id: baseSepolia.id });
        this.connectionState.chainId = baseSepolia.id;
        this.config.onChainSwitch?.(baseSepolia.id);
      } catch (addError) {
        this.connectionState.error = addError as Error;
        this.config.onError?.(addError as Error);
        throw addError;
      }
    }
  }

  // Auto-reconnect logic
  private scheduleReconnect(): void {
    if (!this.config.autoReconnect ||
        this.connectionState.connectionAttempts >= this.config.maxReconnectAttempts!) {
      return;
    }

    this.reconnectTimeout = setTimeout(async () => {
      this.connectionState.isReconnecting = true;

      try {
        await this.connect();
      } catch (error) {
        console.warn('Auto-reconnect failed, will retry...', error);
        this.scheduleReconnect(); // Schedule another attempt
      } finally {
        this.connectionState.isReconnecting = false;
      }
    }, this.config.reconnectDelay);
  }

  // Handle connection state changes
  updateConnectionState(updates: Partial<WalletState>): void {
    const wasConnected = this.connectionState.isConnected;
    this.connectionState = { ...this.connectionState, ...updates };

    // Handle connection events
    if (!wasConnected && updates.isConnected) {
      this.config.onConnect?.(updates.address!);
    } else if (wasConnected && !updates.isConnected) {
      this.config.onDisconnect?.();
      if (this.config.autoReconnect) {
        this.scheduleReconnect();
      }
    }

    // Handle chain changes
    if (updates.chainId && updates.chainId !== this.connectionState.chainId) {
      this.config.onChainSwitch?.(updates.chainId);
    }
  }

  // Health check for wallet connection
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.connectionState.isConnected || !this.connectionState.address) {
        return false;
      }

      const walletClient = getBaseWalletClient();
      const [address] = await walletClient.getAddresses();

      return address.toLowerCase() === this.connectionState.address.toLowerCase();
    } catch (error) {
      console.warn('Wallet health check failed:', error);
      return false;
    }
  }

  // Get wallet statistics
  getStats() {
    return {
      connectionAttempts: this.connectionState.connectionAttempts,
      lastConnectionAttempt: new Date(this.connectionState.lastConnectionAttempt),
      isHealthy: this.connectionState.isConnected && !this.connectionState.error,
      currentChain: this.connectionState.chainId,
      autoReconnectEnabled: this.config.autoReconnect,
      maxReconnectAttempts: this.config.maxReconnectAttempts
    };
  }

  // Cleanup
  destroy(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
  }
}

// Singleton instance
export const baseWalletManager = new BaseWalletManager();

// React hook for wallet management
export function useBaseWallet(config?: Partial<WalletConfig>) {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const [walletState, setWalletState] = useState<WalletState>(baseWalletManager.getState());

  // Update manager config
  useEffect(() => {
    if (config) {
      baseWalletManager.updateConfig(config);
    }
  }, [config]);

  // Sync wagmi state with manager
  useEffect(() => {
    baseWalletManager.updateConnectionState({
      isConnected,
      address: address as `0x${string}`,
      chainId,
      isConnecting: isPending,
      error: null
    });

    setWalletState(baseWalletManager.getState());
  }, [address, isConnected, chainId, isPending]);

  // Connect function
  const connectWallet = useCallback(async (connectorId?: string) => {
    try {
      const connector = connectorId
        ? connectors.find(c => c.id === connectorId)
        : connectors[0];

      if (connector) {
        connect({ connector });
        await baseWalletManager.connect(connectorId);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  }, [connect, connectors]);

  // Disconnect function
  const disconnectWallet = useCallback(async () => {
    disconnect();
    await baseWalletManager.disconnect();
  }, [disconnect]);

  // Switch to Base function
  const switchToBase = useCallback(async () => {
    try {
      await switchChain({ chainId: baseSepolia.id });
      await baseWalletManager.switchToBase();
    } catch (error) {
      console.error('Failed to switch to Base:', error);
    }
  }, [switchChain]);

  // Health check function
  const checkHealth = useCallback(async () => {
    return await baseWalletManager.healthCheck();
  }, []);

  return {
    // State
    ...walletState,
    connectors,

    // Actions
    connect: connectWallet,
    disconnect: disconnectWallet,
    switchToBase,

    // Utilities
    checkHealth,
    getStats: () => baseWalletManager.getStats()
  };
}

// Export types and utilities
export type { WalletState, WalletConfig };
export { BaseWalletManager };