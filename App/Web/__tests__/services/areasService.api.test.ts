/**
 * areasService API tests with real backend response structures
 * Tests CRUD operations, error handling, and API integration
 */
import axios from '../../src/config/axios';
import * as areasService from '../../src/services/areasService';
import { API_CONFIG } from '../../src/config/api';
import { BackendArea, BackendService, ActionDefinitionResponse, ServiceData, ServiceState } from '../../src/types';

jest.mock('../../src/config/axios');
jest.mock('../../src/services/authService', () => ({
  getCurrentUser: jest.fn().mockResolvedValue({ id: 'user-123', email: 'test@example.com' }),
}));

// Mock USE_MOCK_DATA to force API mode
jest.mock('../../src/config/api', () => {
  const actualApi = jest.requireActual('../../src/config/api');
  return {
    ...actualApi,
    USE_MOCK_DATA: false,
  };
});

const mockAxios = axios as jest.Mocked<typeof axios>;

describe('areasService with real API responses', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAreas - pageable response', () => {
    it('should fetch areas from pageable API response', async () => {
      const mockBackendAreas: BackendArea[] = [
        {
          id: '1',
          name: 'GitHub Monitor',
          description: 'Monitor GitHub activity',
          enabled: true,
          userId: 'user-123',
          userEmail: 'test@example.com',
          actions: [],
          reactions: [],
          createdAt: '2025-01-10T10:00:00Z',
          updatedAt: '2025-01-15T14:30:00Z'
        },
        {
          id: '2',
          name: 'Discord Notifier',
          description: 'Send Discord notifications',
          enabled: false,
          userId: 'user-123',
          userEmail: 'test@example.com',
          actions: [],
          reactions: [],
          createdAt: '2025-01-12T09:00:00Z',
          updatedAt: '2025-01-16T11:20:00Z'
        }
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: {
          content: mockBackendAreas,
          totalElements: 2,
          totalPages: 1,
          size: 20,
          number: 0
        }
      });

      const result = await areasService.getAreas();

      expect(mockAxios.get).toHaveBeenCalledWith(API_CONFIG.endpoints.areas.list);
      expect(result).toEqual(mockBackendAreas);
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('GitHub Monitor');
    });

    it('should handle array response format directly', async () => {
      const mockAreas: BackendArea[] = [
        {
          id: '1',
          name: 'Test Area',
          description: 'Test',
          enabled: true,
          userId: 'user-123',
          userEmail: 'test@example.com',
          actions: [],
          reactions: [],
          createdAt: '2025-01-10T10:00:00Z',
          updatedAt: '2025-01-10T10:00:00Z'
        }
      ];

      mockAxios.get.mockResolvedValueOnce({ data: mockAreas });

      const result = await areasService.getAreas();

      expect(result).toEqual(mockAreas);
    });

    it('should handle empty response', async () => {
      mockAxios.get.mockResolvedValueOnce({ data: [] });

      const result = await areasService.getAreas();

      expect(result).toEqual([]);
    });

    it('should handle 403 Forbidden error', async () => {
      const error = new Error('Forbidden');
      Object.assign(error, { response: { status: 403, data: { message: 'Forbidden' } } });
      mockAxios.get.mockRejectedValueOnce(error);

      await expect(areasService.getAreas()).rejects.toThrow();
      expect(mockAxios.get).toHaveBeenCalled();
    });

    it('should handle network errors', async () => {
      mockAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(areasService.getAreas()).rejects.toThrow('Network error');
    });
  });

  describe('getAreaById', () => {
    it('should fetch single area by id', async () => {
      const mockArea: BackendArea = {
        id: 'area-1',
        name: 'Test Area',
        description: 'Description',
        enabled: true,
        userId: 'user-123',
        userEmail: 'test@example.com',
        actions: [
          {
            id: 'action-1',
            actionDefinitionId: 'def-1',
            name: 'GitHub Push',
            parameters: { repository: 'repo' },
            activationConfig: { type: 'webhook' }
          }
        ],
        reactions: [
          {
            id: 'reaction-1',
            actionDefinitionId: 'def-2',
            name: 'Send Message',
            parameters: { message: 'text' },
            order: 1,
            continue_on_error: false
          }
        ],
        createdAt: '2025-01-10T10:00:00Z',
        updatedAt: '2025-01-15T14:30:00Z'
      };

      mockAxios.get.mockResolvedValueOnce({ data: mockArea });

      const result = await areasService.getAreaById('area-1');

      expect(mockAxios.get).toHaveBeenCalledWith(
        API_CONFIG.endpoints.areas.getById + 'area-1'
      );
      expect(result).toEqual(mockArea);
      expect(result?.actions).toHaveLength(1);
      expect(result?.reactions).toHaveLength(1);
    });
  });

  describe('createArea', () => {
    it('should create new area', async () => {
      const newAreaData = {
        name: 'New Area',
        description: 'New Description'
      };

      const responseArea: BackendArea = {
        id: 'new-area-1',
        ...newAreaData,
        enabled: true,
        userId: 'user-123',
        userEmail: 'test@example.com',
        actions: [],
        reactions: [],
        createdAt: '2025-01-20T12:00:00Z',
        updatedAt: '2025-01-20T12:00:00Z'
      };

      mockAxios.post.mockResolvedValueOnce({ data: responseArea });

      const result = await areasService.createArea(newAreaData);

      expect(mockAxios.post).toHaveBeenCalledWith(
        API_CONFIG.endpoints.areas.create,
        newAreaData
      );
      expect(result).toEqual(responseArea);
      expect(result.id).toBe('new-area-1');
    });

    it('should handle creation errors', async () => {
      mockAxios.post.mockRejectedValueOnce(new Error('Validation failed'));

      await expect(
        areasService.createArea({ name: '', description: '' })
      ).rejects.toThrow('Validation failed');
    });
  });

  describe('createAreaSimple', () => {
    it('should create area with auto-populated userId', async () => {
      const areaData = {
        name: 'Simple Area',
        description: 'Test'
      };

      const responseArea: BackendArea = {
        id: 'simple-1',
        ...areaData,
        enabled: true,
        userId: 'user-123',
        userEmail: 'test@example.com',
        actions: [],
        reactions: [],
        createdAt: '2025-01-20T12:00:00Z',
        updatedAt: '2025-01-20T12:00:00Z'
      };

      mockAxios.post.mockResolvedValueOnce({ data: responseArea });

      const result = await areasService.createAreaSimple(areaData);

      expect(result).toEqual(responseArea);
      expect(result.userId).toBe('user-123');
    });

    it('should use provided userId if available', async () => {
      const areaData = {
        name: 'Area',
        description: 'Desc',
        userId: 'custom-user'
      };

      mockAxios.post.mockResolvedValueOnce({
        data: { ...areaData, id: '1', enabled: true, userEmail: 'custom@example.com', actions: [], reactions: [], createdAt: '', updatedAt: '' }
      });

      await areasService.createAreaSimple(areaData);

      expect(mockAxios.post).toHaveBeenCalledWith(
        API_CONFIG.endpoints.areas.create,
        expect.objectContaining({ userId: 'custom-user' })
      );
    });
  });

  describe('updateArea', () => {
    it('should update existing area', async () => {
      const updates = { name: 'Updated Name', description: 'Updated Desc' };
      const responseArea: BackendArea = {
        id: 'area-1',
        ...updates,
        enabled: true,
        userId: 'user-123',
        userEmail: 'test@example.com',
        actions: [],
        reactions: [],
        createdAt: '2025-01-10T10:00:00Z',
        updatedAt: '2025-01-20T15:00:00Z'
      };

      mockAxios.put.mockResolvedValueOnce({ data: responseArea });

      const result = await areasService.updateArea('area-1', updates);

      expect(mockAxios.put).toHaveBeenCalledWith(
        API_CONFIG.endpoints.areas.update + 'area-1',
        updates
      );
      expect(result).toEqual(responseArea);
    });
  });

  describe('getServices', () => {
    it('should fetch services catalog', async () => {
      const mockServices: BackendService[] = [
        {
          id: '1',
          key: 'github',
          name: 'GitHub',
          auth: 'OAUTH2',
          isActive: true,
          iconLightUrl: 'https://example.com/github-light.png',
          iconDarkUrl: 'https://example.com/github-dark.png'
        },
        {
          id: '2',
          key: 'discord',
          name: 'Discord',
          auth: 'OAUTH2',
          isActive: true,
          iconLightUrl: 'https://example.com/discord-light.png',
          iconDarkUrl: 'https://example.com/discord-dark.png'
        }
      ];

      mockAxios.get.mockResolvedValueOnce({ data: mockServices });

      const result = await areasService.getServices();

      expect(mockAxios.get).toHaveBeenCalledWith(API_CONFIG.endpoints.services.catalog);
      expect(result).toEqual(mockServices);
      expect(result).toHaveLength(2);
      expect(result[0].key).toBe('github');
    });
  });

  describe('getServiceById', () => {
    it('should fetch service by id', async () => {
      const mockService = {
        id: '1',
        name: 'GitHub',
        logo: 'https://example.com/github.png'
      };

      mockAxios.get.mockResolvedValueOnce({ data: mockService });

      const result = await areasService.getServiceById(1);

      expect(mockAxios.get).toHaveBeenCalledWith(
        API_CONFIG.endpoints.services.getById + 1
      );
      expect(result).toEqual(mockService);
    });
  });

  describe('getActionsByServiceKey', () => {
    it('should fetch actions by service key', async () => {
      const mockActions: ActionDefinitionResponse[] = [
        {
          id: 'action-1',
          serviceId: '1',
          serviceKey: 'github',
          serviceName: 'GitHub',
          key: 'push-event',
          name: 'On Push',
          description: 'Triggered when code is pushed',
          isEventCapable: true,
          isExecutable: false,
          version: 1,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          inputSchema: {
            type: 'object',
            properties: {
              repository: { type: 'string', description: 'Repository name' },
              branch: { type: 'string', description: 'Branch name', default: 'main' }
            },
            required: ['repository']
          }
        }
      ];

      mockAxios.get.mockResolvedValueOnce({ data: mockActions });

      const result = await areasService.getActionsByServiceKey('github');

      expect(mockAxios.get).toHaveBeenCalledWith(
        API_CONFIG.endpoints.services.actions + 'github'
      );
      expect(result).toHaveLength(1);
      expect(result[0].serviceKey).toBe('github');
      expect(result[0].inputSchema?.properties).toBeDefined();
    });

    it('should handle empty actions list', async () => {
      mockAxios.get.mockResolvedValueOnce({ data: [] });

      const result = await areasService.getActionsByServiceKey('unknown-service');

      expect(result).toEqual([]);
    });
  });

  describe('getActionFieldsByServiceAndActionId', () => {
    it('should fetch action fields', async () => {
      const mockFields = [
        { name: 'repo', type: 'string', required: true },
        { name: 'branch', type: 'string', required: false, default: 'main' }
      ];

      mockAxios.get.mockResolvedValueOnce({ data: mockFields });

      const result = await areasService.getActionFieldsByServiceAndActionId(1, 2);

      expect(mockAxios.get).toHaveBeenCalledWith(
        API_CONFIG.endpoints.services.actionFields + '1/actions/2/fields'
      );
      expect(result).toEqual(mockFields);
    });
  });

  describe('getCardByAreaId', () => {
    it('should fetch service cards for area', async () => {
      const mockCards: ServiceData[] = [
        {
          id: 'card-1',
          serviceName: 'GitHub',
          serviceKey: 'github',
          cardName: 'Push Trigger',
          event: 'push',
          state: ServiceState.Success,
          logo: 'https://example.com/github.png',
          actionId: 1,
          serviceId: '1',
          fields: {}
        }
      ];

      mockAxios.get.mockResolvedValueOnce({ data: mockCards });

      const result = await areasService.getCardByAreaId('area-1');

      expect(mockAxios.get).toHaveBeenCalledWith(
        API_CONFIG.endpoints.areas.cards + 'area-1/cards'
      );
      expect(result).toEqual(mockCards);
    });

    it('should return empty array for empty areaId', async () => {
      const result = await areasService.getCardByAreaId('');

      expect(result).toEqual([]);
      expect(mockAxios.get).not.toHaveBeenCalled();
    });
  });

  describe('getActionDefinitionById', () => {
    it('should fetch action definition', async () => {
      const mockDef: ActionDefinitionResponse = {
        id: 'def-1',
        serviceId: '1',
        serviceKey: 'github',
        serviceName: 'GitHub',
        key: 'push',
        name: 'On Push Event',
        description: 'Triggered when code is pushed to repository',
        isEventCapable: true,
        isExecutable: false,
        version: 1,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-15T00:00:00Z',
        inputSchema: {
          type: 'object',
          properties: {
            repository: { type: 'string', description: 'Repository name' }
          },
          required: ['repository']
        }
      };

      mockAxios.get.mockResolvedValueOnce({ data: mockDef });

      const result = await areasService.getActionDefinitionById('def-1');

      expect(mockAxios.get).toHaveBeenCalledWith(
        API_CONFIG.endpoints.actions.actionDefinitions + 'def-1'
      );
      expect(result).toEqual(mockDef);
    });
  });

  describe('getActionFieldsFromActionDefinition', () => {
    it('should extract fields from action input schema', () => {
      const action = {
        id: '1',
        serviceId: '1',
        serviceKey: 'github',
        serviceName: 'GitHub',
        key: 'push',
        name: 'On Push',
        description: 'Test',
        isEventCapable: true,
        isExecutable: false,
        version: 1,
        inputSchema: {
          type: 'object',
          properties: {
            repository: {
              type: 'string',
              description: 'Repository name',
              minLength: 1,
              maxLength: 100
            },
            branch: {
              type: 'string',
              description: 'Branch name',
              default: 'main'
            },
            count: {
              type: 'integer',
              description: 'Number of items',
              minimum: 1,
              maximum: 100
            }
          },
          required: ['repository']
        }
      };

      const fields = areasService.getActionFieldsFromActionDefinition(action);

      expect(fields).toHaveLength(3);
      expect(fields[0].name).toBe('repository');
      expect(fields[0].mandatory).toBe(true);
      expect(fields[0].type).toBe('text');
      expect(fields[0].minLength).toBe(1);

      expect(fields[1].name).toBe('branch');
      expect(fields[1].mandatory).toBe(false);
      expect(fields[1].default).toBe('main');

      expect(fields[2].name).toBe('count');
      expect(fields[2].type).toBe('number');
      expect(fields[2].minimum).toBe(1);
    });

    it('should handle various field types', () => {
      const action = {
        id: '1',
        serviceId: '1',
        serviceKey: 'test',
        serviceName: 'Test',
        key: 'test',
        name: 'Test',
        description: '',
        isEventCapable: false,
        isExecutable: true,
        version: 1,
        inputSchema: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email' },
            birthDate: { type: 'string', format: 'date' },
            meetTime: { type: 'string', format: 'time' },
            createdAt: { type: 'string', format: 'date-time' },
            tags: { type: 'array', items: { type: 'string' } }
          }
        }
      };

      const fields = areasService.getActionFieldsFromActionDefinition(action);

      expect(fields.find(f => f.name === 'email')?.type).toBe('email');
      expect(fields.find(f => f.name === 'birthDate')?.type).toBe('date');
      expect(fields.find(f => f.name === 'meetTime')?.type).toBe('time');
      expect(fields.find(f => f.name === 'createdAt')?.type).toBe('datetime');
      expect(fields.find(f => f.name === 'tags')?.type).toBe('array');
    });

    it('should return empty array when no inputSchema', () => {
      const action = {
        id: '1',
        serviceId: '1',
        serviceKey: 'test',
        serviceName: 'Test',
        key: 'test',
        name: 'Test',
        description: '',
        isEventCapable: false,
        isExecutable: true,
        version: 1
      };

      const fields = areasService.getActionFieldsFromActionDefinition(action);

      expect(fields).toEqual([]);
    });
  });
});
