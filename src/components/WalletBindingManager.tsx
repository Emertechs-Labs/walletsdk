'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Check, Plus, Trash2, Link2, Mail, Wallet } from 'lucide-react';
import { useHederaWallet } from '../hooks/useHederaWallet';

interface BoundWallet {
  id: string;
  address: string;
  network: 'base' | 'hedera';
  isPrimary: boolean;
  connectedAt: Date;
  label?: string;
}

export function WalletBindingManager() {
  const { address: ethAddress, isConnected: ethConnected } = useAccount();
  const { accountId: hederaAccountId, isConnected: hederaConnected } = useHederaWallet();

  const [boundWallets, setBoundWallets] = useState<BoundWallet[]>([]);
  const [email] = useState<string>('');
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load bound wallets from API
  useEffect(() => {
    loadBoundWallets();
  }, []);

  const loadBoundWallets = async () => {
    try {
      setIsLoading(true);
      // TODO: Fetch from API
      // const response = await fetch('/api/wallet/bindings');
      // const data = await response.json();
      // setBoundWallets(data.wallets);

      // Mock data for development
      const mockWallets: BoundWallet[] = [];
      
      if (ethAddress && ethConnected) {
        mockWallets.push({
          id: '1',
          address: ethAddress,
          network: 'base',
          isPrimary: true,
          connectedAt: new Date(),
          label: 'Primary Wallet',
        });
      }

      if (hederaAccountId && hederaConnected) {
        mockWallets.push({
          id: '2',
          address: hederaAccountId,
          network: 'hedera',
          isPrimary: false,
          connectedAt: new Date(),
          label: 'Hedera Account',
        });
      }

      setBoundWallets(mockWallets);
    } catch (error) {
      console.error('Failed to load bound wallets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBindWallet = async (_walletAddress: string, _network: 'base' | 'hedera') => {
    try {
      setIsLoading(true);
      
      // TODO: Call API to bind wallet
      // await fetch('/api/wallet/bind', {
      //   method: 'POST',
      //   body: JSON.stringify({ address: walletAddress, network }),
      // });

      // Refresh list
      await loadBoundWallets();
      setShowAddWallet(false);
    } catch (error) {
      console.error('Failed to bind wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnbindWallet = async (_walletId: string) => {
    if (!confirm('Are you sure you want to unbind this wallet? This action cannot be undone.')) {
      return;
    }

    try {
      setIsLoading(true);
      
      // TODO: Call API to unbind wallet
      // await fetch(`/api/wallet/unbind/${walletId}`, {
      //   method: 'DELETE',
      // });

      // Refresh list
      await loadBoundWallets();
    } catch (error) {
      console.error('Failed to unbind wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPrimary = async (_walletId: string) => {
    try {
      setIsLoading(true);
      
      // TODO: Call API to set primary wallet
      // await fetch(`/api/wallet/set-primary/${walletId}`, {
      //   method: 'POST',
      // });

      // Refresh list
      await loadBoundWallets();
    } catch (error) {
      console.error('Failed to set primary wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
  };

  const getNetworkBadgeColor = (network: string) => {
    return network === 'base' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700';
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Wallet Management</h2>
          <p className="text-blue-100">Bind and manage your connected wallets and email</p>
        </div>

        {/* Email Section */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Email Address</h3>
            {!email && (
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Add Email
              </button>
            )}
          </div>

          {email ? (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{email}</div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <Check className="w-3 h-3 text-green-600" />
                  Verified
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 text-sm">
              No email connected. Add an email for account recovery and notifications.
            </div>
          )}
        </div>

        {/* Wallets Section */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Connected Wallets</h3>
            <button
              onClick={() => setShowAddWallet(!showAddWallet)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Wallet
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-gray-600 text-sm">Loading wallets...</p>
            </div>
          ) : boundWallets.length > 0 ? (
            <div className="space-y-3">
              {boundWallets.map((wallet) => (
                <div
                  key={wallet.id}
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {formatAddress(wallet.address)}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getNetworkBadgeColor(wallet.network)}`}>
                        {wallet.network === 'base' ? 'Base' : 'Hedera'}
                      </span>
                      {wallet.isPrimary && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          Primary
                        </span>
                      )}
                    </div>
                    {wallet.label && (
                      <div className="text-xs text-gray-500">{wallet.label}</div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {!wallet.isPrimary && (
                      <button
                        onClick={() => handleSetPrimary(wallet.id)}
                        className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        Set Primary
                      </button>
                    )}
                    <button
                      onClick={() => handleUnbindWallet(wallet.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      disabled={wallet.isPrimary && boundWallets.length === 1}
                      title={wallet.isPrimary && boundWallets.length === 1 ? 'Cannot remove the only primary wallet' : 'Unbind wallet'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">
              No wallets connected. Connect a wallet to get started.
            </div>
          )}
        </div>

        {/* Add Wallet Panel */}
        {showAddWallet && (
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Add New Wallet</h4>
            <p className="text-sm text-gray-600 mb-4">
              Connect another wallet to bind it to your account. You can switch between bound wallets anytime.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleBindWallet('', 'base')}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
              >
                Connect Base Wallet
              </button>
              <button
                onClick={() => handleBindWallet('', 'hedera')}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors"
              >
                Connect Hedera Wallet
              </button>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="p-6 bg-blue-50 border-t border-blue-100">
          <div className="flex gap-3">
            <Link2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-blue-900 mb-1">About Wallet Binding</h4>
              <p className="text-xs text-blue-700">
                Binding multiple wallets allows you to access your account from different devices and networks. 
                Your primary wallet is used for transactions by default, but you can switch between bound wallets anytime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
