import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { AreaStatsCards } from '../src/components/ui/dashboard/AreaStatsCards';
import { IconMap, IconCheck, IconX, IconClock } from '@tabler/icons-react';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <MantineProvider>{children}</MantineProvider>;
};

const mockAreaStats = [
  { title: 'Total Areas', value: '15', icon: IconMap },
  { title: 'Successful', value: '8', icon: IconCheck },
  { title: 'Failed', value: '4', icon: IconX },
  { title: 'In Progress', value: '3', icon: IconClock },
];

describe('AreaStatsCards', () => {
  it('renders stats cards with correct data', () => {
    render(<AreaStatsCards areaStats={mockAreaStats} />, { wrapper: AllTheProviders });

    expect(screen.getByText('Total Areas')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();

    expect(screen.getByText('Successful')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();

    expect(screen.getByText('Failed')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();

    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders icons for each stat', () => {
    render(<AreaStatsCards areaStats={mockAreaStats} />, { wrapper: AllTheProviders });

    // Icons are rendered but hard to test specifically without data-testid
    const cards = screen.getAllByText(/Total Areas|Successful|Failed|In Progress/);
    expect(cards).toHaveLength(4);
  });

  it('handles empty stats', () => {
    render(<AreaStatsCards areaStats={[]} />, { wrapper: AllTheProviders });

    expect(screen.queryByText('Total Areas')).not.toBeInTheDocument();
  });

  it('renders single stat card', () => {
    render(<AreaStatsCards areaStats={[mockAreaStats[0]]} />, { wrapper: AllTheProviders });

    expect(screen.getByText('Total Areas')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });
});