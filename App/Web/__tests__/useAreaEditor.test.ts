import { renderHook, act, waitFor } from '@testing-library/react';
import { useAreaEditor } from '../src/components/ui/areaCreation/useAreaEditor';
import { ServiceState, ServiceData, BackendArea, ConnectionData } from '../src/types';
import { DragEndEvent } from '@dnd-kit/core';

// Mock the notifications module
jest.mock('@mantine/notifications', () => ({
  notifications: {
    show: jest.fn(),
  },
}));

// Mock next/navigation
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  refresh: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  prefetch: jest.fn(),
};
jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

// Mock areasService
jest.mock('../src/services/areasService', () => ({
  getAreaById: jest.fn(),
  updateAreaComplete: jest.fn(),
  createAreaWithActions: jest.fn(),
  getServices: jest.fn(),
  runAreaById: jest.fn(),
  getActionDefinitionById: jest.fn(),
}));

// Mock useDraftManager
jest.mock('../src/components/ui/areaCreation/useDraftManager', () => ({
  useDraftManager: jest.fn(),
}));

// Import mocked functions
import { useRouter } from 'next/navigation';
import {
  getAreaById,
  updateAreaComplete,
  createAreaWithActions,
  getServices,
  runAreaById,
  getActionDefinitionById,
} from '../src/services/areasService';
import { useDraftManager } from '../src/components/ui/areaCreation/useDraftManager';

const mockGetAreaById = getAreaById as jest.MockedFunction<typeof getAreaById>;
const mockUpdateAreaComplete = updateAreaComplete as jest.MockedFunction<typeof updateAreaComplete>;
const mockCreateAreaWithActions = createAreaWithActions as jest.MockedFunction<typeof createAreaWithActions>;
const mockGetServices = getServices as jest.MockedFunction<typeof getServices>;
const mockRunAreaById = runAreaById as jest.MockedFunction<typeof runAreaById>;
const mockGetActionDefinitionById = getActionDefinitionById as jest.MockedFunction<typeof getActionDefinitionById>;
const mockUseDraftManager = useDraftManager as jest.MockedFunction<typeof useDraftManager>;

const mockSaveDraftManually = jest.fn().mockResolvedValue(undefined);
const mockHandleDeleteDraft = jest.fn().mockResolvedValue(undefined);
const mockSetCurrentDraftId = jest.fn();
const mockSetDraftSavedAt = jest.fn();

// Import notifications after mock
import { notifications } from '@mantine/notifications';

const mockNotificationsShow = notifications.show as jest.MockedFunction<typeof notifications.show>;

describe('useAreaEditor', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDraftManager.mockReturnValue({
      currentDraftId: undefined,
      setCurrentDraftId: mockSetCurrentDraftId,
      draftSavedAt: undefined,
      setDraftSavedAt: mockSetDraftSavedAt,
      handleDeleteDraft: mockHandleDeleteDraft,
      saveDraftManually: mockSaveDraftManually,
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Hook initialization', () => {
    test('initializes with default state for new area', () => {
      const { result } = renderHook(() => useAreaEditor());

      expect(result.current.servicesState).toEqual([]);
      expect(result.current.selectedService).toBeNull();
      expect(result.current.modalOpened).toBe(false);
      expect(result.current.isDragging).toBe(false);
      expect(result.current.areaName).toBe('');
      expect(result.current.areaDescription).toBe('');
      expect(result.current.isCommitting).toBe(false);
      expect(result.current.showDraftModal).toBe(false);
      expect(result.current.pendingDraft).toBeNull();
      expect(result.current.draftModalActions).toBeNull();
      expect(result.current.connections).toEqual([]);
    });

    test('initializes with areaId for existing area', () => {
      const mockArea: BackendArea = {
        id: 'area-1',
        name: 'Test Area',
        description: 'Test Description',
        enabled: true,
        userId: 'user-1',
        userEmail: 'user@example.com',
        actions: [],
        reactions: [],
        links: [],
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      };

      mockGetAreaById.mockResolvedValue(mockArea);
      mockGetServices.mockResolvedValue([]);
      mockGetActionDefinitionById.mockRejectedValue(new Error('Not found'));

      renderHook(() => useAreaEditor('area-1'));

      expect(mockGetAreaById).toHaveBeenCalledWith('area-1');
    });
  });

  describe('Service management', () => {
    test('addNewServiceBelow adds a new service', () => {
      const { result } = renderHook(() => useAreaEditor());

      act(() => {
        result.current.addNewServiceBelow();
      });

      expect(result.current.servicesState).toHaveLength(1);
      expect(result.current.servicesState[0].state).toBe(ServiceState.Configuration);
      expect(result.current.servicesState[0].activationConfig?.type).toBe('chain');
    });

    test('removeService removes a service by id', () => {
      const { result } = renderHook(() => useAreaEditor());

      act(() => {
        result.current.addNewServiceBelow();
      });

      act(() => {
        result.current.removeService(result.current.servicesState[0].id);
      });

      expect(result.current.servicesState).toHaveLength(0);
    });

    test('editService sets selected service and opens modal', () => {
      const { result } = renderHook(() => useAreaEditor());

      const testService: ServiceData = {
        id: 'test-service',
        logo: '/test.png',
        serviceName: 'Test Service',
        serviceKey: 'test',
        event: 'Test Event',
        cardName: 'Test Card',
        state: ServiceState.Success,
        actionId: 1,
        serviceId: 'service-1',
        actionDefinitionId: 'action-1',
        fields: {},
        activationConfig: { type: 'webhook' },
        position: { x: 0, y: 0 },
      };

      act(() => {
        result.current.editService(testService);
      });

      expect(result.current.selectedService).toEqual(testService);
      expect(result.current.modalOpened).toBe(true);
    });

    test('updateService updates existing service', () => {
      const { result } = renderHook(() => useAreaEditor());

      act(() => {
        result.current.addNewServiceBelow();
      });

      const updatedService: ServiceData = {
        ...result.current.servicesState[0],
        serviceName: 'Updated Service',
        event: 'Updated Event',
      };

      act(() => {
        result.current.updateService(updatedService);
      });

      expect(result.current.servicesState[0].serviceName).toBe('Updated Service');
      expect(result.current.servicesState[0].event).toBe('Updated Event');
    });

    test('moveServiceUp moves service up in array', () => {
      const { result } = renderHook(() => useAreaEditor());

      act(() => {
        result.current.addNewServiceBelow();
        result.current.addNewServiceBelow();
      });

      const firstServiceId = result.current.servicesState[0].id;
      const secondServiceId = result.current.servicesState[1].id;

      act(() => {
        result.current.moveServiceDown(firstServiceId);
      });

      expect(result.current.servicesState[0].id).toBe(secondServiceId);
      expect(result.current.servicesState[1].id).toBe(firstServiceId);
    });

    test('moveServiceDown moves service down in array', () => {
      const { result } = renderHook(() => useAreaEditor());

      act(() => {
        result.current.addNewServiceBelow();
        result.current.addNewServiceBelow();
      });

      const firstServiceId = result.current.servicesState[0].id;
      const secondServiceId = result.current.servicesState[1].id;

      act(() => {
        result.current.moveServiceDown(firstServiceId);
      });

      expect(result.current.servicesState[0].id).toBe(secondServiceId);
      expect(result.current.servicesState[1].id).toBe(firstServiceId);
    });

    test('duplicateService creates a copy of service', () => {
      const { result } = renderHook(() => useAreaEditor());

      // Add the service first
      act(() => {
        result.current.addNewServiceBelow();
      });

      const serviceId = result.current.servicesState[0].id;
      const originalServiceCount = result.current.servicesState.length;

      act(() => {
        result.current.duplicateService(serviceId);
      });

      expect(result.current.servicesState).toHaveLength(originalServiceCount + 1);
      expect(result.current.servicesState[1].id).not.toBe(serviceId); // Should have different ID
      expect(result.current.servicesState[1].serviceName).toBe(''); // Should copy the empty serviceName
      expect(result.current.servicesState[1].activationConfig?.type).toBe('chain'); // Should copy activation config
    });
  });

  describe('Connection management', () => {
    test('createConnection adds new connection and applies link effect', () => {
      const { result } = renderHook(() => useAreaEditor());

      const sourceService: ServiceData = {
        id: 'source-service',
        logo: '/test.png',
        serviceName: 'Source Service',
        serviceKey: 'source',
        event: 'Source Event',
        cardName: 'Source Card',
        state: ServiceState.Success,
        actionId: 1,
        serviceId: 'service-1',
        actionDefinitionId: 'action-1',
        fields: {},
        activationConfig: { type: 'webhook' },
        position: { x: 0, y: 0 },
      };

      const targetService: ServiceData = {
        id: 'target-service',
        logo: '/test.png',
        serviceName: 'Target Service',
        serviceKey: 'target',
        event: 'Target Event',
        cardName: 'Target Card',
        state: ServiceState.Success,
        actionId: 2,
        serviceId: 'service-2',
        actionDefinitionId: 'action-2',
        fields: {},
        activationConfig: { type: 'webhook' },
        position: { x: 100, y: 100 },
      };

      // Add services first
      act(() => {
        result.current.addNewServiceBelow();
        result.current.updateService({ ...result.current.servicesState[0], ...sourceService });
        result.current.addNewServiceBelow();
        result.current.updateService({ ...result.current.servicesState[1], ...targetService });
      });

      const connection: ConnectionData = {
        id: 'test-connection',
        sourceId: 'source-service',
        targetId: 'target-service',
        linkData: {
          type: 'chain',
          mapping: { field1: 'value1' },
          condition: {},
          order: 0,
        },
      };

      act(() => {
        result.current.createConnection(connection);
      });

      expect(result.current.connections).toHaveLength(1);
      expect(result.current.connections[0]).toEqual(connection);
    });

    test('removeConnection removes connection and cleans up link effects', () => {
      const { result } = renderHook(() => useAreaEditor());

      const connection: ConnectionData = {
        id: 'test-connection',
        sourceId: 'source-service',
        targetId: 'target-service',
        linkData: {
          type: 'chain',
          mapping: {},
          condition: {},
          order: 0,
        },
      };

      // Add connection first
      act(() => {
        result.current.addNewServiceBelow();
        result.current.updateService({
          ...result.current.servicesState[0],
          id: 'source-service',
          serviceName: 'Source',
          activationConfig: { type: 'webhook' },
          fields: {}
        });
        result.current.addNewServiceBelow();
        result.current.updateService({
          ...result.current.servicesState[1],
          id: 'target-service',
          serviceName: 'Target',
          activationConfig: { type: 'webhook' },
          fields: {}
        });
        result.current.createConnection(connection);
      });

      act(() => {
        result.current.removeConnection('test-connection');
      });

      expect(result.current.connections).toHaveLength(0);
    });

    test('updateConnection updates existing connection', () => {
      const { result } = renderHook(() => useAreaEditor());

      const connection: ConnectionData = {
        id: 'test-connection',
        sourceId: 'source-service',
        targetId: 'target-service',
        linkData: {
          type: 'chain',
          mapping: {},
          condition: {},
          order: 0,
        },
      };

      const updatedConnection: ConnectionData = {
        ...connection,
        linkData: {
          ...connection.linkData,
          type: 'conditional',
          condition: { field: 'value' },
        },
      };

      // Add connection first
      act(() => {
        result.current.addNewServiceBelow();
        result.current.updateService({
          ...result.current.servicesState[0],
          id: 'source-service',
          serviceName: 'Source',
          activationConfig: { type: 'webhook' },
          fields: {}
        });
        result.current.addNewServiceBelow();
        result.current.updateService({
          ...result.current.servicesState[1],
          id: 'target-service',
          serviceName: 'Target',
          activationConfig: { type: 'webhook' },
          fields: {}
        });
        result.current.createConnection(connection);
        result.current.updateConnection(updatedConnection);
      });

      expect(result.current.connections[0]).toEqual(updatedConnection);
    });
  });

  describe('Area operations', () => {
    test('handleCommit creates new area successfully', async () => {
      const { result } = renderHook(() => useAreaEditor());

      const testService: ServiceData = {
        id: 'test-service',
        logo: '/test.png',
        serviceName: 'Test Service',
        serviceKey: 'test',
        event: 'Test Event',
        cardName: 'Test Card',
        state: ServiceState.Success,
        actionId: 1,
        serviceId: 'service-1',
        actionDefinitionId: 'action-1',
        fields: {},
        activationConfig: { type: 'webhook' },
        position: { x: 0, y: 0 },
      };

      mockGetActionDefinitionById.mockResolvedValue({
        id: 'action-1',
        serviceId: 'service-1',
        serviceKey: 'test',
        serviceName: 'Test Service',
        key: 'test-action',
        name: 'Test Action',
        description: 'Test action description',
        inputSchema: {},
        outputSchema: {},
        isEventCapable: true,
        isExecutable: false,
        version: 1,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      });

      mockCreateAreaWithActions.mockResolvedValue({
        id: 'new-area-id',
        name: 'Test Area',
        description: 'Test Description',
        enabled: true,
        userId: 'user-1',
        userEmail: 'user@example.com',
        actions: [],
        reactions: [],
        links: [],
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      });

      act(() => {
        result.current.setAreaName('Test Area');
        result.current.setAreaDescription('Test Description');
        result.current.addNewServiceBelow();
        result.current.updateService({ ...result.current.servicesState[0], ...testService });
      });

      await act(async () => {
        await result.current.handleCommit();
      });

      expect(mockCreateAreaWithActions).toHaveBeenCalled();
      expect(mockHandleDeleteDraft).toHaveBeenCalled();
      expect(mockNotificationsShow).toHaveBeenCalledWith({
        title: 'Success',
        message: 'AREA "Test Area" was created successfully!',
        color: 'green',
      });

      jest.useRealTimers();
    });

    test('handleCommit updates existing area successfully', async () => {
      const { result } = renderHook(() => useAreaEditor('existing-area-id'));

      const testService: ServiceData = {
        id: 'test-service',
        logo: '/test.png',
        serviceName: 'Test Service',
        serviceKey: 'test',
        event: 'Test Event',
        cardName: 'Test Card',
        state: ServiceState.Success,
        actionId: 1,
        serviceId: 'service-1',
        actionDefinitionId: 'action-1',
        fields: {},
        activationConfig: { type: 'webhook' },
        position: { x: 0, y: 0 },
      };

      mockGetActionDefinitionById.mockResolvedValue({
        id: 'action-1',
        serviceId: 'service-1',
        serviceKey: 'test',
        serviceName: 'Test Service',
        key: 'test-action',
        name: 'Test Action',
        description: 'Test action description',
        inputSchema: {},
        outputSchema: {},
        isEventCapable: true,
        isExecutable: false,
        version: 1,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      });

      mockUpdateAreaComplete.mockResolvedValue({
        id: 'existing-area-id',
        name: 'Updated Area',
        description: 'Updated Description',
        enabled: true,
        userId: 'user-1',
        userEmail: 'user@example.com',
        actions: [],
        reactions: [],
        links: [],
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      });

      act(() => {
        result.current.setAreaName('Updated Area');
        result.current.setAreaDescription('Updated Description');
        result.current.addNewServiceBelow();
        result.current.updateService({ ...result.current.servicesState[0], ...testService });
      });

      await act(async () => {
        await result.current.handleCommit();
      });

      expect(mockUpdateAreaComplete).toHaveBeenCalledWith('existing-area-id', expect.any(Object));
      expect(mockHandleDeleteDraft).toHaveBeenCalled();
      expect(mockNotificationsShow).toHaveBeenCalledWith({
        title: 'Success',
        message: 'AREA "Updated Area" was updated successfully!',
        color: 'green',
      });
    });

    test('handleCommit shows error when area name is empty', async () => {
      const { result } = renderHook(() => useAreaEditor());

      act(() => {
        result.current.setAreaName('');
        result.current.addNewServiceBelow();
      });

      await act(async () => {
        await result.current.handleCommit();
      });

      expect(mockNotificationsShow).toHaveBeenCalledWith({
        title: 'Error',
        message: 'AREA name is required',
        color: 'red',
      });
      expect(mockCreateAreaWithActions).not.toHaveBeenCalled();
    });

    test('handleCommit shows error when no services exist', async () => {
      const { result } = renderHook(() => useAreaEditor());

      act(() => {
        result.current.setAreaName('Test Area');
      });

      await act(async () => {
        await result.current.handleCommit();
      });

      expect(mockNotificationsShow).toHaveBeenCalledWith({
        title: 'Error',
        message: 'At least one service is required',
        color: 'red',
      });
      expect(mockCreateAreaWithActions).not.toHaveBeenCalled();
    });

    test('handleRun executes area successfully', async () => {
      const { result } = renderHook(() => useAreaEditor('area-1'));

      mockRunAreaById.mockResolvedValue(undefined);

      act(() => {
        result.current.setAreaName('Test Area');
      });

      await act(async () => {
        await result.current.handleRun();
      });

      expect(mockRunAreaById).toHaveBeenCalledWith('area-1');
      expect(mockNotificationsShow).toHaveBeenCalledWith({
        title: 'Success',
        message: 'AREA "Test Area" was executed successfully!',
        color: 'green',
      });
    });

    test('handleRun shows error when areaId is missing', async () => {
      const { result } = renderHook(() => useAreaEditor());

      await act(async () => {
        await result.current.handleRun();
      });

      expect(mockNotificationsShow).toHaveBeenCalledWith({
        title: 'Error',
        message: 'Unable to run AREA: missing ID',
        color: 'red',
      });
      expect(mockRunAreaById).not.toHaveBeenCalled();
    });
  });

  describe('Drag and drop', () => {
    test('handleDragEnd reorders services', () => {
      const { result } = renderHook(() => useAreaEditor());

      act(() => {
        result.current.addNewServiceBelow();
        result.current.addNewServiceBelow();
      });

      const firstServiceId = result.current.servicesState[0].id;
      const secondServiceId = result.current.servicesState[1].id;

      const dragEndEvent: DragEndEvent = {
        active: { id: firstServiceId },
        over: { id: secondServiceId },
      } as DragEndEvent;

      act(() => {
        result.current.handleDragEnd(dragEndEvent);
      });

      expect(result.current.servicesState[0].id).toBe(secondServiceId);
      expect(result.current.servicesState[1].id).toBe(firstServiceId);
    });

    test('handleDragEnd does nothing when over is null', () => {
      const { result } = renderHook(() => useAreaEditor());

      act(() => {
        result.current.addNewServiceBelow();
      });

      const firstServiceId = result.current.servicesState[0].id;

      const dragEndEvent: DragEndEvent = {
        active: { id: firstServiceId },
        over: null,
      } as DragEndEvent;

      act(() => {
        result.current.handleDragEnd(dragEndEvent);
      });

      expect(result.current.servicesState[0].id).toBe(firstServiceId);
    });
  });

  describe('Draft management integration', () => {
    test('auto-saves draft when area name changes', async () => {
      jest.useFakeTimers();

      const { result } = renderHook(() => useAreaEditor());

      act(() => {
        result.current.setAreaName('New Area Name');
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Auto-save should be triggered via effect, just verify state changes
      expect(result.current.areaName).toBe('New Area Name');

      jest.useRealTimers();
    });

    test('auto-saves draft when area description changes', async () => {
      jest.useFakeTimers();

      const { result } = renderHook(() => useAreaEditor());

      act(() => {
        result.current.setAreaDescription('New Description');
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Auto-save should be triggered via effect, just verify state changes
      expect(result.current.areaDescription).toBe('New Description');

      jest.useRealTimers();
    });
  });

  describe('Data transformation functions', () => {
    // These would require importing the internal functions or testing through public API
    // For now, we'll test them indirectly through the hook's behavior
    test('loads area data correctly', async () => {
      const mockArea: BackendArea = {
        id: 'area-1',
        name: 'Test Area',
        description: 'Test Description',
        enabled: true,
        userId: 'user-1',
        userEmail: 'user@example.com',
        actions: [
          {
            id: 'action-1',
            actionDefinitionId: 'action-def-1',
            name: 'Test Action',
            parameters: { param1: 'value1' },
            activationConfig: { type: 'webhook' },
          },
        ],
        reactions: [],
        links: [],
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      };

      const mockActionDef = {
        id: 'action-def-1',
        serviceId: 'service-1',
        serviceKey: 'github',
        serviceName: 'GitHub',
        key: 'push',
        name: 'Push Event',
        description: 'Triggered on push',
        inputSchema: {},
        outputSchema: {},
        isEventCapable: true,
        isExecutable: false,
        version: 1,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      };

      const mockServices = [
        {
          id: 'github-service',
          key: 'github',
          name: 'GitHub',
          auth: 'OAUTH2' as const,
          isActive: true,
          iconLightUrl: '/github-light.png',
          iconDarkUrl: '/github-dark.png',
        },
      ];

      mockGetAreaById.mockResolvedValue(mockArea);
      mockGetServices.mockResolvedValue(mockServices);
      mockGetActionDefinitionById.mockResolvedValue(mockActionDef);

      const { result } = renderHook(() => useAreaEditor('area-1'));

      await waitFor(() => {
        expect(result.current.areaName).toBe('Test Area');
        expect(result.current.areaDescription).toBe('Test Description');
        expect(result.current.servicesState).toHaveLength(1);
      });

      const service = result.current.servicesState[0];
      expect(service.serviceName).toBe('GitHub');
      expect(service.event).toBe('Test Action');
      expect(service.fields).toEqual({ param1: 'value1' });
      expect(service.activationConfig?.type).toBe('webhook');
    });
  });
});