/**
 * areasService branch coverage tests
 * Focuses on conditional branches and edge cases in areasService
 */
import axios from '../../src/config/axios';
import * as areasService from '../../src/services/areasService';
import { API_CONFIG } from '../../src/config/api';
import { Action, BackendArea, BackendService, ServiceData } from '../../src/types';

jest.mock('../../src/config/axios');
jest.mock('../../src/services/authService', () => ({
  getCurrentUser: jest.fn().mockResolvedValue({ id: 'user-1' })
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

describe('areasService - Branch Coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAreas - Response Handling Branches', () => {
    it('should handle pageable response with content property', async () => {
      const mockAreas = [
        { id: '1', name: 'Area 1', description: 'Desc 1' },
        { id: '2', name: 'Area 2', description: 'Desc 2' }
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { content: mockAreas }
      });

      const result = await areasService.getAreas();

      expect(result).toEqual(mockAreas);
    });

    it('should handle direct array response', async () => {
      const mockAreas = [
        { id: '1', name: 'Area 1' },
        { id: '2', name: 'Area 2' }
      ];

      mockAxios.get.mockResolvedValueOnce({ data: mockAreas });

      const result = await areasService.getAreas();

      expect(result).toEqual(mockAreas);
    });

    it('should handle null response data', async () => {
      mockAxios.get.mockResolvedValueOnce({ data: null });

      const result = await areasService.getAreas();

      expect(result).toEqual([]);
    });

    it('should handle non-array, non-pageable response', async () => {
      mockAxios.get.mockResolvedValueOnce({ data: { some: 'object' } });

      const result = await areasService.getAreas();

      expect(result).toEqual([]);
    });

    it('should handle 403 error with proper warning', async () => {
      const error = new Error('Forbidden');
      (error as unknown as Record<string, unknown>).response = { status: 403 };

      mockAxios.get.mockRejectedValueOnce(error);

      await expect(areasService.getAreas()).rejects.toThrow();
    });

    it('should handle non-403 errors', async () => {
      const error = new Error('Server error');
      (error as unknown as Record<string, unknown>).response = { status: 500 };

      mockAxios.get.mockRejectedValueOnce(error);

      await expect(areasService.getAreas()).rejects.toThrow('Server error');
    });

    it('should handle error without response property', async () => {
      mockAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(areasService.getAreas()).rejects.toThrow('Network error');
    });

    it('should handle error object without response', async () => {
      mockAxios.get.mockRejectedValueOnce({ message: 'Error' });

      await expect(areasService.getAreas()).rejects.toEqual({ message: 'Error' });
    });
  });

  describe('getActionFieldsFromActionDefinition - Field Type Branches', () => {
    it('should return empty array for null inputSchema', () => {
      const action: Action = {
        id: '1',
        serviceId: '1',
        serviceKey: 'test',
        serviceName: 'Test',
        key: 'test-action',
        name: 'Test',
        description: 'Test',
        inputSchema: null,
        isEventCapable: false,
        isExecutable: true,
        version: 1,
        fields: {}
      } as unknown as Action;

      const result = areasService.getActionFieldsFromActionDefinition(action);

      expect(result).toEqual([]);
    });

    it('should return empty array for undefined properties', () => {
      const action: Action = {
        id: '1',
        inputSchema: {
          properties: undefined,
          required: []
        }
      } as unknown as Action;

      const result = areasService.getActionFieldsFromActionDefinition(action);

      expect(result).toEqual([]);
    });

    it('should handle string fields with format: email', () => {
      const action: Action = {
        id: '1',
        inputSchema: {
          properties: {
            email: { type: 'string', format: 'email', description: 'Email field' }
          },
          required: ['email']
        }
      } as unknown as Action;

      const result = areasService.getActionFieldsFromActionDefinition(action);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('email');
      expect(result[0].mandatory).toBe(true);
    });

    it('should handle string fields with format: date-time', () => {
      const action: Action = {
        id: '1',
        inputSchema: {
          properties: {
            timestamp: { type: 'string', format: 'date-time', description: 'Timestamp' }
          }
        }
      } as unknown as Action;

      const result = areasService.getActionFieldsFromActionDefinition(action);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('datetime');
    });

    it('should handle string fields with format: date', () => {
      const action: Action = {
        id: '1',
        inputSchema: {
          properties: {
            date: { type: 'string', format: 'date' }
          }
        }
      } as unknown as Action;

      const result = areasService.getActionFieldsFromActionDefinition(action);

      expect(result[0].type).toBe('date');
    });

    it('should handle string fields with format: time', () => {
      const action: Action = {
        id: '1',
        inputSchema: {
          properties: {
            time: { type: 'string', format: 'time' }
          }
        }
      } as unknown as Action;

      const result = areasService.getActionFieldsFromActionDefinition(action);

      expect(result[0].type).toBe('time');
    });

    it('should handle plain string fields (no format)', () => {
      const action: Action = {
        id: '1',
        inputSchema: {
          properties: {
            username: { type: 'string' }
          }
        }
      } as unknown as Action;

      const result = areasService.getActionFieldsFromActionDefinition(action);

      expect(result[0].type).toBe('text');
    });

    it('should handle integer fields', () => {
      const action: Action = {
        id: '1',
        inputSchema: {
          properties: {
            count: { type: 'integer', minimum: 0 }
          }
        }
      } as unknown as Action;

      const result = areasService.getActionFieldsFromActionDefinition(action);

      expect(result[0].type).toBe('number');
      expect(result[0].minimum).toBe(0);
    });

    it('should handle number fields', () => {
      const action: Action = {
        id: '1',
        inputSchema: {
          properties: {
            percentage: { type: 'number', maximum: 100 }
          }
        }
      } as unknown as Action;

      const result = areasService.getActionFieldsFromActionDefinition(action);

      expect(result[0].type).toBe('number');
      expect(result[0].maximum).toBe(100);
    });

    it('should handle array fields', () => {
      const action: Action = {
        id: '1',
        inputSchema: {
          properties: {
            tags: { type: 'array', minItems: 1 }
          }
        }
      } as unknown as Action;

      const result = areasService.getActionFieldsFromActionDefinition(action);

      expect(result[0].type).toBe('array');
      expect(result[0].minItems).toBe(1);
    });

    it('should handle unknown field types with text default', () => {
      const action: Action = {
        id: '1',
        inputSchema: {
          properties: {
            unknown: { type: 'boolean' } as unknown as Record<string, unknown>
          }
        }
      } as unknown as Action;

      const result = areasService.getActionFieldsFromActionDefinition(action);

      expect(result[0].type).toBe('text');
    });

    it('should handle fields with multiple properties', () => {
      const action: Action = {
        id: '1',
        inputSchema: {
          properties: {
            email: { type: 'string', format: 'email', description: 'Email', minLength: 5, maxLength: 100 },
            count: { type: 'integer', minimum: 1, maximum: 10 }
          },
          required: ['email']
        }
      } as unknown as Action;

      const result = areasService.getActionFieldsFromActionDefinition(action);

      expect(result).toHaveLength(2);
      expect(result[0].minLength).toBe(5);
      expect(result[0].maxLength).toBe(100);
      expect(result[1].minimum).toBe(1);
    });

    it('should use field name as placeholder when description missing', () => {
      const action: Action = {
        id: '1',
        inputSchema: {
          properties: {
            username: { type: 'string' }
          }
        }
      } as unknown as Action;

      const result = areasService.getActionFieldsFromActionDefinition(action);

      expect(result[0].placeholder).toBe('Enter username');
    });

    it('should use description as placeholder when provided', () => {
      const action: Action = {
        id: '1',
        inputSchema: {
          properties: {
            username: { type: 'string', description: 'Your username' }
          }
        }
      } as unknown as Action;

      const result = areasService.getActionFieldsFromActionDefinition(action);

      expect(result[0].placeholder).toBe('Your username');
    });

    it('should handle missing required array', () => {
      const action: Action = {
        id: '1',
        inputSchema: {
          properties: {
            field: { type: 'string' }
          }
        }
      } as unknown as Action;

      const result = areasService.getActionFieldsFromActionDefinition(action);

      expect(result[0].mandatory).toBe(false);
    });
  });

  describe('getCardByAreaId - Edge Cases', () => {
    it('should return empty array when areaId is empty string', async () => {
      const result = await areasService.getCardByAreaId('');

      expect(result).toEqual([]);
    });

    it('should return empty array when areaId is falsy (null)', async () => {
      const result = await areasService.getCardByAreaId(null as unknown as string);

      expect(result).toEqual([]);
    });

    it('should fetch and return cards', async () => {
      const mockCards: ServiceData[] = [
        {
          id: '1',
          serviceName: 'GitHub',
          serviceKey: 'github',
          event: 'push',
          state: 'trigger'
        }
      ] as unknown as ServiceData[];

      mockAxios.get.mockResolvedValueOnce({ data: mockCards });

      const result = await areasService.getCardByAreaId('area-1');

      expect(mockAxios.get).toHaveBeenCalledWith(
        `${API_CONFIG.endpoints.areas.cards}area-1/cards`
      );
      expect(result).toEqual(mockCards);
    });

    it('should handle error fetching cards', async () => {
      mockAxios.get.mockRejectedValueOnce(new Error('Fetch failed'));

      await expect(areasService.getCardByAreaId('area-1')).rejects.toThrow();
    });
  });

  describe('getAreaById - Response Handling', () => {
    it('should return area when found', async () => {
      const mockArea: BackendArea = {
        id: 'area-1',
        name: 'My Area',
        description: 'Description',
        enabled: true,
        userId: 'user-1',
        userEmail: 'user@example.com',
        actions: [],
        reactions: [],
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      };

      mockAxios.get.mockResolvedValueOnce({ data: mockArea });

      const result = await areasService.getAreaById('area-1');

      expect(result).toEqual(mockArea);
    });

    it('should return undefined when area not found', async () => {
      mockAxios.get.mockRejectedValueOnce(new Error('Not found'));

      await expect(areasService.getAreaById('nonexistent')).rejects.toThrow();
    });
  });

  describe('getActionsByServiceKey - Complex Filtering', () => {
    it('should map action definitions to actions correctly', async () => {
      const mockDefinitions: any[] = [
        {
          id: 'action-1',
          serviceId: 'service-1',
          serviceKey: 'github',
          serviceName: 'GitHub',
          key: 'push',
          name: 'On Push',
          description: 'Triggered on push',
          inputSchema: { properties: {}, required: [] },
          outputSchema: {},
          isEventCapable: true,
          isExecutable: false,
          version: 1
        }
      ];

      mockAxios.get.mockResolvedValueOnce({ data: mockDefinitions });

      const result = await areasService.getActionsByServiceKey('github');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('action-1');
      expect(result[0].serviceKey).toBe('github');
      expect(result[0].isEventCapable).toBe(true);
    });

    it('should handle error fetching actions', async () => {
      mockAxios.get.mockRejectedValueOnce(new Error('Fetch failed'));

      await expect(areasService.getActionsByServiceKey('github')).rejects.toThrow();
    });
  });

  describe('createAreaSimple - User ID Resolution', () => {
    it('should use provided userId', async () => {
      const { getCurrentUser } = require('../../src/services/authService');
      mockAxios.post.mockResolvedValueOnce({
        data: { id: 'area-1', name: 'Test Area' }
      });

      const payload = {
        name: 'Test Area',
        description: 'Test',
        userId: 'user-123'
      };

      const result = await areasService.createAreaSimple(payload);

      expect(result).toEqual({ id: 'area-1', name: 'Test Area' });
      expect(getCurrentUser).not.toHaveBeenCalled();
    });

    it('should fetch current user when userId not provided', async () => {
      const { getCurrentUser } = require('../../src/services/authService');
      mockAxios.post.mockResolvedValueOnce({
        data: { id: 'area-1', name: 'Test Area' }
      });

      const payload = {
        name: 'Test Area'
      };

      await areasService.createAreaSimple(payload);

      expect(getCurrentUser).toHaveBeenCalled();
    });

    it('should handle error when creating area', async () => {
      mockAxios.post.mockRejectedValueOnce(new Error('Creation failed'));

      const payload = { name: 'Test Area', userId: 'user-1' };

      await expect(areasService.createAreaSimple(payload)).rejects.toThrow();
    });
  });

  describe('Complex Area Operations', () => {
    it('should create area with actions payload', async () => {
      const payload: areasService.CreateAreaPayload = {
        name: 'Complex Area',
        description: 'With actions',
        actions: [
          {
            actionDefinitionId: 'action-1',
            name: 'Action 1',
            parameters: { key: 'value' }
          }
        ],
        reactions: [],
        links: [],
        connections: []
      };

      mockAxios.post.mockResolvedValueOnce({
        data: { id: 'area-1', name: 'Complex Area' }
      });

      const result = await areasService.createAreaWithActions(payload);

      expect(result.id).toBe('area-1');
      expect(mockAxios.post).toHaveBeenCalledWith(
        API_CONFIG.endpoints.areas.createWithActions,
        payload,
        { withCredentials: true }
      );
    });

    it('should update area with complete payload', async () => {
      const payload: areasService.CreateAreaPayload = {
        name: 'Updated Area',
        actions: [],
        reactions: []
      };

      mockAxios.put.mockResolvedValueOnce({
        data: { id: 'area-1', name: 'Updated Area' }
      });

      const result = await areasService.updateAreaComplete('area-1', payload);

      expect(result.name).toBe('Updated Area');
      expect(mockAxios.put).toHaveBeenCalledWith(
        expect.stringContaining('area-1/complete'),
        payload,
        { withCredentials: true }
      );
    });

    it('should toggle area activation', async () => {
      mockAxios.patch.mockResolvedValueOnce({
        data: { id: 'area-1', enabled: false }
      });

      const result = await areasService.toggleAreaActivation('area-1', false);

      expect(result.enabled).toBe(false);
      expect(mockAxios.patch).toHaveBeenCalledWith(
        expect.stringContaining('area-1/toggle'),
        { enabled: false }
      );
    });

    it('should trigger area manually', async () => {
      mockAxios.post.mockResolvedValueOnce({
        data: { success: true, message: 'Area triggered' }
      });

      const result = await areasService.triggerAreaManually('area-1');

      expect(result.success).toBe(true);
    });

    it('should get area executions', async () => {
      const mockExecutions = [
        { id: 'exec-1', status: 'completed' }
      ];

      mockAxios.get.mockResolvedValueOnce({ data: mockExecutions });

      const result = await areasService.getAreaExecutions('area-1');

      expect(result).toEqual(mockExecutions);
    });

    it('should handle error when deleting area', async () => {
      mockAxios.delete.mockRejectedValueOnce(new Error('Delete failed'));

      await expect(areasService.deleteAreaBackend('area-1')).rejects.toThrow();
    });
  });

  describe('Backend Response Variations', () => {
    it('should handle getServices response array', async () => {
      const mockServices: BackendService[] = [
        {
          id: '1',
          key: 'github',
          name: 'GitHub',
          auth: 'OAUTH2',
          isActive: true,
          iconLightUrl: 'light.png',
          iconDarkUrl: 'dark.png'
        }
      ];

      mockAxios.get.mockResolvedValueOnce({ data: mockServices });

      const result = await areasService.getServices();

      expect(result).toEqual(mockServices);
    });

    it('should handle getServiceById response', async () => {
      const mockService = {
        id: '1',
        name: 'GitHub',
        logo: 'github.png'
      };

      mockAxios.get.mockResolvedValueOnce({ data: mockService });

      const result = await areasService.getServiceById(1);

      expect(result).toEqual(mockService);
    });

    it('should handle getActionDefinitionById', async () => {
      const mockDef = {
        id: 'action-1',
        serviceId: '1',
        serviceKey: 'github',
        key: 'push',
        name: 'On Push'
      };

      mockAxios.get.mockResolvedValueOnce({ data: mockDef });

      const result = await areasService.getActionDefinitionById('action-1');

      expect(result).toEqual(mockDef);
    });
  });
});
