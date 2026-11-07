import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import ServiceSelectorScreen from '../service-selector';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: jest.fn(),
    push: jest.fn(),
  }),
  useLocalSearchParams: jest.fn(() => ({
    type: 'action',
  })),
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
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
    border: '#e5e5e5',
  }),
}));

// Mock services
jest.mock('@/services/serviceCatalog', () => ({
  getServicesCatalog: jest.fn(),
  getServiceEvents: jest.fn(),
  getServiceReactions: jest.fn(),
}));

describe('ServiceSelectorScreen', () => {
  const mockGetServicesCatalog = require('@/services/serviceCatalog').getServicesCatalog;
  const mockGetServiceEvents = require('@/services/serviceCatalog').getServiceEvents;
  const mockGetServiceReactions = require('@/services/serviceCatalog').getServiceReactions;
  const mockUseLocalSearchParams = require('expo-router').useLocalSearchParams;
  const mockRouter = require('expo-router').useRouter();

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset the mock to default
    mockUseLocalSearchParams.mockReturnValue({
      type: 'action',
    });

    // Default mocks
    mockGetServicesCatalog.mockResolvedValue([
      {
        id: 'service-1',
        key: 'github',
        name: 'GitHub',
        isActive: true,
        description: 'Version control and collaboration',
        auth: 'OAuth',
      },
      {
        id: 'service-2',
        key: 'discord',
        name: 'Discord',
        isActive: true,
        description: 'Communication platform',
        auth: 'OAuth',
      },
      {
        id: 'service-3',
        key: 'slack',
        name: 'Slack',
        isActive: false,
        description: 'Team communication',
        auth: 'OAuth',
      },
    ]);

    mockGetServiceEvents.mockImplementation((serviceKey: string) => {
      if (serviceKey === 'github') {
        return Promise.resolve([
          {
            id: 'action-1',
            name: 'Create Issue',
            description: 'Creates a new issue in a repository',
            isEventCapable: true,
            isExecutable: false,
          },
          {
            id: 'action-2',
            name: 'Create Pull Request',
            description: 'Creates a new pull request',
            isEventCapable: true,
            isExecutable: false,
          },
        ]);
      }
      return Promise.resolve([]);
    });

    mockGetServiceReactions.mockImplementation((serviceKey: string) => {
      if (serviceKey === 'discord') {
        return Promise.resolve([
          {
            id: 'reaction-1',
            name: 'Send Message',
            description: 'Sends a message to a channel',
            isEventCapable: false,
            isExecutable: true,
          },
        ]);
      }
      return Promise.resolve([]);
    });
  });

  it('renders loading state initially', () => {
    render(<ServiceSelectorScreen />);

    expect(screen.getByText('Loading...')).toBeTruthy();
  });

  it('renders services list for action type', async () => {
    render(<ServiceSelectorScreen />);

    await waitFor(() => {
      expect(screen.getByText('Select Service')).toBeTruthy();
    });

    expect(screen.getByText('GitHub')).toBeTruthy();
    expect(screen.getByText('Discord')).toBeTruthy();
    expect(screen.getByText('Slack')).toBeTruthy();
  });

  it('renders services list for reaction type', async () => {
    mockUseLocalSearchParams.mockReturnValue({
      type: 'reaction',
    });

    render(<ServiceSelectorScreen />);

    await waitFor(() => {
      expect(screen.getByText('Select Service')).toBeTruthy();
    });
  });

  it('shows inactive services', async () => {
    render(<ServiceSelectorScreen />);

    await waitFor(() => {
      expect(screen.getByText('GitHub')).toBeTruthy();
    });

    // Slack should be shown but marked as inactive
    expect(screen.getByText('Slack')).toBeTruthy();
    expect(screen.getByText('Inactive')).toBeTruthy();
  });

  it('navigates to action selector when service is selected for action', async () => {
    render(<ServiceSelectorScreen />);

    await waitFor(() => {
      expect(screen.getByText('GitHub')).toBeTruthy();
    });

    const githubCard = screen.getByText('GitHub').parent?.parent?.parent;
    expect(githubCard).toBeTruthy();

    fireEvent.press(githubCard!);

    await waitFor(() => {
      expect(screen.getByText('Create Issue')).toBeTruthy();
    });
  });

  it('navigates to action selector when service is selected for reaction', async () => {
    mockUseLocalSearchParams.mockReturnValue({
      type: 'reaction',
    });

    render(<ServiceSelectorScreen />);

    await waitFor(() => {
      expect(screen.getByText('Discord')).toBeTruthy();
    });

    const discordCard = screen.getByText('Discord').parent?.parent;
    expect(discordCard).toBeTruthy();

    fireEvent.press(discordCard!);

    await waitFor(() => {
      expect(screen.getByText('Send Message')).toBeTruthy();
    });
  });

  it('shows search functionality', async () => {
    render(<ServiceSelectorScreen />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search services...')).toBeTruthy();
    });

    const searchInput = screen.getByPlaceholderText('Search services...');

    // Initially all services should be visible
    expect(screen.getByText('GitHub')).toBeTruthy();
    expect(screen.getByText('Discord')).toBeTruthy();

    // Search for GitHub
    fireEvent.changeText(searchInput, 'GitHub');

    expect(screen.getByText('GitHub')).toBeTruthy();
    expect(screen.queryByText('Discord')).toBeNull();
  });

  it('handles search with no results', async () => {
    render(<ServiceSelectorScreen />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search services...')).toBeTruthy();
    });

    const searchInput = screen.getByPlaceholderText('Search services...');

    // Search for non-existent service
    fireEvent.changeText(searchInput, 'NonExistentService');

    expect(screen.queryByText('GitHub')).toBeNull();
    expect(screen.queryByText('Discord')).toBeNull();
    expect(screen.getByText('No services found')).toBeTruthy();
  });

  // it('navigates back when back button is pressed', async () => {
  //   render(<ServiceSelectorScreen />);

  //   await waitFor(() => {
  //     expect(screen.getByText('Select Service')).toBeTruthy();
  //   });

  //   // Find back button (TouchableOpacity with ArrowLeft)
  //   const backButton = screen.getByTestId('back-button'); // Assuming it has a testID
  //   fireEvent.press(backButton);

  //   expect(mockRouter.back).toHaveBeenCalled();
  // });

  it('handles service loading error', async () => {
    mockGetServicesCatalog.mockRejectedValue(new Error('Load failed'));

    render(<ServiceSelectorScreen />);

    // Should still show loading initially, then complete without services
    await waitFor(() => {
      expect(screen.getByText('Select Service')).toBeTruthy();
    });

    // Should show no services available when loading fails
    expect(screen.getByText('No services found')).toBeTruthy();
  });



  it('displays correct header for action type', async () => {
    render(<ServiceSelectorScreen />);

    await waitFor(() => {
      expect(screen.getByText('Select Service')).toBeTruthy();
    });
  });

  it('displays correct header for reaction type', async () => {
    mockUseLocalSearchParams.mockReturnValue({
      type: 'reaction',
    });

    render(<ServiceSelectorScreen />);

    await waitFor(() => {
      expect(screen.getByText('Select Service')).toBeTruthy();
    });
  });



  it('handles empty service list', async () => {
    mockGetServicesCatalog.mockResolvedValue([]);

    render(<ServiceSelectorScreen />);

    await waitFor(() => {
      expect(screen.getByText('No services found')).toBeTruthy();
    });
  });

  it('shows services even when some have no actions', async () => {
    // Mock services where some have no actions/reactions
    mockGetServicesCatalog.mockResolvedValue([
      {
        id: 'service-1',
        key: 'github',
        name: 'GitHub',
        isActive: true,
        auth: 'OAuth',
      },
      {
        id: 'service-2',
        key: 'empty-service',
        name: 'Empty Service',
        isActive: true,
        auth: 'OAuth',
      },
    ]);

    mockGetServiceEvents.mockResolvedValue([]); // No actions for any service

    render(<ServiceSelectorScreen />);

    await waitFor(() => {
      expect(screen.getByText('GitHub')).toBeTruthy();
      expect(screen.getByText('Empty Service')).toBeTruthy();
    });
  });
});