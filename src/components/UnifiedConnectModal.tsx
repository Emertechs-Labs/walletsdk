'use client';

import { useEffect, useMemo, useState } from 'react';
import { useConnect } from 'wagmi';
import { X, ArrowRight } from 'lucide-react';
import { getHederaWalletManager, HederaWalletConnector } from '../lib/hedera-wallet-manager';

interface UnifiedConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHederaWalletConnect?: (walletInfo: any) => void;
}

export function UnifiedConnectModal({ isOpen, onClose, onHederaWalletConnect }: UnifiedConnectModalProps) {
  const { connectors, connect, isPending, error } = useConnect();
  const [hederaConnectors, setHederaConnectors] = useState<HederaWalletConnector[]>([]);
  const [isHederaConnecting, setIsHederaConnecting] = useState(false);
  const [hederaError, setHederaError] = useState<string | null>(null);

  // Load Hedera connectors on mount
  useEffect(() => {
    if (isOpen) {
      const hederaManager = getHederaWalletManager();
      setHederaConnectors(hederaManager.getConnectors());
    }
  }, [isOpen]);

  const walletOptions = useMemo(() => {
    const map = new Map<string, (typeof connectors)[number]>();
    connectors.forEach((connector) => {
      map.set(connector.name, connector);
    });
    return Array.from(map.values());
  }, [connectors]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const connectorDescriptions: Record<string, string> = {
    metaMask: 'Browser extension',
    walletConnect: 'Mobile & desktop',
    injected: 'Browser wallet',
    coinbaseWallet: 'Coinbase wallet',
    brave: 'Brave browser',
    safe: 'Safe wallet',
  };

  const getConnectorIcon = (connector: (typeof connectors)[number]) => {
    const iconMap: Record<string, string> = {
      metaMask: '🦊',
      coinbaseWallet: '🔵',
      walletConnect: '🔗',
      brave: '🦁',
      safe: '🛡️',
      injected: '💳',
    };

    return iconMap[connector.id] || '💼';
  };

  const getConnectorDescription = (connector: (typeof connectors)[number]) => {
    if (connectorDescriptions[connector.id]) {
      return connectorDescriptions[connector.id];
    }

    if (connector.type) {
      return connector.type
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/(^|\s)\w/g, (match) => match.toUpperCase());
    }

    return 'Wallet connection';
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleEthereumWalletConnect = (connector: any) => {
    connect({ connector });
    onClose();
  };

  const handleHederaWalletConnect = async (connector: HederaWalletConnector) => {
    setIsHederaConnecting(true);
    setHederaError(null);

    try {
      const hederaManager = getHederaWalletManager();
      const walletInfo = await hederaManager.connect(connector.id as 'hashpack' | 'blade' | 'kabila');

      if (onHederaWalletConnect) {
        onHederaWalletConnect(walletInfo);
      }

      onClose();
    } catch (error) {
      console.error('Hedera wallet connection error:', error);
      setHederaError(error instanceof Error ? error.message : 'Failed to connect to Hedera wallet');
    } finally {
      setIsHederaConnecting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[99999] p-4 min-h-screen"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div></div>
          <h2 className="text-lg font-semibold text-gray-900">Connect Wallet</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Messages */}
        {(error || hederaError) && (
          <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-lg mx-6 mt-4">
            <p className="text-red-600 text-sm">
              {error?.message || hederaError}
            </p>
          </div>
        )}

        {/* Ethereum Wallets Section */}
        {walletOptions.length > 0 && (
          <div className="p-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Ethereum & Base Networks</h3>
            <div className="space-y-3">
              {walletOptions.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => handleEthereumWalletConnect(connector)}
                  disabled={isPending}
                  className="w-full flex items-center justify-between p-4 border border-gray-200 hover:border-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                      <span className="text-lg">{getConnectorIcon(connector)}</span>
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">{connector.name}</div>
                      <div className="text-sm text-gray-500">
                        {getConnectorDescription(connector)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    {isPending ? (
                      <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                    ) : (
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Hedera Wallets Section */}
        {hederaConnectors.length > 0 && (
          <>
            {walletOptions.length > 0 && <div className="border-t border-gray-200 mx-6" />}
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Hedera Network</h3>
              <div className="space-y-3">
                {hederaConnectors.map((connector) => (
                  <button
                    key={connector.id}
                    onClick={() => handleHederaWalletConnect(connector)}
                    disabled={isHederaConnecting}
                    className="w-full flex items-center justify-between p-4 border border-gray-200 hover:border-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                        <span className="text-lg">{connector.icon}</span>
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-gray-900">{connector.name}</div>
                        <div className="text-sm text-gray-500">
                          {connector.description}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      {isHederaConnecting ? (
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                      ) : (
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Footer with Wallet Icons */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {walletOptions.slice(0, 4).map((connector) => (
              <div key={connector.id} className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden">
                <span className="text-sm">{getConnectorIcon(connector)}</span>
              </div>
            ))}
            {hederaConnectors.slice(0, 2).map((connector) => (
              <div key={connector.id} className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden">
                <span className="text-sm">{connector.icon}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}