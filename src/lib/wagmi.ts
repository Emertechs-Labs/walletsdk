import { createConfig, http } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { injected, walletConnect, coinbaseWallet, metaMask } from 'wagmi/connectors';
import { baseRPCManager } from '../lib/base-rpc-manager';

// Server-safe minimal config
const createMinimalConfig = () => {
  return createConfig({
    chains: [base, baseSepolia],
    transports: {
      [base.id]: http('https://mainnet.base.org'),
      [baseSepolia.id]: http('https://sepolia.base.org'),
    },
    connectors: [],
    ssr: true,
  });
};

// Client config with connectors
const createClientConfig = () => {
  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id';

  const connectors = [
    metaMask(),
    walletConnect({ projectId }),
    coinbaseWallet({
      appName: 'Echain Wallet',
      preference: 'smartWalletOnly'
    }),
    injected({ shimDisconnect: true }),
  ];

  return createConfig({
    chains: [base, baseSepolia],
    transports: {
      [base.id]: http('https://mainnet.base.org'),
      [baseSepolia.id]: http('https://sepolia.base.org'),
    },
    connectors,
    ssr: true,
  });
};

export const getConfig = () => {
  if (typeof window === 'undefined') {
    return createMinimalConfig();
  }
  return createClientConfig();
};

// For backward compatibility - return client config
export const config = createClientConfig();

export { baseSepolia as defaultChain };
export { baseRPCManager };