import { createConfig, http } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
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

// Lazy-loaded client config
let _clientConfig: any = null;
const createClientConfig = async () => {
  if (_clientConfig) return _clientConfig;

  try {
    // Dynamic import to avoid server-side issues and handle missing packages
    const rainbowKit = await import('@rainbow-me/rainbowkit').catch(() => null);
    const rainbowWallets = await import('@rainbow-me/rainbowkit/wallets').catch(() => null);

    if (!rainbowKit || !rainbowWallets) {
      console.warn('RainbowKit not available, using minimal config');
      return createMinimalConfig();
    }

    const { connectorsForWallets } = rainbowKit;
    const {
      metaMaskWallet,
      walletConnectWallet,
      coinbaseWallet,
      rainbowWallet,
      braveWallet,
      injectedWallet,
    } = rainbowWallets;

    const appName = 'Echain Wallet';
    const projectId = process.env.NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID || 'your-project-id';

    const connectors = connectorsForWallets(
      [
        {
          groupName: 'Recommended',
          wallets: [
            metaMaskWallet,
            walletConnectWallet({ projectId, qrModalOptions: { themeMode: 'light' } }),
            coinbaseWallet({ appName, preference: 'smartWalletOnly' }),
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
      chains: [base, baseSepolia],
      transports: {
        [base.id]: http('https://mainnet.base.org'),
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