import { HederaTransactionService, HederaMirrorTransaction, HederaMirrorResponse } from '../hederaTransactionService';
import { HederaProviderConfig } from '../../types/hedera';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('HederaTransactionService', () => {
  let service: HederaTransactionService;
  const mockConfig: HederaProviderConfig = {
    network: 'testnet',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new HederaTransactionService(mockConfig);
  });

  describe('constructor', () => {
    it('should initialize with testnet URL', () => {
      expect(service).toBeDefined();
    });

    it('should initialize with mainnet URL', () => {
      const mainnetService = new HederaTransactionService({ ...mockConfig, network: 'mainnet' });
      expect(mainnetService).toBeDefined();
    });

    it('should initialize with previewnet URL', () => {
      const previewnetService = new HederaTransactionService({ ...mockConfig, network: 'previewnet' });
      expect(previewnetService).toBeDefined();
    });
  });

  describe('getAccountTransactions', () => {
    const mockTransaction: HederaMirrorTransaction = {
      transaction_id: '0.0.12345@1234567890.000000000',
      consensus_timestamp: '1234567890.123456789',
      valid_start_timestamp: '1234567890.000000000',
      charged_tx_fee: 100000,
      max_fee: '1000000',
      memo_base64: '',
      name: 'CRYPTOTRANSFER',
      node: '0.0.3',
      nonce: 0,
      parent_consensus_timestamp: null,
      result: 'SUCCESS',
      scheduled: false,
      transaction_hash: 'hash123',
      transfers: [
        { account: '0.0.12345', amount: -100000000, is_approval: false },
        { account: '0.0.67890', amount: 100000000, is_approval: false },
      ],
      token_transfers: [],
    };

    const mockResponse: HederaMirrorResponse = {
      transactions: [mockTransaction],
      links: { next: null },
    };

    it('should fetch transactions successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await service.getAccountTransactions({
        accountId: '0.0.12345',
        limit: 10,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://testnet.mirrornode.hedera.com/api/v1/transactions?account.id=0.0.12345&limit=10&order=desc'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle all query parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await service.getAccountTransactions({
        accountId: '0.0.12345',
        limit: 25,
        order: 'asc',
        timestamp: '1234567890.000000000',
        transactionType: 'CRYPTOTRANSFER',
        result: 'SUCCESS',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('account.id=0.0.12345')
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=25')
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('order=asc')
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('timestamp=1234567890.000000000')
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('transactionType=CRYPTOTRANSFER')
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('result=SUCCESS')
      );
    });

    it('should throw error on failed response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(
        service.getAccountTransactions({ accountId: '0.0.12345' })
      ).rejects.toThrow('Failed to fetch transactions: Not Found');
    });

    it('should throw error on network failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        service.getAccountTransactions({ accountId: '0.0.12345' })
      ).rejects.toThrow('Network error');
    });
  });

  describe('getTransaction', () => {
    const mockTransaction: HederaMirrorTransaction = {
      transaction_id: '0.0.12345@1234567890.000000000',
      consensus_timestamp: '1234567890.123456789',
      valid_start_timestamp: '1234567890.000000000',
      charged_tx_fee: 100000,
      max_fee: '1000000',
      memo_base64: '',
      name: 'CRYPTOTRANSFER',
      node: '0.0.3',
      nonce: 0,
      parent_consensus_timestamp: null,
      result: 'SUCCESS',
      scheduled: false,
      transaction_hash: 'hash123',
      transfers: [
        { account: '0.0.12345', amount: -100000000, is_approval: false },
        { account: '0.0.67890', amount: 100000000, is_approval: false },
      ],
      token_transfers: [],
    };

    it('should fetch single transaction successfully', async () => {
      const mockResponse = { transactions: [mockTransaction] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await service.getTransaction('0.0.12345@1234567890.000000000');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://testnet.mirrornode.hedera.com/api/v1/transactions/0.0.12345@1234567890.000000000'
      );
      expect(result).toEqual(mockTransaction);
    });

    it('should throw error on failed response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(
        service.getTransaction('invalid-id')
      ).rejects.toThrow('Failed to fetch transaction: Not Found');
    });
  });

  describe('getAccountBalance', () => {
    const mockBalanceResponse = {
      balances: [{
        account: '0.0.12345',
        balance: 1000000000, // 10 HBAR in tinybars
        tokens: [
          { token_id: '0.0.67890', balance: 1000000 },
        ],
      }],
    };

    it('should fetch account balance successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBalanceResponse),
      });

      const result = await service.getAccountBalance('0.0.12345');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://testnet.mirrornode.hedera.com/api/v1/balances?account.id=0.0.12345'
      );
      expect(result).toEqual({
        balance: 10, // Converted from tinybars to HBAR
        tokens: [{ token_id: '0.0.67890', balance: 1000000 }],
      });
    });

    it('should handle accounts with no tokens', async () => {
      const responseWithoutTokens = {
        balances: [{
          account: '0.0.12345',
          balance: 500000000, // 5 HBAR
          tokens: [],
        }],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(responseWithoutTokens),
      });

      const result = await service.getAccountBalance('0.0.12345');

      expect(result).toEqual({
        balance: 5,
        tokens: [],
      });
    });

    it('should throw error on failed response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(
        service.getAccountBalance('0.0.12345')
      ).rejects.toThrow('Failed to fetch balance: Not Found');
    });
  });

  describe('convertMirrorTransaction', () => {
    const mockMirrorTx: HederaMirrorTransaction = {
      transaction_id: '0.0.12345@1234567890.000000000',
      consensus_timestamp: '1609459200.123456789', // 2021-01-01 00:00:00 UTC
      valid_start_timestamp: '1609459199.000000000',
      charged_tx_fee: 100000,
      max_fee: '1000000',
      memo_base64: 'SGVsbG8gV29ybGQ=', // "Hello World" base64
      name: 'CRYPTOTRANSFER',
      node: '0.0.3',
      nonce: 0,
      parent_consensus_timestamp: null,
      result: 'SUCCESS',
      scheduled: false,
      transaction_hash: 'hash123',
      transfers: [
        { account: '0.0.12345', amount: -200000000, is_approval: false }, // -2 HBAR
        { account: '0.0.67890', amount: 200000000, is_approval: false },  // +2 HBAR
      ],
      token_transfers: [],
    };

    it('should convert mirror transaction to internal format', () => {
      const result = service.convertMirrorTransaction(mockMirrorTx);

      expect(result).toEqual({
        id: '0.0.12345@1234567890.000000000',
        hash: 'hash123',
        from: '0.0.12345',
        to: '0.0.67890',
        value: 2, // Converted from tinybars to HBAR
        data: 'SGVsbG8gV29ybGQ=',
        timestamp: '2021-01-01T00:00:00.123Z',
        status: 'executed',
        type: 'CRYPTOTRANSFER',
        fee: 0.001, // 100000 tinybars = 0.001 HBAR
        result: 'SUCCESS',
      });
    });

    it('should handle different transaction results', () => {
      const failedTx = { ...mockMirrorTx, result: 'FAIL' as const };
      const result = service.convertMirrorTransaction(failedTx);
      expect(result.status).toBe('failed');

      const pendingTx = { ...mockMirrorTx, result: 'PENDING' as const };
      const pendingResult = service.convertMirrorTransaction(pendingTx);
      expect(pendingResult.status).toBe('pending');
    });

    it('should handle transactions with multiple transfers', () => {
      const multiTransferTx: HederaMirrorTransaction = {
        ...mockMirrorTx,
        transfers: [
          { account: '0.0.11111', amount: -50000000, is_approval: false }, // Small transfer
          { account: '0.0.12345', amount: -150000000, is_approval: false }, // Main sender
          { account: '0.0.67890', amount: 200000000, is_approval: false },  // Main receiver
        ],
      };

      const result = service.convertMirrorTransaction(multiTransferTx);

      // Should pick the largest outgoing transfer (150000000 tinybars = 1.5 HBAR)
      expect(result.from).toBe('0.0.12345'); // Largest outgoing
      expect(result.to).toBe('0.0.67890');   // Largest incoming
      expect(result.value).toBe(1.5);
    });
  });
});