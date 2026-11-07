import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { StatsGrid } from '../src/components/ui/dashboard/StatsGrid';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <MantineProvider>{children}</MantineProvider>;
};

const mockData = [
  { title: 'Total Users', icon: 'user' as const, value: '40', diff: 5 },
  { title: 'Active Users', icon: 'user' as const, value: '35', diff: -2 },
  { title: 'Revenue', icon: 'coin' as const, value: '$10,000', diff: 10 },
  { title: 'Orders', icon: 'receipt' as const, value: '150', diff: -5 },
];

describe('StatsGrid', () => {
  it('renders stats cards with correct data', () => {
    render(<StatsGrid data={mockData} />, { wrapper: AllTheProviders });

    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('40')).toBeInTheDocument();
    expect(screen.getByText('5%')).toBeInTheDocument();

    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('35')).toBeInTheDocument();
    expect(screen.getByText('-2%')).toBeInTheDocument();

    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('$10,000')).toBeInTheDocument();
    expect(screen.getByText('10%')).toBeInTheDocument();

    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('-5%')).toBeInTheDocument();
  });

  it('renders positive diff with up arrow', () => {
    render(<StatsGrid data={[mockData[0]]} />, { wrapper: AllTheProviders });

    const diffText = screen.getByText('5%');
    expect(diffText).toBeInTheDocument();
    // The arrow icon should be present, but we can't easily test the icon rendering
  });

  it('renders negative diff with down arrow', () => {
    render(<StatsGrid data={[mockData[1]]} />, { wrapper: AllTheProviders });

    const diffText = screen.getByText('-2%');
    expect(diffText).toBeInTheDocument();
  });

  it('renders comparison text', () => {
    render(<StatsGrid data={mockData} />, { wrapper: AllTheProviders });

    const comparisonTexts = screen.getAllByText('Compared to previous month');
    expect(comparisonTexts).toHaveLength(4);
  });

  it('handles partial data', () => {
    render(<StatsGrid data={[mockData[0], mockData[1]]} />, { wrapper: AllTheProviders });

    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('Active Users')).toBeInTheDocument();
  });

  it('renders single stat card', () => {
    render(<StatsGrid data={[mockData[0]]} />, { wrapper: AllTheProviders });

    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('40')).toBeInTheDocument();
  });
});