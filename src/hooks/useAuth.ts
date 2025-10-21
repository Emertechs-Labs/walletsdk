import { useState, useEffect } from 'react';
import { authService, AuthUser } from '../services/authService';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string) => {
    const result = await authService.signUp(email, password);
    return result;
  };

  const signIn = async (email: string, password: string) => {
    return authService.signIn(email, password);
  };

  const signOut = async () => {
    return authService.signOut();
  };

  const resetPassword = async (email: string) => {
    return authService.resetPassword(email);
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword
  };
}