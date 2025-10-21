import { render, screen, fireEvent } from '@testing-library/react';
import { NetworkSwitcher, NetworkBadge, NetworkSwitcherProps } from '../NetworkSwitcher';
import { HederaNetwork } from '../../types/hedera';

describe('NetworkSwitcher', () => {
  const mockOnNetworkChange = jest.fn();

  const defaultProps: NetworkSwitcherProps = {
    currentNetwork: 'testnet',
    onNetworkChange: mockOnNetworkChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial rendering', () => {
    it('displays current network with icon and name', () => {
      render(<NetworkSwitcher {...defaultProps} />);

      expect(screen.getByText('🧪')).toBeInTheDocument();
      expect(screen.getByText('Testnet')).toBeInTheDocument();
      expect(screen.getByText('Test network for development')).toBeInTheDocument();
    });

    it('shows label by default', () => {
      render(<NetworkSwitcher {...defaultProps} />);

      expect(screen.getByText('Network')).toBeInTheDocument();
    });

    it('hides label when showLabel is false', () => {
      render(<NetworkSwitcher {...defaultProps} showLabel={false} />);

      expect(screen.queryByText('Network')).not.toBeInTheDocument();
    });

    it('displays dropdown arrow', () => {
      render(<NetworkSwitcher {...defaultProps} />);

      const arrowIcon = document.querySelector('svg');
      expect(arrowIcon).toBeInTheDocument();
    });
  });

  describe('dropdown functionality', () => {
    it('opens dropdown when button is clicked', () => {
      render(<NetworkSwitcher {...defaultProps} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(screen.getByText('Mainnet')).toBeInTheDocument();
      expect(screen.getByText('Previewnet')).toBeInTheDocument();
    });

    it('closes dropdown when clicking outside', () => {
      render(<NetworkSwitcher {...defaultProps} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(screen.getByText('Mainnet')).toBeInTheDocument();

      // Click on backdrop
      const backdrop = document.querySelector('.fixed.inset-0');
      fireEvent.click(backdrop!);

      expect(screen.queryByText('Mainnet')).not.toBeInTheDocument();
    });

    it('closes dropdown when network is selected', () => {
      render(<NetworkSwitcher {...defaultProps} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      const mainnetOption = screen.getByText('Mainnet');
      fireEvent.click(mainnetOption);

      expect(screen.queryByText('Mainnet')).not.toBeInTheDocument();
      expect(mockOnNetworkChange).toHaveBeenCalledWith('mainnet');
    });

    it('does not call onNetworkChange when selecting current network', () => {
      render(<NetworkSwitcher {...defaultProps} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      const testnetOption = screen.getAllByText('Testnet')[1]; // Second instance is in dropdown
      fireEvent.click(testnetOption);

      expect(mockOnNetworkChange).not.toHaveBeenCalled();
    });

    it('shows checkmark for currently selected network', () => {
      render(<NetworkSwitcher {...defaultProps} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Find the checkmark icon in the testnet option
      const testnetOption = screen.getAllByText('Testnet')[1].closest('button');
      const checkmark = testnetOption?.querySelector('svg');
      expect(checkmark).toBeInTheDocument();
    });

    it('rotates arrow icon when dropdown is open', () => {
      render(<NetworkSwitcher {...defaultProps} />);

      const button = screen.getByRole('button');
      const arrowIcon = button.querySelector('svg');

      expect(arrowIcon).not.toHaveClass('rotate-180');

      fireEvent.click(button);

      expect(arrowIcon).toHaveClass('rotate-180');
    });
  });

  describe('disabled state', () => {
    it('disables button when disabled prop is true', () => {
      render(<NetworkSwitcher {...defaultProps} disabled={true} />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
    });

    it('does not open dropdown when disabled', () => {
      render(<NetworkSwitcher {...defaultProps} disabled={true} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(screen.queryByText('Mainnet')).not.toBeInTheDocument();
    });
  });

  describe('network information', () => {
    const testCases: Array<{ network: HederaNetwork; name: string; description: string; icon: string }> = [
      { network: 'testnet', name: 'Testnet', description: 'Test network for development', icon: '🧪' },
      { network: 'mainnet', name: 'Mainnet', description: 'Production network', icon: '🌐' },
      { network: 'previewnet', name: 'Previewnet', description: 'Preview network for upcoming features', icon: '🔮' },
    ];

    testCases.forEach(({ network, name, description, icon }) => {
      it(`displays correct info for ${network}`, () => {
        render(<NetworkSwitcher {...defaultProps} currentNetwork={network} />);

        expect(screen.getByText(icon)).toBeInTheDocument();
        expect(screen.getByText(name)).toBeInTheDocument();
        expect(screen.getByText(description)).toBeInTheDocument();
      });
    });
  });

  describe('accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<NetworkSwitcher {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('supports keyboard navigation', () => {
      render(<NetworkSwitcher {...defaultProps} />);

      const button = screen.getByRole('button');

      // Focus the button
      button.focus();
      expect(button).toHaveFocus();

      // Open dropdown with Enter
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      expect(screen.getByText('Mainnet')).toBeInTheDocument();

      // Close dropdown with Escape
      fireEvent.keyDown(button, { key: 'Escape', code: 'Escape' });
      expect(screen.queryByText('Mainnet')).not.toBeInTheDocument();
    });

    it('has proper focus styles', () => {
      render(<NetworkSwitcher {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500');
    });
  });
});

describe('NetworkBadge', () => {
  it('renders network badge with correct styling', () => {
    render(<NetworkBadge network="testnet" />);

    const badge = screen.getByText('Testnet');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-800', 'border-blue-200');
    expect(screen.getByText('🧪')).toBeInTheDocument();
  });

  it('renders different networks with correct colors', () => {
    const { rerender } = render(<NetworkBadge network="mainnet" />);

    expect(screen.getByText('🌐')).toBeInTheDocument();
    expect(screen.getByText('Mainnet')).toHaveClass('bg-green-100', 'text-green-800');

    rerender(<NetworkBadge network="previewnet" />);
    expect(screen.getByText('🔮')).toBeInTheDocument();
    expect(screen.getByText('Previewnet')).toHaveClass('bg-purple-100', 'text-purple-800');
  });

  it('is clickable when onClick is provided', () => {
    const onClick = jest.fn();
    render(<NetworkBadge network="testnet" onClick={onClick} />);

    const badge = screen.getByRole('button');
    fireEvent.click(badge);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(badge).toHaveClass('cursor-pointer', 'hover:opacity-80');
  });

  it('is not clickable when onClick is not provided', () => {
    render(<NetworkBadge network="testnet" />);

    const badge = screen.getByText('Testnet').closest('button');
    expect(badge).toHaveClass('cursor-default');
    expect(badge).not.toHaveClass('cursor-pointer');
  });

  it('has proper accessibility attributes', () => {
    render(<NetworkBadge network="testnet" onClick={() => {}} />);

    const badge = screen.getByRole('button');
    expect(badge).toHaveAttribute('type', 'button');
  });
});