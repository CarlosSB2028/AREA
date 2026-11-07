import React from 'react';
import { render, screen, fireEvent } from './helpers/test-utils';
import { NameStep } from '../src/components/ui/area-simple-steps/NameStep';

describe('NameStep', () => {
  const mockOnNameChange = jest.fn();
  const mockOnDescriptionChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render name and description inputs', () => {
    render(
      <NameStep
        areaName=""
        areaDescription=""
        onNameChange={mockOnNameChange}
        onDescriptionChange={mockOnDescriptionChange}
      />
    );

    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThanOrEqual(2);
  });

  it('should call onNameChange when name input changes', () => {
    render(
      <NameStep
        areaName=""
        areaDescription=""
        onNameChange={mockOnNameChange}
        onDescriptionChange={mockOnDescriptionChange}
      />
    );

    const inputs = screen.getAllByRole('textbox');
    const nameInput = inputs[0];

    fireEvent.change(nameInput, { target: { value: 'Test Area' } });
    expect(mockOnNameChange).toHaveBeenCalledWith('Test Area');
  });

  it('should call onDescriptionChange when description input changes', () => {
    render(
      <NameStep
        areaName=""
        areaDescription=""
        onNameChange={mockOnNameChange}
        onDescriptionChange={mockOnDescriptionChange}
      />
    );

    const inputs = screen.getAllByRole('textbox');
    const descriptionInput = inputs[1];

    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    expect(mockOnDescriptionChange).toHaveBeenCalledWith('Test Description');
  });

  it('should display provided area name', () => {
    render(
      <NameStep
        areaName="My Area"
        areaDescription=""
        onNameChange={mockOnNameChange}
        onDescriptionChange={mockOnDescriptionChange}
      />
    );

    const nameInput = screen.getByDisplayValue('My Area');
    expect(nameInput).toBeInTheDocument();
  });

  it('should display provided description', () => {
    render(
      <NameStep
        areaName=""
        areaDescription="My Description"
        onNameChange={mockOnNameChange}
        onDescriptionChange={mockOnDescriptionChange}
      />
    );

    const descriptionInput = screen.getByDisplayValue('My Description');
    expect(descriptionInput).toBeInTheDocument();
  });

  it('should render with both name and description', () => {
    render(
      <NameStep
        areaName="Test Area"
        areaDescription="Test Description"
        onNameChange={mockOnNameChange}
        onDescriptionChange={mockOnDescriptionChange}
      />
    );

    const nameInput = screen.getByDisplayValue('Test Area');
    const descriptionInput = screen.getByDisplayValue('Test Description');

    expect(nameInput).toBeInTheDocument();
    expect(descriptionInput).toBeInTheDocument();
  });

  it('should handle empty initial values', () => {
    render(
      <NameStep
        areaName=""
        areaDescription=""
        onNameChange={mockOnNameChange}
        onDescriptionChange={mockOnDescriptionChange}
      />
    );

    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toHaveValue('');
    expect(inputs[1]).toHaveValue('');
  });
});
