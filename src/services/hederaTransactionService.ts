/**
 * Hedera Transaction Service
 * Handles fetching transaction data from Hedera Mirror Node API
 */

import { HederaProviderConfig } from '../types/hedera';

export interface HederaMirrorTransaction {
  transaction_id: string;
  consensus_timestamp: string;
  valid_start_timestamp: string;
  charged_tx_fee: number;
  max_fee: string;
  memo_base64: string;
  name: string;
  node: string;
  nonce: number;
  parent_consensus_timestamp: string | null;
  result: string;
  scheduled: boolean;
  transaction_hash: string;
  transfers: Array<{
    account: string;
    amount: number;
    is_approval: boolean;
  }>;
  token_transfers?: Array<{
    account: string;
    amount: number;
    token_id: string;
  }>;
}

export interface HederaMirrorResponse {
  transactions: HederaMirrorTransaction[];
  links: {
    next: string | null;
  };
}

export interface TransactionQueryParams {
  accountId: string;
  limit?: number;
  order?: 'asc' | 'desc';
  timestamp?: string;
  transactionType?: string;
  result?: string;
}

export class HederaTransactionService {
  private baseUrl: string;
  
  constructor(config: HederaProviderConfig) {
    // Map network to Mirror Node URL
    const mirrorNodeUrls: Record<string, string> = {
      mainnet: 'https://mainnet-public.mirrornode.hedera.com',
      testnet: 'https://testnet.mirrornode.hedera.com',
      previewnet: 'https://previewnet.mirrornode.hedera.com',
    };
    
    this.baseUrl = mirrorNodeUrls[config.network] || mirrorNodeUrls.testnet;
  }

  /**
   * Fetch transactions for an account
   */
  async getAccountTransactions(
    params: TransactionQueryParams
  ): Promise<HederaMirrorResponse> {
    const { accountId, limit = 25, order = 'desc', timestamp, transactionType, result } = params;
    
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      order,
    });
    
    if (timestamp) queryParams.append('timestamp', timestamp);
    if (transactionType) queryParams.append('transactionType', transactionType);
    if (result) queryParams.append('result', result);
    
    const url = `${this.baseUrl}/api/v1/transactions?account.id=${accountId}&${queryParams.toString()}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching Hedera transactions:', error);
      throw error;
    }
  }

  /**
   * Fetch a specific transaction by ID
   */
  async getTransaction(transactionId: string): Promise<HederaMirrorTransaction> {
    const url = `${this.baseUrl}/api/v1/transactions/${transactionId}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch transaction: ${response.statusText}`);
      }
      const data = await response.json();
      return data.transactions[0];
    } catch (error) {
      console.error('Error fetching Hedera transaction:', error);
      throw error;
    }
  }

  /**
   * Get account balance
   */
  async getAccountBalance(accountId: string): Promise<{
    balance: number;
    tokens: Array<{ token_id: string; balance: number }>;
  }> {
    const url = `${this.baseUrl}/api/v1/balances?account.id=${accountId}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch balance: ${response.statusText}`);
      }
      const data = await response.json();
      const accountData = data.balances[0];
      
      return {
        balance: accountData.balance / 100000000, // Convert tinybars to HBAR
        tokens: accountData.tokens || [],
      };
    } catch (error) {
      console.error('Error fetching Hedera balance:', error);
      throw error;
    }
  }

  /**
   * Poll for transaction status updates
   */
  async pollTransactionStatus(
    transactionId: string,
    onUpdate: (transaction: HederaMirrorTransaction) => void,
    intervalMs: number = 3000,
    maxAttempts: number = 20
  ): Promise<() => void> {
    let attempts = 0;
    let isActive = true;

    const poll = async () => {
      if (!isActive || attempts >= maxAttempts) {
        return;
      }

      try {
        const transaction = await this.getTransaction(transactionId);
        onUpdate(transaction);

        // Stop polling if transaction is finalized
        if (transaction.result === 'SUCCESS' || transaction.result === 'FAIL') {
          isActive = false;
          return;
        }

        attempts++;
        if (isActive) {
          setTimeout(poll, intervalMs);
        }
      } catch (error) {
        console.error('Error polling transaction:', error);
        attempts++;
        if (isActive && attempts < maxAttempts) {
          setTimeout(poll, intervalMs);
        }
      }
    };

    // Start polling
    poll();

    // Return cleanup function
    return () => {
      isActive = false;
    };
  }

  /**
   * Convert Mirror Node transaction to our internal format
   */
  convertMirrorTransaction(mirrorTx: HederaMirrorTransaction) {
    // Find the largest outgoing and incoming transfers
    const outgoingTransfers = mirrorTx.transfers.filter(t => t.amount < 0);
    const incomingTransfers = mirrorTx.transfers.filter(t => t.amount > 0);
    
    const largestOutgoing = outgoingTransfers.reduce((prev, current) => 
      Math.abs(current.amount) > Math.abs(prev.amount) ? current : prev
    );
    
    const largestIncoming = incomingTransfers.reduce((prev, current) => 
      current.amount > prev.amount ? current : prev
    );

    return {
      id: mirrorTx.transaction_id,
      hash: mirrorTx.transaction_hash,
      from: largestOutgoing?.account || '',
      to: largestIncoming?.account || '',
      value: Math.abs(largestOutgoing?.amount || 0) / 100000000, // Convert to HBAR
      data: mirrorTx.memo_base64,
      timestamp: new Date(parseFloat(mirrorTx.consensus_timestamp) * 1000).toISOString(),
      status: this.mapTransactionStatus(mirrorTx.result),
      type: mirrorTx.name,
      fee: mirrorTx.charged_tx_fee / 100000000,
      result: mirrorTx.result,
    };
  }

  /**
   * Map Hedera transaction result to our status
   */
  private mapTransactionStatus(result: string): 'pending' | 'approved' | 'executed' | 'failed' {
    const statusMap: Record<string, 'pending' | 'approved' | 'executed' | 'failed'> = {
      'SUCCESS': 'executed',
      'FAIL': 'failed',
      'INVALID': 'failed',
      'PENDING': 'pending',
      'SUBMITTED': 'approved',
    };
    
    return statusMap[result] || 'pending';
  }
}

export default HederaTransactionService;
