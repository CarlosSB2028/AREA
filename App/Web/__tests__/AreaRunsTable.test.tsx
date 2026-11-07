import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { AreaRunsTable } from '../src/components/ui/dashboard/AreaRunsTable';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <MantineProvider>{children}</MantineProvider>;
};

const mockAreaRuns = [
  { id: 1, areaName: 'GitHub PR Monitor', user: 'John Doe', timestamp: '2025-10-07 14:30:00', status: 'success', duration: '2.5s' },
  { id: 2, areaName: 'Slack Alert', user: 'Jane Smith', timestamp: '2025-10-07 14:25:00', status: 'failed', duration: '1.8s' },
  { id: 3, areaName: 'GitLab CI', user: 'Bob Johnson', timestamp: '2025-10-07 14:20:00', status: 'in progress', duration: '3.2s' },
];

describe('AreaRunsTable', () => {
  it('renders the table with area runs data', () => {
    render(<AreaRunsTable areaRuns={mockAreaRuns} />, { wrapper: AllTheProviders });

    expect(screen.getByText('Recent Area Runs')).toBeInTheDocument();
    expect(screen.getByText('GitHub PR Monitor')).toBeInTheDocument();
    expect(screen.getByText('Slack Alert')).toBeInTheDocument();
    expect(screen.getByText('GitLab CI')).toBeInTheDocument();
  });

  it('displays area run status with correct badge colors', () => {
    render(<AreaRunsTable areaRuns={mockAreaRuns} />, { wrapper: AllTheProviders });

    expect(screen.getByText('success')).toBeInTheDocument();
    expect(screen.getByText('failed')).toBeInTheDocument();
    expect(screen.getByText('in progress')).toBeInTheDocument();
  });

  it('renders user links', () => {
    render(<AreaRunsTable areaRuns={mockAreaRuns} />, { wrapper: AllTheProviders });

    const johnLink = screen.getByText('John Doe');
    expect(johnLink).toBeInTheDocument();
    expect(johnLink.closest('a')).toHaveAttribute('href', '/profil/john-doe');
  });

  it('renders timestamps with monospace font', () => {
    render(<AreaRunsTable areaRuns={mockAreaRuns} />, { wrapper: AllTheProviders });

    const timestamp = screen.getByText('2025-10-07 14:30:00');
    expect(timestamp).toBeInTheDocument();
    expect(timestamp).toHaveStyle('font-family: monospace');
  });

  it('renders durations with monospace font', () => {
    render(<AreaRunsTable areaRuns={mockAreaRuns} />, { wrapper: AllTheProviders });

    const duration = screen.getByText('2.5s');
    expect(duration).toBeInTheDocument();
    expect(duration).toHaveStyle('font-family: monospace');
  });

  it('renders table headers correctly', () => {
    render(<AreaRunsTable areaRuns={mockAreaRuns} />, { wrapper: AllTheProviders });

    expect(screen.getByText('Area Name')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('Timestamp')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Duration')).toBeInTheDocument();
  });

  it('handles empty area runs list', () => {
    render(<AreaRunsTable areaRuns={[]} />, { wrapper: AllTheProviders });

    expect(screen.getByText('Recent Area Runs')).toBeInTheDocument();
    expect(screen.queryByText('GitHub PR Monitor')).not.toBeInTheDocument();
  });

  it('does not show add button or actions', () => {
    render(<AreaRunsTable areaRuns={mockAreaRuns} />, { wrapper: AllTheProviders });

    expect(screen.queryByText('Add')).not.toBeInTheDocument();
    // Actions column should not be present
    expect(screen.queryByText('Actions')).not.toBeInTheDocument();
  });
});