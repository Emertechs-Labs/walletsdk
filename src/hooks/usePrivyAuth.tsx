import { useState, useEffect } from 'react';

export interface PrivyUser {
  id: string;
  email?: string;
  phone?: string;
  wallet?: {
    address: string;
    walletClientType: string;
  };
}

export interface PrivyAuthResult {
  user: PrivyUser;
  isReady: boolean;
}

export function usePrivyAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<PrivyUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initPrivy = async () => {
      try {
        // Dynamic import with type assertion to avoid TypeScript resolution
        const privyModule = await (import('@privy-io/react-auth') as any).catch(() => null);
        if (!privyModule) {
          setError('Privy not installed or not configured');
          setIsReady(true);
          return;
        }
        // This would be used in a component wrapped with PrivyProvider
        setIsReady(true);
      } catch (err) {
        setError('Privy not installed or not configured');
      }
    };

    initPrivy();
  }, []);

  const signInWithEmail = async (_email: string) => {
    setLoading(true);
    setError(null);
    try {
      const privyModule = await (import('@privy-io/react-auth') as any).catch(() => null);
      if (!privyModule) {
        throw new Error('Privy integration requires PrivyProvider in the app and @privy-io/react-auth package');
      }
      // In a real implementation, this would use the Privy hook
      throw new Error('Privy integration requires PrivyProvider in the app');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Privy sign-in failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signInWithWallet = async () => {
    setLoading(true);
    setError(null);
    try {
      // Privy handles wallet connection
      throw new Error('Privy integration requires PrivyProvider in the app');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Privy wallet sign-in failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const privyModule = await (import('@privy-io/react-auth') as any).catch(() => null);
      if (!privyModule) {
        throw new Error('Privy not available');
      }
      // usePrivy().logout()
      setUser(null);
    } catch (err) {
      setError('Privy sign-out failed');
    }
  };

  return {
    signInWithEmail,
    signInWithWallet,
    signOut,
    user,
    loading,
    error,
    isReady,
  };
}

// PrivyProvider component for apps to use
export const PrivyProvider = ({
  children,
  appId,
  config
}: {
  children: React.ReactNode;
  appId: string;
  config?: any
}) => {
  const [PrivyProviderComponent, setPrivyProviderComponent] = useState<any>(null);

  useEffect(() => {
    const loadPrivy = async () => {
      try {
        const privyModule = await (import('@privy-io/react-auth') as any).catch(() => null);
        if (privyModule) {
          const { PrivyProvider } = privyModule;
          setPrivyProviderComponent(() => PrivyProvider);
        }
      } catch (err) {
        console.warn('Privy not available:', err);
      }
    };

    loadPrivy();
  }, []);

  if (!PrivyProviderComponent) {
    return <>{children}</>; // Fallback if Privy not installed
  }

  return (
    <PrivyProviderComponent
      appId={appId}
      config={{
        loginMethods: ['email', 'wallet'],
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
        ...config,
      }}
    >
      {children}
    </PrivyProviderComponent>
  );
};