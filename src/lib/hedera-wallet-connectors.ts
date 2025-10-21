export interface HederaWalletInfo {
  accountId: string;
  publicKey?: string;
  walletType: 'hashpack' | 'blade' | 'kabila';
  network: 'testnet' | 'mainnet' | 'previewnet';
}

export interface HederaWalletConnector {
  id: string;
  name: string;
  icon: string;
  description: string;
  connect(): Promise<HederaWalletInfo>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  getAccountId(): string | null;
  signTransaction?(transaction: any): Promise<any>;
  signMessage?(message: string): Promise<string>;
}

// HashPack Wallet Connector
export class HashPackConnector implements HederaWalletConnector {
  id = 'hashpack';
  name = 'HashPack';
  icon = '🎒';
  description = 'Popular Hedera wallet';

  private connectedAccount: string | null = null;
  private network: 'testnet' | 'mainnet' | 'previewnet' = 'testnet';

  async connect(): Promise<HederaWalletInfo> {
    // Check if HashPack extension is available
    if (typeof window === 'undefined' || !(window as any).hashpack) {
      throw new Error('HashPack wallet not found. Please install HashPack extension.');
    }

    try {
      const hashpack = (window as any).hashpack;

      // Request connection
      const connectResponse = await hashpack.connect({
        network: this.network,
        appMetadata: {
          name: 'Echain Wallet',
          description: 'Hedera wallet integration',
          icons: [],
          url: window.location.origin,
        },
      });

      if (!connectResponse.success) {
        throw new Error('HashPack connection rejected');
      }

      // Get account info
      const accountResponse = await hashpack.getAccountInfo();
      if (!accountResponse.success) {
        throw new Error('Failed to get account info from HashPack');
      }

      const accountId = accountResponse.accountId;
      this.connectedAccount = accountId;

      return {
        accountId,
        publicKey: accountResponse.publicKey,
        walletType: 'hashpack',
        network: this.network,
      };
    } catch (error) {
      this.connectedAccount = null;
      throw new Error(`HashPack connection failed: ${error}`);
    }
  }

  async disconnect(): Promise<void> {
    if (typeof window !== 'undefined' && (window as any).hashpack) {
      try {
        await (window as any).hashpack.disconnect();
      } catch (error) {
        console.warn('HashPack disconnect error:', error);
      }
    }
    this.connectedAccount = null;
  }

  isConnected(): boolean {
    return this.connectedAccount !== null;
  }

  getAccountId(): string | null {
    return this.connectedAccount;
  }

  async signTransaction(transaction: any): Promise<any> {
    if (!this.isConnected() || typeof window === 'undefined' || !(window as any).hashpack) {
      throw new Error('HashPack not connected');
    }

    const hashpack = (window as any).hashpack;
    const signResponse = await hashpack.signTransaction(transaction);

    if (!signResponse.success) {
      throw new Error('Transaction signing failed');
    }

    return signResponse.signedTransaction;
  }

  async signMessage(message: string): Promise<string> {
    if (!this.isConnected() || typeof window === 'undefined' || !(window as any).hashpack) {
      throw new Error('HashPack not connected');
    }

    const hashpack = (window as any).hashpack;
    const signResponse = await hashpack.signMessage({ message });

    if (!signResponse.success) {
      throw new Error('Message signing failed');
    }

    return signResponse.signedMessage;
  }
}

// Blade Wallet Connector
export class BladeConnector implements HederaWalletConnector {
  id = 'blade';
  name = 'Blade Wallet';
  icon = '⚔️';
  description = 'Hedera wallet by Blade Labs';

  private connectedAccount: string | null = null;
  private network: 'testnet' | 'mainnet' | 'previewnet' = 'testnet';

  async connect(): Promise<HederaWalletInfo> {
    // Check if Blade extension is available
    if (typeof window === 'undefined' || !(window as any).blade) {
      throw new Error('Blade wallet not found. Please install Blade extension.');
    }

    try {
      const blade = (window as any).blade;

      // Request connection
      const connectResponse = await blade.connect({
        network: this.network,
        appMetadata: {
          name: 'Echain Wallet',
          description: 'Hedera wallet integration',
          icons: [],
          url: window.location.origin,
        },
      });

      if (!connectResponse.success) {
        throw new Error('Blade connection rejected');
      }

      // Get account info
      const accountResponse = await blade.getAccountInfo();
      if (!accountResponse.success) {
        throw new Error('Failed to get account info from Blade');
      }

      const accountId = accountResponse.accountId;
      this.connectedAccount = accountId;

      return {
        accountId,
        publicKey: accountResponse.publicKey,
        walletType: 'blade',
        network: this.network,
      };
    } catch (error) {
      this.connectedAccount = null;
      throw new Error(`Blade connection failed: ${error}`);
    }
  }

  async disconnect(): Promise<void> {
    if (typeof window !== 'undefined' && (window as any).blade) {
      try {
        await (window as any).blade.disconnect();
      } catch (error) {
        console.warn('Blade disconnect error:', error);
      }
    }
    this.connectedAccount = null;
  }

  isConnected(): boolean {
    return this.connectedAccount !== null;
  }

  getAccountId(): string | null {
    return this.connectedAccount;
  }

  async signTransaction(transaction: any): Promise<any> {
    if (!this.isConnected() || typeof window === 'undefined' || !(window as any).blade) {
      throw new Error('Blade not connected');
    }

    const blade = (window as any).blade;
    const signResponse = await blade.signTransaction(transaction);

    if (!signResponse.success) {
      throw new Error('Transaction signing failed');
    }

    return signResponse.signedTransaction;
  }

  async signMessage(message: string): Promise<string> {
    if (!this.isConnected() || typeof window === 'undefined' || !(window as any).blade) {
      throw new Error('Blade not connected');
    }

    const blade = (window as any).blade;
    const signResponse = await blade.signMessage({ message });

    if (!signResponse.success) {
      throw new Error('Message signing failed');
    }

    return signResponse.signedMessage;
  }
}

// Kabila Wallet Connector (Mobile-focused)
export class KabilaConnector implements HederaWalletConnector {
  id = 'kabila';
  name = 'Kabila';
  icon = '📱';
  description = 'Mobile Hedera wallet';

  private connectedAccount: string | null = null;

  async connect(): Promise<HederaWalletInfo> {
    // Kabila typically uses WalletConnect for mobile connections
    // For now, we'll implement a basic connection that can be extended
    throw new Error('Kabila wallet integration coming soon. Please use HashPack or Blade for now.');
  }

  async disconnect(): Promise<void> {
    this.connectedAccount = null;
  }

  isConnected(): boolean {
    return this.connectedAccount !== null;
  }

  getAccountId(): string | null {
    return this.connectedAccount;
  }
}

// Factory function to create connectors
export function createHederaConnectors(network: 'testnet' | 'mainnet' | 'previewnet' = 'testnet') {
  const connectors: HederaWalletConnector[] = [
    new HashPackConnector(),
    new BladeConnector(),
    new KabilaConnector(),
  ];

  // Set network for all connectors
  connectors.forEach(connector => {
    if ('network' in connector) {
      (connector as any).network = network;
    }
  });

  return connectors;
}

// Utility function to check if a Hedera wallet is available
export function isHederaWalletAvailable(walletType: 'hashpack' | 'blade' | 'kabila'): boolean {
  if (typeof window === 'undefined') return false;

  switch (walletType) {
    case 'hashpack':
      return !!(window as any).hashpack;
    case 'blade':
      return !!(window as any).blade;
    case 'kabila':
      // Kabila detection logic would go here
      return false;
    default:
      return false;
  }
}

// Type declarations for wallet extensions
declare global {
  interface Window {
    hashpack?: any;
    blade?: any;
    kabila?: any;
  }
}