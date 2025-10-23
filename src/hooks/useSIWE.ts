import { useState } from 'react';
import { useAccount, useSignMessage, useChainId } from 'wagmi';
import { SiweMessage } from 'siwe';
import { base, baseSepolia } from 'wagmi/chains';

export interface SIWEConfig {
  domain: string;
  uri: string;
  statement?: string;
  version?: string;
  chainId?: number;
  nonce?: string;
}

export interface SIWEResult {
  message: string;
  signature: string;
  address: string;
}

export function useSIWE() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();

  const signInWithEthereum = async (config: SIWEConfig): Promise<SIWEResult | null> => {
    if (!address) {
      setError('No wallet connected');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // Determine if we're on Base network
      const isBaseNetwork = chainId === base.id || chainId === baseSepolia.id;
      if (!isBaseNetwork) {
        throw new Error('SIWE is only supported on Base networks');
      }

      // Create SIWE message
      const message = new SiweMessage({
        domain: config.domain,
        address,
        statement: config.statement || 'Sign in with Ethereum to the app.',
        uri: config.uri,
        version: config.version || '1',
        chainId,
        nonce: config.nonce || generateNonce(),
      });

      const messageString = message.prepareMessage();

      // Sign the message
      const signature = await signMessageAsync({ message: messageString });

      return {
        message: messageString,
        signature,
        address,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'SIWE signing failed';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const verifySIWE = async (message: string, signature: string): Promise<boolean> => {
    try {
      const siweMessage = new SiweMessage(message);
      const result = await siweMessage.verify({ signature });
      return result.success;
    } catch (err) {
      setError('SIWE verification failed');
      return false;
    }
  };

  return {
    signInWithEthereum,
    verifySIWE,
    loading,
    error,
  };
}

// Utility function to generate nonce
function generateNonce(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}