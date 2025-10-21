import { useState, useEffect } from 'react';
import { userService, WalletBinding } from '../services/userService';
import { useAuth } from './useAuth';

export function useUserWallets() {
  const { user } = useAuth();
  const [walletBindings, setWalletBindings] = useState<WalletBinding[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadWalletBindings();
    } else {
      setWalletBindings([]);
    }
  }, [user]);

  const loadWalletBindings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const bindings = await userService.getWalletBindings(user.uid);
      setWalletBindings(bindings);
    } catch (error) {
      console.error('Error loading wallet bindings:', error);
    } finally {
      setLoading(false);
    }
  };

  const bindWallet = async (walletAddress: string, network: 'ethereum' | 'hedera') => {
    if (!user) throw new Error('User not authenticated');
    setLoading(true);
    try {
      await userService.bindWallet(user.uid, walletAddress, network);
      await loadWalletBindings(); // Refresh bindings
    } catch (error) {
      console.error('Error binding wallet:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const unbindWallet = async (walletAddress: string, network: 'ethereum' | 'hedera') => {
    if (!user) throw new Error('User not authenticated');
    setLoading(true);
    try {
      await userService.unbindWallet(user.uid, walletAddress, network);
      await loadWalletBindings(); // Refresh bindings
    } catch (error) {
      console.error('Error unbinding wallet:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const isWalletBound = (walletAddress: string, network: 'ethereum' | 'hedera'): boolean => {
    return walletBindings.some(
      binding => binding.walletAddress === walletAddress && binding.network === network && binding.isActive
    );
  };

  return {
    walletBindings,
    loading,
    bindWallet,
    unbindWallet,
    isWalletBound,
    refreshBindings: loadWalletBindings
  };
}