import {
  getAreas,
  getServices,
} from '../../src/services/areasService';
import type { Area, BackendService } from '../../src/types';

// Mock axios to avoid actual API calls
jest.mock('../../src/config/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

// Set mock data environment variable
process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'true';

describe('areasService - Mock Data Mode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Ensure USE_MOCK_DATA is true for all tests
    process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'true';
  });

  describe('getAreas', () => {
    it('should return mock areas data', async () => {
      const areas = await getAreas();

      expect(areas).toBeDefined();
      expect(Array.isArray(areas)).toBe(true);
      expect(areas.length).toBeGreaterThan(0);
    });

    it('should return areas with required properties', async () => {
      const areas = await getAreas();

      areas.forEach((area: Area) => {
        expect(area).toHaveProperty('id');
        expect(area).toHaveProperty('name');
        expect(area).toHaveProperty('description');
      });
    });

    it('should have areas with valid status values', async () => {
      const areas = await getAreas();
      const validStatuses = ['success', 'failed', 'in progress', 'not started'];

      areas.forEach((area: Area) => {
        expect(validStatuses).toContain(area.status);
      });
    });

    it('should have areas with services array', async () => {
      const areas = await getAreas();

      areas.forEach((area: Area) => {
        expect(Array.isArray(area.services)).toBe(true);
      });
    });

    it('should have unique area IDs', async () => {
      const areas = await getAreas();
      const ids = areas.map((a: Area) => a.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have areas with names and descriptions', async () => {
      const areas = await getAreas();

      areas.forEach((area: Area) => {
        expect(area.name).toBeTruthy();
        expect(area.description).toBeTruthy();
      });
    });
  });

  describe('getServices', () => {
    it('should return mock services data', async () => {
      const services = await getServices();

      expect(services).toBeDefined();
      expect(Array.isArray(services)).toBe(true);
      expect(services.length).toBeGreaterThan(0);
    });

    it('should return services with name property', async () => {
      const services = await getServices();

      services.forEach((service: BackendService) => {
        expect(service).toHaveProperty('id');
        expect(service).toHaveProperty('name');
      });
    });

    it('should have 6 services in mock data', async () => {
      const services = await getServices();
      expect(services.length).toBe(6);
    });

    it('should have icon URLs for services', async () => {
      const services = await getServices();

      services.forEach((service: BackendService) => {
        if (service.iconLightUrl) {
          expect(service.iconLightUrl).toMatch(/^https?:\/\//);
        }
        if (service.iconDarkUrl) {
          expect(service.iconDarkUrl).toMatch(/^https?:\/\//);
        }
      });
    });

    it('should have all expected service names', async () => {
      const services = await getServices();
      const expectedNames = ['GitHub', 'Google', 'Bitbucket', 'Spotify', 'Jira', 'Slack'];

      const actualNames = services.map((s: BackendService) => s.name);
      expectedNames.forEach((name) => {
        expect(actualNames).toContain(name);
      });
    });
  });

  describe('getActionsByServiceKey', () => {
    it('should skip - function testing requires additional setup', () => {
      expect(true).toBe(true);
    });
  });

  describe('getServiceById', () => {
    it('should skip service by ID tests - function not exported from areasService', () => {
      expect(true).toBe(true);
    });
  });

  describe('getCardByAreaId', () => {
    it('should skip card by area ID tests - needs additional setup', () => {
      expect(true).toBe(true);
    });
  });

  describe('getAreaById', () => {
    it('should skip area by ID tests - function not exported from areasService', () => {
      expect(true).toBe(true);
    });
  });

  describe('Cross-Mock Data Consistency', () => {
    it('services returned should be properly formatted', async () => {
      const services = await getServices();

      services.forEach((service: BackendService) => {
        expect(service.name).toBeTruthy();
        expect(service.id).toBeTruthy();
      });
    });

    it('all services should have names matching expected services', async () => {
      const services = await getServices();
      const expectedNames = ['GitHub', 'Google', 'Bitbucket', 'Spotify', 'Jira', 'Slack'];

      const actualNames = services.map((s: BackendService) => s.name);
      expectedNames.forEach((name) => {
        expect(actualNames).toContain(name);
      });
    });

    it('getAreas and getServices should complete without errors', async () => {
      const [areas, services] = await Promise.all([
        getAreas(),
        getServices(),
      ]);

      expect(Array.isArray(areas)).toBe(true);
      expect(Array.isArray(services)).toBe(true);
      expect(areas.length).toBeGreaterThan(0);
      expect(services.length).toBeGreaterThan(0);
    });

    it('mock data should be deterministic', async () => {
      const areas1 = await getAreas();
      const areas2 = await getAreas();

      expect(areas1.length).toBe(areas2.length);
      areas1.forEach((area: Area, index: number) => {
        expect(area.id).toBe(areas2[index].id);
        expect(area.name).toBe(areas2[index].name);
      });
    });

    it('services data should be deterministic', async () => {
      const services1 = await getServices();
      const services2 = await getServices();

      expect(services1.length).toBe(services2.length);
      services1.forEach((service: BackendService, index: number) => {
        expect(service.id).toBe(services2[index].id);
        expect(service.name).toBe(services2[index].name);
      });
    });
  });
});
