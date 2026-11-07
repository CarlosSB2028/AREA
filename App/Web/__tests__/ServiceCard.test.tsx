import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import ServiceCard from '@/components/ui/areaCreation/ServiceCard';
import { ServiceState } from '@/types';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <MantineProvider>{children}</MantineProvider>;
};

describe('ServiceCard', () => {
  const defaultProps = {
    logo: 'https://example.com/logo.png',
    serviceName: 'Test Service',
    cardName: 'Test Card',
    event: 'Test Event',
    state: ServiceState.Success,
    onRemove: jest.fn(),
    onEdit: jest.fn(),
    onDuplicate: jest.fn(),
  };

  it('renders service card with basic information', () => {
    render(<ServiceCard {...defaultProps} />, { wrapper: AllTheProviders });

    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('Test Event')).toBeInTheDocument();
  });

  it('renders success badge when state is Success', () => {
    render(<ServiceCard {...defaultProps} state={ServiceState.Success} />, { wrapper: AllTheProviders });

    expect(screen.getByText('Test Card')).toBeInTheDocument();
  });

  it('renders configuration badge when state is Configuration', () => {
    render(<ServiceCard {...defaultProps} state={ServiceState.Configuration} />, { wrapper: AllTheProviders });

    expect(screen.getByText('Test Card')).toBeInTheDocument();
  });

  it('renders failed badge when state is Failed', () => {
    render(<ServiceCard {...defaultProps} state={ServiceState.Failed} />, { wrapper: AllTheProviders });

    expect(screen.getByText('Test Card')).toBeInTheDocument();
  });

  it('renders in progress badge when state is InProgress', () => {
    render(<ServiceCard {...defaultProps} state={ServiceState.InProgress} />, { wrapper: AllTheProviders });

    expect(screen.getByText('Test Card')).toBeInTheDocument();
  });

  it('truncates long card name', () => {
    render(
      <ServiceCard {...defaultProps} cardName="Very Long Card Name That Should Be Truncated" />,
      { wrapper: AllTheProviders }
    );

    expect(screen.getByText('Very Long Card ...')).toBeInTheDocument();
  });

  it('truncates long event name', () => {
    render(
      <ServiceCard {...defaultProps} event="Very Long Event Name That Should Be Truncated" />,
      { wrapper: AllTheProviders }
    );

    expect(screen.getByText('Very Long Event...')).toBeInTheDocument();
  });

  it('renders link info for chain type', () => {
    const propsWithLink = {
      ...defaultProps,
      linkInfo: {
        type: 'chain' as const,
        sourceService: 'Source Service',
        hasChainTarget: false,
      },
    };

    render(<ServiceCard {...propsWithLink} />, { wrapper: AllTheProviders });

    expect(screen.getByText('Chain from Source Service')).toBeInTheDocument();
  });

  it('renders link info for conditional type', () => {
    const propsWithLink = {
      ...defaultProps,
      linkInfo: {
        type: 'conditional' as const,
        sourceService: 'Source Service',
        hasChainTarget: false,
      },
    };

    render(<ServiceCard {...propsWithLink} />, { wrapper: AllTheProviders });

    expect(screen.getByText('Conditional from Source Service')).toBeInTheDocument();
  });

  it('renders link info with chain target badge', () => {
    const propsWithLink = {
      ...defaultProps,
      linkInfo: {
        type: 'chain' as const,
        sourceService: 'Source Service',
        hasChainTarget: true,
      },
    };

    render(<ServiceCard {...propsWithLink} />, { wrapper: AllTheProviders });

    expect(screen.getByText('Has chain target')).toBeInTheDocument();
  });
});