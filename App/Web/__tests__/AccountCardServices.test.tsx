import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import AccountCardServices from '@/components/ui/areaCreation/acountCardServices';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <MantineProvider>{children}</MantineProvider>;
};

describe('AccountCardServices', () => {
  const defaultProps = {
    logo: 'https://example.com/logo.png',
    accountName: 'Test Account',
    email: 'test@example.com',
    isLoggedIn: true,
    onView: jest.fn(),
    onChange: jest.fn(),
    onDelete: jest.fn(),
    onConnect: jest.fn(),
  };

  it('renders logged in account card with user information', () => {
    render(<AccountCardServices {...defaultProps} />, { wrapper: AllTheProviders });

    expect(screen.getByText('Test Account')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('renders logged out account card with connect button', () => {
    render(<AccountCardServices {...defaultProps} isLoggedIn={false} />, { wrapper: AllTheProviders });

    expect(screen.getByText('No account connected')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /connect/i })).toBeInTheDocument();
  });

  it('calls onConnect when connect button is clicked', () => {
    const mockOnConnect = jest.fn();
    render(<AccountCardServices {...defaultProps} isLoggedIn={false} onConnect={mockOnConnect} />, { wrapper: AllTheProviders });

    const connectButton = screen.getByRole('button', { name: /connect/i });
    fireEvent.click(connectButton);

    expect(mockOnConnect).toHaveBeenCalledTimes(1);
  });

  it('renders logged in account card with menu trigger', () => {
    render(<AccountCardServices {...defaultProps} />, { wrapper: AllTheProviders });

    expect(screen.getByText('Test Account')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    // Check that the menu trigger button exists
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});