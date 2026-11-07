/**
 * areasService API endpoint tests - REAL API INTEGRATION
 * Tests CRUD operations with proper mocking
 */
import axios from '../../src/config/axios';
import * as areasService from '../../src/services/areasService';
import { API_CONFIG } from '../../src/config/api';

jest.mock('../../src/config/axios');
jest.mock('../../src/services/authService', () => ({
  getCurrentUser: jest.fn().mockResolvedValue({ id: 'user123', email: 'test@example.com' }),
}));

// Mock the USE_MOCK_DATA so services use real API calls
jest.mock('../../src/config/api', () => ({
  ...jest.requireActual('../../src/config/api'),
  USE_MOCK_DATA: false,
}));

const mockAxios = axios as jest.Mocked<typeof axios>;

describe('areasService - Real API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAreas - Pageable Response', () => {
    it('should handle pageable response format from backend', async () => {
      const pageableResponse = {
        content: [
          {
            id: 1,
            name: 'GitHub Integration',
            description: 'Automate GitHub workflows',
            enabled: true,
            userId: 'user-123',
            userEmail: 'test@example.com',
            actions: [],
            reactions: [],
            createdAt: '2025-01-15T10:00:00Z',
            updatedAt: '2025-01-15T10:00:00Z'
          }
        ],
        totalElements: 1,
        totalPages: 1,
        size: 20,
        number: 0
      };

      mockAxios.get.mockResolvedValueOnce({ data: pageableResponse });

      const result = await areasService.getAreas();

      expect(mockAxios.get).toHaveBeenCalledWith(API_CONFIG.endpoints.areas.list);
      expect(result).toEqual(pageableResponse.content);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('GitHub Integration');
    });

    it('should handle array response format', async () => {
      const arrayResponse = [
        {
          id: 1,
          name: 'Area 1',
          description: 'Test',
          enabled: true,
          userId: 'user-123',
          userEmail: 'test@example.com',
          actions: [],
          reactions: [],
          createdAt: '2025-01-15T10:00:00Z',
          updatedAt: '2025-01-15T10:00:00Z'
        }
      ];

      mockAxios.get.mockResolvedValueOnce({ data: arrayResponse });

      const result = await areasService.getAreas();

      expect(result).toEqual(arrayResponse);
    });
  });

  describe('getAreaById', () => {
    it('should fetch area with all details', async () => {
      const backendArea = {
        id: 1,
        name: 'Advanced Workflow',
        description: 'Complex automation',
        enabled: true,
        userId: 'user-123',
        userEmail: 'test@example.com',
        actions: [
          {
            id: '1',
            serviceId: 'github',
            key: 'push',
            name: 'Push Event'
          }
        ],
        reactions: [
          {
            id: '1',
            serviceId: 'discord',
            key: 'send-message',
            name: 'Send Message'
          }
        ],
        createdAt: '2025-01-15T10:00:00Z',
        updatedAt: '2025-01-20T15:30:00Z'
      };

      mockAxios.get.mockResolvedValueOnce({ data: backendArea });

      const result = await areasService.getAreaById('1');

      expect(mockAxios.get).toHaveBeenCalledWith(API_CONFIG.endpoints.areas.getById + '1');
      expect(result?.id).toBe(1);
      expect(result?.name).toBe('Advanced Workflow');
      expect(result?.actions).toHaveLength(1);
      expect(result?.reactions).toHaveLength(1);
    });
  });

  describe('createArea', () => {
    it('should create area and return with generated id', async () => {
      const createPayload = {
        name: 'New Automation',
        description: 'Test automation',
        actions: [],
        reactions: []
      };

      const createdArea = {
        id: 1,
        ...createPayload,
        enabled: true,
        userId: 'user-123',
        userEmail: 'test@example.com',
        createdAt: '2025-01-21T10:00:00Z',
        updatedAt: '2025-01-21T10:00:00Z'
      };

      mockAxios.post.mockResolvedValueOnce({ data: createdArea });

      const result = await areasService.createArea(createPayload);

      expect(mockAxios.post).toHaveBeenCalledWith(
        API_CONFIG.endpoints.areas.create,
        createPayload
      );
      expect(result.id).toBe(1);
      expect(result.name).toBe('New Automation');
    });
  });

  describe('createAreaSimple - Auto-populate userId', () => {
    it('should populate userId from current user', async () => {
      const simplePayload = {
        name: 'Simple Area',
        description: 'Quick setup'
      };

      const createdArea = {
        id: 2,
        name: simplePayload.name,
        description: simplePayload.description,
        userId: 'user123',
        userEmail: 'test@example.com',
        enabled: true,
        actions: [],
        reactions: [],
        createdAt: '2025-01-21T10:00:00Z',
        updatedAt: '2025-01-21T10:00:00Z'
      };

      mockAxios.post.mockResolvedValueOnce({ data: createdArea });

      const result = await areasService.createAreaSimple(simplePayload);

      expect(mockAxios.post).toHaveBeenCalledWith(
        API_CONFIG.endpoints.areas.create,
        expect.objectContaining({
          name: 'Simple Area',
          userId: 'user123'
        })
      );
      expect(result.userId).toBe('user123');
    });
  });

  describe('updateArea', () => {
    it('should update area fields', async () => {
      const updates = {
        name: 'Updated Name',
        description: 'Updated Description'
      };

      const updatedArea = {
        id: 1,
        name: updates.name,
        description: updates.description,
        enabled: true,
        userId: 'user-123',
        userEmail: 'test@example.com',
        actions: [],
        reactions: [],
        createdAt: '2025-01-15T10:00:00Z',
        updatedAt: '2025-01-21T12:00:00Z'
      };

      mockAxios.put.mockResolvedValueOnce({ data: updatedArea });

      const result = await areasService.updateArea('1', updates);

      expect(mockAxios.put).toHaveBeenCalledWith(
        API_CONFIG.endpoints.areas.update + '1',
        updates
      );
      expect(result.name).toBe('Updated Name');
    });
  });

  describe('getServices - Backend catalog', () => {
    it('should fetch services from catalog endpoint', async () => {
      const servicesResponse = [
        {
          id: '1',
          key: 'github',
          name: 'GitHub',
          auth: 'OAUTH',
          isActive: true,
          iconLightUrl: 'https://api.example.com/icons/github-light.svg',
          iconDarkUrl: 'https://api.example.com/icons/github-dark.svg'
        },
        {
          id: '2',
          key: 'discord',
          name: 'Discord',
          auth: 'OAUTH',
          isActive: true,
          iconLightUrl: 'https://api.example.com/icons/discord-light.svg',
          iconDarkUrl: 'https://api.example.com/icons/discord-dark.svg'
        }
      ];

      mockAxios.get.mockResolvedValueOnce({ data: servicesResponse });

      const result = await areasService.getServices();

      expect(mockAxios.get).toHaveBeenCalledWith(API_CONFIG.endpoints.services.catalog);
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('GitHub');
      expect(result[0].auth).toBe('OAUTH');
    });
  });

  describe('getActionsByServiceKey', () => {
    it('should fetch action definitions for service', async () => {
      const actionsResponse = [
        {
          id: 'push-event',
          serviceId: '1',
          serviceKey: 'github',
          serviceName: 'GitHub',
          key: 'push',
          name: 'Push Event',
          description: 'Triggered when code is pushed',
          isEventCapable: true,
          isExecutable: false,
          version: 1,
          inputSchema: {
            properties: {
              repository: { type: 'string', description: 'Repository name' },
              branch: { type: 'string', description: 'Branch name' }
            },
            required: ['repository']
          },
          outputSchema: {},
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z'
        }
      ];

      mockAxios.get.mockResolvedValueOnce({ data: actionsResponse });

      const result = await areasService.getActionsByServiceKey('github');

      expect(mockAxios.get).toHaveBeenCalledWith(
        API_CONFIG.endpoints.services.actions + 'github'
      );
      expect(result).toHaveLength(1);
      expect(result[0].serviceKey).toBe('github');
      expect(result[0].isEventCapable).toBe(true);
    });
  });

  describe('getCardByAreaId - Service cards', () => {
    it('should fetch cards configured for area', async () => {
      const cardsResponse = [
        {
          id: '1',
          areaId: '1',
          serviceName: 'GitHub',
          serviceKey: 'github',
          cardName: 'On Push',
          event: 'push',
          state: 'active',
          logo: 'https://api.example.com/icons/github.svg',
          actionId: 1,
          serviceId: '1',
          fields: {
            repository: 'my-repo',
            branch: 'main'
          }
        }
      ];

      mockAxios.get.mockResolvedValueOnce({ data: cardsResponse });

      const result = await areasService.getCardByAreaId('1');

      expect(mockAxios.get).toHaveBeenCalledWith(
        API_CONFIG.endpoints.areas.cards + '1/cards'
      );
      expect(result).toHaveLength(1);
      expect(result[0].cardName).toBe('On Push');
      expect(result[0].state).toBe('active');
    });
  });

  describe('Error Handling - 403 Forbidden', () => {
    it('should handle permission denied gracefully', async () => {
      mockAxios.get.mockRejectedValueOnce(
        new Error('403 Forbidden')
      );

      await expect(areasService.getAreas()).rejects.toThrow();
    });
  });

  describe('Error Handling - Network Error', () => {
    it('should reject on network failure', async () => {
      mockAxios.get.mockRejectedValueOnce(
        new Error('Network timeout')
      );

      await expect(areasService.getAreas()).rejects.toThrow('Network timeout');
    });
  });

  describe('getActionFieldsByServiceAndActionId', () => {
    it('should fetch field schema for action', async () => {
      const fieldsResponse = [
        {
          name: 'repository',
          type: 'string',
          mandatory: true,
          description: 'Repository to monitor'
        },
        {
          name: 'branch',
          type: 'string',
          mandatory: false,
          description: 'Specific branch (optional)'
        }
      ];

      mockAxios.get.mockResolvedValueOnce({ data: fieldsResponse });

      const result = await areasService.getActionFieldsByServiceAndActionId(1, 2);

      expect(mockAxios.get).toHaveBeenCalledWith(
        API_CONFIG.endpoints.services.actionFields + '1/actions/2/fields'
      );
      expect(result).toHaveLength(2);
    });
  });

  describe('getActionDefinitionById', () => {
    it('should fetch action definition by id', async () => {
      const definitionResponse = {
        id: 'push-event-001',
        serviceId: '1',
        serviceKey: 'github',
        serviceName: 'GitHub',
        key: 'push',
        name: 'Push Event',
        description: 'Triggered on push to repository',
        isEventCapable: true,
        isExecutable: false,
        version: 1,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      };

      mockAxios.get.mockResolvedValueOnce({ data: definitionResponse });

      const result = await areasService.getActionDefinitionById('push-event-001');

      expect(mockAxios.get).toHaveBeenCalledWith(
        API_CONFIG.endpoints.actions.actionDefinitions + 'push-event-001'
      );
      expect(result.serviceKey).toBe('github');
      expect(result.isEventCapable).toBe(true);
    });
  });
});
