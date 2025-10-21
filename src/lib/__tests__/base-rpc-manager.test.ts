import { baseRPCManager, getBaseRPCStats } from '../base-rpc-manager';

describe('BaseRPCManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStats', () => {
    it('should return RPC statistics', () => {
      const stats = getBaseRPCStats();

      expect(stats).toHaveProperty('endpoints');
      expect(stats).toHaveProperty('activeConnections');
      expect(stats).toHaveProperty('cachedClients');
    });

    it('should have valid stat values', () => {
      const stats = getBaseRPCStats();

      expect(Array.isArray(stats.endpoints)).toBe(true);
      expect(typeof stats.activeConnections).toBe('number');
      expect(typeof stats.cachedClients).toBe('object');
      expect(typeof stats.cachedClients.public).toBe('number');
      expect(typeof stats.cachedClients.wallet).toBe('number');
    });
  });

  describe('getPublicClient', () => {
    it('should return a public client', () => {
      const client = baseRPCManager.getPublicClient();
      expect(client).toBeDefined();
      expect(typeof client).toBe('object');
    });
  });

  describe('getWalletClient', () => {
    it('should return a wallet client', () => {
      const client = baseRPCManager.getWalletClient();
      expect(client).toBeDefined();
      expect(typeof client).toBe('object');
    });
  });
});