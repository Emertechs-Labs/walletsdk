# Coinbase AgentKit Integration

## Overview

AgentKit is Coinbase's framework for building AI agents that can interact with blockchain networks, including Base. It provides wallet management, transaction capabilities, and integration with various DeFi protocols.

## Installation

```bash
npm install @coinbase/agentkit
```

## Wallet Providers

### CDP EVM Wallet Provider

#### Creating a New Wallet
```typescript
import { CdpEvmWalletProvider } from '@coinbase/agentkit';

const walletProvider = await CdpEvmWalletProvider.configureWithWallet({
  apiKeyId: process.env.CDP_API_KEY_ID!,
  apiKeySecret: process.env.CDP_API_KEY_SECRET!,
  networkId: 'base-sepolia', // or 'base-mainnet'
  walletSecret: process.env.CDP_WALLET_SECRET,
  idempotencyKey: 'unique-wallet-key', // Optional: for deterministic wallet creation
});
```

#### Using an Existing Wallet
```typescript
const walletProvider = await CdpEvmWalletProvider.configureWithWallet({
  apiKeyId: process.env.CDP_API_KEY_ID!,
  apiKeySecret: process.env.CDP_API_KEY_SECRET!,
  networkId: 'base-sepolia',
  walletSecret: process.env.CDP_WALLET_SECRET,
  address: '0x...', // Existing wallet address
});
```

### Smart Wallet Provider

#### Creating a New Smart Wallet
```typescript
import { CdpSmartWalletProvider } from '@coinbase/agentkit';

const smartWalletProvider = await CdpSmartWalletProvider.configureWithWallet({
  apiKeyId: process.env.CDP_API_KEY_ID!,
  apiKeySecret: process.env.CDP_API_KEY_SECRET!,
  networkId: 'base-sepolia',
  walletSecret: process.env.CDP_WALLET_SECRET,
  owner: 'owner-private-key-or-address',
  idempotencyKey: 'unique-smart-wallet-key',
});
```

#### Using an Existing Smart Wallet
```typescript
const smartWalletProvider = await CdpSmartWalletProvider.configureWithWallet({
  apiKeyId: process.env.CDP_API_KEY_ID!,
  apiKeySecret: process.env.CDP_API_KEY_SECRET!,
  networkId: 'base-sepolia',
  walletSecret: process.env.CDP_WALLET_SECRET,
  address: '0x...', // Existing smart wallet address
});
```

### Privy Embedded Wallet Provider

#### Delegated Embedded Wallet
```typescript
import { PrivyWalletProvider } from '@coinbase/agentkit';

const privyProvider = await PrivyWalletProvider.configureWithWallet({
  appId: process.env.PRIVY_APP_ID!,
  appSecret: process.env.PRIVY_APP_SECRET!,
  authorizationPrivateKey: process.env.PRIVY_AUTH_PRIVATE_KEY!,
  walletId: 'delegated-wallet-id',
  networkId: 'base-mainnet',
  walletType: 'embedded',
});
```

### ZeroDev Wallet Provider

#### Account Abstraction Setup
```typescript
import { ZeroDevWalletProvider } from '@coinbase/agentkit';

const zeroDevProvider = await ZeroDevWalletProvider.configureWithWallet({
  signer: evmWalletProvider.toSigner(),
  projectId: process.env.ZERODEV_PROJECT_ID!,
  entryPointVersion: '0.7',
  networkId: 'base-mainnet',
});
```

## Action Providers

### Wallet Actions

#### Basic Wallet Operations
```typescript
import { getAddress, getBalance, transfer } from '@coinbase/agentkit';

// Get wallet address
const address = await getAddress(walletProvider);

// Get balance
const balance = await getBalance(walletProvider, 'eth');

// Transfer tokens
const txHash = await transfer(walletProvider, {
  to: '0x...',
  value: '0.1',
  token: 'eth',
});
```

#### Advanced Transaction Actions
```typescript
import { deployContract, callContract } from '@coinbase/agentkit';

// Deploy a contract
const deploymentTx = await deployContract(walletProvider, {
  bytecode: '0x...',
  abi: [...],
  constructorArgs: [...],
});

// Call contract method
const callResult = await callContract(walletProvider, {
  contractAddress: '0x...',
  method: 'transfer',
  args: ['0x...', '1000000000000000000'],
});
```

### DeFi Actions

#### Token Swaps (Jupiter DEX)
```typescript
import { swap } from '@coinbase/agentkit';

const swapTx = await swap(walletProvider, {
  fromToken: 'ETH',
  toToken: 'USDC',
  amount: '1.0',
  slippage: 0.5,
});
```

#### Portfolio Management (Zerion)
```typescript
import { getPortfolioOverview, getFungiblePositions } from '@coinbase/agentkit';

const portfolio = await getPortfolioOverview(walletProvider, '0x...');
const positions = await getFungiblePositions(walletProvider, '0x...');
```

#### Lending/Borrowing (ZeroDev)
```typescript
import { getCAB } from '@coinbase/agentkit';

const chainAbstractedBalance = await getCAB(walletProvider, {
  tokens: ['USDC', 'WETH'],
  networks: ['base-mainnet', 'ethereum-mainnet'],
});
```

### NFT Actions

#### Zora Coin Creation
```typescript
import { coinIt } from '@coinbase/agentkit';

const coinTx = await coinIt(walletProvider, {
  name: 'My Coin',
  symbol: 'MYCOIN',
  description: 'A unique digital collectible',
  image: 'https://example.com/image.png',
});
```

### External Service Integrations

#### WOW Token Sales
```typescript
import { sellWowTokens } from '@coinbase/agentkit';

const saleTx = await sellWowTokens(walletProvider, {
  amount: '100',
});
```

#### HTTP Requests with Payment
```typescript
import { makeHttpRequest, retryHttpRequestWithX402 } from '@coinbase/agentkit';

// Make request with automatic payment handling
const response = await makeHttpRequest(walletProvider, {
  url: 'https://api.example.com/data',
  method: 'GET',
});

// Retry with payment if 402 received
const retryResponse = await retryHttpRequestWithX402(walletProvider, {
  url: 'https://api.example.com/premium-data',
  method: 'GET',
  paymentDetails: paymentInfo,
});
```

## Agent Setup

### Basic Agent Configuration
```typescript
import { AgentKit, CdpEvmWalletProvider } from '@coinbase/agentkit';

// Configure wallet
const walletProvider = await CdpEvmWalletProvider.configureWithWallet({
  apiKeyId: process.env.CDP_API_KEY_ID!,
  apiKeySecret: process.env.CDP_API_KEY_SECRET!,
  networkId: 'base-sepolia',
});

// Create agent
const agent = await AgentKit.from({
  walletProvider,
  actionProviders: [
    // Add desired action providers
  ],
});
```

### Custom Action Providers
```typescript
import { ActionProvider } from '@coinbase/agentkit';

class CustomActionProvider extends ActionProvider {
  async execute(action: string, params: any) {
    switch (action) {
      case 'custom_action':
        // Implement custom logic
        return await this.performCustomAction(params);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  getAvailableActions() {
    return [
      {
        name: 'custom_action',
        description: 'Perform a custom action on Base',
        schema: {
          type: 'object',
          properties: {
            param1: { type: 'string' },
            param2: { type: 'number' },
          },
          required: ['param1'],
        },
      },
    ];
  }
}

// Add to agent
const agent = await AgentKit.from({
  walletProvider,
  actionProviders: [new CustomActionProvider()],
});
```

## Integration with AI Frameworks

### LangChain Integration
```typescript
import { ChatOpenAI } from '@langchain/openai';
import { AgentKit } from '@coinbase/agentkit';

const llm = new ChatOpenAI({
  modelName: 'gpt-4',
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const agent = await AgentKit.from({
  walletProvider,
  actionProviders: [],
});

const langchainAgent = agent.toLangchainAgent(llm);

// Use the agent
const result = await langchainAgent.invoke({
  input: 'Send 0.1 ETH to 0x... on Base',
});
```

### OpenAI Assistant Integration
```typescript
import OpenAI from 'openai';
import { AgentKit } from '@coinbase/agentkit';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const agent = await AgentKit.from({
  walletProvider,
  actionProviders: [],
});

const assistant = await openai.beta.assistants.create({
  model: 'gpt-4',
  tools: agent.toOpenAITools(),
  instructions: 'You are a helpful assistant that can interact with Base blockchain.',
});

// Use the assistant
const thread = await openai.beta.threads.create();
const run = await openai.beta.threads.runs.create(thread.id, {
  assistant_id: assistant.id,
  additional_instructions: 'Use the available blockchain tools to help the user.',
});
```

## Error Handling

### Wallet Errors
```typescript
try {
  const result = await walletProvider.sendTransaction({
    to: '0x...',
    value: '0.1',
  });
} catch (error) {
  if (error.code === 'INSUFFICIENT_FUNDS') {
    console.log('Not enough balance');
  } else if (error.code === 'NETWORK_ERROR') {
    console.log('Network connection issue');
  } else {
    console.error('Transaction failed:', error);
  }
}
```

### Agent Errors
```typescript
try {
  const result = await agent.run('Send 0.1 ETH to 0x...');
} catch (error) {
  if (error.type === 'TOOL_ERROR') {
    console.log('Tool execution failed:', error.message);
  } else if (error.type === 'VALIDATION_ERROR') {
    console.log('Input validation failed:', error.message);
  } else {
    console.error('Agent execution failed:', error);
  }
}
```

## Security Best Practices

### API Key Management
```typescript
// Use environment variables
const config = {
  apiKeyId: process.env.CDP_API_KEY_ID,
  apiKeySecret: process.env.CDP_API_KEY_SECRET,
  walletSecret: process.env.CDP_WALLET_SECRET,
};

// Never hardcode keys
// ❌ Bad
const config = {
  apiKeyId: 'your-api-key-id',
  apiKeySecret: 'your-api-key-secret',
};
```

### Transaction Validation
```typescript
// Always validate transaction parameters
const validateTransaction = (params: any) => {
  if (!params.to || !params.to.startsWith('0x')) {
    throw new Error('Invalid recipient address');
  }
  if (params.value && parseFloat(params.value) <= 0) {
    throw new Error('Invalid transaction value');
  }
  // Add more validations as needed
};
```

### Rate Limiting
```typescript
// Implement rate limiting for agent actions
const rateLimiter = new Map();

const checkRateLimit = (userId: string) => {
  const now = Date.now();
  const userRequests = rateLimiter.get(userId) || [];

  // Remove old requests (last hour)
  const recentRequests = userRequests.filter(time => now - time < 3600000);

  if (recentRequests.length >= 100) { // 100 requests per hour
    throw new Error('Rate limit exceeded');
  }

  recentRequests.push(now);
  rateLimiter.set(userId, recentRequests);
};
```

## Testing

### Unit Testing Wallet Providers
```typescript
import { CdpEvmWalletProvider } from '@coinbase/agentkit';

describe('Wallet Provider', () => {
  let walletProvider: CdpEvmWalletProvider;

  beforeEach(async () => {
    walletProvider = await CdpEvmWalletProvider.configureWithWallet({
      // Test configuration
      apiKeyId: 'test-key-id',
      apiKeySecret: 'test-key-secret',
      networkId: 'base-sepolia',
    });
  });

  test('should get wallet address', async () => {
    const address = await walletProvider.getAddress();
    expect(address).toMatch(/^0x[a-fA-F0-9]{40}$/);
  });
});
```

### Integration Testing
```typescript
describe('Agent Integration', () => {
  test('should execute transfer action', async () => {
    const agent = await AgentKit.from({
      walletProvider,
      actionProviders: [],
    });

    const result = await agent.run('Send 0.01 ETH to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
    expect(result.success).toBe(true);
  });
});
```

## Monitoring and Logging

### Transaction Monitoring
```typescript
import { EventEmitter } from 'events';

class TransactionMonitor extends EventEmitter {
  constructor(private walletProvider: any) {
    super();
    this.setupMonitoring();
  }

  private setupMonitoring() {
    // Monitor transaction events
    this.walletProvider.on('transaction', (tx: any) => {
      console.log('Transaction sent:', tx.hash);
      this.emit('transaction', tx);
    });
  }
}

const monitor = new TransactionMonitor(walletProvider);
monitor.on('transaction', (tx) => {
  // Log to monitoring service
  logToService('transaction_sent', tx);
});
```

## Deployment Considerations

### Environment Variables
```bash
# Required environment variables
CDP_API_KEY_ID=your-api-key-id
CDP_API_KEY_SECRET=your-api-key-secret
CDP_WALLET_SECRET=your-wallet-secret

# Optional for advanced features
ZERODEV_PROJECT_ID=your-zerodev-project-id
PRIVY_APP_ID=your-privy-app-id
PRIVY_APP_SECRET=your-privy-app-secret
```

### Production Configuration
```typescript
const productionConfig = {
  networkId: 'base-mainnet',
  // Use mainnet endpoints
  // Enable additional security measures
  // Set up proper monitoring
};
```

## Troubleshooting

### Common Issues

**API Key Errors:**
- Verify API keys are correct and active
- Check CDP dashboard for key status
- Ensure proper permissions are set

**Network Issues:**
- Confirm network ID is correct ('base-mainnet' or 'base-sepolia')
- Check network connectivity
- Verify RPC endpoints are accessible

**Transaction Failures:**
- Check wallet balance
- Verify gas limits and prices
- Confirm contract addresses are correct

**Agent Errors:**
- Validate action parameters
- Check action provider configurations
- Review error logs for detailed messages

## Resources

- [AgentKit Documentation](https://docs.cdp.coinbase.com/agentkit/)
- [AgentKit GitHub](https://github.com/coinbase/agentkit)
- [Coinbase Developer Platform](https://docs.cdp.coinbase.com/)
- [Base Documentation](https://docs.base.org/)

---

*Last updated: October 23, 2025*</content>
<parameter name="filePath">e:\Polymath Universata\Projects\walletsdk\docs\base-docs\agentkit-integration.md