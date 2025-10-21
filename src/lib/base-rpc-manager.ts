import { createPublicClient, createWalletClient, http, type PublicClient, type WalletClient } from 'viem';
import { baseSepolia } from 'viem/chains';

// Base Sepolia RPC endpoints with health monitoring
const BASE_RPC_ENDPOINTS = [
  {
    http: 'https://sepolia.base.org',
    ws: 'wss://sepolia.base.org/ws',
    priority: 1,
    weight: 100,
    lastHealthCheck: 0,
    isHealthy: true,
    responseTime: 0
  },
  {
    http: 'https://base-sepolia.publicnode.com',
    ws: 'wss://base-sepolia.publicnode.com/ws',
    priority: 2,
    weight: 80,
    lastHealthCheck: 0,
    isHealthy: true,
    responseTime: 0
  },
  {
    http: process.env.ALCHEMY_API_KEY 
      ? `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
      : 'https://base-sepolia.publicnode.com',
    ws: process.env.ALCHEMY_API_KEY 
      ? `wss://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
      : 'wss://base-sepolia.publicnode.com/ws',
    priority: 3,
    weight: process.env.ALCHEMY_API_KEY ? 60 : 40,
    lastHealthCheck: 0,
    isHealthy: true,
    responseTime: 0
  }
];

interface RPCEndpoint {
  http: string;
  ws: string;
  priority: number;
  weight: number;
  lastHealthCheck: number;
  isHealthy: boolean;
  responseTime: number;
}

class BaseRPCManager {
  private endpoints: RPCEndpoint[] = [...BASE_RPC_ENDPOINTS];
  private publicClients: Map<string, PublicClient> = new Map();
  private walletClients: Map<string, WalletClient> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private connectionPool: Map<string, { client: PublicClient; lastUsed: number; inUse: boolean }> = new Map();

  constructor() {
    this.startHealthChecks();
  }

  // Get the best available RPC endpoint based on health and performance
  private getBestEndpoint(): RPCEndpoint {
    const healthyEndpoints = this.endpoints.filter(ep => ep.isHealthy);

    if (healthyEndpoints.length === 0) {
      // Fallback to first endpoint if all are unhealthy
      return this.endpoints[0];
    }

    // Sort by response time and weight
    return healthyEndpoints.sort((a, b) => {
      const scoreA = a.responseTime * (100 - a.weight) / 100;
      const scoreB = b.responseTime * (100 - b.weight) / 100;
      return scoreA - scoreB;
    })[0];
  }

  // Create or get cached public client
  getPublicClient(): PublicClient {
    const endpoint = this.getBestEndpoint();
    const cacheKey = `public-${endpoint.http}`;

    if (this.publicClients.has(cacheKey)) {
      return this.publicClients.get(cacheKey)!;
    }

    const client: any = createPublicClient({
      chain: baseSepolia,
      transport: http(endpoint.http, {
        timeout: 10000,
        retryCount: 2,
        retryDelay: 1000
      })
    });

    this.publicClients.set(cacheKey, client);
    return client;
  }

  // Create or get cached wallet client
  getWalletClient(): WalletClient {
    const endpoint = this.getBestEndpoint();
    const cacheKey = `wallet-${endpoint.http}`;

    if (this.walletClients.has(cacheKey)) {
      return this.walletClients.get(cacheKey)!;
    }

    const client: any = createWalletClient({
      chain: baseSepolia,
      transport: http(endpoint.http, {
        timeout: 15000,
        retryCount: 3,
        retryDelay: 1000
      })
    });

    this.walletClients.set(cacheKey, client);
    return client;
  }

  // Health check all endpoints
  private async healthCheckEndpoint(endpoint: RPCEndpoint): Promise<void> {
    const startTime = Date.now();

    try {
      const client = createPublicClient({
        chain: baseSepolia,
        transport: http(endpoint.http, { timeout: 5000 })
      });

      await client.getBlockNumber();
      endpoint.isHealthy = true;
      endpoint.responseTime = Date.now() - startTime;
    } catch (error) {
      endpoint.isHealthy = false;
      endpoint.responseTime = 9999; // High penalty for failed requests
      console.warn(`RPC endpoint ${endpoint.http} health check failed:`, error);
    }

    endpoint.lastHealthCheck = Date.now();
  }

  // Start periodic health checks
  private startHealthChecks(): void {
    // Initial health check
    this.endpoints.forEach(endpoint => this.healthCheckEndpoint(endpoint));

    // Periodic health checks every 30 seconds
    this.healthCheckInterval = setInterval(() => {
      this.endpoints.forEach(endpoint => {
        // Only check if it's been more than 30 seconds since last check
        if (Date.now() - endpoint.lastHealthCheck > 30000) {
          this.healthCheckEndpoint(endpoint);
        }
      });
    }, 30000);
  }

  // Get connection pool stats
  getStats() {
    return {
      endpoints: this.endpoints.map(ep => ({
        url: ep.http,
        healthy: ep.isHealthy,
        responseTime: ep.responseTime,
        weight: ep.weight
      })),
      activeConnections: this.connectionPool.size,
      cachedClients: {
        public: this.publicClients.size,
        wallet: this.walletClients.size
      }
    };
  }

  // Cleanup resources
  destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    this.publicClients.clear();
    this.walletClients.clear();
    this.connectionPool.clear();
  }
}

// Singleton instance
export const baseRPCManager = new BaseRPCManager();

// Convenience functions
export const getBasePublicClient = () => baseRPCManager.getPublicClient();
export const getBaseWalletClient = () => baseRPCManager.getWalletClient();
export const getBaseRPCStats = () => baseRPCManager.getStats();

// Export for cleanup
export { BaseRPCManager };