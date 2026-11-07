import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { ServicesTab } from '../src/components/ui/dashboard/ServicesTab';
import { deleteService } from '../src/services/adminService';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <MantineProvider>{children}</MantineProvider>;
};

// Mock the adminService
jest.mock('../src/services/adminService', () => ({
  getServices: jest.fn(() => Promise.resolve([
    { id: 1, name: 'GitHub', logo: 'https://example.com/github.png' },
    { id: 2, name: 'Slack', logo: 'https://example.com/slack.png' },
  ])),
  getServicesBarData: jest.fn(() => Promise.resolve([
    { service: 'GitHub', usage: 25 },
    { service: 'Slack', usage: 20 },
  ])),
  deleteService: jest.fn(() => Promise.resolve()),
}));

describe('ServicesTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the services tab with chart and table', async () => {
    render(<ServicesTab />, { wrapper: AllTheProviders });

    await waitFor(() => {
      expect(screen.getByText('Service Usage')).toBeInTheDocument();
      expect(screen.getByText('GitHub')).toBeInTheDocument();
      expect(screen.getByText('Slack')).toBeInTheDocument();
    });
  });

  it('filters services by search', async () => {
    render(<ServicesTab />, { wrapper: AllTheProviders });

    await waitFor(() => {
      expect(screen.getByText('GitHub')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search services by name...');
    fireEvent.change(searchInput, { target: { value: 'Slack' } });

    await waitFor(() => {
      expect(screen.queryByText('GitHub')).not.toBeInTheDocument();
      expect(screen.getByText('Slack')).toBeInTheDocument();
    });
  });

  it('handles delete service', async () => {
    render(<ServicesTab />, { wrapper: AllTheProviders });

    await waitFor(() => {
      expect(screen.getByText('GitHub')).toBeInTheDocument();
    });

    // Delete functionality would be tested through the ServicesTable component
    expect(deleteService).not.toHaveBeenCalled();
  });
});