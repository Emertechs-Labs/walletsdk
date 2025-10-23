import { CdpEvmWalletProvider } from '@coinbase/agentkit';

export interface AgentKitConfig {
  apiKeyName: string;
  apiKeyPrivateKey: string;
  networkId?: string;
}

class AgentKitManager {
  private config: AgentKitConfig;
  private walletProvider: CdpEvmWalletProvider | null = null;

  constructor(config: AgentKitConfig) {
    this.config = config;
  }

  // Initialize AgentKit wallet provider
  async initializeWalletProvider() {
    if (this.walletProvider) return this.walletProvider;

    // Note: This configuration may need to be updated based on the actual AgentKit API
    this.walletProvider = await CdpEvmWalletProvider.configureWithWallet({
      // apiKeyName may not be the correct property name
      ...this.config,
      networkId: this.config.networkId || 'base-sepolia',
    });

    return this.walletProvider;
  }

  // Get wallet address
  async getWalletAddress() {
    const provider = await this.initializeWalletProvider();
    return provider.getAddress();
  }

  // Send transaction via AgentKit
  async sendTransaction(to: `0x${string}`, value: bigint, data?: `0x${string}`) {
    const provider = await this.initializeWalletProvider();
    return provider.sendTransaction({
      to,
      value,
      data,
    });
  }

  // Get balance
  async getBalance() {
    const provider = await this.initializeWalletProvider();
    return provider.getBalance();
  }

  // Deploy contract (placeholder - method may not exist in current API)
  async deployContract() {
    // Note: This method may not be available in the current AgentKit API
    // You may need to use sendTransaction with deployment data instead
    throw new Error('deployContract method not available in current AgentKit API');
  }
}

// Factory function
export const createAgentKitManager = (config: AgentKitConfig) => {
  return new AgentKitManager(config);
};

export { AgentKitManager };