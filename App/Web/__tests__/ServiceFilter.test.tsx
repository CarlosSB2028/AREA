import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ServiceFilter from '../src/components/ui/areaList/ServiceFilter';
import { MantineProvider } from '@mantine/core';
import { services as mockServices } from '../src/mocks/areas';

// Custom render function with MantineProvider
const renderWithMantine = (component: React.ReactElement) => {
  return render(
    <MantineProvider>
      {component}
    </MantineProvider>
  );
};

describe('ServiceFilter', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the filter input with placeholder', () => {
    renderWithMantine(<ServiceFilter services={mockServices} value={[]} onChange={mockOnChange} />);

    expect(screen.getByPlaceholderText('Search services')).toBeInTheDocument();
  });

  it('displays selected services as pills', () => {
    const selectedValues = ['1', '2'];
    renderWithMantine(<ServiceFilter services={mockServices} value={selectedValues} onChange={mockOnChange} />);

    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('Google')).toBeInTheDocument();
    expect(screen.queryByText('Bitbucket')).not.toBeInTheDocument();
  });

  it('shows service logos in pills', () => {
    const selectedValues = ['1'];
    renderWithMantine(<ServiceFilter services={mockServices} value={selectedValues} onChange={mockOnChange} />);

    const logo = screen.getByAltText('GitHub');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', 'https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg');
  });

  it('removes last selected service with backspace', () => {
    renderWithMantine(<ServiceFilter services={mockServices} value={['1', '2']} onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText('Search services');
    fireEvent.keyDown(input, { key: 'Backspace' });

    expect(mockOnChange).toHaveBeenCalledWith(['1']);
  });

  it('handles service without logo', () => {
    const servicesWithoutLogo = [
      { id: '1', name: 'GitHub', logo: '' }, // Empty logo
    ];

    renderWithMantine(<ServiceFilter services={servicesWithoutLogo} value={['1']} onChange={mockOnChange} />);

    expect(screen.getByText('GitHub')).toBeInTheDocument();
    // Should not crash and should not show logo
    expect(screen.queryByAltText('GitHub')).not.toBeInTheDocument();
  });

  it('handles unknown service id gracefully', () => {
    renderWithMantine(<ServiceFilter services={mockServices} value={['999']} onChange={mockOnChange} />);

    expect(screen.getByText('999')).toBeInTheDocument(); // Shows ID as fallback
  });
});