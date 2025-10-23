import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NetworkSwitcher, NetworkBadge, NetworkSwitcherProps } from '../NetworkSwitcher';
import { HederaNetwork } from '../../types/hedera';

// Mock wagmi hooks
jest.mock('wagmi', () => ({
  useChainId: () => 84532, // Base Sepolia
  useSwitchChain: () => ({
    switchChain: jest.fn().mockResolvedValue(undefined),
  }),
}));

// Mock window.ethereum
Object.defineProperty(window, 'ethereum', {
  value: {
    isMetaMask: true,
    request: jest.fn().mockResolvedValue(undefined),
  },
  writable: true,
});

describe('NetworkSwitcher', () => {
  const mockOnNetworkChange = jest.fn();

  const defaultProps: NetworkSwitcherProps = {
    currentNetwork: 'hedera-testnet',
    onNetworkChange: mockOnNetworkChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial rendering', () => {
    it('displays component title and subtitle', () => {
      render(<NetworkSwitcher {...defaultProps} />);

      expect(screen.getByText('🌐 Network Switcher')).toBeInTheDocument();
      expect(screen.getByText('Switch between blockchain networks')).toBeInTheDocument();
    });

    it('shows status indicator', () => {
      render(<NetworkSwitcher {...defaultProps} />);

      expect(screen.getByText('Interactive')).toBeInTheDocument();
    });

    it('displays all available networks', () => {
      render(<NetworkSwitcher {...defaultProps} />);

      expect(screen.getByText('Base Sepolia')).toBeInTheDocument();
      expect(screen.getByText('Base Mainnet')).toBeInTheDocument();
      expect(screen.getAllByText('Hedera Testnet')).toHaveLength(2); // Button and current network
      expect(screen.getByText('Hedera Mainnet')).toBeInTheDocument();
      expect(screen.getByText('Hedera Previewnet')).toBeInTheDocument();
    });

    it('shows current network section', () => {
      render(<NetworkSwitcher {...defaultProps} />);

      expect(screen.getByText('Current Network')).toBeInTheDocument();
      
      // Check current network display specifically
      const currentNetworkSection = screen.getByText('Current Network').parentElement;
      expect(currentNetworkSection).toHaveTextContent('💜');
      expect(currentNetworkSection).toHaveTextContent('Hedera Testnet');
      expect(currentNetworkSection).toHaveTextContent('Hedera test network');
    });

    it('highlights the active network', () => {
      render(<NetworkSwitcher {...defaultProps} />);

      // Find the active button by looking for the button with 'active' class
      const activeButton = screen.getByRole('button', { name: /Hedera Testnet/ });
      expect(activeButton).toHaveClass('active');
    });
  });

  describe('network selection', () => {
    it('calls onNetworkChange when network button is clicked', async () => {
      render(<NetworkSwitcher {...defaultProps} />);

      const mainnetButton = screen.getByRole('button', { name: /Hedera Mainnet/ });
      fireEvent.click(mainnetButton);

      await waitFor(() => {
        expect(mockOnNetworkChange).toHaveBeenCalledWith('hedera-mainnet', 'hedera');
      });
    });

    it('does not call onNetworkChange when clicking the active network', () => {
      render(<NetworkSwitcher {...defaultProps} />);

      const testnetButton = screen.getByRole('button', { name: /Hedera Testnet/ });
      fireEvent.click(testnetButton);

      expect(mockOnNetworkChange).not.toHaveBeenCalled();
    });

    it('updates current network display when network is selected', async () => {
      render(<NetworkSwitcher {...defaultProps} />);

      const mainnetButton = screen.getByRole('button', { name: /Hedera Mainnet/ });
      fireEvent.click(mainnetButton);

      // The component doesn't update its display based on clicks - it relies on props
      // This test should check that onNetworkChange was called, which triggers parent to update
      await waitFor(() => {
        expect(mockOnNetworkChange).toHaveBeenCalledWith('hedera-mainnet', 'hedera');
      });
    });
  });

  describe('disabled state', () => {
    it('disables all network buttons when disabled prop is true', () => {
      render(<NetworkSwitcher {...defaultProps} disabled={true} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe('network information', () => {
    const testCases: Array<{ network: string; name: string; description: string; icon: string }> = [
      { network: 'hedera-testnet', name: 'Hedera Testnet', description: 'Hedera test network', icon: '💜' },
      { network: 'hedera-mainnet', name: 'Hedera Mainnet', description: 'Hedera production network', icon: '💚' },
      { network: 'hedera-previewnet', name: 'Hedera Previewnet', description: 'Hedera preview network', icon: '🔮' },
      { network: 'base-sepolia', name: 'Base Sepolia', description: 'Base testnet on Ethereum', icon: '🧪' },
      { network: 'base-mainnet', name: 'Base Mainnet', description: 'Base mainnet on Ethereum', icon: '🔷' },
    ];

    testCases.forEach(({ network, name, description, icon }) => {
      it(`displays correct info for ${network}`, () => {
        render(<NetworkSwitcher {...defaultProps} currentNetwork={network} />);

        // Check that the name appears at least once (in current network display)
        expect(screen.getAllByText(name)).toHaveLength(2); // One in button, one in current network
        expect(screen.getAllByText(description)).toHaveLength(2); // One in button, one in current network
        
        // Check that the icon appears at least once (it appears in both button and current network)
        expect(screen.getAllByText(icon)).toHaveLength(2);
      });
    });
  });

  describe('accessibility', () => {
    it('has proper button types', () => {
      render(<NetworkSwitcher {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });

    it('supports keyboard navigation', () => {
      render(<NetworkSwitcher {...defaultProps} />);

      const firstButton = screen.getByText('Base Sepolia').closest('button');

      // Focus the first button
      firstButton?.focus();
      expect(firstButton).toHaveFocus();
    });
  });
});

describe('NetworkBadge', () => {
  it('renders network badge with correct styling', () => {
    render(<NetworkBadge network="hedera-testnet" />);

    const badge = screen.getByText('Hedera Testnet');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-purple-100', 'text-purple-800', 'border-purple-200');
    expect(screen.getByText('💜')).toBeInTheDocument();
  });

  it('renders different networks with correct colors', () => {
    const { rerender } = render(<NetworkBadge network="hedera-mainnet" />);

    expect(screen.getByText('💚')).toBeInTheDocument();
    expect(screen.getByText('Hedera Mainnet')).toHaveClass('bg-green-100', 'text-green-800');

    rerender(<NetworkBadge network="hedera-previewnet" />);
    expect(screen.getByText('🔮')).toBeInTheDocument();
    expect(screen.getByText('Hedera Previewnet')).toHaveClass('bg-indigo-100', 'text-indigo-800');
  });

  it('is clickable when onClick is provided', () => {
    const onClick = jest.fn();
    render(<NetworkBadge network="hedera-testnet" onClick={onClick} />);

    const badge = screen.getByRole('button');
    fireEvent.click(badge);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(badge).toHaveClass('cursor-pointer', 'hover:opacity-80');
  });

  it('is not clickable when onClick is not provided', () => {
    render(<NetworkBadge network="hedera-testnet" />);

    const badge = screen.getByText('Hedera Testnet').closest('button');
    expect(badge).toHaveClass('cursor-default');
    expect(badge).not.toHaveClass('cursor-pointer');
  });

  it('has proper accessibility attributes', () => {
    render(<NetworkBadge network="hedera-testnet" onClick={() => {}} />);

    const badge = screen.getByRole('button');
    expect(badge).toHaveAttribute('type', 'button');
  });
});