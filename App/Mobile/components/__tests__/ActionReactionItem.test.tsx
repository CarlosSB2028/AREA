import { fireEvent, render, screen } from '@testing-library/react-native';
import { Github, Mail } from 'lucide-react-native';
import React from 'react';

import { ActionReactionItem } from '../ActionReactionItem';
import { GluestackUIProvider } from '../ui/gluestack-ui-provider';

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'actionReaction.action': 'ACTION',
        'actionReaction.reaction': 'REACTION',
        'actionReaction.connect': 'Connect',
        'actionReaction.connected': 'Connected',
        'actionReaction.notConnected': 'Not connected',
      };
      return translations[key] || key;
    },
  }),
}));

const renderWithProvider = (component: React.ReactElement) => {
  return render(<GluestackUIProvider mode="light">{component}</GluestackUIProvider>);
};

describe('ActionReactionItem', () => {
  const mockOnConnect = jest.fn();
  const mockOnPress = jest.fn();

  const defaultProps = {
    actionName: 'GitHub Push',
    reactionName: 'Send Email',
    actionIcon: Github,
    reactionIcon: Mail,
    isConnected: false,
    onConnect: mockOnConnect,
    onPress: mockOnPress,
    actionColor: '#181717',
    reactionColor: '#00A4EF',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with all props', () => {
    renderWithProvider(<ActionReactionItem {...defaultProps} />);

    expect(screen.getByText('GitHub Push')).toBeTruthy();
    expect(screen.getByText('Send Email')).toBeTruthy();
    expect(screen.getByText('Not connected')).toBeTruthy();
  });

  it('displays connected status when isConnected is true', () => {
    renderWithProvider(<ActionReactionItem {...defaultProps} isConnected={true} />);

    expect(screen.getByText('Connected')).toBeTruthy();
    expect(screen.queryByText('Connect')).toBeNull();
  });

  it('displays connect button when not connected', () => {
    renderWithProvider(<ActionReactionItem {...defaultProps} />);

    const connectButton = screen.getByText('Connect');
    expect(connectButton).toBeTruthy();
  });

  it('calls onConnect when connect button is pressed', () => {
    renderWithProvider(<ActionReactionItem {...defaultProps} />);

    const connectButton = screen.getByTestId('connect-button');
    fireEvent.press(connectButton);

    expect(mockOnConnect).toHaveBeenCalledTimes(1);
  });

  it('calls onPress when item is pressed', () => {
    renderWithProvider(<ActionReactionItem {...defaultProps} />);

    const item = screen.getByTestId('action-reaction-item');
    fireEvent.press(item);

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('does not render connect button when isConnected is true', () => {
    renderWithProvider(<ActionReactionItem {...defaultProps} isConnected={true} />);

    expect(screen.queryByTestId('connect-button')).toBeNull();
  });

  it('does not crash when onConnect is not provided', () => {
    const propsWithoutOnConnect = { ...defaultProps };
    delete (propsWithoutOnConnect as any).onConnect;

    renderWithProvider(<ActionReactionItem {...propsWithoutOnConnect} />);

    expect(screen.queryByTestId('connect-button')).toBeNull();
  });

  it('does not crash when onPress is not provided', () => {
    const propsWithoutOnPress = { ...defaultProps };
    delete (propsWithoutOnPress as any).onPress;

    renderWithProvider(<ActionReactionItem {...propsWithoutOnPress} />);

    const item = screen.getByTestId('action-reaction-item');
    expect(() => fireEvent.press(item)).not.toThrow();
  });
});
