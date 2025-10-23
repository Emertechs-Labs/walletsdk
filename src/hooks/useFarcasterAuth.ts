import { useState } from 'react';
import { useSignIn } from '@farcaster/auth-kit';

export interface FarcasterAuthResult {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl?: string;
  bio?: string;
}

export function useFarcasterAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<FarcasterAuthResult | null>(null);

  const { signIn, isSuccess, isError } = useSignIn({
    onSuccess: (data) => {
      setUser({
        fid: data.fid || 0,
        username: data.username || '',
        displayName: data.displayName || '',
        pfpUrl: data.pfpUrl,
        bio: data.bio,
      });
      setLoading(false);
      setError(null);
    },
    onError: (error) => {
      setError(error?.message || 'Farcaster sign-in failed');
      setLoading(false);
    },
  });

  const signInWithFarcaster = async () => {
    setLoading(true);
    setError(null);
    try {
      await signIn();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Farcaster sign-in failed';
      setError(errorMessage);
      setLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    setError(null);
  };

  return {
    signInWithFarcaster,
    signOut,
    user,
    loading,
    error,
    isSuccess,
    isError,
  };
}