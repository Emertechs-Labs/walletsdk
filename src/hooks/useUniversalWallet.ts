import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAuth } from './useAuth';
import { useUserWallets } from './useUserWallets';

export interface UniversalWallet {
  address: string;
  network: 'ethereum' | 'hedera';
  encryptedPrivateKey: string;
}

export function useUniversalWallet() {
  const { user } = useAuth();
  const { walletBindings, bindWallet, unbindWallet } = useUserWallets();
  const [universalWallet, setUniversalWallet] = useState<UniversalWallet | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && walletBindings.length > 0) {
      // Find the universal wallet (assuming it's marked somehow)
      const universal = walletBindings.find(b => b.isActive && b.network === 'ethereum');
      if (universal) {
        // In a real implementation, you'd decrypt the private key
        setUniversalWallet({
          address: universal.walletAddress,
          network: universal.network,
          encryptedPrivateKey: 'encrypted-key-placeholder'
        });
      }
    }
  }, [user, walletBindings]);

  const createUniversalWallet = async (password: string) => {
    if (!user) throw new Error('User not authenticated');

    setLoading(true);
    try {
      // Generate a new wallet
      const wallet = ethers.Wallet.createRandom();

      // Encrypt the private key with user's password
      const encryptedPrivateKey = await wallet.encrypt(password);

      // Bind the wallet to the user
      await bindWallet(wallet.address, 'ethereum');

      const newWallet: UniversalWallet = {
        address: wallet.address,
        network: 'ethereum',
        encryptedPrivateKey
      };

      setUniversalWallet(newWallet);
      return newWallet;
    } catch (error) {
      console.error('Error creating universal wallet:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getWalletSigner = async (password: string): Promise<ethers.Wallet> => {
    if (!universalWallet) throw new Error('No universal wallet available');

    // Decrypt the private key
    const wallet = await ethers.Wallet.fromEncryptedJson(universalWallet.encryptedPrivateKey, password) as ethers.Wallet;
    return wallet;
  };

  return {
    universalWallet,
    loading,
    createUniversalWallet,
    getWalletSigner,
    bindWallet,
    unbindWallet
  };
}