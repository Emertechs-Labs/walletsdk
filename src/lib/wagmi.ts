import { createConfig, http } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { baseRPCManager } from '../lib/base-rpc-manager';

// Server-safe minimal config
const createMinimalConfig = () => {
  return createConfig({
    chains: [baseSepolia],
    transports: {
      [baseSepolia.id]: http('https://sepolia.base.org'),
    },
    connectors: [],
    ssr: true,
  });
};

// Lazy-loaded client config
let _clientConfig: any = null;
const createClientConfig = async () => {
  if (_clientConfig) return _clientConfig;

  try {
    // Dynamic import to avoid server-side issues
    const { connectorsForWallets } = await import('@rainbow-me/rainbowkit');
    const {
      metaMaskWallet,
      walletConnectWallet,
      coinbaseWallet,
      rainbowWallet,
      braveWallet,
      injectedWallet,
    } = await import('@rainbow-me/rainbowkit/wallets');

    const appName = 'Echain Wallet';
    const projectId = process.env.NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID || 'your-project-id';

    const connectors = connectorsForWallets(
      [
        {
          groupName: 'Recommended',
          wallets: [
            metaMaskWallet,
            walletConnectWallet,
            coinbaseWallet,
            rainbowWallet,
            braveWallet,
            injectedWallet,
          ],
        },
      ],
      {
        appName,
        projectId,
      }
    );

    _clientConfig = createConfig({
      chains: [baseSepolia],
      transports: {
        [baseSepolia.id]: http('https://sepolia.base.org'),
      },
      connectors,
      ssr: true,
    });

    return _clientConfig;
  } catch (error) {
    console.warn('Failed to create client wagmi config:', error);
    return createMinimalConfig();
  }
};

export const getConfig = async () => {
  if (typeof window === 'undefined') {
    return createMinimalConfig();
  }
  return await createClientConfig();
};

// For backward compatibility - return minimal config synchronously
export const config = createMinimalConfig();

export { baseSepolia as defaultChain };
export { baseRPCManager };