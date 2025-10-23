import { createWalletClient, http, type WalletClient } from 'viem';
import { baseSepolia } from 'viem/chains';
import { coinbaseWallet } from '@wagmi/connectors';
import { createConfig } from 'wagmi';

// Coinbase Smart Wallet configuration for Base
export interface SmartWalletConfig {
  appName: string;
  paymasterUrl?: string;
  bundlerUrl?: string;
}

class BaseSmartWalletManager {
  private config: SmartWalletConfig;
  private walletClient: WalletClient | null = null;

  constructor(config: SmartWalletConfig) {
    this.config = config;
  }

  // Create smart wallet connector
  getConnector() {
    return coinbaseWallet({
      appName: this.config.appName,
      preference: 'smartWalletOnly',
    });
  }

  // Create wagmi config with smart wallet
  getWagmiConfig() {
    const connector = this.getConnector();

    return createConfig({
      chains: [baseSepolia],
      connectors: [connector],
      transports: {
        [baseSepolia.id]: http('https://sepolia.base.org'),
      },
      ssr: true,
    });
  }

  // Get wallet client for smart wallet operations
  async getWalletClient(): Promise<WalletClient> {
    if (this.walletClient) return this.walletClient;

    // For smart wallets, the client is created through the connector
    // This is a placeholder - actual implementation depends on Coinbase SDK
    this.walletClient = createWalletClient({
      chain: baseSepolia,
      transport: http('https://sepolia.base.org'),
    });

    return this.walletClient;
  }

  // Send gasless transaction using paymaster
  async sendGaslessTransaction(tx: any) {
    // Implementation would use Coinbase's paymaster service
    // This is a placeholder
    const walletClient = await this.getWalletClient();
    return walletClient.sendTransaction(tx);
  }

  // Batch transactions
  async sendBatchTransactions(txs: any[]) {
    // Smart wallets support batching
    const walletClient = await this.getWalletClient();
    // Implementation for batching
    return Promise.all(txs.map(tx => walletClient.sendTransaction(tx)));
  }
}

// Factory function
export const createBaseSmartWalletManager = (config: SmartWalletConfig) => {
  return new BaseSmartWalletManager(config);
};

export { BaseSmartWalletManager };