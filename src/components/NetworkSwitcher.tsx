/**
 * Network Switcher Component
 * Allows switching between different blockchain networks (Ethereum, Hedera, etc.)
 */

'use client';

import { useState } from 'react';
import { useChainId, useSwitchChain } from 'wagmi';
import { HederaNetwork } from '../types/hedera';
import { useHederaWallet } from '../hooks/useHederaWallet';

type NetworkType = 'ethereum' | 'hedera';

interface BaseNetworkInfo {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  type: NetworkType;
  chainId?: number; // For Ethereum networks
  hederaNetwork?: HederaNetwork; // For Hedera networks
}

export interface NetworkSwitcherProps {
  currentNetwork?: string; // Optional - will detect from connected wallet
  onNetworkChange?: (network: string, type: NetworkType) => void;
  disabled?: boolean;
  showLabel?: boolean;
  allowedTypes?: NetworkType[]; // Which network types to show
}

const networks: BaseNetworkInfo[] = [
  // Ethereum networks
  {
    id: 'base-sepolia',
    name: 'Base Sepolia',
    description: 'Base testnet on Ethereum',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: '🧪',
    type: 'ethereum',
    chainId: 84532,
  },
  {
    id: 'base-mainnet',
    name: 'Base Mainnet',
    description: 'Base mainnet on Ethereum',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: '🔷',
    type: 'ethereum',
    chainId: 8453,
  },
  // Hedera networks
  {
    id: 'hedera-testnet',
    name: 'Hedera Testnet',
    description: 'Hedera test network',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: '💜',
    type: 'hedera',
    hederaNetwork: 'testnet',
  },
  {
    id: 'hedera-mainnet',
    name: 'Hedera Mainnet',
    description: 'Hedera production network',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: '💚',
    type: 'hedera',
    hederaNetwork: 'mainnet',
  },
  {
    id: 'hedera-previewnet',
    name: 'Hedera Previewnet',
    description: 'Hedera preview network',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    icon: '🔮',
    type: 'hedera',
    hederaNetwork: 'previewnet',
  },
];

export function NetworkSwitcher({
  currentNetwork,
  onNetworkChange,
  disabled = false,
  showLabel = true,
  allowedTypes = ['ethereum', 'hedera'],
}: NetworkSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { switchChain } = useSwitchChain();
  const { switchNetwork: switchHederaNetwork } = useHederaWallet();

  // Filter networks based on allowed types
  const availableNetworks = networks.filter(network => allowedTypes.includes(network.type));

  // Determine current network
  const ethChainId = useChainId();
  const { network: hederaNetwork } = useHederaWallet();

  const getCurrentNetworkId = (): string => {
    if (currentNetwork) return currentNetwork;

    // Try to detect from connected wallets
    if (ethChainId) {
      const ethNetwork = networks.find(n => n.chainId === ethChainId);
      if (ethNetwork) return ethNetwork.id;
    }

    if (hederaNetwork) {
      const hederaNet = networks.find(n => n.hederaNetwork === hederaNetwork);
      if (hederaNet) return hederaNet.id;
    }

    return availableNetworks[0]?.id || 'base-sepolia';
  };

  const currentNetworkId = getCurrentNetworkId();
  const currentNetworkInfo = networks.find(n => n.id === currentNetworkId) || availableNetworks[0];

  const handleNetworkSelect = async (network: BaseNetworkInfo) => {
    try {
      if (network.type === 'ethereum' && network.chainId) {
        // Switch Ethereum network
        await switchChain({ chainId: network.chainId });
      } else if (network.type === 'hedera' && network.hederaNetwork) {
        // Switch Hedera network
        await switchHederaNetwork(network.hederaNetwork);
      }

      if (onNetworkChange) {
        onNetworkChange(network.id, network.type);
      }
    } catch (error) {
      console.error('Network switch failed:', error);
    }

    setIsOpen(false);
  };

  return (
    <div className="relative">
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Network
        </label>
      )}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          relative w-full bg-white border rounded-lg shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
        `}
      >
        <span className="flex items-center">
          <span className="text-xl mr-2">{currentNetworkInfo.icon}</span>
          <span className="block truncate">
            <span className="font-medium">{currentNetworkInfo.name}</span>
            {showLabel && (
              <span className="text-sm text-gray-500 ml-2">
                {currentNetworkInfo.description}
              </span>
            )}
          </span>
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg
            className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute z-20 mt-1 w-full bg-white shadow-lg max-h-60 rounded-lg py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            {availableNetworks.map((network) => (
              <button
                key={network.id}
                onClick={() => handleNetworkSelect(network)}
                className={`
                  w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors
                  ${currentNetworkId === network.id ? 'bg-blue-50' : ''}
                `}
              >
                <div className="flex items-start">
                  <span className="text-xl mr-3 mt-0.5">{network.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{network.name}</span>
                      {currentNetworkId === network.id && (
                        <svg
                          className="h-5 w-5 text-blue-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{network.description}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${
                      network.type === 'ethereum'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {network.type}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Compact version for header/navbar
export function NetworkBadge({
  network,
  onClick,
}: {
  network: string;
  onClick?: () => void;
}) {
  const networkInfo = networks.find(n => n.id === network) || networks[0];

  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border
        ${networkInfo.color}
        ${onClick ? 'hover:opacity-80 cursor-pointer' : 'cursor-default'}
        transition-opacity
      `}
    >
      <span className="mr-1.5">{networkInfo.icon}</span>
      {networkInfo.name}
    </button>
  );
}

export default NetworkSwitcher;
