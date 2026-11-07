import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import ZoomControls from '@/components/ui/areaCreation/components/ZoomControls';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <MantineProvider>{children}</MantineProvider>;
};

describe('ZoomControls', () => {
  it('renders zoom controls with correct scale percentage', () => {
    const mockOnZoomIn = jest.fn();
    const mockOnZoomOut = jest.fn();

    render(
      <ZoomControls scale={1.25} onZoomIn={mockOnZoomIn} onZoomOut={mockOnZoomOut} />,
      { wrapper: AllTheProviders }
    );

    expect(screen.getByText('125%')).toBeInTheDocument();
  });

  it('calls onZoomIn when zoom in button is clicked', () => {
    const mockOnZoomIn = jest.fn();
    const mockOnZoomOut = jest.fn();

    render(
      <ZoomControls scale={1.0} onZoomIn={mockOnZoomIn} onZoomOut={mockOnZoomOut} />,
      { wrapper: AllTheProviders }
    );

    const zoomInButton = screen.getByTitle('Zoom In');
    fireEvent.click(zoomInButton);

    expect(mockOnZoomIn).toHaveBeenCalledTimes(1);
    expect(mockOnZoomOut).not.toHaveBeenCalled();
  });

  it('calls onZoomOut when zoom out button is clicked', () => {
    const mockOnZoomIn = jest.fn();
    const mockOnZoomOut = jest.fn();

    render(
      <ZoomControls scale={1.0} onZoomIn={mockOnZoomIn} onZoomOut={mockOnZoomOut} />,
      { wrapper: AllTheProviders }
    );

    const zoomOutButton = screen.getByTitle('Zoom Out');
    fireEvent.click(zoomOutButton);

    expect(mockOnZoomOut).toHaveBeenCalledTimes(1);
    expect(mockOnZoomIn).not.toHaveBeenCalled();
  });

  it('displays scale as percentage with rounding', () => {
    const mockOnZoomIn = jest.fn();
    const mockOnZoomOut = jest.fn();

    render(
      <ZoomControls scale={0.785} onZoomIn={mockOnZoomIn} onZoomOut={mockOnZoomOut} />,
      { wrapper: AllTheProviders }
    );

    expect(screen.getByText('79%')).toBeInTheDocument();
  });
});