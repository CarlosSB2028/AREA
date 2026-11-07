import { renderHook, waitFor, act } from '@testing-library/react';
import { useAreaForm } from '../src/hooks/useAreaForm';
import type { BackendService, Action } from '../src/types';
import type { ServiceConnectionStatus } from '../src/services/serviceConnectionService';

// Mock the services modules
jest.mock('../src/services/areasService', () => ({
  getServices: jest.fn(),
  getActionsByServiceKey: jest.fn(),
}));

jest.mock('../src/services/serviceConnectionService', () => ({
  getServiceConnectionStatus: jest.fn(),
}));

// Import the mocked functions
import { getServices, getActionsByServiceKey } from '../src/services/areasService';
import { getServiceConnectionStatus } from '../src/services/serviceConnectionService';

describe('useAreaForm', () => {
  const mockServices: BackendService[] = [
    {
      id: '1',
      key: 'github',
      name: 'GitHub',
      auth: 'OAUTH2',
      isActive: true,
      iconLightUrl: 'github-light.png',
      iconDarkUrl: 'github-dark.png',
    },
    {
      id: '2',
      key: 'slack',
      name: 'Slack',
      auth: 'OAUTH2',
      isActive: true,
      iconLightUrl: 'slack-light.png',
      iconDarkUrl: 'slack-dark.png',
    },
  ];

  const mockConnectionStatus: ServiceConnectionStatus = {
    serviceKey: 'github',
    serviceName: 'GitHub',
    iconUrl: 'github-light.png',
    isConnected: true,
    connectionType: 'OAUTH',
    userEmail: 'user@example.com',
    userName: 'testuser',
  };

  const mockTriggerActions: Action[] = [
    {
      id: '1',
      serviceId: '1',
      serviceKey: 'github',
      serviceName: 'GitHub',
      key: 'new_commit',
      name: 'New Commit',
      description: 'Triggered on new commit',
      isEventCapable: true,
      isExecutable: false,
      version: 1,
    },
    {
      id: '2',
      serviceId: '1',
      serviceKey: 'github',
      serviceName: 'GitHub',
      key: 'pull_request',
      name: 'Pull Request',
      description: 'Triggered on PR',
      isEventCapable: true,
      isExecutable: false,
      version: 1,
    },
  ];

  const mockReactionActions: Action[] = [
    {
      id: '3',
      serviceId: '2',
      serviceKey: 'slack',
      serviceName: 'Slack',
      key: 'post_message',
      name: 'Post Message',
      description: 'Post a message',
      isEventCapable: false,
      isExecutable: true,
      version: 1,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (getServices as jest.Mock).mockResolvedValue(mockServices);
    (getServiceConnectionStatus as jest.Mock).mockResolvedValue(mockConnectionStatus);
    (getActionsByServiceKey as jest.Mock).mockImplementation((serviceKey: string) => {
      if (serviceKey === 'github') {
        return Promise.resolve([...mockTriggerActions, ...mockReactionActions]);
      }
      return Promise.resolve(mockReactionActions);
    });
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAreaForm());

    expect(result.current.services).toEqual([]);
    expect(result.current.serviceConnectionStatuses).toEqual({});
    expect(result.current.actionTriggers).toEqual([]);
    expect(result.current.reactionActions).toEqual([]);
    expect(result.current.loading).toBe(true);
  });

  it('should load services on mount', async () => {
    const { result } = renderHook(() => useAreaForm());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.services).toEqual(mockServices);
    expect(getServices).toHaveBeenCalledTimes(1);
  });

  it('should load service connection statuses', async () => {
    const { result } = renderHook(() => useAreaForm());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.serviceConnectionStatuses).toHaveProperty('github');
    expect(result.current.serviceConnectionStatuses).toHaveProperty('slack');
    expect(getServiceConnectionStatus).toHaveBeenCalledWith('github');
    expect(getServiceConnectionStatus).toHaveBeenCalledWith('slack');
  });

  it('should handle service connection status error gracefully', async () => {
    (getServiceConnectionStatus as jest.Mock).mockRejectedValue(
      new Error('Connection failed')
    );

    const { result } = renderHook(() => useAreaForm());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.serviceConnectionStatuses['github']).toEqual({
      serviceKey: 'github',
      serviceName: 'GitHub',
      iconUrl: 'github-light.png',
      isConnected: false,
      connectionType: 'NONE',
      userEmail: '',
      userName: '',
    });
  });

  it('should load trigger actions for a specific service', async () => {
    const { result } = renderHook(() => useAreaForm());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.loadTriggerActions('github');
    });

    expect(result.current.actionTriggers).toEqual(mockTriggerActions);
    expect(getActionsByServiceKey).toHaveBeenCalledWith('github');
  });

  it('should filter only event-capable actions as triggers', async () => {
    const mixedActions: Action[] = [
      ...mockTriggerActions,
      {
        id: '5',
        serviceId: '1',
        serviceKey: 'github',
        serviceName: 'GitHub',
        key: 'not_event_capable',
        name: 'Not Event Capable',
        description: 'Not a trigger',
        isEventCapable: false,
        isExecutable: true,
        version: 1,
      },
    ];

    (getActionsByServiceKey as jest.Mock).mockResolvedValue(mixedActions);

    const { result } = renderHook(() => useAreaForm());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.loadTriggerActions('github');
    });

    expect(result.current.actionTriggers).toEqual(mockTriggerActions);
    expect(result.current.actionTriggers.every(a => a.isEventCapable)).toBe(true);
  });

  it('should load reaction actions for multiple services', async () => {
    const { result } = renderHook(() => useAreaForm());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.loadReactionActions(['slack', 'github']);
    });

    expect(result.current.reactionActions.length).toBeGreaterThan(0);
    expect(getActionsByServiceKey).toHaveBeenCalledWith('slack');
    expect(getActionsByServiceKey).toHaveBeenCalledWith('github');
  });

  it('should filter only executable actions as reactions', async () => {
    const { result } = renderHook(() => useAreaForm());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.loadReactionActions(['slack']);
    });

    expect(result.current.reactionActions.every(a => a.isExecutable)).toBe(true);
  });

  it('should not duplicate actions when loading reactions', async () => {
    const { result } = renderHook(() => useAreaForm());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.loadReactionActions(['slack']);
    });

    const firstCount = result.current.reactionActions.length;

    await act(async () => {
      await result.current.loadReactionActions(['slack']);
    });

    expect(result.current.reactionActions.length).toBe(firstCount);
  });

  it('should handle errors when loading trigger actions', async () => {
    (getActionsByServiceKey as jest.Mock).mockRejectedValue(
      new Error('Failed to load actions')
    );

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const { result } = renderHook(() => useAreaForm());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await expect(async () => {
      await act(async () => {
        await result.current.loadTriggerActions('github');
      });
    }).rejects.toThrow('Failed to load actions');

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('should handle errors when loading reaction actions for a service', async () => {
    (getActionsByServiceKey as jest.Mock).mockRejectedValue(
      new Error('Failed to load actions')
    );

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const { result } = renderHook(() => useAreaForm());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.loadReactionActions(['slack']);
    });

    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(result.current.reactionActions).toEqual([]);

    consoleErrorSpy.mockRestore();
  });

  it('should refresh connection statuses', async () => {
    const { result } = renderHook(() => useAreaForm());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    jest.clearAllMocks();

    const updatedStatus = {
      ...mockConnectionStatus,
      isConnected: false,
    };
    (getServiceConnectionStatus as jest.Mock).mockResolvedValue(updatedStatus);

    await act(async () => {
      await result.current.refreshConnectionStatuses();
    });

    expect(getServiceConnectionStatus).toHaveBeenCalledWith('github');
    expect(getServiceConnectionStatus).toHaveBeenCalledWith('slack');
  });

  it('should add window focus event listener for refreshing statuses', async () => {
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useAreaForm());

    await waitFor(() => {
      expect(addEventListenerSpy).toHaveBeenCalledWith('focus', expect.any(Function));
    });

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('focus', expect.any(Function));

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it('should not load services multiple times concurrently', async () => {
    const { result, rerender } = renderHook(() => useAreaForm());

    // Trigger multiple rerenders before services are loaded
    rerender();
    rerender();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should only call getServices once despite multiple rerenders
    expect(getServices).toHaveBeenCalledTimes(1);
  });

  it('should not load trigger actions multiple times for the same service concurrently', async () => {
    const { result } = renderHook(() => useAreaForm());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    jest.clearAllMocks();

    // Try to load the same service multiple times
    await act(async () => {
      const promises = [
        result.current.loadTriggerActions('github'),
        result.current.loadTriggerActions('github'),
        result.current.loadTriggerActions('github'),
      ];
      await Promise.all(promises);
    });

    // Should only call once
    expect(getActionsByServiceKey).toHaveBeenCalledTimes(1);
  });

  it('should handle services with missing icon URLs', async () => {
    const servicesWithoutIcons: BackendService[] = [
      {
        id: '1',
        key: 'test-service',
        name: 'Test Service',
        auth: 'NONE',
        isActive: true,
        iconLightUrl: '',
        iconDarkUrl: '',
      },
    ];

    (getServices as jest.Mock).mockResolvedValue(servicesWithoutIcons);
    (getServiceConnectionStatus as jest.Mock).mockRejectedValue(
      new Error('Connection failed')
    );

    const { result } = renderHook(() => useAreaForm());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.serviceConnectionStatuses['test-service']).toEqual({
      serviceKey: 'test-service',
      serviceName: 'Test Service',
      iconUrl: '',
      isConnected: false,
      connectionType: 'NONE',
      userEmail: '',
      userName: '',
    });
  });

  it('should handle error when some services fail to load statuses during refresh', async () => {
    const { result } = renderHook(() => useAreaForm());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Mock one service to fail
    (getServiceConnectionStatus as jest.Mock)
      .mockResolvedValueOnce(mockConnectionStatus)
      .mockRejectedValueOnce(new Error('Status check failed'));

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    await act(async () => {
      await result.current.refreshConnectionStatuses();
    });

    // Should have fallback status for the failed service
    expect(result.current.serviceConnectionStatuses['slack']).toEqual({
      serviceKey: 'slack',
      serviceName: 'Slack',
      iconUrl: 'slack-light.png',
      isConnected: false,
      connectionType: 'NONE',
      userEmail: '',
      userName: '',
    });

    consoleErrorSpy.mockRestore();
  });

  it('should not attempt to refresh connection statuses if no services are loaded', async () => {
    (getServices as jest.Mock).mockResolvedValue([]);

    const { result } = renderHook(() => useAreaForm());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    jest.clearAllMocks();

    await act(async () => {
      await result.current.refreshConnectionStatuses();
    });

    // Should not call getServiceConnectionStatus
    expect(getServiceConnectionStatus).not.toHaveBeenCalled();
  });

  it('should handle partial errors when loading reaction actions', async () => {
    (getActionsByServiceKey as jest.Mock)
      .mockResolvedValueOnce(mockReactionActions) // First service succeeds
      .mockRejectedValueOnce(new Error('Service unavailable')); // Second service fails

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const { result } = renderHook(() => useAreaForm());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.loadReactionActions(['github', 'slack']);
    });

    // Should have reactions from first service
    expect(result.current.reactionActions).toEqual(mockReactionActions);
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
