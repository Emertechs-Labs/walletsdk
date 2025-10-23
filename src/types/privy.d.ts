// Privy type declarations for optional dependency
declare module '@privy-io/react-auth' {
  export interface User {
    id: string;
    email?: string;
    phone?: string;
    wallet?: {
      address: string;
      walletClientType: string;
    };
  }

  export interface PrivyInterface {
    ready: boolean;
    authenticated: boolean;
    user: User | null;
    login: (options?: any) => Promise<User>;
    logout: () => Promise<void>;
    getAccessToken: () => string | null;
  }

  export function usePrivy(): PrivyInterface;

  export interface PrivyProviderProps {
    appId: string;
    config?: any;
    children: React.ReactNode;
  }

  export const PrivyProvider: React.ComponentType<PrivyProviderProps>;

  // Export everything as a default export for dynamic imports
  const privy: {
    usePrivy: () => PrivyInterface;
    PrivyProvider: React.ComponentType<PrivyProviderProps>;
    // Add other exports as needed
  };

  export default privy;
}

export {};