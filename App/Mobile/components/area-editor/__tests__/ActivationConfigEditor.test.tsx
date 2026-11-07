import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { ActivationConfigEditor } from '../ActivationConfigEditor';
import type { ActivationConfig } from '@/types/areas';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
  }),
}));

describe('ActivationConfigEditor', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders type selector with default allowed types', () => {
    const config = { type: 'webhook' as const };

    render(<ActivationConfigEditor config={config} onChange={mockOnChange} />);

    expect(screen.getByText('Activation Type')).toBeTruthy();
    expect(screen.getByText('webhook')).toBeTruthy();
    expect(screen.getByText('cron')).toBeTruthy();
    expect(screen.getByText('poll')).toBeTruthy();
    expect(screen.getByText('chain')).toBeTruthy();
  });

  it('renders type selector with custom allowed types', () => {
    const config = { type: 'manual' as const };
    const allowedTypes: ActivationConfig['type'][] = ['webhook', 'manual'];

    render(<ActivationConfigEditor config={config} onChange={mockOnChange} allowedTypes={allowedTypes} />);

    expect(screen.getByText('webhook')).toBeTruthy();
    expect(screen.getByText('manual')).toBeTruthy();
    expect(screen.queryByText('cron')).toBeNull();
  });

  it('excludes chain type for first action', () => {
    const config = { type: 'webhook' as const };

    render(<ActivationConfigEditor config={config} onChange={mockOnChange} isFirstAction={true} />);

    expect(screen.getByText('webhook')).toBeTruthy();
    expect(screen.getByText('cron')).toBeTruthy();
    expect(screen.getByText('poll')).toBeTruthy();
    expect(screen.queryByText('chain')).toBeNull();
  });

  it('changes type to webhook and initializes config', () => {
    const config = { type: 'manual' as const };

    render(<ActivationConfigEditor config={config} onChange={mockOnChange} />);

    const webhookBadge = screen.getByText('webhook');
    fireEvent.press(webhookBadge);

    expect(mockOnChange).toHaveBeenCalledWith({
      type: 'webhook',
      webhook_url: '',
      events: [],
      secret_token: '',
    });
  });

  it('changes type to cron and initializes config', () => {
    const config = { type: 'manual' as const };

    render(<ActivationConfigEditor config={config} onChange={mockOnChange} />);

    const cronBadge = screen.getByText('cron');
    fireEvent.press(cronBadge);

    expect(mockOnChange).toHaveBeenCalledWith({
      type: 'cron',
      cron_expression: '0 */30 * * * *',
    });
  });

  it('changes type to poll and initializes config', () => {
    const config = { type: 'manual' as const };

    render(<ActivationConfigEditor config={config} onChange={mockOnChange} />);

    const pollBadge = screen.getByText('poll');
    fireEvent.press(pollBadge);

    expect(mockOnChange).toHaveBeenCalledWith({
      type: 'poll',
      poll_interval: 300,
    });
  });

  it('changes type to chain and initializes config', () => {
    const config = { type: 'manual' as const };

    render(<ActivationConfigEditor config={config} onChange={mockOnChange} />);

    const chainBadge = screen.getByText('chain');
    fireEvent.press(chainBadge);

    expect(mockOnChange).toHaveBeenCalledWith({
      type: 'chain',
    });
  });

  it('renders webhook configuration fields', () => {
    const config = {
      type: 'webhook' as const,
      webhook_url: 'https://example.com/webhook',
      secret_token: 'secret123',
      events: ['push', 'pull_request'],
    };

    render(<ActivationConfigEditor config={config} onChange={mockOnChange} />);

    expect(screen.getByText('Webhook URL')).toBeTruthy();
    expect(screen.getByDisplayValue('https://example.com/webhook')).toBeTruthy();

    expect(screen.getByText('Secret Token (Optional)')).toBeTruthy();
    expect(screen.getByDisplayValue('secret123')).toBeTruthy();

    expect(screen.getByText('Events (Optional)')).toBeTruthy();
    expect(screen.getByDisplayValue('push, pull_request')).toBeTruthy();
  });

  it('updates webhook URL', () => {
    const config = { type: 'webhook' as const, webhook_url: '' };

    render(<ActivationConfigEditor config={config} onChange={mockOnChange} />);

    const urlInput = screen.getByPlaceholderText('https://example.com/webhook');
    fireEvent.changeText(urlInput, 'https://new-webhook.com');

    expect(mockOnChange).toHaveBeenCalledWith({
      ...config,
      webhook_url: 'https://new-webhook.com',
    });
  });

  it('updates webhook secret token', () => {
    const config = { type: 'webhook' as const, secret_token: '' };

    render(<ActivationConfigEditor config={config} onChange={mockOnChange} />);

    const secretInput = screen.getByPlaceholderText('Enter secret token');
    fireEvent.changeText(secretInput, 'newsecret');

    expect(mockOnChange).toHaveBeenCalledWith({
      ...config,
      secret_token: 'newsecret',
    });
  });

  it('updates webhook events', () => {
    const config = { type: 'webhook' as const, events: [] };

    render(<ActivationConfigEditor config={config} onChange={mockOnChange} />);

    const eventsInput = screen.getByPlaceholderText('Comma-separated events');
    fireEvent.changeText(eventsInput, 'push, issues, pr');

    expect(mockOnChange).toHaveBeenCalledWith({
      ...config,
      events: ['push', 'issues', 'pr'],
    });
  });

  it('renders cron configuration fields', () => {
    const config = {
      type: 'cron' as const,
      cron_expression: '0 */15 * * * *',
    };

    render(<ActivationConfigEditor config={config} onChange={mockOnChange} />);

    expect(screen.getByText('Cron Expression')).toBeTruthy();
    expect(screen.getByDisplayValue('0 */15 * * * *')).toBeTruthy();
    expect(screen.getByText('Common Presets')).toBeTruthy();
  });

  it('updates cron expression', () => {
    const config = { type: 'cron' as const, cron_expression: '0 */30 * * * *' };

    render(<ActivationConfigEditor config={config} onChange={mockOnChange} />);

    const cronInput = screen.getByPlaceholderText('0 */30 * * * *');
    fireEvent.changeText(cronInput, '0 0 * * * *');

    expect(mockOnChange).toHaveBeenCalledWith({
      ...config,
      cron_expression: '0 0 * * * *',
    });
  });

  it('applies cron preset', () => {
    const config = { type: 'cron' as const, cron_expression: '0 */30 * * * *' };

    render(<ActivationConfigEditor config={config} onChange={mockOnChange} />);

    const hourlyPreset = screen.getByText('Hourly');
    fireEvent.press(hourlyPreset);

    expect(mockOnChange).toHaveBeenCalledWith({
      ...config,
      cron_expression: '0 0 * * * *',
    });
  });

  it('renders poll configuration fields', () => {
    const config = {
      type: 'poll' as const,
      poll_interval: 600,
    };

    render(<ActivationConfigEditor config={config} onChange={mockOnChange} />);

    expect(screen.getByText('Poll Interval (seconds)')).toBeTruthy();
    expect(screen.getByDisplayValue('600')).toBeTruthy();
    expect(screen.getByText('Common Intervals')).toBeTruthy();
  });

  it('updates poll interval', () => {
    const config = { type: 'poll' as const, poll_interval: 300 };

    render(<ActivationConfigEditor config={config} onChange={mockOnChange} />);

    const intervalInput = screen.getByPlaceholderText('300');
    fireEvent.changeText(intervalInput, '900');

    expect(mockOnChange).toHaveBeenCalledWith({
      ...config,
      poll_interval: 900,
      interval_seconds: 900,
    });
  });

  it('handles invalid poll interval', () => {
    const config = { type: 'poll' as const, poll_interval: 300 };

    render(<ActivationConfigEditor config={config} onChange={mockOnChange} />);

    const intervalInput = screen.getByPlaceholderText('300');
    fireEvent.changeText(intervalInput, 'invalid');

    expect(mockOnChange).toHaveBeenCalledWith({
      ...config,
      poll_interval: undefined,
      interval_seconds: undefined,
    });
  });

  it('applies poll interval preset', () => {
    const config = { type: 'poll' as const, poll_interval: 300 };

    render(<ActivationConfigEditor config={config} onChange={mockOnChange} />);

    const fifteenMinPreset = screen.getByText('15 min');
    fireEvent.press(fifteenMinPreset);

    expect(mockOnChange).toHaveBeenCalledWith({
      ...config,
      poll_interval: 900,
      interval_seconds: 900,
    });
  });

  it('renders chain info message', () => {
    const config = { type: 'chain' as const };

    render(<ActivationConfigEditor config={config} onChange={mockOnChange} />);

    expect(screen.getByText('This action will be triggered automatically after the previous action completes.')).toBeTruthy();
  });

  it('renders manual info message', () => {
    const config = { type: 'manual' as const };

    render(<ActivationConfigEditor config={config} onChange={mockOnChange} />);

    expect(screen.getByText('This action will only be triggered manually.')).toBeTruthy();
  });

  it('renders nothing for unknown type', () => {
    const config = { type: 'unknown' as any };

    render(<ActivationConfigEditor config={config} onChange={mockOnChange} />);

    // Should still show type selector but no config fields
    expect(screen.getByText('Activation Type')).toBeTruthy();
    expect(screen.queryByText('Webhook URL')).toBeNull();
  });

  it('handles empty events array', () => {
    const config = { type: 'webhook' as const, events: [] };

    render(<ActivationConfigEditor config={config} onChange={mockOnChange} />);

    const eventsInput = screen.getByPlaceholderText('Comma-separated events');
    expect(eventsInput.props.value).toBe('');
  });

  it('handles undefined config properties', () => {
    const config = { type: 'webhook' as const };

    render(<ActivationConfigEditor config={config} onChange={mockOnChange} />);

    const urlInput = screen.getByPlaceholderText('https://example.com/webhook');
    expect(urlInput.props.value).toBe('');

    const secretInput = screen.getByPlaceholderText('Enter secret token');
    expect(secretInput.props.value).toBe('');
  });

  it('maintains other config properties when updating', () => {
    const config = {
      type: 'webhook' as const,
      webhook_url: 'https://example.com',
      secret_token: 'secret',
      events: ['push'],
    };

    render(<ActivationConfigEditor config={config} onChange={mockOnChange} />);

    const urlInput = screen.getByDisplayValue('https://example.com');
    fireEvent.changeText(urlInput, 'https://new-url.com');

    expect(mockOnChange).toHaveBeenCalledWith({
      ...config,
      webhook_url: 'https://new-url.com',
    });
  });
});