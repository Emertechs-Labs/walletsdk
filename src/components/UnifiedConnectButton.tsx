'use client';

import { useState, useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { Wallet, ChevronDown, LogOut, Link, Settings } from 'lucide-react';
import { ConnectModal } from './ConnectModal';
import { useHederaWallet } from '../hooks/useHederaWallet';

export function UnifiedConnectButton() {
  const { isConnected: ethIsConnected, address: ethAddress } = useAccount();
  const { disconnect: disconnectEth } = useDisconnect();
  const { isConnected: hederaIsConnected, accountId: hederaAccountId, disconnect: disconnectHedera } = useHederaWallet();

  const [showModal, setShowModal] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  // Combined connection state
  const isConnected = ethIsConnected || hederaIsConnected;

  // Format connected account display
  const getConnectedAccountDisplay = () => {
    if (ethIsConnected && ethAddress) {
      return {
        address: `${ethAddress.substring(0, 6)}...${ethAddress.substring(ethAddress.length - 4)}`,
        network: 'Base',
        full: ethAddress,
      };
    }
    if (hederaIsConnected && hederaAccountId) {
      return {
        address: `${hederaAccountId.substring(0, 6)}...${hederaAccountId.substring(hederaAccountId.length - 4)}`,
        network: 'Hedera',
        full: hederaAccountId,
      };
    }
    return null;
  };

  const account = getConnectedAccountDisplay();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showAccountMenu && !target.closest('.account-menu')) {
        setShowAccountMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAccountMenu]);

  const handleDisconnect = () => {
    if (ethIsConnected) {
      disconnectEth();
    }
    if (hederaIsConnected) {
      disconnectHedera();
    }
    setShowAccountMenu(false);
  };

  const handleCopyAddress = () => {
    if (account?.full) {
      navigator.clipboard.writeText(account.full);
    }
  };

  return (
    <div className="relative">
      {!isConnected ? (
        <button
          onClick={() => setShowModal(true)}
          type="button"
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-full transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
        >
          <Wallet className="w-4 h-4" />
          <span>Connect</span>
        </button>
      ) : (
        <div className="account-menu">
          <button
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            className="px-4 py-2.5 bg-white border-2 border-gray-200 hover:border-gray-300 rounded-full transition-all duration-200 flex items-center gap-3 shadow-md hover:shadow-lg"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {account?.address.substring(0, 2)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">{account?.address}</span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showAccountMenu ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {/* Account Menu Dropdown */}
          {showAccountMenu && (
            <div className="absolute top-full mt-2 right-0 w-72 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-0 slide-in-from-top-2 duration-200 z-50">
              {/* Account Info */}
              <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {account?.address.substring(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">{account?.address}</div>
                    <div className="text-xs text-gray-600">{account?.network} Network</div>
                  </div>
                </div>
                <button
                  onClick={handleCopyAddress}
                  className="w-full py-2 px-3 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg border border-gray-200 transition-colors"
                >
                  Copy Address
                </button>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                <button
                  onClick={() => {
                    setShowAccountMenu(false);
                    setShowModal(true);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors text-left"
                >
                  <Link className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Bind/Unbind Wallets</span>
                </button>
                
                <button
                  onClick={() => {
                    setShowAccountMenu(false);
                    // Navigate to settings
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors text-left"
                >
                  <Settings className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Account Settings</span>
                </button>

                <div className="my-2 border-t border-gray-100" />

                <button
                  onClick={handleDisconnect}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-red-50 rounded-lg transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-red-600">Disconnect</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Connect Modal */}
      <ConnectModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          setShowModal(false);
          console.log('Connection successful');
        }}
      />
    </div>
  );
}