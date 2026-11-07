import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import BoardToolbar from '@/components/ui/areaCreation/components/BoardToolbar';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <MantineProvider>{children}</MantineProvider>;
};

describe('BoardToolbar', () => {
  it('renders toolbar with Add Service and Create Link buttons', () => {
    const mockOnAddService = jest.fn();
    const mockOnToggleLinking = jest.fn();

    render(
      <BoardToolbar
        onAddService={mockOnAddService}
        onToggleLinking={mockOnToggleLinking}
        isLinking={false}
        canStartLinking={true}
      />,
      { wrapper: AllTheProviders }
    );

    expect(screen.getByText('Add Service')).toBeInTheDocument();
    expect(screen.getByText('Create Link')).toBeInTheDocument();
  });

  it('calls onAddService when Add Service button is clicked', () => {
    const mockOnAddService = jest.fn();
    const mockOnToggleLinking = jest.fn();

    render(
      <BoardToolbar
        onAddService={mockOnAddService}
        onToggleLinking={mockOnToggleLinking}
        isLinking={false}
        canStartLinking={true}
      />,
      { wrapper: AllTheProviders }
    );

    const addServiceButton = screen.getByText('Add Service');
    fireEvent.click(addServiceButton);

    expect(mockOnAddService).toHaveBeenCalledTimes(1);
    expect(mockOnToggleLinking).not.toHaveBeenCalled();
  });

  it('shows Create Link button when not linking', () => {
    const mockOnAddService = jest.fn();
    const mockOnToggleLinking = jest.fn();

    render(
      <BoardToolbar
        onAddService={mockOnAddService}
        onToggleLinking={mockOnToggleLinking}
        isLinking={false}
        canStartLinking={true}
      />,
      { wrapper: AllTheProviders }
    );

    expect(screen.getByText('Create Link')).toBeInTheDocument();
    expect(screen.queryByText('Cancel Linking')).not.toBeInTheDocument();
  });

  it('shows Cancel Linking button when linking', () => {
    const mockOnAddService = jest.fn();
    const mockOnToggleLinking = jest.fn();

    render(
      <BoardToolbar
        onAddService={mockOnAddService}
        onToggleLinking={mockOnToggleLinking}
        isLinking={true}
        canStartLinking={true}
      />,
      { wrapper: AllTheProviders }
    );

    expect(screen.getByText('Cancel Linking')).toBeInTheDocument();
    expect(screen.queryByText('Create Link')).not.toBeInTheDocument();
  });

  it('disables Create Link button when canStartLinking is false', () => {
    const mockOnAddService = jest.fn();
    const mockOnToggleLinking = jest.fn();

    render(
      <BoardToolbar
        onAddService={mockOnAddService}
        onToggleLinking={mockOnToggleLinking}
        isLinking={false}
        canStartLinking={false}
      />,
      { wrapper: AllTheProviders }
    );

    const createLinkButton = screen.getByText('Create Link').closest('button');
    expect(createLinkButton).toBeDisabled();
  });

  it('calls onToggleLinking when Create Link button is clicked', () => {
    const mockOnAddService = jest.fn();
    const mockOnToggleLinking = jest.fn();

    render(
      <BoardToolbar
        onAddService={mockOnAddService}
        onToggleLinking={mockOnToggleLinking}
        isLinking={false}
        canStartLinking={true}
      />,
      { wrapper: AllTheProviders }
    );

    const createLinkButton = screen.getByText('Create Link');
    fireEvent.click(createLinkButton);

    expect(mockOnToggleLinking).toHaveBeenCalledTimes(1);
    expect(mockOnAddService).not.toHaveBeenCalled();
  });
});