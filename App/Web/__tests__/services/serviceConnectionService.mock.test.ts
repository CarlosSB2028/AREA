import {
  getServiceConnectionStatus,
  getConnectedServices,
  initiateServiceConnection,
  disconnectService
} from '../../src/services/serviceConnectionService';

describe('serviceConnectionService (mock mode)', () => {
  // Suppress console logs for tests
  const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

  beforeEach(() => {
    consoleLogSpy.mockClear();
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  describe('getServiceConnectionStatus', () => {
    it('should get GitHub connection status', async () => {
      const result = await getServiceConnectionStatus('github');

      expect(result).toBeDefined();
      expect(result.serviceKey).toBe('github');
      expect(result.serviceName).toBe('GitHub');
      expect(result.isConnected).toBe(true);
    });

    it('should get Google connection status', async () => {
      const result = await getServiceConnectionStatus('google');

      expect(result).toBeDefined();
      expect(result.serviceKey).toBe('google');
      expect(result.serviceName).toBe('Google');
    });

    it('should include connection details', async () => {
      const result = await getServiceConnectionStatus('github');

      expect(result).toHaveProperty('serviceKey');
      expect(result).toHaveProperty('serviceName');
      expect(result).toHaveProperty('iconUrl');
      expect(result).toHaveProperty('isConnected');
      expect(result).toHaveProperty('connectionType');
      expect(result).toHaveProperty('userEmail');
      expect(result).toHaveProperty('userName');
    });

    it('should have valid connection type', async () => {
      const result = await getServiceConnectionStatus('github');

      expect(['LOCAL', 'OAUTH', 'BOTH', 'NONE']).toContain(result.connectionType);
    });

    it('should return icon URL for each service', async () => {
      const result = await getServiceConnectionStatus('github');

      expect(result.iconUrl).toBeDefined();
      expect(result.iconUrl.length).toBeGreaterThan(0);
    });
  });

  describe('getConnectedServices', () => {
    it('should get list of connected services', async () => {
      const result = await getConnectedServices();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should include GitHub and Google by default', async () => {
      const result = await getConnectedServices();

      const serviceKeys = result.map(s => s.serviceKey);
      expect(serviceKeys).toContain('github');
      expect(serviceKeys).toContain('google');
    });

    it('should have proper service structure', async () => {
      const result = await getConnectedServices();

      result.forEach(service => {
        expect(service).toHaveProperty('serviceKey');
        expect(service).toHaveProperty('serviceName');
        expect(service).toHaveProperty('iconUrl');
        expect(service).toHaveProperty('isConnected');
        expect(service).toHaveProperty('connectionType');
        expect(service).toHaveProperty('userEmail');
        expect(service).toHaveProperty('userName');
      });
    });

    it('should have consistent user information', async () => {
      const result = await getConnectedServices();

      const userEmails = result.map(s => s.userEmail);
      expect(new Set(userEmails).size).toBe(1); // All same email
    });

    it('should indicate connection status', async () => {
      const result = await getConnectedServices();

      result.forEach(service => {
        expect(typeof service.isConnected).toBe('boolean');
      });
    });

    it('should identify primary auth service', async () => {
      const result = await getConnectedServices();

      const primaryAuthService = result.find(s => s.isPrimaryAuth);
      expect(primaryAuthService).toBeDefined();
      expect(primaryAuthService?.serviceKey).toBe('github');
    });

    it('should indicate disconnect capability', async () => {
      const result = await getConnectedServices();

      result.forEach(service => {
        expect(typeof service.canDisconnect).toBe('boolean');
      });
    });
  });

  describe('initiateServiceConnection', () => {
    it('should log mock connection initiation', async () => {
      await initiateServiceConnection('github');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Mock service connection initiation for github')
      );
    });

    it('should initiate connection for various services', async () => {
      const services = ['github', 'google', 'microsoft'];

      for (const service of services) {
        await initiateServiceConnection(service);
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining(`Mock service connection initiation for ${service}`)
        );
      }
    });

    it('should handle connection initiation without return URL', async () => {
      await expect(initiateServiceConnection('github')).resolves.toBeUndefined();
    });

    it('should handle connection initiation with return URL', async () => {
      const returnUrl = 'https://example.com/profile';
      await expect(initiateServiceConnection('github', returnUrl)).resolves.toBeUndefined();
    });
  });

  describe('disconnectService', () => {
    it('should log mock service disconnection', async () => {
      await disconnectService('github');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Mock service disconnection for github')
      );
    });

    it('should disconnect from various services', async () => {
      const services = ['github', 'google', 'microsoft'];

      for (const service of services) {
        await disconnectService(service);
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining(`Mock service disconnection for ${service}`)
        );
      }
    });

    it('should complete disconnection without error', async () => {
      await expect(disconnectService('github')).resolves.toBeUndefined();
    });

    it('should handle case insensitive service keys', async () => {
      await expect(disconnectService('GITHUB')).resolves.toBeUndefined();
      await expect(disconnectService('GitHub')).resolves.toBeUndefined();
    });
  });

  describe('mock data consistency', () => {
    it('should return consistent connected services list', async () => {
      const services1 = await getConnectedServices();
      const services2 = await getConnectedServices();

      expect(services1).toEqual(services2);
    });

    it('should have GitHub as primary auth', async () => {
      const services = await getConnectedServices();
      const github = services.find(s => s.serviceKey === 'github');

      expect(github?.isPrimaryAuth).toBe(true);
      expect(github?.canDisconnect).toBe(false);
    });

    it('should have Google as secondary connection', async () => {
      const services = await getConnectedServices();
      const google = services.find(s => s.serviceKey === 'google');

      expect(google?.isPrimaryAuth).toBe(false);
      expect(google?.canDisconnect).toBe(true);
    });

    it('should maintain provider user IDs', async () => {
      const services = await getConnectedServices();

      services.forEach(service => {
        if (service.isConnected) {
          expect(service.providerUserId).toBeDefined();
        }
      });
    });
  });

  describe('service display names', () => {
    it('should display GitHub as GitHub', async () => {
      const result = await getServiceConnectionStatus('github');
      expect(result.serviceName).toBe('GitHub');
    });

    it('should display Google as Google', async () => {
      const result = await getServiceConnectionStatus('google');
      expect(result.serviceName).toBe('Google');
    });

    it('should display Microsoft as Microsoft', async () => {
      const result = await getServiceConnectionStatus('microsoft');
      expect(result.serviceName).toBe('Microsoft');
    });
  });
});
