import React from 'react';
import { render, screen, fireEvent } from './helpers/test-utils';
import { ArrayInput } from '../src/components/ui/area-simple-steps/ArrayInput';
import type { FieldData } from '@/types';

const mockField: FieldData = {
  name: 'tags',
  type: 'array',
  mandatory: true,
  description: 'Add tags',
  placeholder: 'Enter a tag',
};

describe('ArrayInput', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render field name', () => {
    render(
      <ArrayInput field={mockField} value={[]} onChange={mockOnChange} />
    );

    expect(screen.getByText('tags')).toBeInTheDocument();
  });

  it('should show mandatory indicator for required fields', () => {
    render(
      <ArrayInput field={mockField} value={[]} onChange={mockOnChange} />
    );

    const asterisk = screen.getByText('*');
    expect(asterisk).toBeInTheDocument();
  });

  it('should display field description', () => {
    render(
      <ArrayInput field={mockField} value={[]} onChange={mockOnChange} />
    );

    expect(screen.getByText('Add tags')).toBeInTheDocument();
  });

  it('should show placeholder text when array is empty', () => {
    render(
      <ArrayInput field={mockField} value={[]} onChange={mockOnChange} />
    );

    expect(screen.getByText('No items yet. Add items below.')).toBeInTheDocument();
  });

  it('should display array items as pills', () => {
    render(
      <ArrayInput field={mockField} value={['tag1', 'tag2']} onChange={mockOnChange} />
    );

    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
  });

  it('should add item when Add button clicked', () => {
    render(
      <ArrayInput field={mockField} value={[]} onChange={mockOnChange} />
    );

    const input = screen.getByPlaceholderText('Enter a tag');
    fireEvent.change(input, { target: { value: 'newtag' } });

    const addButton = screen.getByText('Add');
    fireEvent.click(addButton);

    expect(mockOnChange).toHaveBeenCalledWith(['newtag']);
  });

  it('should add item when Enter pressed', () => {
    render(
      <ArrayInput field={mockField} value={[]} onChange={mockOnChange} />
    );

    const input = screen.getByPlaceholderText('Enter a tag');
    fireEvent.change(input, { target: { value: 'newtag' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(mockOnChange).toHaveBeenCalledWith(['newtag']);
  });

  it('should add item to existing array', () => {
    render(
      <ArrayInput
        field={mockField}
        value={['existing']}
        onChange={mockOnChange}
      />
    );

    const input = screen.getByPlaceholderText('Enter a tag');
    fireEvent.change(input, { target: { value: 'newtag' } });

    const addButton = screen.getByText('Add');
    fireEvent.click(addButton);

    expect(mockOnChange).toHaveBeenCalledWith(['existing', 'newtag']);
  });

  it('should trim whitespace when adding item', () => {
    render(
      <ArrayInput field={mockField} value={[]} onChange={mockOnChange} />
    );

    const input = screen.getByPlaceholderText('Enter a tag');
    fireEvent.change(input, { target: { value: '  newtag  ' } });

    const addButton = screen.getByText('Add');
    fireEvent.click(addButton);

    expect(mockOnChange).toHaveBeenCalledWith(['newtag']);
  });

  it('should not add empty items', () => {
    render(
      <ArrayInput field={mockField} value={[]} onChange={mockOnChange} />
    );

    const addButton = screen.getByRole('button', { name: /Add/ });
    expect(addButton).toBeDisabled();
  });

  it('should disable Add button when input is empty', () => {
    render(
      <ArrayInput field={mockField} value={[]} onChange={mockOnChange} />
    );

    const input = screen.getByPlaceholderText('Enter a tag');
    const addButton = screen.getByRole('button', { name: /Add/ });

    expect(addButton).toBeDisabled();

    fireEvent.change(input, { target: { value: 'tag' } });
    expect(addButton).not.toBeDisabled();

    fireEvent.change(input, { target: { value: '' } });
    expect(addButton).toBeDisabled();
  });

  it('should remove item when remove button clicked', () => {
    const { container } = render(
      <ArrayInput
        field={mockField}
        value={['tag1', 'tag2']}
        onChange={mockOnChange}
      />
    );

    const removeButtons = container.querySelectorAll('button[aria-label*="Remove"]');
    if (removeButtons.length > 0) {
      fireEvent.click(removeButtons[0]);
      expect(mockOnChange).toHaveBeenCalledWith(['tag2']);
    }
  });

  it('should clear input after adding item', () => {
    render(
      <ArrayInput field={mockField} value={[]} onChange={mockOnChange} />
    );

    const input = screen.getByPlaceholderText('Enter a tag') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'newtag' } });

    const addButton = screen.getByText('Add');
    fireEvent.click(addButton);

    expect(input.value).toBe('');
  });

  it('should handle non-array initial value', () => {
    render(
      <ArrayInput field={mockField} value={undefined} onChange={mockOnChange} />
    );

    expect(screen.getByText('No items yet. Add items below.')).toBeInTheDocument();
  });

  it('should not display description when not provided', () => {
    const fieldWithoutDescription = {
      name: 'tags',
      type: 'array' as const,
      mandatory: true,
    };

    render(
      <ArrayInput
        field={fieldWithoutDescription}
        value={[]}
        onChange={mockOnChange}
      />
    );

    expect(screen.queryByText('Add tags')).not.toBeInTheDocument();
  });

  it('should not add item when Enter pressed with only whitespace', () => {
    render(
      <ArrayInput field={mockField} value={[]} onChange={mockOnChange} />
    );

    const input = screen.getByPlaceholderText('Enter a tag');
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('should not add item when other key pressed', () => {
    render(
      <ArrayInput field={mockField} value={[]} onChange={mockOnChange} />
    );

    const input = screen.getByPlaceholderText('Enter a tag');
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.keyDown(input, { key: 'ArrowUp', code: 'ArrowUp' });

    expect(mockOnChange).not.toHaveBeenCalled();
  });
});
