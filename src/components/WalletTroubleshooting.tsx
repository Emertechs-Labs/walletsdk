'use client';

import { useState } from 'react';
import { AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';

interface WalletTroubleshootingProps {
  error?: string;
  onRetry?: () => void;
}

export function WalletTroubleshooting({ error, onRetry }: WalletTroubleshootingProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const troubleshootingSteps = [
    {
      title: 'Check MetaMask Installation',
      description: 'Ensure MetaMask extension is installed and enabled in your browser.',
      action: () => typeof window !== 'undefined' && window.open('https://metamask.io/download/', '_blank'),
      actionLabel: 'Install MetaMask',
    },
    {
      title: 'Unlock MetaMask',
      description: 'Open MetaMask and unlock your wallet if it\'s locked.',
      action: null,
    },
    {
      title: 'Check Network',
      description: 'Ensure MetaMask is connected to Base Sepolia testnet.',
      action: null,
    },
    {
      title: 'Refresh Page',
      description: 'Try refreshing the page and attempting connection again.',
      action: () => window.location.reload(),
      actionLabel: 'Refresh Page',
    },
    {
      title: 'Clear Browser Cache',
      description: 'Clear your browser cache and try again.',
      action: null,
    },
  ];

  if (!error) return null;

  return (
    <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <span className="text-red-400 font-medium">Wallet Connection Issue</span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-red-400 hover:text-red-300 text-sm"
        >
          {isExpanded ? 'Hide' : 'Show'} Help
        </button>
      </div>

      <p className="text-red-300 mt-2">{error}</p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Connection</span>
        </button>
      )}

      {isExpanded && (
        <div className="mt-4 space-y-3">
          <h4 className="text-white font-medium">Troubleshooting Steps:</h4>
          {troubleshootingSteps.map((step, index) => (
            <div key={index} className="bg-slate-800/50 rounded p-3">
              <h5 className="text-white font-medium mb-1">{step.title}</h5>
              <p className="text-gray-300 text-sm mb-2">{step.description}</p>
              {step.action && (
                <button
                  onClick={step.action}
                  className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 text-sm"
                >
                  <span>{step.actionLabel}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}