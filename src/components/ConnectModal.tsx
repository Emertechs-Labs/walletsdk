'use client';

import { useState, useEffect } from 'react';
import { X, Mail, Wallet as WalletIcon, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { useConnect } from 'wagmi';
import { getHederaWalletManager, HederaWalletConnector } from '../lib/hedera-wallet-manager';

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type AuthMethod = 'email' | 'wallet' | 'smart';
type WalletType = 'ethereum' | 'hedera';

export function ConnectModal({ isOpen, onClose, onSuccess }: ConnectModalProps) {
  const [authMethod, setAuthMethod] = useState<AuthMethod | null>(null);
  const [email, setEmail] = useState('');
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [walletType, setWalletType] = useState<WalletType | null>(null);
  
  const { connectors, connect, isPending, error: ethError } = useConnect();
  const [hederaConnectors, setHederaConnectors] = useState<HederaWalletConnector[]>([]);
  const [isHederaConnecting, setIsHederaConnecting] = useState(false);
  const [hederaError, setHederaError] = useState<string | null>(null);

  // Load Hedera connectors
  useEffect(() => {
    if (isOpen) {
      const hederaManager = getHederaWalletManager();
      setHederaConnectors(hederaManager.getConnectors());
    }
  }, [isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setAuthMethod(null);
        setEmail('');
        setEmailError('');
        setWalletType(null);
      }, 200);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleBack = () => {
    if (walletType) {
      setWalletType(null);
    } else {
      setAuthMethod(null);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEmailSubmitting(true);
    setEmailError('');

    try {
      // TODO: Implement email authentication with automatic wallet linking
      const response = await fetch('/api/auth/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to send verification email');
      }

      // Show success message
      onSuccess?.();
      onClose();
    } catch (error) {
      setEmailError(error instanceof Error ? error.message : 'Failed to send email');
    } finally {
      setIsEmailSubmitting(false);
    }
  };

  const handleFarcasterLogin = () => {
    // Trigger Farcaster authentication
    window.dispatchEvent(new CustomEvent('farcaster-auth-start'));
    onClose();
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
      await hederaManager.connect(connector.id as 'hashpack' | 'blade' | 'kabila');
      onSuccess?.();
      onClose();
    } catch (error) {
      setHederaError(error instanceof Error ? error.message : 'Failed to connect to Hedera wallet');
    } finally {
      setIsHederaConnecting(false);
    }
  };

  // Filter connectors to show Base-focused wallets
  const ethereumWallets = connectors.filter(c => 
    ['metaMask', 'coinbaseWallet', 'walletConnect', 'brave'].includes(c.id)
  );

  const getWalletIcon = (connectorId: string) => {
    const icons: Record<string, JSX.Element> = {
      metaMask: (
        <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.163 0 0 7.163 0 16s7.163 16 16 16 16-7.163 16-16S24.837 0 16 0z" fill="#F6851B"/>
          <path d="M16 0C7.163 0 0 7.163 0 16s7.163 16 16 16 16-7.163 16-16S24.837 0 16 0z" fill="#E2761B"/>
          <path d="M8.5 10.5l1.5 2.5 2.5-1.5-1.5 2.5 2.5 1.5-2.5 1.5 1.5 2.5-2.5-1.5-1.5 2.5-1.5-2.5-2.5 1.5 1.5-2.5-2.5-1.5 2.5-1.5 1.5-2.5 2.5 1.5z" fill="#F6851B"/>
          <path d="M23.5 10.5l-1.5 2.5-2.5-1.5 1.5 2.5-2.5 1.5 2.5 1.5-1.5 2.5 2.5-1.5 1.5 2.5 1.5-2.5 2.5 1.5-1.5-2.5 2.5-1.5-2.5-1.5-1.5-2.5-2.5 1.5z" fill="#F6851B"/>
        </svg>
      ),
      coinbaseWallet: (
        <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="16" fill="#0052FF"/>
          <path d="M16 6C10.477 6 6 10.477 6 16s4.477 10 10 10 10-4.477 10-10S21.523 6 16 6zm0 16c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6z" fill="white"/>
          <circle cx="16" cy="16" r="4" fill="#0052FF"/>
        </svg>
      ),
      walletConnect: (
        <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="16" fill="#3B99FC"/>
          <path d="M8.5 12.5c3.5-3.5 9.5-3.5 13 0l.5.5c.5.5.5 1.5 0 2l-1.5 1.5c-.5.5-1.5.5-2 0l-1-1c-1.5-1.5-4-1.5-5.5 0l-1 1c-.5.5-1.5.5-2 0L8 15c-.5-.5-.5-1.5 0-2l.5-.5z" fill="white"/>
        </svg>
      ),
      brave: (
        <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="16" fill="#FF4724"/>
          <path d="M16 6l8 8-8 8-8-8 8-8z" fill="white"/>
          <circle cx="16" cy="14" r="2" fill="#FF4724"/>
        </svg>
      ),
    };
    return icons[connectorId] || <WalletIcon className="w-8 h-8" />;
  };

  const getHederaWalletIcon = (connectorId: string) => {
    const icons: Record<string, JSX.Element> = {
      hashpack: (
        <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="8" fill="#000"/>
          <path d="M8 12h16v8H8z" fill="#fff"/>
          <path d="M12 8v16M20 8v16" stroke="#fff" strokeWidth="2"/>
        </svg>
      ),
      blade: (
        <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="16" fill="#00D4FF"/>
          <path d="M8 16l8-8 8 8-8 8-8-8z" fill="white"/>
          <circle cx="16" cy="16" r="4" fill="#00D4FF"/>
        </svg>
      ),
      kabila: (
        <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="16" fill="#8B5CF6"/>
          <path d="M12 12h8v8h-8z" fill="white"/>
          <circle cx="16" cy="16" r="3" fill="#8B5CF6"/>
        </svg>
      ),
    };
    return icons[connectorId] || <WalletIcon className="w-8 h-8" />;
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[99999] p-4 animate-in fade-in-0 duration-200 min-h-screen"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-100">
          {authMethod && (
            <button
              onClick={handleBack}
              className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h2 className="text-xl font-bold text-center text-gray-900">
            {!authMethod ? 'Welcome to Echain' : 
             authMethod === 'email' ? 'Continue with Email' :
             authMethod === 'wallet' ? 'Connect Your Wallet' : 'Smart Wallet'}
          </h2>
          <button
            onClick={onClose}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!authMethod ? (
            // Main auth method selection
            <div className="space-y-4">
              <p className="text-center text-gray-600 text-sm mb-6">
                Choose how you'd like to connect
              </p>

              {/* Email Login */}
              <button
                onClick={() => setAuthMethod('email')}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600 text-white rounded-2xl p-4 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold">Continue with Email</div>
                    <div className="text-sm text-white/80">Auto-create wallet</div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Check className="w-5 h-5" />
                  </div>
                </div>
              </button>

              {/* Connect Wallet */}
              <button
                onClick={() => setAuthMethod('wallet')}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600 text-white rounded-2xl p-4 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <WalletIcon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold">Connect Wallet</div>
                    <div className="text-sm text-white/80">MetaMask, Coinbase & more</div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Check className="w-5 h-5" />
                  </div>
                </div>
              </button>

              {/* Smart Wallet */}
              <button
                onClick={() => setAuthMethod('smart')}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600 text-white rounded-2xl p-4 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold">Smart Wallet</div>
                    <div className="text-sm text-white/80">Gasless transactions</div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Check className="w-5 h-5" />
                  </div>
                </div>
              </button>

              <div className="pt-4 text-center">
                <p className="text-xs text-gray-500">
                  By connecting, you agree to our{' '}
                  <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
                </p>
              </div>
            </div>
          ) : authMethod === 'email' ? (
            // Email authentication form
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              {emailError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{emailError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isEmailSubmitting}
                className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600 disabled:bg-gray-300 text-white font-medium py-3 rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
              >
                {isEmailSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending verification...
                  </span>
                ) : (
                  'Continue with Email'
                )}
              </button>

              <div className="pt-4 text-center">
                <p className="text-sm text-gray-600">
                  We'll send you a verification link. A wallet will be automatically created and linked to your email.
                </p>
              </div>
            </form>
          ) : authMethod === 'wallet' ? (
            // Unified wallet list - all supported wallets
            <div className="space-y-3">
              <p className="text-center text-gray-600 text-sm mb-6">
                Choose your wallet to connect
              </p>

              {(ethError || isPending) && (
                <div className={`p-3 rounded-xl text-sm ${
                  ethError ? 'bg-red-50 border border-red-200 text-red-600' : 'bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 text-cyan-700'
                }`}>
                  {ethError ? (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{ethError.message}</span>
                    </div>
                  ) : (
                    'Connecting to wallet...'
                  )}
                </div>
              )}

              {hederaError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{hederaError}</span>
                  </div>
                </div>
              )}

              {/* Ethereum/Base Wallets */}
              {ethereumWallets.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => handleEthereumWalletConnect(connector)}
                  disabled={isPending}
                  className="w-full group bg-white hover:bg-gray-50 border border-gray-200 hover:border-cyan-300 rounded-xl p-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center">
                      {getWalletIcon(connector.id)}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900">{connector.name}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700 text-xs rounded-full">Base</span>
                        {connector.id === 'coinbaseWallet' && <span className="text-green-600 text-xs">Recommended</span>}
                      </div>
                    </div>
                    {isPending ? (
                      <div className="w-5 h-5 border-2 border-gray-300 border-t-cyan-500 rounded-full animate-spin" />
                    ) : (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Check className="w-5 h-5 text-cyan-500" />
                      </div>
                    )}
                  </div>
                </button>
              ))}

              {/* Hedera Wallets */}
              {hederaConnectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => handleHederaWalletConnect(connector)}
                  disabled={isHederaConnecting}
                  className="w-full group bg-white hover:bg-gray-50 border border-gray-200 hover:border-purple-300 rounded-xl p-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                      {getHederaWalletIcon(connector.id)}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900">{connector.name}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">Hedera</span>
                        <span className="text-gray-500">{connector.description}</span>
                      </div>
                    </div>
                    {isHederaConnecting ? (
                      <div className="w-5 h-5 border-2 border-gray-300 border-t-purple-500 rounded-full animate-spin" />
                    ) : (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Check className="w-5 h-5 text-purple-500" />
                      </div>
                    )}
                  </div>
                </button>
              ))}

              <div className="pt-4 text-center space-y-2">
                <p className="text-xs text-gray-500">
                  Don't have a wallet?{' '}
                  <a href="https://www.coinbase.com/wallet" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:underline">
                    Create Coinbase Wallet
                  </a>
                  {' '}or{' '}
                  <a href="https://www.hashpack.app/" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                    Get HashPack
                  </a>
                </p>
              </div>
            </div>
          ) : authMethod === 'smart' ? (
            // Smart wallet section
            <div className="space-y-4">
              <p className="text-center text-gray-600 text-sm mb-6">
                Create a gasless smart wallet
              </p>

              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Echain Smart Wallet</div>
                    <div className="text-sm text-gray-600">Powered by Account Abstraction</div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Gasless transactions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Multi-device sync</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Social recovery</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    // TODO: Implement smart wallet creation
                    console.log('Smart wallet creation coming soon');
                  }}
                  className="w-full mt-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600 text-white font-medium py-3 rounded-xl transition-all duration-200"
                >
                  Create Smart Wallet
                </button>

                <p className="text-xs text-gray-500 text-center mt-3">
                  Coming soon - Smart wallets will be available on Base & Hedera
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        {!authMethod && (
          <div className="px-6 pb-6">
            <div className="flex items-center justify-center gap-3 pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-500">Powered by</span>
              <div className="flex gap-2">
                <div className="px-3 py-1 bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 text-xs font-medium rounded-full border border-cyan-200">Base</div>
                <div className="px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 text-xs font-medium rounded-full border border-purple-200">Hedera</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
