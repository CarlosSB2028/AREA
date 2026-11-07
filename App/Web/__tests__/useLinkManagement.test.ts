import { renderHook, act } from '@testing-library/react';
import { useLinkManagement } from '../src/components/ui/areaCreation/hooks/useLinkManagement';
import { ServiceData, ServiceState, ConnectionData } from '../src/types';

// Mock data
const mockServices: ServiceData[] = [
  {
    id: 'service-1',
    logo: 'logo1.png',
    serviceName: 'Service 1',
    event: 'event1',
    cardName: 'Card 1',
    state: ServiceState.Success,
    actionId: 1,
    serviceId: 'service-id-1',
    actionDefinitionId: 'action-def-1',
  },
  {
    id: 'service-2',
    logo: 'logo2.png',
    serviceName: 'Service 2',
    event: 'event2',
    cardName: 'Card 2',
    state: ServiceState.Success,
    actionId: 2,
    serviceId: 'service-id-2',
    actionDefinitionId: 'action-def-2',
  },
  {
    id: 'service-3',
    logo: 'logo3.png',
    serviceName: 'Service 3',
    event: '',
    cardName: 'Card 3',
    state: ServiceState.Configuration,
    actionId: 3,
    serviceId: 'service-id-3',
    // Missing actionDefinitionId and event - not configured
  },
];

const mockOnCreateConnection = jest.fn();

describe('useLinkManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default linking state', () => {
    const { result } = renderHook(() =>
      useLinkManagement(mockServices, mockOnCreateConnection)
    );

    expect(result.current.linkingState).toEqual({
      isLinking: false,
      sourceId: null,
      targetId: null,
    });
    expect(result.current.linkModalOpened).toBe(false);
    expect(result.current.tempConnection).toBe(null);
    expect(result.current.canStartLinking).toBe(true); // 2 configured services
  });

  it('should check if service is configured correctly', () => {
    const { result } = renderHook(() =>
      useLinkManagement(mockServices, mockOnCreateConnection)
    );

    expect(result.current.isServiceConfigured('service-1')).toBe(true); // Success state
    expect(result.current.isServiceConfigured('service-2')).toBe(true); // Success state
    expect(result.current.isServiceConfigured('service-3')).toBe(false); // Configuration state, missing fields
    expect(result.current.isServiceConfigured('non-existent')).toBe(false);
  });

  it('should not handle service click when not in linking mode', () => {
    const { result } = renderHook(() =>
      useLinkManagement(mockServices, mockOnCreateConnection)
    );

    act(() => {
      result.current.handleServiceClick('service-1');
    });

    expect(result.current.linkingState.sourceId).toBe(null);
    expect(result.current.linkModalOpened).toBe(false);
  });

  it('should set source service on first click during linking', () => {
    const { result } = renderHook(() =>
      useLinkManagement(mockServices, mockOnCreateConnection)
    );

    act(() => {
      result.current.startLinking();
    });

    act(() => {
      result.current.handleServiceClick('service-1');
    });

    expect(result.current.linkingState).toEqual({
      isLinking: true,
      sourceId: 'service-1',
      targetId: null,
    });
    expect(result.current.linkModalOpened).toBe(false);
  });

  it('should not set unconfigured service as source', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    const { result } = renderHook(() =>
      useLinkManagement(mockServices, mockOnCreateConnection)
    );

    act(() => {
      result.current.startLinking();
    });

    act(() => {
      result.current.handleServiceClick('service-3'); // Not configured
    });

    expect(result.current.linkingState.sourceId).toBe(null);
    expect(consoleWarnSpy).toHaveBeenCalledWith('Cannot create link: Service is not properly configured');

    consoleWarnSpy.mockRestore();
  });

  it('should create connection on second click during linking', () => {
    const { result } = renderHook(() =>
      useLinkManagement(mockServices, mockOnCreateConnection)
    );

    act(() => {
      result.current.startLinking();
    });

    act(() => {
      result.current.handleServiceClick('service-1'); // Source
    });

    act(() => {
      result.current.handleServiceClick('service-2'); // Target
    });

    expect(result.current.linkingState).toEqual({
      isLinking: true,
      sourceId: 'service-1',
      targetId: 'service-2',
    });
    expect(result.current.linkModalOpened).toBe(true);
    expect(result.current.tempConnection).toEqual({
      id: expect.stringContaining('link-'),
      sourceId: 'service-1',
      targetId: 'service-2',
      linkData: {
        type: 'chain',
        mapping: {},
        condition: {},
        order: 0,
      },
    });
  });

  it('should not create connection to same service', () => {
    const { result } = renderHook(() =>
      useLinkManagement(mockServices, mockOnCreateConnection)
    );

    act(() => {
      result.current.startLinking();
    });

    act(() => {
      result.current.handleServiceClick('service-1'); // Source
    });

    act(() => {
      result.current.handleServiceClick('service-1'); // Same service
    });

    expect(result.current.linkingState.targetId).toBe(null);
    expect(result.current.linkModalOpened).toBe(false);
    expect(result.current.tempConnection).toBe(null);
  });

  it('should not create connection with unconfigured target', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    const { result } = renderHook(() =>
      useLinkManagement(mockServices, mockOnCreateConnection)
    );

    act(() => {
      result.current.startLinking();
    });

    act(() => {
      result.current.handleServiceClick('service-1'); // Source
    });

    act(() => {
      result.current.handleServiceClick('service-3'); // Unconfigured target
    });

    expect(result.current.linkingState.targetId).toBe(null);
    expect(result.current.linkModalOpened).toBe(false);
    expect(result.current.tempConnection).toBe(null);
    expect(consoleWarnSpy).toHaveBeenCalledWith('Cannot create link: Service is not properly configured');

    consoleWarnSpy.mockRestore();
  });

  it('should start linking when there are enough configured services', () => {
    const { result } = renderHook(() =>
      useLinkManagement(mockServices, mockOnCreateConnection)
    );

    act(() => {
      result.current.startLinking();
    });

    expect(result.current.linkingState.isLinking).toBe(true);
  });

  it('should not start linking when there are not enough configured services', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    const servicesWithOneConfigured = [
      mockServices[0], // This one is configured (Success state)
      {
        ...mockServices[1],
        state: ServiceState.Configuration,
        actionDefinitionId: undefined,
        event: '',
      }, // This one is not configured
    ];

    const { result } = renderHook(() =>
      useLinkManagement(servicesWithOneConfigured, mockOnCreateConnection)
    );

    act(() => {
      result.current.startLinking();
    });

    expect(result.current.linkingState.isLinking).toBe(false);
    expect(consoleWarnSpy).toHaveBeenCalledWith('Cannot start linking: Need at least 2 configured services');

    consoleWarnSpy.mockRestore();
  });

  it('should cancel linking', () => {
    const { result } = renderHook(() =>
      useLinkManagement(mockServices, mockOnCreateConnection)
    );

    act(() => {
      result.current.startLinking();
    });

    act(() => {
      result.current.handleServiceClick('service-1');
    });

    expect(result.current.linkingState.isLinking).toBe(true);

    act(() => {
      result.current.cancelLinking();
    });

    expect(result.current.linkingState).toEqual({
      isLinking: false,
      sourceId: null,
      targetId: null,
    });
  });

  it('should confirm link and create connection', () => {
    const { result } = renderHook(() =>
      useLinkManagement(mockServices, mockOnCreateConnection)
    );

    act(() => {
      result.current.startLinking();
    });

    act(() => {
      result.current.handleServiceClick('service-1');
    });

    act(() => {
      result.current.handleServiceClick('service-2');
    });

    expect(result.current.tempConnection).not.toBe(null);

    act(() => {
      result.current.confirmLink();
    });

    expect(mockOnCreateConnection).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceId: 'service-1',
        targetId: 'service-2',
        linkData: {
          type: 'chain',
          mapping: {},
          condition: {},
          order: 0,
        },
      })
    );

    expect(result.current.linkingState).toEqual({
      isLinking: false,
      sourceId: null,
      targetId: null,
    });
    expect(result.current.linkModalOpened).toBe(false);
    expect(result.current.tempConnection).toBe(null);
  });

  it('should not confirm link when tempConnection is incomplete', () => {
    const { result } = renderHook(() =>
      useLinkManagement(mockServices, mockOnCreateConnection)
    );

    act(() => {
      result.current.setTempConnection({ sourceId: 'service-1' }); // Incomplete
    });

    act(() => {
      result.current.confirmLink();
    });

    expect(mockOnCreateConnection).not.toHaveBeenCalled();
  });

  it('should determine if linking can start based on configured services', () => {
    const { result } = renderHook(() =>
      useLinkManagement(mockServices, mockOnCreateConnection)
    );

    expect(result.current.canStartLinking).toBe(true); // 2 configured services

    const servicesWithOneConfigured = [mockServices[0]]; // Only 1 configured service
    const { result: result2 } = renderHook(() =>
      useLinkManagement(servicesWithOneConfigured, mockOnCreateConnection)
    );

    expect(result2.current.canStartLinking).toBe(false);
  });

  it('should allow setting link modal opened state', () => {
    const { result } = renderHook(() =>
      useLinkManagement(mockServices, mockOnCreateConnection)
    );

    expect(result.current.linkModalOpened).toBe(false);

    act(() => {
      result.current.setLinkModalOpened(true);
    });

    expect(result.current.linkModalOpened).toBe(true);
  });

  it('should allow setting temp connection', () => {
    const { result } = renderHook(() =>
      useLinkManagement(mockServices, mockOnCreateConnection)
    );

    const testConnection: Partial<ConnectionData> = {
      id: 'test-connection',
      sourceId: 'service-1',
      targetId: 'service-2',
    };

    act(() => {
      result.current.setTempConnection(testConnection);
    });

    expect(result.current.tempConnection).toEqual(testConnection);
  });
});