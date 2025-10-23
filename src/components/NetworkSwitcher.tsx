/**
 * Network Switcher Component
 * Allows switching between different blockchain networks (Ethereum, Hedera, etc.)
 */

'use client';

import './styles.css';

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
  allowedTypes = ['ethereum', 'hedera'],
}: NetworkSwitcherProps) {
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
        // For MetaMask, ensure network is added
        if (window.ethereum && window.ethereum.isMetaMask) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: `0x${network.chainId.toString(16)}` }],
            });
          } catch (switchError: any) {
            // If network not added, add it
            if (switchError.code === 4902) {
              const chainParams = network.id === 'base-mainnet' ? {
                chainId: '0x2105', // 8453
                chainName: 'Base',
                nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['https://mainnet.base.org'],
                blockExplorerUrls: ['https://basescan.org'],
              } : {
                chainId: '0x14a34', // 84532
                chainName: 'Base Sepolia',
                nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['https://sepolia.base.org'],
                blockExplorerUrls: ['https://sepolia.basescan.org'],
              };
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [chainParams],
              });
            }
          }
        } else {
          // For other wallets, use wagmi switchChain
          await switchChain({ chainId: network.chainId });
        }
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
  };

  return (
    <div className="echain-component">
      {/* Header */}
      <div className="echain-header">
        <div className="echain-header-content">
          <h1 className="echain-title">🌐 Network Switcher</h1>
          <p className="echain-subtitle">Switch between blockchain networks</p>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="echain-section">
        <div className="echain-status-indicator echain-status-success">
          Interactive
        </div>
      </div>

      {/* Network Selection */}
      <div className="echain-section">
        <div className="echain-section-title">Available Networks</div>
        <div className="echain-section-description">
          Select your preferred blockchain network for transactions
        </div>
        <div className="echain-network-buttons">
          {availableNetworks.map((network) => (
            <button
              key={network.id}
              type="button"
              onClick={() => handleNetworkSelect(network)}
              className={`echain-network-button ${currentNetworkId === network.id ? 'active' : ''}`}
              disabled={disabled}
            >
              <span className="echain-network-button-icon">{network.icon}</span>
              <div>
                <div className="echain-network-button-name">{network.name}</div>
                <div className="echain-network-button-desc">{network.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Current Network Info */}
      <div className="echain-section">
        <div className="echain-section-title">Current Network</div>
        <div className="echain-current-network">
          <span className="echain-current-network-icon">{currentNetworkInfo.icon}</span>
          <div>
            <div className="echain-current-network-name">{currentNetworkInfo.name}</div>
            <div className="echain-current-network-desc">{currentNetworkInfo.description}</div>
            <div className={`echain-status-indicator echain-status-info echain-current-network-type`}>
              {currentNetworkInfo.type}
            </div>
          </div>
        </div>
      </div>
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
      type="button"
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
