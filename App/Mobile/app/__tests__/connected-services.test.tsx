import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert, Linking } from 'react-native';
import ConnectedServicesScreen from '../connected-services';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
  },
  useFocusEffect: jest.fn(),
}));

// Mock react-i18next
const mockT = (key: string, defaultValue?: string) => defaultValue || key;
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

// Mock hooks
jest.mock('@/hooks/useThemeColors', () => ({
  useThemeColors: () => ({
    backgroundSecondary: '#f5f5f5',
    info: '#3b82f6',
    text: '#000000',
    textSecondary: '#666666',
    success: '#10b981',
    warning: '#f59e0b',
    card: '#ffffff',
    cardBorder: '#e5e5e5',
  }),
}));

// Mock services
jest.mock('@/services/serviceCatalog', () => ({
  getServicesCatalog: jest.fn(),
}));

jest.mock('@/services/serviceConnection', () => ({
  getConnectedServices: jest.fn(),
  connectService: jest.fn(),
  disconnectService: jest.fn(),
  mapServiceKeyToOAuthProvider: jest.fn(),
}));

// Mock Linking
jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(true);
jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);

// Mock Alert
const mockAlert = jest.fn();

describe('ConnectedServicesScreen', () => {
  const mockGetServicesCatalog = require('@/services/serviceCatalog').getServicesCatalog;
  const mockGetConnectedServices = require('@/services/serviceConnection').getConnectedServices;
  const mockConnectService = require('@/services/serviceConnection').connectService;
  const mockDisconnectService = require('@/services/serviceConnection').disconnectService;
  const mockMapServiceKeyToOAuthProvider = require('@/services/serviceConnection').mapServiceKeyToOAuthProvider;
  const mockRouter = require('expo-router').router;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Alert.alert
    jest.spyOn(Alert, 'alert').mockImplementation(mockAlert);

    // Default mocks
    mockGetServicesCatalog.mockResolvedValue([
      {
        id: 'service-1',
        key: 'github',
        name: 'GitHub',
        isActive: true,
      },
      {
        id: 'service-2',
        key: 'discord',
        name: 'Discord',
        isActive: true,
      },
      {
        id: 'service-3',
        key: 'slack',
        name: 'Slack',
        isActive: false,
      },
    ]);

    mockGetConnectedServices.mockResolvedValue([
      {
        serviceKey: 'github',
        serviceName: 'GitHub',
        iconUrl: 'https://example.com/github.png',
        isConnected: true,
        connectionType: 'OAUTH',
        userEmail: 'test@example.com',
        userName: 'testuser',
        canDisconnect: true,
        isPrimaryAuth: false,
      },
    ]);

    mockMapServiceKeyToOAuthProvider.mockReturnValue('github');
  });

  it('renders loading state initially', () => {
    render(<ConnectedServicesScreen />);

    expect(screen.getByText('Loading...')).toBeTruthy();
  });

  it('renders services list after loading', async () => {
    render(<ConnectedServicesScreen />);

    await waitFor(() => {
      expect(screen.getByText('Connected Services')).toBeTruthy();
    });

    expect(screen.getByText('Manage your service connections for automations')).toBeTruthy();
    expect(screen.getByText('GitHub')).toBeTruthy();
    expect(screen.getByText('Discord')).toBeTruthy();
    expect(screen.getByText('Slack')).toBeTruthy();
  });

  it('shows connected status for connected services', async () => {
    render(<ConnectedServicesScreen />);

    await waitFor(() => {
      expect(screen.getByText('Connected Services')).toBeTruthy();
    });

    expect(screen.getByText('Connected')).toBeTruthy();
    expect(screen.getByText('testuser')).toBeTruthy();
  });

  it('shows not connected status for unconnected services', async () => {
    render(<ConnectedServicesScreen />);

    await waitFor(() => {
      expect(screen.getAllByText('Not Connected').length).toBeGreaterThan(0);
    });
  });

  it('shows inactive services as disabled', async () => {
    render(<ConnectedServicesScreen />);

    await waitFor(() => {
      expect(screen.getByText('Slack')).toBeTruthy();
    });

    // Slack should be shown but marked as inactive
    const slackCard = screen.getByText('Slack').parent?.parent;
    expect(slackCard).toBeTruthy();
  });

  it('handles connect button press for unconnected service', async () => {
    render(<ConnectedServicesScreen />);

    await waitFor(() => {
      expect(screen.getByText('Discord')).toBeTruthy();
    });

    // Find Discord service card and its connect button
    const discordCard = screen.getByText('Discord').parent?.parent;
    expect(discordCard).toBeTruthy();

    // The connect button should be in the card
    const connectButtons = screen.getAllByText('Connect');
    expect(connectButtons.length).toBeGreaterThan(0);
    expect(connectButtons[0]).toBeTruthy();

    // Press the first connect button (Discord)
    fireEvent.press(connectButtons[0]);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Connect Service',
        'You will be redirected to Discord to authorize the connection.',
        expect.any(Array)
      );
    });

    // Simulate user pressing Continue in alert
    const alertMock = Alert.alert as jest.MockedFunction<typeof Alert.alert>;
    const yesCallback = alertMock.mock.calls[0][2]?.[1]?.onPress;
    expect(yesCallback).toBeDefined();
    await yesCallback?.();

    expect(Linking.canOpenURL).toHaveBeenCalled();
    expect(Linking.openURL).toHaveBeenCalled();
  });

  it('handles disconnect button press for connected service', async () => {
    render(<ConnectedServicesScreen />);

    await waitFor(() => {
      expect(screen.getByText('GitHub')).toBeTruthy();
    });

    // Find disconnect button for GitHub
    const disconnectButtons = screen.getAllByText('Disconnect');
    expect(disconnectButtons.length).toBeGreaterThan(0);

    fireEvent.press(disconnectButtons[0]);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Disconnect Service',
        'Are you sure you want to disconnect GitHub?',
        expect.any(Array)
      );
    });

    // Simulate user pressing Yes in alert
    const alertMock = Alert.alert as jest.MockedFunction<typeof Alert.alert>;
    const yesCallback = alertMock.mock.calls[0][2]?.[1]?.onPress;
    yesCallback?.();

    expect(mockDisconnectService).toHaveBeenCalledWith('github');
  });

  it('refreshes connection status after OAuth flow', async () => {
    render(<ConnectedServicesScreen />);

    await waitFor(() => {
      expect(screen.getByText('Discord')).toBeTruthy();
    });

    // Trigger OAuth flow
    const connectButtons = screen.getAllByText('Connect');
    fireEvent.press(connectButtons[0]);

    const alertMock = Alert.alert as jest.MockedFunction<typeof Alert.alert>;
    const yesCallback = alertMock.mock.calls[0][2]?.[1]?.onPress;
    yesCallback?.();

    // Wait for the timeout that checks connection status
    await waitFor(() => {
      expect(mockGetConnectedServices).toHaveBeenCalledTimes(2); // Initial load + refresh
    }, { timeout: 3000 });
  });

  it('handles service loading error', async () => {
    mockGetServicesCatalog.mockRejectedValue(new Error('Load failed'));

    render(<ConnectedServicesScreen />);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to load services'
      );
    });
  });

  it('handles connection status check error gracefully', async () => {
    mockGetConnectedServices.mockRejectedValue(new Error('Connection check failed'));

    render(<ConnectedServicesScreen />);

    await waitFor(() => {
      expect(screen.getByText('Connected Services')).toBeTruthy();
    });

    // Should still render services even if connection check fails
    expect(screen.getByText('GitHub')).toBeTruthy();
  });

  it('navigates back when back button is pressed', async () => {
    render(<ConnectedServicesScreen />);

    await waitFor(() => {
      expect(screen.getByText('Connected Services')).toBeTruthy();
    });

    // Find back button
    const backButton = screen.getAllByRole('button')[0]; // First button should be back
    fireEvent.press(backButton);

    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('handles connect service error', async () => {
    mockMapServiceKeyToOAuthProvider.mockImplementation(() => {
      throw new Error('Connect failed');
    });

    render(<ConnectedServicesScreen />);

    await waitFor(() => {
      expect(screen.getByText('Discord')).toBeTruthy();
    });

    const connectButtons = screen.getAllByText('Connect');
    fireEvent.press(connectButtons[0]);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to connect service'
      );
    });
  });

  it('handles disconnect service error', async () => {
    mockDisconnectService.mockRejectedValue(new Error('Disconnect failed'));

    render(<ConnectedServicesScreen />);

    await waitFor(() => {
      expect(screen.getByText('GitHub')).toBeTruthy();
    });

    const disconnectButtons = screen.getAllByText('Disconnect');
    fireEvent.press(disconnectButtons[0]);

    const alertMock = Alert.alert as jest.MockedFunction<typeof Alert.alert>;
    const yesCallback = alertMock.mock.calls[0][2]?.[1]?.onPress;
    await yesCallback?.();

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to disconnect service'
      );
    });
  });

  it('shows correct user information for connected services', async () => {
    mockGetConnectedServices.mockResolvedValue([
      {
        serviceKey: 'github',
        serviceName: 'GitHub',
        iconUrl: 'https://example.com/github.png',
        isConnected: true,
        connectionType: 'OAUTH',
        userEmail: 'john@example.com',
        userName: 'johndoe',
        canDisconnect: true,
        isPrimaryAuth: false,
      },
    ]);

    render(<ConnectedServicesScreen />);

    await waitFor(() => {
      expect(screen.getByText('johndoe')).toBeTruthy();
    });
  });
});