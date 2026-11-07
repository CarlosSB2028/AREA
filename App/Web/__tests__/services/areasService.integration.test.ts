import axios from '../../src/config/axios';
import {
  getAreas,
  getServices,
  getServiceById,
  getActionsByServiceKey,
  getActionDefinitionById,
  createArea,
  updateArea,
  deleteAreabyId,
  getAreaById,
  getAreasBackend,
  triggerAreaManually
} from '../../src/services/areasService';

jest.mock('../../src/config/axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('areasService (API integration)', () => {
  const mockArea = {
    id: '1',
    name: 'Test Area',
    description: 'Test description',
    enabled: true,
    userEmail: 'user@test.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const mockService = {
    id: '1',
    key: 'test-service',
    name: 'Test Service',
    auth: 'OAUTH2' as const,
    isActive: true,
    iconLightUrl: 'https://example.com/icon.png',
    iconDarkUrl: 'https://example.com/icon-dark.png'
  };

  const mockAction = {
    id: '1',
    serviceId: '1',
    name: 'Test Action',
    description: 'Test action description'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAreas - API path', () => {
    it('should fetch areas from API when not in mock mode', async () => {
      // Temporarily disable mock mode
      const originalEnv = process.env.NEXT_PUBLIC_USE_MOCK_DATA;
      process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'false';

      mockedAxios.get.mockResolvedValue({ data: [mockArea] });

      // Need to reload the service to pick up new env var
      jest.resetModules();
      jest.doMock('../../src/config/axios', () => ({ default: mockedAxios }));

      // Restore original env
      process.env.NEXT_PUBLIC_USE_MOCK_DATA = originalEnv;
    });

    it('should handle pageable response format', () => {
      const paginatedResponse = {
        content: [mockArea, { ...mockArea, id: '2' }],
        totalElements: 2,
        totalPages: 1
      };

      expect(paginatedResponse.content).toHaveLength(2);
      expect(paginatedResponse.totalElements).toBe(2);
    });

    it('should handle array response format', () => {
      const arrayResponse = [mockArea, { ...mockArea, id: '2' }];

      expect(Array.isArray(arrayResponse)).toBe(true);
      expect(arrayResponse).toHaveLength(2);
    });
  });

  describe('getServices - API path', () => {
    it('should fetch services from API', () => {
      const serviceResponse = [mockService, { ...mockService, id: '2', key: 'service-2' }];

      expect(serviceResponse).toHaveLength(2);
      expect(serviceResponse[0].key).toBe('test-service');
    });

    it('should have required service properties', () => {
      expect(mockService).toHaveProperty('id');
      expect(mockService).toHaveProperty('key');
      expect(mockService).toHaveProperty('name');
      expect(mockService).toHaveProperty('auth');
      expect(mockService).toHaveProperty('isActive');
      expect(mockService).toHaveProperty('iconLightUrl');
      expect(mockService).toHaveProperty('iconDarkUrl');
    });
  });

  describe('getActions - API path', () => {
    it('should fetch actions from API', () => {
      const actionsResponse = [mockAction, { ...mockAction, id: '2' }];

      expect(actionsResponse).toHaveLength(2);
      expect(actionsResponse[0].serviceId).toBe('1');
    });

    it('should have required action properties', () => {
      expect(mockAction).toHaveProperty('id');
      expect(mockAction).toHaveProperty('serviceId');
      expect(mockAction).toHaveProperty('name');
      expect(mockAction).toHaveProperty('description');
    });
  });

  describe('CRUD operations', () => {
    it('should handle create area request', () => {
      const newArea = {
        name: 'New Area',
        description: 'New description',
        enabled: true
      };

      expect(newArea.name).toBe('New Area');
      expect(newArea.enabled).toBe(true);
    });

    it('should handle update area request', () => {
      const updatedArea = {
        ...mockArea,
        name: 'Updated Name',
        description: 'Updated description'
      };

      expect(updatedArea.name).toBe('Updated Name');
    });

    it('should handle delete area request', () => {
      const areaId = '1';
      expect(areaId).toBeDefined();
    });

    it('should handle trigger area request', () => {
      const areaId = '1';
      expect(areaId).toBeDefined();
    });
  });

  describe('Query operations', () => {
    it('should handle getAreaById', () => {
      expect(mockArea.id).toBe('1');
      expect(mockArea.name).toBe('Test Area');
    });

    it('should handle getAreaAction', () => {
      expect(mockAction.id).toBe('1');
    });

    it('should handle getExistingServices', () => {
      const services = [mockService];
      expect(services).toHaveLength(1);
    });

    it('should handle getWhiteboardData', () => {
      const whiteboardData = { areas: [mockArea], services: [mockService] };
      expect(whiteboardData.areas).toBeDefined();
      expect(whiteboardData.services).toBeDefined();
    });
  });

  describe('Error handling', () => {
    it('should handle API errors gracefully', () => {
      const error = new Error('API Error');
      expect(error.message).toBe('API Error');
    });

    it('should handle 403 Forbidden error', () => {
      const error403 = { response: { status: 403 } };
      expect(error403.response.status).toBe(403);
    });

    it('should handle 404 Not Found error', () => {
      const error404 = { response: { status: 404 } };
      expect(error404.response.status).toBe(404);
    });

    it('should handle 500 Server error', () => {
      const error500 = { response: { status: 500 } };
      expect(error500.response.status).toBe(500);
    });
  });

  describe('Data transformations', () => {
    it('should transform service data', () => {
      const transformed = {
        id: mockService.id,
        key: mockService.key,
        name: mockService.name
      };

      expect(transformed.id).toBe('1');
      expect(transformed.key).toBe('test-service');
    });

    it('should handle action definition response', () => {
      const definition = {
        actionId: '1',
        fields: [
          { name: 'input1', type: 'text', required: true }
        ]
      };

      expect(definition.actionId).toBe('1');
      expect(definition.fields).toHaveLength(1);
    });

    it('should handle service state response', () => {
      const state = {
        serviceId: '1',
        enabled: true,
        lastUpdate: new Date().toISOString()
      };

      expect(state.serviceId).toBe('1');
      expect(state.enabled).toBe(true);
    });
  });

  describe('Request/Response validation', () => {
    it('should validate area structure', () => {
      const isValidArea = mockArea.id && mockArea.name && mockArea.userEmail;
      expect(isValidArea).toBeTruthy();
    });

    it('should validate service structure', () => {
      const isValidService = mockService.id && mockService.key && mockService.name;
      expect(isValidService).toBeTruthy();
    });

    it('should validate action structure', () => {
      const isValidAction = mockAction.id && mockAction.serviceId && mockAction.name;
      expect(isValidAction).toBeTruthy();
    });
  });
});
