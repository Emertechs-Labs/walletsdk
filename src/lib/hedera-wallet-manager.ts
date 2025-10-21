import { HederaWalletConnector, HederaWalletInfo, createHederaConnectors } from './hedera-wallet-connectors';
import { HederaProvider } from './hedera-provider';
import type { HederaProviderConfig, HederaNetwork } from '../types/hedera';

export interface HederaWalletState {
  isConnected: boolean;
  accountId: string | null;
  walletType: 'hashpack' | 'blade' | 'kabila' | null;
  network: HederaNetwork;
  publicKey?: string;
}

export class HederaWalletManager {
  private connectors: HederaWalletConnector[] = [];
  private activeConnector: HederaWalletConnector | null = null;
  private provider: HederaProvider | null = null;
  private network: HederaNetwork = 'testnet';
  private state: HederaWalletState = {
    isConnected: false,
    accountId: null,
    walletType: null,
    network: 'testnet',
  };

  constructor(network: HederaNetwork = 'testnet') {
    this.network = network;
    this.connectors = createHederaConnectors(network);
  }

  /**
   * Get current wallet state
   */
  getState(): HederaWalletState {
    return { ...this.state };
  }

  /**
   * Get available wallet connectors
   */
  getConnectors(): HederaWalletConnector[] {
    return this.connectors.filter(connector => {
      switch (connector.id) {
        case 'hashpack':
          return this.isHashPackAvailable();
        case 'blade':
          return this.isBladeAvailable();
        case 'kabila':
          return this.isKabilaAvailable();
        default:
          return false;
      }
    });
  }

  /**
   * Connect to a specific Hedera wallet
   */
  async connect(walletType: 'hashpack' | 'blade' | 'kabila'): Promise<HederaWalletInfo> {
    const connector = this.connectors.find(c => c.id === walletType);
    if (!connector) {
      throw new Error(`Wallet connector ${walletType} not found`);
    }

    try {
      // Disconnect any existing connection
      if (this.activeConnector) {
        await this.activeConnector.disconnect();
      }

      // Connect to the new wallet
      const walletInfo = await connector.connect();
      this.activeConnector = connector;

      // Update state
      this.state = {
        isConnected: true,
        accountId: walletInfo.accountId,
        walletType: walletInfo.walletType,
        network: walletInfo.network,
        publicKey: walletInfo.publicKey,
      };

      // Initialize Hedera provider with the connected account
      const providerConfig: HederaProviderConfig = {
        network: this.network,
        operatorId: walletInfo.accountId,
        // Note: For read-only operations, we don't need the private key
        // For transactions, the wallet will handle signing
      };

      this.provider = new HederaProvider(providerConfig);
      await this.provider.connect();

      return walletInfo;
    } catch (error) {
      // Reset state on failure
      this.state = {
        isConnected: false,
        accountId: null,
        walletType: null,
        network: this.network,
      };
      this.activeConnector = null;
      throw error;
    }
  }

  /**
   * Disconnect from the current wallet
   */
  async disconnect(): Promise<void> {
    if (this.activeConnector) {
      await this.activeConnector.disconnect();
      this.activeConnector = null;
    }

    if (this.provider) {
      await this.provider.disconnect();
      this.provider = null;
    }

    this.state = {
      isConnected: false,
      accountId: null,
      walletType: null,
      network: this.network,
    };
  }

  /**
   * Switch to a different Hedera network
   */
  async switchNetwork(network: HederaNetwork): Promise<void> {
    this.network = network;

    // If connected, disconnect and reconnect with new network
    if (this.state.isConnected && this.state.walletType) {
      await this.disconnect();
      // Note: User will need to manually reconnect after network switch
    }

    // Update connectors with new network
    this.connectors = createHederaConnectors(network);

    // Update state
    this.state.network = network;
  }

  /**
   * Get account balance using Hedera provider
   */
  async getAccountBalance(accountId?: string): Promise<any> {
    if (!this.provider) {
      throw new Error('Hedera provider not initialized');
    }

    const targetAccountId = accountId || this.state.accountId;
    if (!targetAccountId) {
      throw new Error('No account ID available');
    }

    return await this.provider.getAccountBalance(targetAccountId);
  }

  /**
   * Get account info using Hedera provider
   */
  async getAccountInfo(accountId?: string): Promise<any> {
    if (!this.provider) {
      throw new Error('Hedera provider not initialized');
    }

    const targetAccountId = accountId || this.state.accountId;
    if (!targetAccountId) {
      throw new Error('No account ID available');
    }

    return await this.provider.getAccountInfo(targetAccountId);
  }

  /**
   * Sign a transaction using the connected wallet
   */
  async signTransaction(transaction: any): Promise<any> {
    if (!this.activeConnector || !this.activeConnector.signTransaction) {
      throw new Error('No wallet connected or wallet does not support transaction signing');
    }

    return await this.activeConnector.signTransaction(transaction);
  }

  /**
   * Sign a message using the connected wallet
   */
  async signMessage(message: string): Promise<string> {
    if (!this.activeConnector || !this.activeConnector.signMessage) {
      throw new Error('No wallet connected or wallet does not support message signing');
    }

    return await this.activeConnector.signMessage(message);
  }

  /**
   * Check if HashPack is available
   */
  private isHashPackAvailable(): boolean {
    return typeof window !== 'undefined' && !!(window as any).hashpack;
  }

  /**
   * Check if Blade wallet is available
   */
  private isBladeAvailable(): boolean {
    return typeof window !== 'undefined' && !!(window as any).blade;
  }

  /**
   * Check if Kabila wallet is available
   */
  private isKabilaAvailable(): boolean {
    // Kabila detection logic - for now, assume not available
    return false;
  }

  /**
   * Get the Hedera provider instance
   */
  getProvider(): HederaProvider | null {
    return this.provider;
  }

  /**
   * Get the active connector
   */
  getActiveConnector(): HederaWalletConnector | null {
    return this.activeConnector;
  }
}

// Global instance for easy access
let globalHederaWalletManager: HederaWalletManager | null = null;

export function getHederaWalletManager(network: HederaNetwork = 'testnet'): HederaWalletManager {
  if (!globalHederaWalletManager || globalHederaWalletManager.getState().network !== network) {
    globalHederaWalletManager = new HederaWalletManager(network);
  }
  return globalHederaWalletManager;
}

// Re-export types and connectors for convenience
export type { HederaWalletConnector } from './hedera-wallet-connectors';