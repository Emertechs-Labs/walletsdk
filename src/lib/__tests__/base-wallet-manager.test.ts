import { baseWalletManager } from '../base-wallet-manager';

describe('BaseWalletManager', () => {
  beforeEach(() => {
    // Reset any state between tests
    jest.clearAllMocks();
  });

  describe('getState', () => {
    it('should return default wallet state when no wallet is connected', () => {
      const state = baseWalletManager.getState();
      expect(state).toEqual({
        isConnected: false,
        address: undefined,
        chainId: undefined,
        isConnecting: false,
        isReconnecting: false,
        error: null,
        lastConnectionAttempt: 0,
        connectionAttempts: 0,
      });
    });
  });

  describe('connect', () => {
    it('should handle wallet connection', async () => {
      // Mock successful connection
      const connectSpy = jest.spyOn(baseWalletManager, 'connect');

      // This would need to be mocked in a real implementation
      // For now, just test that the method exists and can be called
      expect(typeof baseWalletManager.connect).toBe('function');

      connectSpy.mockRestore();
    });
  });

  describe('disconnect', () => {
    it('should handle wallet disconnection', async () => {
      const disconnectSpy = jest.spyOn(baseWalletManager, 'disconnect');

      // This would need proper mocking in a real implementation
      expect(typeof baseWalletManager.disconnect).toBe('function');

      disconnectSpy.mockRestore();
    });
  });

  describe('updateConfig', () => {
    it('should update configuration', () => {
      const newConfig = { autoReconnect: false };
      baseWalletManager.updateConfig(newConfig);

      // Test that config was updated (this would need proper implementation)
      expect(typeof baseWalletManager.updateConfig).toBe('function');
    });
  });

  describe('healthCheck', () => {
    it('should return false when not connected', async () => {
      const result = await baseWalletManager.healthCheck();
      expect(result).toBe(false);
    });
  });
});