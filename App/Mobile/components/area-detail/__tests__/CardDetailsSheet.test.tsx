import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { CardDetailsSheet } from '../CardDetailsSheet';
import type { CardData } from '@/types/area-detail';
import i18n from '@/i18n';

// Mock services data
jest.mock('@/mocks/services.json', () => [
  {
    id: 'service-1',
    name: 'Gmail',
    isActive: true,
    auth: 'oauth2',
  },
  {
    id: 'service-2',
    name: 'Slack',
    isActive: true,
    auth: 'token',
  },
  {
    id: 'service-3',
    name: 'Inactive Service',
    isActive: false,
    auth: 'api_key',
  },
]);

// Mock lucide-react-native icons
jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');

  return new Proxy(
    {},
    {
      get: (_target, prop) => {
        const IconComponent = React.forwardRef((props: any, ref: any) => (
          <View ref={ref} accessibilityLabel={`icon-${String(prop)}`} {...props} />
        ));
        IconComponent.displayName = `Icon(${String(prop)})`;
        return IconComponent;
      },
    }
  );
});

describe('CardDetailsSheet', () => {
  const mockActionCard: CardData = {
    id: 'card-1',
    type: 'action',
    position: { x: 100, y: 100 },
    data: {
      id: 'action-1',
      actionDefinitionId: 'def-1',
      name: 'Test Action',
      parameters: {},
      activationConfig: {
        type: 'manual',
      },
    },
  };

  const mockReactionCard: CardData = {
    id: 'card-2',
    type: 'reaction',
    position: { x: 200, y: 200 },
    data: {
      id: 'reaction-1',
      actionDefinitionId: 'def-2',
      name: 'Test Reaction',
      parameters: {},
      order: 0,
      continue_on_error: false,
    },
  };

  const defaultProps = {
    visible: true,
    card: mockActionCard,
    onClose: jest.fn(),
    onCardEdit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when not visible', () => {
    const { queryByText } = render(
      <CardDetailsSheet {...defaultProps} visible={false} />
    );

    expect(queryByText(i18n.t('areaDetail.detailsSheet.title'))).toBeNull();
  });

  it('renders card details when visible with action card', () => {
    const { getByText, getByDisplayValue } = render(
      <CardDetailsSheet {...defaultProps} />
    );

    expect(getByText(i18n.t('areaDetail.detailsSheet.title'))).toBeTruthy();
    expect(getByDisplayValue('Test Action')).toBeTruthy();
  });

  it('renders card details when visible with reaction card', () => {
    const { getByText, getByDisplayValue } = render(
      <CardDetailsSheet {...defaultProps} card={mockReactionCard} />
    );

    expect(getByText(i18n.t('areaDetail.detailsSheet.title'))).toBeTruthy();
    expect(getByDisplayValue('Test Reaction')).toBeTruthy();
  });

  it('calls onClose when close button is pressed', () => {
    const { getByLabelText } = render(
      <CardDetailsSheet {...defaultProps} />
    );

    const closeButton = getByLabelText('icon-X');
    fireEvent.press(closeButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('updates name field when text changes', () => {
    const { getByDisplayValue } = render(
      <CardDetailsSheet {...defaultProps} />
    );

    const nameInput = getByDisplayValue('Test Action');
    fireEvent.changeText(nameInput, 'Updated Action Name');

    expect(getByDisplayValue('Updated Action Name')).toBeTruthy();
  });

  it('renders trigger type options for action cards', () => {
    const { getByText } = render(
      <CardDetailsSheet {...defaultProps} />
    );

    expect(getByText(i18n.t('areaDetail.detailsSheet.triggerTypes.manual'))).toBeTruthy();
    expect(getByText(i18n.t('areaDetail.detailsSheet.triggerTypes.webhook'))).toBeTruthy();
    expect(getByText(i18n.t('areaDetail.detailsSheet.triggerTypes.cron'))).toBeTruthy();
  });

  it('changes trigger type when option is pressed', () => {
    const { getByText } = render(
      <CardDetailsSheet {...defaultProps} />
    );

    const webhookButton = getByText(i18n.t('areaDetail.detailsSheet.triggerTypes.webhook'));
    fireEvent.press(webhookButton);

    // Webhook fields should appear
    expect(getByText(i18n.t('areaDetail.detailsSheet.webhookUrlLabel'))).toBeTruthy();
  });

  it('shows webhook fields when webhook trigger is selected', () => {
    const { getByText, getByPlaceholderText } = render(
      <CardDetailsSheet {...defaultProps} />
    );

    const webhookButton = getByText('Webhook');
    fireEvent.press(webhookButton);

    expect(getByText('Webhook URL')).toBeTruthy();
    expect(getByPlaceholderText('https://example.com/webhook')).toBeTruthy();
    expect(getByText('Service (Optional)')).toBeTruthy();
  });

  it('shows cron fields when cron trigger is selected', () => {
    const { getByText, getByPlaceholderText } = render(
      <CardDetailsSheet {...defaultProps} />
    );

    const cronButton = getByText('Cron');
    fireEvent.press(cronButton);

    expect(getByText('Cron Expression')).toBeTruthy();
    expect(getByPlaceholderText('*/5 * * * *')).toBeTruthy();
  });

  it('updates webhook URL when input changes', () => {
    const { getByText, getByPlaceholderText, getByDisplayValue } = render(
      <CardDetailsSheet {...defaultProps} />
    );

    fireEvent.press(getByText('Webhook'));
    const webhookInput = getByPlaceholderText('https://example.com/webhook');
    fireEvent.changeText(webhookInput, 'https://test.com/hook');

    expect(getByDisplayValue('https://test.com/hook')).toBeTruthy();
  });

  it('updates cron expression when input changes', () => {
    const { getByText, getByPlaceholderText, getByDisplayValue } = render(
      <CardDetailsSheet {...defaultProps} />
    );

    fireEvent.press(getByText('Cron'));
    const cronInput = getByPlaceholderText('*/5 * * * *');
    fireEvent.changeText(cronInput, '0 0 * * *');

    expect(getByDisplayValue('0 0 * * *')).toBeTruthy();
  });

  it('loads and displays active services for webhook', async () => {
    const { getByText } = render(
      <CardDetailsSheet {...defaultProps} />
    );

    fireEvent.press(getByText('Webhook'));

    await waitFor(() => {
      expect(getByText('Gmail')).toBeTruthy();
      expect(getByText('Slack')).toBeTruthy();
    });
  });

  it('loads and displays services for reaction cards', async () => {
    const { getByText } = render(
      <CardDetailsSheet {...defaultProps} card={mockReactionCard} />
    );

    await waitFor(() => {
      expect(getByText('Select Service')).toBeTruthy();
      expect(getByText('Gmail')).toBeTruthy();
      expect(getByText('Slack')).toBeTruthy();
    });
  });

  it('does not display inactive services', async () => {
    const { getByText, queryByText } = render(
      <CardDetailsSheet {...defaultProps} card={mockReactionCard} />
    );

    await waitFor(() => {
      expect(getByText('Gmail')).toBeTruthy();
      expect(queryByText('Inactive Service')).toBeNull();
    });
  });

  it('selects service when pressed', async () => {
    const { getByText } = render(
      <CardDetailsSheet {...defaultProps} />
    );

    fireEvent.press(getByText('Webhook'));

    await waitFor(() => {
      const gmailOption = getByText('Gmail');
      fireEvent.press(gmailOption);
    });

    // Service should be selected (indicated by styling change)
    await waitFor(() => {
      expect(getByText('Gmail')).toBeTruthy();
    });
  });

  it('shows selected service info for reaction cards', async () => {
    const { getByText } = render(
      <CardDetailsSheet {...defaultProps} card={mockReactionCard} />
    );

    await waitFor(() => {
      const gmailOption = getByText('Gmail');
      fireEvent.press(gmailOption);
    });

    await waitFor(() => {
      expect(getByText(/Selected:/)).toBeTruthy();
      expect(getByText('Action selection will be available in the next step')).toBeTruthy();
    });
  });

  it('calls onCardEdit with updated data when save is pressed', async () => {
    const { getByText, getByDisplayValue } = render(
      <CardDetailsSheet {...defaultProps} />
    );

    const nameInput = getByDisplayValue('Test Action');
    fireEvent.changeText(nameInput, 'Updated Name');

    const saveButton = getByText('Save Changes');
    fireEvent.press(saveButton);

    expect(defaultProps.onCardEdit).toHaveBeenCalledWith(
      'card-1',
      expect.objectContaining({
        data: expect.objectContaining({
          name: 'Updated Name',
        }),
      })
    );
  });

  it('calls onClose after saving', () => {
    const { getByText } = render(
      <CardDetailsSheet {...defaultProps} />
    );

    const saveButton = getByText('Save Changes');
    fireEvent.press(saveButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('handles save with webhook configuration', async () => {
    const { getByText, getByPlaceholderText } = render(
      <CardDetailsSheet {...defaultProps} />
    );

    fireEvent.press(getByText('Webhook'));
    
    const webhookInput = getByPlaceholderText('https://example.com/webhook');
    fireEvent.changeText(webhookInput, 'https://test.com/webhook');

    await waitFor(() => {
      const gmailOption = getByText('Gmail');
      fireEvent.press(gmailOption);
    });

    const saveButton = getByText('Save Changes');
    fireEvent.press(saveButton);

    expect(defaultProps.onCardEdit).toHaveBeenCalledWith(
      'card-1',
      expect.objectContaining({
        data: expect.objectContaining({
          activationConfig: expect.objectContaining({
            type: 'webhook',
            webhook_url: 'https://test.com/webhook',
          }),
        }),
      })
    );
  });

  it('handles save with cron configuration', () => {
    const { getByText, getByPlaceholderText } = render(
      <CardDetailsSheet {...defaultProps} />
    );

    fireEvent.press(getByText('Cron'));
    
    const cronInput = getByPlaceholderText('*/5 * * * *');
    fireEvent.changeText(cronInput, '0 0 * * *');

    const saveButton = getByText('Save Changes');
    fireEvent.press(saveButton);

    expect(defaultProps.onCardEdit).toHaveBeenCalledWith(
      'card-1',
      expect.objectContaining({
        data: expect.objectContaining({
          activationConfig: expect.objectContaining({
            type: 'cron',
            cron_expression: '0 0 * * *',
          }),
        }),
      })
    );
  });

  it('does not render card content when card is null', () => {
    const { queryByPlaceholderText } = render(
      <CardDetailsSheet {...defaultProps} card={null} />
    );

    // Modal should still render but content should be empty
    expect(queryByPlaceholderText('Enter card name')).toBeNull();
  });

  it('does not call onCardEdit when onCardEdit prop is not provided', () => {
    const onCloseMock = jest.fn();
    const propsWithoutEdit = { ...defaultProps, onCardEdit: undefined, onClose: onCloseMock };
    const { getByText } = render(
      <CardDetailsSheet {...propsWithoutEdit} />
    );

    const saveButton = getByText('Save Changes');
    fireEvent.press(saveButton);

    // Should still call onClose
    expect(onCloseMock).toHaveBeenCalled();
  });

  it('displays help text for cron expression', () => {
    const { getByText } = render(
      <CardDetailsSheet {...defaultProps} />
    );

    fireEvent.press(getByText('Cron'));

    expect(getByText('Example: */5 * * * * (every 5 minutes)')).toBeTruthy();
  });
});
