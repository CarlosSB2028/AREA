import {
  getUser,
  uploadAvatar,
  getUserInfo,
  getUserById,
  getConnectedServices,
  getAllServices
} from '../../src/services/userService';
import { mockUser } from '../../src/mocks/user';

// Note: Global mocks removed from test-setup.ts
// Services now use native USE_MOCK_DATA logic which is enabled in tests

describe('userService (mock mode)', () => {
  describe('getUser', () => {
    it('should get mock user by email', async () => {
      const result = await getUser('test@test.com');

      expect(result).toBeDefined();
      expect(result.email).toBe(mockUser.email);
      expect(result.name).toBe(mockUser.name);
    });
  });

  describe('uploadAvatar', () => {
    it('should upload avatar and return mock URL', async () => {
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });

      const result = await uploadAvatar(mockFile);

      expect(result).toBe('https://mock.jpg');
    });

    it('should handle upload with timeout', async () => {
      const mockFile = new File(['avatar data'], 'avatar.png', { type: 'image/png' });
      const startTime = Date.now();

      const result = await uploadAvatar(mockFile);

      const duration = Date.now() - startTime;
      expect(result).toBe('https://mock.jpg');
      expect(duration).toBeGreaterThanOrEqual(1000); // Should have 1s delay
    });
  });

  describe('getUserInfo', () => {
    it('should get current user info from mock', async () => {
      const result = await getUserInfo();

      expect(result).toBeDefined();
      expect(result.email).toBeDefined();
      expect(result.name).toBeDefined();
      expect(result.profileData).toBeDefined();
    });

    it('should include profile data in response', async () => {
      const result = await getUserInfo();

      expect(result.profileData).toHaveProperty('email');
      expect(result.profileData).toHaveProperty('firstName');
      expect(result.profileData).toHaveProperty('lastName');
      expect(result.profileData).toHaveProperty('language');
    });
  });

  describe('getUserById', () => {
    it('should get user by ID from mock', async () => {
      const result = await getUserById('123');

      expect(result).toBeDefined();
      expect(result.id).toBe(mockUser.id);
      expect(result.email).toBe(mockUser.email);
    });

    it('should return consistent user data', async () => {
      const result1 = await getUserById('123');
      const result2 = await getUserById('456');

      expect(result1.id).toBe(result2.id);
      expect(result1.email).toBe(result2.email);
    });
  });

  describe('getConnectedServices', () => {
    it('should get connected services from mock', async () => {
      const result = await getConnectedServices();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should include GitHub service by default', async () => {
      const result = await getConnectedServices();

      const githubService = result.find(s => s.serviceKey === 'github');
      expect(githubService).toBeDefined();
      expect(githubService?.serviceName).toBe('GitHub');
      expect(githubService?.isConnected).toBe(true);
    });

    it('should include service connection details', async () => {
      const result = await getConnectedServices();

      result.forEach(service => {
        expect(service).toHaveProperty('serviceKey');
        expect(service).toHaveProperty('serviceName');
        expect(service).toHaveProperty('iconUrl');
        expect(service).toHaveProperty('connectionType');
        expect(service).toHaveProperty('isConnected');
      });
    });
  });

  describe('getAllServices', () => {
    it('should get all services from mock', async () => {
      const result = await getAllServices();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should include GitHub, Google, and Discord', async () => {
      const result = await getAllServices();

      const serviceKeys = result.map(s => s.key);
      expect(serviceKeys).toContain('github');
      expect(serviceKeys).toContain('google');
      expect(serviceKeys).toContain('discord');
    });

    it('should include service metadata', async () => {
      const result = await getAllServices();

      result.forEach(service => {
        expect(service).toHaveProperty('id');
        expect(service).toHaveProperty('key');
        expect(service).toHaveProperty('name');
        expect(service).toHaveProperty('auth');
        expect(service).toHaveProperty('isActive');
        expect(service).toHaveProperty('iconLightUrl');
        expect(service).toHaveProperty('iconDarkUrl');
      });
    });

    it('should all services be active', async () => {
      const result = await getAllServices();

      result.forEach(service => {
        expect(service.isActive).toBe(true);
      });
    });
  });
});
