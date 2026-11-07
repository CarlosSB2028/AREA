import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { DynamicField } from '../DynamicField';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
  }),
}));

describe('DynamicField', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders text input field', () => {
    const field = {
      name: 'title',
      type: 'text' as const,
      mandatory: true,
      placeholder: 'Enter title',
    };

    render(<DynamicField field={field} value="Test Title" onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText('Enter title');
    expect(input).toBeTruthy();
    expect(input.props.value).toBe('Test Title');
    expect(input.props.keyboardType).toBe('default');
  });

  it('renders email input field', () => {
    const field = {
      name: 'email',
      type: 'email' as const,
      mandatory: true,
      placeholder: 'Enter email',
    };

    render(<DynamicField field={field} value="test@example.com" onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText('Enter email');
    expect(input).toBeTruthy();
    expect(input.props.keyboardType).toBe('email-address');
  });

  it('renders number input field', () => {
    const field = {
      name: 'count',
      type: 'number' as const,
      mandatory: false,
      placeholder: 'Enter count',
    };

    render(<DynamicField field={field} value={42} onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText('Enter count');
    expect(input).toBeTruthy();
    expect(input.props.value).toBe('42');
    expect(input.props.keyboardType).toBe('numeric');
  });

  it('renders date input field', () => {
    const field = {
      name: 'birthdate',
      type: 'date' as const,
      mandatory: true,
      placeholder: 'YYYY-MM-DD',
    };

    render(<DynamicField field={field} value="1990-01-01" onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText('YYYY-MM-DD');
    expect(input).toBeTruthy();
    expect(input.props.value).toBe('1990-01-01');
  });

  it('renders time input field', () => {
    const field = {
      name: 'meetingTime',
      type: 'time' as const,
      mandatory: false,
      placeholder: 'HH:mm:ss',
    };

    render(<DynamicField field={field} value="14:30:00" onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText('HH:mm:ss');
    expect(input).toBeTruthy();
    expect(input.props.value).toBe('14:30:00');
  });

  it('renders datetime input field', () => {
    const field = {
      name: 'scheduledAt',
      type: 'datetime' as const,
      mandatory: true,
      placeholder: 'YYYY-MM-DD HH:mm:ss',
    };

    render(<DynamicField field={field} value="2023-12-25 10:00:00" onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText('YYYY-MM-DD HH:mm:ss');
    expect(input).toBeTruthy();
    expect(input.props.value).toBe('2023-12-25 10:00:00');
  });

  it('renders array field as multiline text input', () => {
    const field = {
      name: 'tags',
      type: 'array' as const,
      mandatory: false,
    };

    render(<DynamicField field={field} value="tag1,tag2,tag3" onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText('Enter tags');
    expect(input).toBeTruthy();
    expect(input.props.multiline).toBe(true);
    expect(input.props.numberOfLines).toBe(3);
  });

  it('handles text input changes', () => {
    const field = {
      name: 'description',
      type: 'text' as const,
      mandatory: false,
    };

    render(<DynamicField field={field} value="" onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText('Enter description');
    fireEvent.changeText(input, 'New description');

    expect(mockOnChange).toHaveBeenCalledWith('description', 'New description');
  });

  it('handles number input changes with valid number', () => {
    const field = {
      name: 'quantity',
      type: 'number' as const,
      mandatory: false,
    };

    render(<DynamicField field={field} value={undefined} onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText('Enter quantity');
    fireEvent.changeText(input, '123');

    expect(mockOnChange).toHaveBeenCalledWith('quantity', 123);
  });

  it('handles number input changes with invalid number', () => {
    const field = {
      name: 'quantity',
      type: 'number' as const,
      mandatory: false,
    };

    render(<DynamicField field={field} value={undefined} onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText('Enter quantity');
    fireEvent.changeText(input, 'invalid');

    expect(mockOnChange).toHaveBeenCalledWith('quantity', undefined);
  });

  it('handles empty string input', () => {
    const field = {
      name: 'title',
      type: 'text' as const,
      mandatory: true,
    };

    render(<DynamicField field={field} value="Initial value" onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText('Enter title');
    fireEvent.changeText(input, '');

    expect(mockOnChange).toHaveBeenCalledWith('title', '');
  });

  it('uses default placeholder when none provided', () => {
    const field = {
      name: 'customField',
      type: 'text' as const,
      mandatory: false,
    };

    render(<DynamicField field={field} value="" onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText('Enter customField');
    expect(input).toBeTruthy();
  });

  it('handles null/undefined values', () => {
    const field = {
      name: 'optional',
      type: 'text' as const,
      mandatory: false,
    };

    render(<DynamicField field={field} value={null} onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText('Enter optional');
    expect(input.props.value).toBe('');
  });

  it('handles zero as valid number', () => {
    const field = {
      name: 'count',
      type: 'number' as const,
      mandatory: false,
    };

    render(<DynamicField field={field} value={undefined} onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText('Enter count');
    fireEvent.changeText(input, '0');

    expect(mockOnChange).toHaveBeenCalledWith('count', 0);
  });

  it('handles negative numbers', () => {
    const field = {
      name: 'temperature',
      type: 'number' as const,
      mandatory: false,
    };

    render(<DynamicField field={field} value={undefined} onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText('Enter temperature');
    fireEvent.changeText(input, '-10');

    expect(mockOnChange).toHaveBeenCalledWith('temperature', -10);
  });

  it('handles decimal numbers', () => {
    const field = {
      name: 'price',
      type: 'number' as const,
      mandatory: false,
    };

    render(<DynamicField field={field} value={undefined} onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText('Enter price');
    fireEvent.changeText(input, '19.99');

    expect(mockOnChange).toHaveBeenCalledWith('price', 19.99);
  });

  it('renders with correct styling', () => {
    const field = {
      name: 'test',
      type: 'text' as const,
      mandatory: true,
    };

    render(<DynamicField field={field} value="test" onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText('Enter test');
    expect(input.props.className).toContain('text-typography-900');
  });

  it('handles unknown field types gracefully', () => {
    const field = {
      name: 'unknown',
      type: 'unknown' as any,
      mandatory: false,
    };

    render(<DynamicField field={field} value="test" onChange={mockOnChange} />);

    // Should render as text input for unknown types
    const input = screen.getByPlaceholderText('Enter unknown');
    expect(input).toBeTruthy();
  });
});