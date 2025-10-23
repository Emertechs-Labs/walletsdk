# Testing Strategies for Base Wallet Integration

## Overview

Comprehensive testing is crucial for wallet integrations on Base. This guide covers testing strategies, tools, and best practices for ensuring reliable wallet functionality.

## Testing Pyramid

```
Unit Tests (80%+ coverage)
├── Component Tests
├── Hook Tests
├── Utility Tests
└── Service Tests

Integration Tests (15%)
├── Wallet Connection Tests
├── Transaction Tests
└── Network Tests

End-to-End Tests (5%)
├── User Journey Tests
├── Cross-browser Tests
└── Mobile Tests
```

## Unit Testing

### Component Testing

#### React Component Testing with Jest and React Testing Library
```typescript
// components/__tests__/UnifiedConnectButton.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UnifiedConnectButton } from '../UnifiedConnectButton';
import { WagmiProvider } from 'wagmi';
import { base } from '../../lib/base-chains';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <WagmiProvider config={wagmiConfig}>
      {component}
    </WagmiProvider>
  );
};

describe('UnifiedConnectButton', () => {
  it('renders connect button when not connected', () => {
    renderWithProviders(<UnifiedConnectButton />);

    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
  });

  it('renders disconnect button when connected', async () => {
    // Mock connected state
    const mockAccount = {
      address: '0x1234567890123456789012345678901234567890',
      isConnected: true,
    };

    // Setup mock
    (useAccount as jest.Mock).mockReturnValue(mockAccount);

    renderWithProviders(<UnifiedConnectButton />);

    await waitFor(() => {
      expect(screen.getByText('Disconnect')).toBeInTheDocument();
    });
  });

  it('opens modal on connect button click', () => {
    renderWithProviders(<UnifiedConnectButton />);

    const connectButton = screen.getByText('Connect Wallet');
    fireEvent.click(connectButton);

    expect(screen.getByTestId('wallet-modal')).toBeInTheDocument();
  });
});
```

#### Hook Testing
```typescript
// hooks/__tests__/useWalletConnection.test.tsx
import { renderHook, act, waitFor } from '@testing-library/react';
import { useWalletConnection } from '../useWalletConnection';
import { WagmiProvider } from 'wagmi';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <WagmiProvider config={wagmiConfig}>
    {children}
  </WagmiProvider>
);

describe('useWalletConnection', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
  });

  it('returns initial connection state', () => {
    const { result } = renderHook(() => useWalletConnection(), { wrapper });

    expect(result.current.isConnected).toBe(false);
    expect(result.current.address).toBeUndefined();
    expect(result.current.chainId).toBeUndefined();
  });

  it('connects to wallet successfully', async () => {
    const mockConnector = {
      connect: jest.fn().mockResolvedValue({
        account: '0x1234567890123456789012345678901234567890',
        chain: { id: 8453 },
      }),
    };

    (useConnect as jest.Mock).mockReturnValue({
      connect: mockConnector.connect,
      connectors: [mockConnector],
    });

    const { result } = renderHook(() => useWalletConnection(), { wrapper });

    act(() => {
      result.current.connect(mockConnector);
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
      expect(result.current.address).toBe('0x1234567890123456789012345678901234567890');
      expect(result.current.chainId).toBe(8453);
    });
  });

  it('handles connection errors', async () => {
    const mockError = new Error('Connection failed');
    const mockConnector = {
      connect: jest.fn().mockRejectedValue(mockError),
    };

    (useConnect as jest.Mock).mockReturnValue({
      connect: mockConnector.connect,
      connectors: [mockConnector],
    });

    const { result } = renderHook(() => useWalletConnection(), { wrapper });

    act(() => {
      result.current.connect(mockConnector);
    });

    await waitFor(() => {
      expect(result.current.error).toBe(mockError);
      expect(result.current.isConnected).toBe(false);
    });
  });
});
```

### Service Testing

#### Transaction Service Testing
```typescript
// services/__tests__/hederaTransactionService.test.ts
import { HederaTransactionService } from '../hederaTransactionService';
import { ethers } from 'ethers';

jest.mock('ethers');

describe('HederaTransactionService', () => {
  let service: HederaTransactionService;
  let mockProvider: jest.Mocked<ethers.Provider>;
  let mockSigner: jest.Mocked<ethers.Signer>;

  beforeEach(() => {
    mockProvider = {
      getBalance: jest.fn(),
      estimateGas: jest.fn(),
      getFeeData: jest.fn(),
      call: jest.fn(),
    } as any;

    mockSigner = {
      getAddress: jest.fn(),
      sendTransaction: jest.fn(),
    } as any;

    service = new HederaTransactionService(mockProvider, mockSigner);
  });

  describe('sendTransaction', () => {
    it('validates transaction parameters', async () => {
      const invalidTx = {
        to: 'invalid-address',
        value: ethers.parseEther('1'),
      };

      await expect(service.sendTransaction(invalidTx))
        .rejects.toThrow('Invalid recipient address');
    });

    it('checks balance before sending', async () => {
      const tx = {
        to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        value: ethers.parseEther('1'),
      };

      mockSigner.getAddress.mockResolvedValue('0x123...');
      mockProvider.getBalance.mockResolvedValue(ethers.parseEther('0.5'));
      mockProvider.estimateGas.mockResolvedValue(21000n);

      await expect(service.sendTransaction(tx))
        .rejects.toThrow('Insufficient balance');
    });

    it('sends transaction successfully', async () => {
      const tx = {
        to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        value: ethers.parseEther('0.1'),
      };

      const mockTxResponse = {
        hash: '0xabc123...',
        wait: jest.fn().mockResolvedValue({
          status: 1,
          blockNumber: 12345,
        }),
      };

      mockSigner.getAddress.mockResolvedValue('0x123...');
      mockProvider.getBalance.mockResolvedValue(ethers.parseEther('1'));
      mockProvider.estimateGas.mockResolvedValue(21000n);
      mockProvider.call.mockResolvedValue('0x');
      mockSigner.sendTransaction.mockResolvedValue(mockTxResponse as any);

      const result = await service.sendTransaction(tx);

      expect(result.status).toBe(1);
      expect(mockSigner.sendTransaction).toHaveBeenCalledWith(tx);
    });
  });
});
```

## Integration Testing

### Wallet Connection Integration Tests
```typescript
// __tests__/integration/wallet-connection.test.ts
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UnifiedConnectModal } from '../../components/UnifiedConnectModal';
import { WagmiProvider } from 'wagmi';
import { base } from '../../lib/base-chains';

describe('Wallet Connection Integration', () => {
  it('connects to Coinbase Wallet', async () => {
    render(
      <WagmiProvider config={wagmiConfig}>
        <UnifiedConnectModal />
      </WagmiProvider>
    );

    // Open modal
    const connectButton = screen.getByText('Connect Wallet');
    fireEvent.click(connectButton);

    // Select Coinbase Wallet
    const coinbaseOption = screen.getByText('Coinbase Wallet');
    fireEvent.click(coinbaseOption);

    // Mock successful connection
    await waitFor(() => {
      expect(screen.getByText('Connected')).toBeInTheDocument();
    });

    // Verify connection state
    expect(screen.getByText(/0x[a-fA-F0-9]{40}/)).toBeInTheDocument();
  });

  it('handles network switching', async () => {
    // Connect wallet first
    // ... connection setup

    // Switch to Base Sepolia
    const networkSwitcher = screen.getByTestId('network-switcher');
    fireEvent.click(networkSwitcher);

    const baseSepoliaOption = screen.getByText('Base Sepolia');
    fireEvent.click(baseSepoliaOption);

    await waitFor(() => {
      expect(screen.getByText('Base Sepolia')).toBeInTheDocument();
    });
  });
});
```

### Smart Wallet Integration Tests
```typescript
// __tests__/integration/smart-wallet.test.ts
import { createSmartWallet } from '../../lib/smart-wallet-manager';
import { baseSepolia } from '../../lib/base-chains';

describe('Smart Wallet Integration', () => {
  let smartWallet: any;

  beforeEach(async () => {
    smartWallet = await createSmartWallet({
      chain: baseSepolia,
      ownerAddress: '0x1234567890123456789012345678901234567890',
    });
  });

  it('creates smart wallet account', async () => {
    expect(smartWallet.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
    expect(smartWallet.isDeployed).toBe(false);
  });

  it('deploys smart wallet', async () => {
    const deployTx = await smartWallet.deploy();

    expect(deployTx.hash).toMatch(/^0x[a-fA-F0-9]{64}$/);

    // Wait for deployment
    await deployTx.wait();

    expect(smartWallet.isDeployed).toBe(true);
  });

  it('executes user operation', async () => {
    // Deploy wallet first
    await smartWallet.deploy();

    const userOp = {
      target: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      value: ethers.parseEther('0.01'),
      data: '0x',
    };

    const result = await smartWallet.execute(userOp);

    expect(result.success).toBe(true);
    expect(result.txHash).toMatch(/^0x[a-fA-F0-9]{64}$/);
  });

  it('batches multiple operations', async () => {
    await smartWallet.deploy();

    const operations = [
      {
        target: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        value: ethers.parseEther('0.01'),
        data: '0x',
      },
      {
        target: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        value: 0n,
        data: '0xa9059cbb' + '00'.repeat(32) + '01'.repeat(32), // transfer(address,uint256)
      },
    ];

    const result = await smartWallet.executeBatch(operations);

    expect(result.success).toBe(true);
    expect(result.txHash).toMatch(/^0x[a-fA-F0-9]{64}$/);
  });
});
```

## End-to-End Testing

### Playwright E2E Tests
```typescript
// e2e/wallet-connection.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Wallet Connection E2E', () => {
  test('should connect Coinbase Wallet', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Click connect button
    await page.click('text=Connect Wallet');

    // Select Coinbase Wallet
    await page.click('text=Coinbase Wallet');

    // Mock wallet connection (in real scenario, would use wallet emulator)
    await page.evaluate(() => {
      // Simulate wallet connection
      window.ethereum = {
        request: async ({ method, params }: any) => {
          if (method === 'eth_requestAccounts') {
            return ['0x1234567890123456789012345678901234567890'];
          }
          if (method === 'eth_chainId') {
            return '0x2105'; // Base mainnet
          }
          return null;
        },
        on: () => {},
        removeListener: () => {},
      };
    });

    // Verify connection
    await expect(page.locator('text=Connected')).toBeVisible();
    await expect(page.locator('text=0x1234...7890')).toBeVisible();
  });

  test('should switch networks', async ({ page }) => {
    // Connect wallet first
    // ... connection steps

    // Open network switcher
    await page.click('[data-testid="network-switcher"]');

    // Select Base Sepolia
    await page.click('text=Base Sepolia');

    // Verify network switch
    await expect(page.locator('text=Base Sepolia')).toBeVisible();
  });

  test('should send transaction', async ({ page }) => {
    // Connect wallet and switch to testnet
    // ... setup steps

    // Navigate to send page
    await page.click('text=Send');

    // Fill transaction details
    await page.fill('[data-testid="recipient"]', '0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
    await page.fill('[data-testid="amount"]', '0.01');

    // Submit transaction
    await page.click('text=Send Transaction');

    // Verify transaction success
    await expect(page.locator('text=Transaction sent!')).toBeVisible();
  });
});
```

## Test Configuration

### Jest Configuration
```javascript
// jest.config.ts
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/setupTests.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx}',
  ],
};
```

### Setup Tests File
```typescript
// src/setupTests.ts
import '@testing-library/jest-dom';
import { ethers } from 'ethers';

// Mock ethers
jest.mock('ethers', () => ({
  ethers: {
    providers: {
      JsonRpcProvider: jest.fn(),
    },
    Wallet: jest.fn(),
    Contract: jest.fn(),
    utils: {
      parseEther: jest.fn((value) => BigInt(value) * 10n ** 18n),
      formatEther: jest.fn((value) => Number(value) / 10 ** 18),
      isAddress: jest.fn((address) => /^0x[a-fA-F0-9]{40}$/.test(address)),
      getAddress: jest.fn((address) => address.toLowerCase()),
    },
  },
}));

// Mock wagmi hooks
jest.mock('wagmi', () => ({
  useAccount: jest.fn(),
  useConnect: jest.fn(),
  useDisconnect: jest.fn(),
  useNetwork: jest.fn(),
  useSigner: jest.fn(),
  useProvider: jest.fn(),
  WagmiProvider: ({ children }: any) => children,
}));

// Mock RainbowKit
jest.mock('@rainbow-me/rainbowkit', () => ({
  ConnectButton: ({ children }: any) => children,
  RainbowKitProvider: ({ children }: any) => children,
}));

// Global test utilities
global.testUtils = {
  mockAddress: '0x1234567890123456789012345678901234567890',
  mockChainId: 8453,
  mockTransaction: {
    hash: '0xabc123def456ghi789jkl012mno345pqr678stu901vwx',
    to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    value: ethers.parseEther('0.1'),
  },
};
```

## Mock Data and Fixtures

### Test Fixtures
```typescript
// __fixtures__/wallet-states.ts
export const mockWalletStates = {
  disconnected: {
    address: undefined,
    isConnected: false,
    chainId: undefined,
  },
  connected: {
    address: '0x1234567890123456789012345678901234567890',
    isConnected: true,
    chainId: 8453, // Base mainnet
  },
  connectedTestnet: {
    address: '0x1234567890123456789012345678901234567890',
    isConnected: true,
    chainId: 84532, // Base Sepolia
  },
};

export const mockTransactions = {
  successful: {
    hash: '0xabc123def456ghi789jkl012mno345pqr678stu901vwx',
    to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    value: ethers.parseEther('0.1'),
    status: 1,
    blockNumber: 12345,
  },
  failed: {
    hash: '0xdef456ghi789jkl012mno345pqr678stu901vwx123abc',
    to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    value: ethers.parseEther('0.1'),
    status: 0,
    blockNumber: 12346,
  },
};
```

## Continuous Integration

### GitHub Actions Testing Workflow
```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
    - uses: actions/checkout@v3

    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run linting
      run: npm run lint

    - name: Run unit tests
      run: npm run test:unit

    - name: Run integration tests
      run: npm run test:integration

    - name: Run E2E tests
      run: npm run test:e2e

    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
```

### Test Scripts in package.json
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:unit": "jest --testPathPattern=src/**/__tests__",
    "test:integration": "jest --testPathPattern=__tests__/integration",
    "test:e2e": "playwright test",
    "test:coverage": "jest --coverage",
    "lint": "eslint src --ext .ts,.tsx",
    "type-check": "tsc --noEmit"
  }
}
```

## Performance Testing

### Load Testing Wallet Connections
```typescript
// __tests__/performance/wallet-load.test.ts
import { createWalletLoadTest } from '../utils/load-test-utils';

describe('Wallet Connection Performance', () => {
  it('handles multiple concurrent connections', async () => {
    const numConnections = 100;
    const results = await createWalletLoadTest(numConnections);

    expect(results.averageConnectionTime).toBeLessThan(5000); // 5 seconds
    expect(results.failedConnections).toBe(0);
    expect(results.successRate).toBeGreaterThan(0.95); // 95% success rate
  });

  it('maintains performance under load', async () => {
    const numTransactions = 50;
    const results = await createTransactionLoadTest(numTransactions);

    expect(results.averageTransactionTime).toBeLessThan(30000); // 30 seconds
    expect(results.failedTransactions).toBe(0);
  });
});
```

## Security Testing

### Fuzz Testing
```typescript
// __tests__/security/fuzz.test.ts
import { fuzzTransactionData } from '../utils/fuzz-utils';

describe('Transaction Security', () => {
  it('handles malformed transaction data', () => {
    const fuzzCases = fuzzTransactionData(1000);

    for (const fuzzCase of fuzzCases) {
      expect(() => {
        validateTransaction(fuzzCase);
      }).not.toThrow();
    }
  });

  it('prevents injection attacks', () => {
    const maliciousInputs = [
      '<script>alert("xss")</script>',
      '../../../etc/passwd',
      '0x' + 'FF'.repeat(1000), // Oversized input
    ];

    for (const input of maliciousInputs) {
      expect(() => {
        sanitizeAddress(input);
      }).toThrow();
    }
  });
});
```

## Test Utilities

### Custom Test Matchers
```typescript
// __tests__/utils/custom-matchers.ts
expect.extend({
  toBeValidAddress(received) {
    const pass = /^0x[a-fA-F0-9]{40}$/.test(received);
    return {
      message: () => `expected ${received} to be a valid Ethereum address`,
      pass,
    };
  },

  toBeValidTransactionHash(received) {
    const pass = /^0x[a-fA-F0-9]{64}$/.test(received);
    return {
      message: () => `expected ${received} to be a valid transaction hash`,
      pass,
    };
  },
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidAddress(): R;
      toBeValidTransactionHash(): R;
    }
  }
}
```

### Test Data Generators
```typescript
// __tests__/utils/test-data-generator.ts
export const generateMockAddress = (): string => {
  return '0x' + Math.random().toString(16).substring(2, 42);
};

export const generateMockTransaction = () => {
  return {
    hash: '0x' + Math.random().toString(16).substring(2, 66),
    to: generateMockAddress(),
    from: generateMockAddress(),
    value: ethers.parseEther((Math.random() * 10).toString()),
    gasLimit: 21000n + BigInt(Math.floor(Math.random() * 10000)),
  };
};

export const generateMockUserOperation = () => {
  return {
    sender: generateMockAddress(),
    nonce: BigInt(Math.floor(Math.random() * 1000)),
    initCode: '0x',
    callData: '0x' + Math.random().toString(16).substring(2, 100),
    callGasLimit: 100000n,
    verificationGasLimit: 100000n,
    preVerificationGas: 21000n,
    maxFeePerGas: ethers.parseUnits('20', 'gwei'),
    maxPriorityFeePerGas: ethers.parseUnits('2', 'gwei'),
    paymasterAndData: '0x',
    signature: '0x' + Math.random().toString(16).substring(2, 200),
  };
};
```

## Best Practices

### Test Organization
- Group tests by feature/component
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests independent and isolated

### Mock Strategy
- Mock external dependencies (RPC calls, wallet connections)
- Use realistic mock data
- Avoid over-mocking (test real logic when possible)

### Coverage Goals
- Aim for 80%+ code coverage
- Focus on critical paths
- Don't test third-party libraries
- Cover error conditions

### CI/CD Integration
- Run tests on every PR
- Block merges on test failures
- Monitor coverage trends
- Alert on coverage drops

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [Wagmi Testing Guide](https://wagmi.sh/react/guides/testing)
- [Base Testing Resources](https://docs.base.org/docs/testing/)

---

*Last updated: October 23, 2025*</content>
<parameter name="filePath">e:\Polymath Universata\Projects\walletsdk\docs\base-docs\testing-strategies.md