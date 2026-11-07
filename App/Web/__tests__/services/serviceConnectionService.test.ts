import {
  getServiceConnectionStatus,
  getConnectedServices,
  disconnectService,
  initiateServiceConnection,
} from '../../src/services/serviceConnectionService';
import axios from '../../src/config/axios';
import { API_CONFIG } from '../../src/config/api';

jest.mock('../../src/config/axios');
jest.mock('../../src/config/api', () => ({
  USE_MOCK_DATA: false,
  API_CONFIG: {
    baseURL: 'http://localhost:3000',
    endpoints: {
      user: {
        serviceConnection: '/api/user/services',
        connectedServices: '/api/user/services/connected',
      },
    },
  },
}));

describe('serviceConnectionService', () => {
  const mockConnectionStatus = {
    serviceKey: 'github',
    serviceName: 'GitHub',
    iconUrl: 'https://example.com/github.png',
    isConnected: true,
    connectionType: 'OAUTH' as const,
    userEmail: 'user@example.com',
    userName: 'Test User',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    delete (window as {location?: unknown}).location;
    (window as {location: {href: string}}).location = { href: '' };
    localStorage.clear();
  });

  describe('getServiceConnectionStatus', () => {
    it('should fetch service connection status', async () => {
      (axios.get as jest.Mock).mockResolvedValue({ data: mockConnectionStatus });

      const result = await getServiceConnectionStatus('github');

      expect(result).toEqual(mockConnectionStatus);
      expect(axios.get).toHaveBeenCalledWith(`${API_CONFIG.endpoints.user.serviceConnection}/github`);
    });

    it('should handle errors when fetching status', async () => {
      const error = new Error('Network error');
      (axios.get as jest.Mock).mockRejectedValue(error);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(getServiceConnectionStatus('github')).rejects.toThrow('Network error');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Get service connection status error:', error);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('getConnectedServices', () => {
    it('should fetch connected services', async () => {
      const mockServices = [mockConnectionStatus];
      (axios.get as jest.Mock).mockResolvedValue({ data: mockServices });

      const result = await getConnectedServices();

      expect(result).toEqual(mockServices);
      expect(axios.get).toHaveBeenCalledWith(API_CONFIG.endpoints.user.connectedServices);
    });

    it('should handle errors when fetching connected services', async () => {
      const error = new Error('Network error');
      (axios.get as jest.Mock).mockRejectedValue(error);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(getConnectedServices()).rejects.toThrow('Network error');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Get connected services error:', error);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('disconnectService', () => {
    it('should disconnect a service', async () => {
      (axios.delete as jest.Mock).mockResolvedValue({ data: { success: true } });

      await disconnectService('github');

      expect(axios.delete).toHaveBeenCalledWith(`${API_CONFIG.endpoints.user.serviceConnection}/github`);
    });

    it('should handle errors when disconnecting service', async () => {
      const error = new Error('Network error');
      (axios.delete as jest.Mock).mockRejectedValue(error);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(disconnectService('github')).rejects.toThrow('Network error');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Disconnect service error:', error);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('initiateServiceConnection', () => {
    it('should initiate service connection with GitHub', async () => {
      const originalHref = window.location.href;

      await initiateServiceConnection('github');

      expect(localStorage.getItem('oauth_return_url')).toBe(originalHref);
      expect(localStorage.getItem('oauth_link_mode')).toBe('true');
      expect(localStorage.getItem('oauth_provider')).toBe('github');
      expect(window.location.href).toBe('http://localhost:3000/api/oauth/github/authorize');
    });

    it('should use custom return URL', async () => {
      await initiateServiceConnection('google', 'http://example.com/callback');

      expect(localStorage.getItem('oauth_return_url')).toBe('http://example.com/callback');
      expect(localStorage.getItem('oauth_provider')).toBe('google');
      expect(window.location.href).toBe('http://localhost:3000/api/oauth/google/authorize');
    });

    it('should handle microsoft service', async () => {
      await initiateServiceConnection('microsoft');

      expect(localStorage.getItem('oauth_provider')).toBe('microsoft');
      expect(window.location.href).toBe('http://localhost:3000/api/oauth/microsoft/authorize');
    });

    it('should handle unknown service key', async () => {
      await initiateServiceConnection('unknown-service');

      expect(localStorage.getItem('oauth_provider')).toBe('unknown-service');
      expect(window.location.href).toBe('http://localhost:3000/api/oauth/unknown-service/authorize');
    });

    it('should handle service key with mixed case', async () => {
      await initiateServiceConnection('GITHUB');

      expect(localStorage.getItem('oauth_provider')).toBe('github');
      expect(window.location.href).toBe('http://localhost:3000/api/oauth/github/authorize');
    });

    it('should handle google service key with mixed case', async () => {
      await initiateServiceConnection('Google');

      expect(localStorage.getItem('oauth_provider')).toBe('google');
      expect(window.location.href).toBe('http://localhost:3000/api/oauth/google/authorize');
    });

    it('should handle microsoft service key with mixed case', async () => {
      await initiateServiceConnection('MICROSOFT');

      expect(localStorage.getItem('oauth_provider')).toBe('microsoft');
      expect(window.location.href).toBe('http://localhost:3000/api/oauth/microsoft/authorize');
    });

    it('should store oauth_link_mode flag', async () => {
      await initiateServiceConnection('github');

      expect(localStorage.getItem('oauth_link_mode')).toBe('true');
    });

    it('should set correct oauth URL for different providers', async () => {
      await initiateServiceConnection('slack');

      expect(window.location.href).toBe('http://localhost:3000/api/oauth/slack/authorize');
    });
  });
});
