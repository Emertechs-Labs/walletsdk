import {
  ContractExecuteTransaction,
  ContractCallQuery,
  ContractId,
  AccountId,
  Hbar,
  TransactionResponse,
  ContractFunctionParameters,
} from '@hashgraph/sdk';
import type {
  MultisigConfig,
  TransactionProposal,
  MultisigState,
  SignerInfo,
} from '../types/hedera';
import { HederaProvider } from './hedera-provider';

export class MultisigManager {
  private provider: HederaProvider;
  private contractId: ContractId;

  constructor(provider: HederaProvider, config: MultisigConfig) {
    this.provider = provider;
    this.contractId = ContractId.fromString(config.contractId);
  }

  /**
   * Propose a new transaction
   */
  async proposeTransaction(
    to: string,
    value: string,
    data: string = ''
  ): Promise<string> {
    if (!this.provider.isConnected()) {
      throw new Error('Hedera provider not connected');
    }

    try {
      // Convert value to tinybars (Hedera's smallest unit)
      const valueHbar = Hbar.fromString(value);

      // Create contract execute transaction
      const transaction = new ContractExecuteTransaction()
        .setContractId(this.contractId)
        .setGas(1000000) // 1M gas
        .setFunction(
          'proposeTransaction',
          new ContractFunctionParameters()
            .addAddress(AccountId.fromString(to).toSolidityAddress())
            .addUint256(valueHbar.toTinybars())
            .addBytes(new Uint8Array(Buffer.from(data || '', 'hex')))
        );

      const response = await this.provider.submitTransaction(transaction);

      // Get transaction ID from response
      const txId = response.transactionId.toString();

      return txId;
    } catch (error) {
      throw new Error(`Failed to propose transaction: ${error}`);
    }
  }

  /**
   * Approve a transaction
   */
  async approveTransaction(txId: string): Promise<void> {
    if (!this.provider.isConnected()) {
      throw new Error('Hedera provider not connected');
    }

    try {
      const transaction = new ContractExecuteTransaction()
        .setContractId(this.contractId)
        .setGas(500000) // 500K gas
        .setFunction(
          'approveTransaction',
          new ContractFunctionParameters()
            .addUint256(parseInt(txId))
        );

      await this.provider.submitTransaction(transaction);
    } catch (error) {
      throw new Error(`Failed to approve transaction: ${error}`);
    }
  }

  /**
   * Execute a transaction
   */
  async executeTransaction(txId: string): Promise<TransactionResponse> {
    if (!this.provider.isConnected()) {
      throw new Error('Hedera provider not connected');
    }

    try {
      const transaction = new ContractExecuteTransaction()
        .setContractId(this.contractId)
        .setGas(1000000) // 1M gas
        .setFunction(
          'executeTransaction',
          new ContractFunctionParameters()
            .addUint256(parseInt(txId))
        );

      return await this.provider.submitTransaction(transaction);
    } catch (error) {
      throw new Error(`Failed to execute transaction: ${error}`);
    }
  }

  /**
   * Cancel a transaction
   */
  async cancelTransaction(txId: string): Promise<void> {
    if (!this.provider.isConnected()) {
      throw new Error('Hedera provider not connected');
    }

    try {
      const transaction = new ContractExecuteTransaction()
        .setContractId(this.contractId)
        .setGas(300000) // 300K gas
        .setFunction(
          'cancelTransaction',
          new ContractFunctionParameters()
            .addUint256(parseInt(txId))
        );

      await this.provider.submitTransaction(transaction);
    } catch (error) {
      throw new Error(`Failed to cancel transaction: ${error}`);
    }
  }

  /**
   * Get transaction details
   */
  async getTransaction(txId: string): Promise<TransactionProposal> {
    if (!this.provider.isConnected()) {
      throw new Error('Hedera provider not connected');
    }

    try {
      const query = new ContractCallQuery()
        .setContractId(this.contractId)
        .setGas(50000) // 50K gas
        .setFunction(
          'getTransaction',
          new ContractFunctionParameters()
            .addUint256(parseInt(txId))
        );

      const result = await query.execute(this.provider.getClient()!);

      // Parse the result (this would need to match the contract's return format)
      // For now, return a mock structure
      const proposal: TransactionProposal = {
        id: txId,
        to: result.getAddress(0).toString(),
        value: result.getUint256(1).toString(),
        data: '', // Placeholder - would need proper bytes handling
        proposer: result.getAddress(3).toString(),
        approvals: [], // Would need to parse approvals array
        status: result.getBool(5) ? 'executed' : 'pending',
        timestamp: result.getUint256(6).toNumber(),
      };

      return proposal;
    } catch (error) {
      throw new Error(`Failed to get transaction: ${error}`);
    }
  }

  /**
   * Get all pending transactions
   */
  async getPendingTransactions(): Promise<TransactionProposal[]> {
    // This would require implementing a way to query all pending transactions
    // For now, return empty array
    return [];
  }

  /**
   * Add a new signer
   */
  async addSigner(signerAddress: string, weight: number): Promise<void> {
    if (!this.provider.isConnected()) {
      throw new Error('Hedera provider not connected');
    }

    try {
      const transaction = new ContractExecuteTransaction()
        .setContractId(this.contractId)
        .setGas(300000) // 300K gas
        .setFunction(
          'addSigner',
          new ContractFunctionParameters()
            .addAddress(AccountId.fromString(signerAddress).toSolidityAddress())
            .addUint256(weight)
        );

      await this.provider.submitTransaction(transaction);
    } catch (error) {
      throw new Error(`Failed to add signer: ${error}`);
    }
  }

  /**
   * Remove a signer
   */
  async removeSigner(signerAddress: string): Promise<void> {
    if (!this.provider.isConnected()) {
      throw new Error('Hedera provider not connected');
    }

    try {
      const transaction = new ContractExecuteTransaction()
        .setContractId(this.contractId)
        .setGas(300000) // 300K gas
        .setFunction(
          'removeSigner',
          new ContractFunctionParameters()
            .addAddress(AccountId.fromString(signerAddress).toSolidityAddress())
        );

      await this.provider.submitTransaction(transaction);
    } catch (error) {
      throw new Error(`Failed to remove signer: ${error}`);
    }
  }

  /**
   * Change threshold
   */
  async updateThreshold(newThreshold: number): Promise<void> {
    if (!this.provider.isConnected()) {
      throw new Error('Hedera provider not connected');
    }

    try {
      const transaction = new ContractExecuteTransaction()
        .setContractId(this.contractId)
        .setGas(200000) // 200K gas
        .setFunction(
          'updateThreshold',
          new ContractFunctionParameters()
            .addUint256(newThreshold)
        );

      await this.provider.submitTransaction(transaction);
    } catch (error) {
      throw new Error(`Failed to update threshold: ${error}`);
    }
  }

  /**
   * Get multisig state
   */
  async getMultisigState(): Promise<MultisigState> {
    if (!this.provider.isConnected()) {
      throw new Error('Hedera provider not connected');
    }

    try {
      const query = new ContractCallQuery()
        .setContractId(this.contractId)
        .setGas(50000)
        .setFunction('getMultisigState', new ContractFunctionParameters());

      const result = await query.execute(this.provider.getClient()!);

      const state: MultisigState = {
        threshold: result.getUint256(0).toNumber(),
        signerCount: result.getUint256(1).toNumber(),
        totalWeight: result.getUint256(2).toNumber(),
        pendingTransactions: result.getUint256(3).toNumber(),
        executedTransactions: result.getUint256(4).toNumber(),
      };

      return state;
    } catch (error) {
      throw new Error(`Failed to get multisig state: ${error}`);
    }
  }

  /**
   * Get all signers
   */
  async getSigners(): Promise<SignerInfo[]> {
    if (!this.provider.isConnected()) {
      throw new Error('Hedera provider not connected');
    }

    try {
      const query = new ContractCallQuery()
        .setContractId(this.contractId)
        .setGas(50000)
        .setFunction('getSigners', new ContractFunctionParameters());

      const result = await query.execute(this.provider.getClient()!);

      // Parse signers array (this assumes a specific contract return format)
      const signers: SignerInfo[] = [];
      const signerCount = result.getUint256(0).toNumber();

      for (let i = 0; i < signerCount; i++) {
        const address = result.getAddress(i * 3 + 1).toString();
        const weight = result.getUint256(i * 3 + 2).toNumber();
        const active = result.getBool(i * 3 + 3);

        signers.push({
          address,
          weight,
          active,
        });
      }

      return signers;
    } catch (error) {
      throw new Error(`Failed to get signers: ${error}`);
    }
  }
}