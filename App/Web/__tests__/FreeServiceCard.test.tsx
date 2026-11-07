import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import FreeServiceCard from '@/components/ui/areaCreation/FreeServiceCard';
import { ServiceState } from '@/types';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <MantineProvider>{children}</MantineProvider>;
};

describe('FreeServiceCard', () => {
  const defaultProps = {
    logo: 'https://example.com/logo.png',
    serviceName: 'Test Service',
    cardName: 'Test Card',
    event: 'Test Event',
    state: ServiceState.Success,
    onRemove: jest.fn(),
    onEdit: jest.fn(),
  };

  it('renders service card with basic information', () => {
    render(<FreeServiceCard {...defaultProps} />, { wrapper: AllTheProviders });

    expect(screen.getByText('Test Service')).toBeInTheDocument();
    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText('success')).toBeInTheDocument();
  });

  it('renders success badge for Success state', () => {
    render(<FreeServiceCard {...defaultProps} state={ServiceState.Success} />, { wrapper: AllTheProviders });

    expect(screen.getByText('success')).toBeInTheDocument();
  });

  it('renders failed badge for Failed state', () => {
    render(<FreeServiceCard {...defaultProps} state={ServiceState.Failed} />, { wrapper: AllTheProviders });

    expect(screen.getByText('failed')).toBeInTheDocument();
  });

  it('renders in progress badge for InProgress state', () => {
    render(<FreeServiceCard {...defaultProps} state={ServiceState.InProgress} />, { wrapper: AllTheProviders });

    expect(screen.getByText('in_progress')).toBeInTheDocument();
  });

  it('renders configuration badge for Configuration state', () => {
    render(<FreeServiceCard {...defaultProps} state={ServiceState.Configuration} />, { wrapper: AllTheProviders });

    expect(screen.getByText('configuration')).toBeInTheDocument();
  });

  it('renders without event when not provided', () => {
    render(<FreeServiceCard {...defaultProps} event={undefined} />, { wrapper: AllTheProviders });

    expect(screen.getByText('Test Service')).toBeInTheDocument();
    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.queryByText('Test Event')).not.toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const mockOnEdit = jest.fn();
    const mockOnRemove = jest.fn();

    render(
      <FreeServiceCard {...defaultProps} onEdit={mockOnEdit} onRemove={mockOnRemove} />,
      { wrapper: AllTheProviders }
    );

    const buttons = screen.getAllByRole('button');
    const editButton = buttons[0]; // First button is edit
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledTimes(1);
    expect(mockOnRemove).not.toHaveBeenCalled();
  });

  it('calls onRemove when remove button is clicked', () => {
    const mockOnEdit = jest.fn();
    const mockOnRemove = jest.fn();

    render(
      <FreeServiceCard {...defaultProps} onEdit={mockOnEdit} onRemove={mockOnRemove} />,
      { wrapper: AllTheProviders }
    );

    const buttons = screen.getAllByRole('button');
    const removeButton = buttons[1]; // Second button is remove
    fireEvent.click(removeButton);

    expect(mockOnRemove).toHaveBeenCalledTimes(1);
    expect(mockOnEdit).not.toHaveBeenCalled();
  });
});