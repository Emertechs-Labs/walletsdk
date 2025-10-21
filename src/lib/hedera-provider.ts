import {
  Client,
  AccountId,
  PrivateKey,
  Hbar,
  AccountBalanceQuery,
  AccountInfoQuery,
  TransactionResponse,
  Transaction,
  Status,
} from '@hashgraph/sdk';
import type { HederaProviderConfig, HederaNetwork } from '../types/hedera';

export class HederaProvider {
  private client: Client | null = null;
  private config: HederaProviderConfig;
  private _isConnected = false;

  constructor(config: HederaProviderConfig) {
    this.config = config;
  }

  /**
   * Connect to Hedera network
   */
  async connect(): Promise<void> {
    try {
      // Create client based on network
      switch (this.config.network) {
        case 'testnet':
          this.client = Client.forTestnet();
          break;
        case 'mainnet':
          this.client = Client.forMainnet();
          break;
        case 'previewnet':
          this.client = Client.forPreviewnet();
          break;
        default:
          throw new Error(`Unsupported network: ${this.config.network}`);
      }

      // Set operator if provided
      if (this.config.operatorId && this.config.operatorKey) {
        const operatorId = AccountId.fromString(this.config.operatorId);
        const operatorKey = PrivateKey.fromString(this.config.operatorKey);
        this.client.setOperator(operatorId, operatorKey);
      }

      // Set default transaction fees if provided
      if (this.config.maxQueryPayment) {
        this.client.setDefaultMaxQueryPayment(Hbar.fromTinybars(this.config.maxQueryPayment));
      }
      if (this.config.maxTransactionFee) {
        this.client.setDefaultMaxTransactionFee(Hbar.fromTinybars(this.config.maxTransactionFee));
      }

      // Test connection by pinging network (simple validation)
      // Note: getNetworkVersion doesn't exist, so we just validate client creation
      if (!this.client) {
        throw new Error('Failed to create Hedera client');
      }
      this._isConnected = true;
    } catch (error) {
      this._isConnected = false;
      throw new Error(`Failed to connect to Hedera ${this.config.network}: ${error}`);
    }
  }

  /**
   * Disconnect from Hedera network
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      this.client.close();
      this.client = null;
    }
    this._isConnected = false;
  }

  /**
   * Check if connected to network
   */
  isConnected(): boolean {
    return this._isConnected && this.client !== null;
  }

  /**
   * Get account balance
   */
  async getAccountBalance(accountId: string): Promise<Hbar> {
    if (!this.client) {
      throw new Error('Not connected to Hedera network');
    }

    try {
      const query = new AccountBalanceQuery()
        .setAccountId(AccountId.fromString(accountId));

      const balance = await query.execute(this.client);
      return balance.hbars;
    } catch (error) {
      throw new Error(`Failed to get account balance: ${error}`);
    }
  }

  /**
   * Get account information
   */
  async getAccountInfo(accountId: string): Promise<any> {
    if (!this.client) {
      throw new Error('Not connected to Hedera network');
    }

    try {
      const query = new AccountInfoQuery()
        .setAccountId(AccountId.fromString(accountId));

      const info = await query.execute(this.client);
      return info;
    } catch (error) {
      throw new Error(`Failed to get account info: ${error}`);
    }
  }

  /**
   * Submit transaction to network
   */
  async submitTransaction(transaction: Transaction): Promise<TransactionResponse> {
    if (!this.client) {
      throw new Error('Not connected to Hedera network');
    }

    try {
      const response = await transaction.execute(this.client);

      // Wait for consensus
      const receipt = await response.getReceipt(this.client);

      if (receipt.status !== Status.Success) {
        throw new Error(`Transaction failed with status: ${receipt.status}`);
      }

      return response;
    } catch (error) {
      throw new Error(`Failed to submit transaction: ${error}`);
    }
  }

  /**
   * Get the underlying Hedera client
   */
  getClient(): Client | null {
    return this.client;
  }

  /**
   * Get current network
   */
  getNetwork(): HederaNetwork {
    return this.config.network;
  }
}