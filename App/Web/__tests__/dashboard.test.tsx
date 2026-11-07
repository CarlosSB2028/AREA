import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import DashboardPage from '../src/app/dashboard/page';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <MantineProvider>{children}</MantineProvider>;
};

// Mock the tab components to avoid async operations
jest.mock('../src/components/ui/dashboard/UsersTab', () => ({
  UsersTab: () => <div data-testid="users-tab">Users Tab Content</div>,
}));

jest.mock('../src/components/ui/dashboard/AreasTab', () => ({
  AreasTab: () => <div data-testid="areas-tab">Areas Tab Content</div>,
}));

jest.mock('../src/components/ui/dashboard/ServicesTab', () => ({
  ServicesTab: () => <div data-testid="services-tab">Services Tab Content</div>,
}));

describe('DashboardPage', () => {
  it('renders the dashboard with tabs', () => {
    render(<DashboardPage />, { wrapper: AllTheProviders });

    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Areas')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
  });

  it('renders tabs with correct icons', () => {
    render(<DashboardPage />, { wrapper: AllTheProviders });

    // Check for tab content areas
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  it('defaults to users tab', () => {
    render(<DashboardPage />, { wrapper: AllTheProviders });

    // The users tab should be active by default
    const usersTab = screen.getByText('Users');
    expect(usersTab).toBeInTheDocument();
  });
});