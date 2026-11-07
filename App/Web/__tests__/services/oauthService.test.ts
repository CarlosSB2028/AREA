import axios from '../../src/config/axios';
import {
  getOAuthProviders,
  initiateOAuth,
  connectGitHubForTesting,
} from '../../src/services/oauthService';
import { API_CONFIG } from '../../src/config/api';

jest.mock('../../src/config/axios');
jest.mock('../../src/config/api', () => ({
  USE_MOCK_DATA: false,
  API_CONFIG: {
    baseURL: 'http://localhost:3000',
  },
}));

describe('oauthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete (window as {location?: unknown}).location;
    (window as {location: {href: string}}).location = { href: '' };
    localStorage.clear();
  });

  describe('getOAuthProviders', () => {
    it('should fetch OAuth providers', async () => {
      const mockProviders = [
        { providerKey: 'google', providerLabel: 'Google', providerLogoUrl: '', userAuthUrl: '', clientId: '123' },
        { providerKey: 'github', providerLabel: 'GitHub', providerLogoUrl: '', userAuthUrl: '', clientId: '456' },
      ];
      (axios.get as jest.Mock).mockResolvedValue({ data: mockProviders });

      const result = await getOAuthProviders();

      expect(result).toEqual(mockProviders);
      expect(axios.get).toHaveBeenCalledWith(`${API_CONFIG.baseURL}/api/oauth/providers`);
    });

    it('should handle errors when fetching providers', async () => {
      const error = new Error('Network error');
      (axios.get as jest.Mock).mockRejectedValue(error);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(getOAuthProviders()).rejects.toThrow('Network error');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Get OAuth providers error:', error);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('initiateOAuth', () => {
    it('should initiate OAuth with provider', () => {
      initiateOAuth('GitHub');

      expect(localStorage.getItem('oauth_provider')).toBe('github');
      expect(window.location.href).toBe('http://localhost:3000/api/oauth/github/authorize');
    });

    it('should use custom userAuthUrl if provided', () => {
      initiateOAuth('Google', 'http://custom.auth.url');

      expect(localStorage.getItem('oauth_provider')).toBe('google');
      expect(window.location.href).toBe('http://custom.auth.url');
    });

    it('should handle provider case insensitively', () => {
      initiateOAuth('MICROSOFT');

      expect(localStorage.getItem('oauth_provider')).toBe('microsoft');
      expect(window.location.href).toBe('http://localhost:3000/api/oauth/microsoft/authorize');
    });

    it('should handle empty provider gracefully', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      initiateOAuth('');

      expect(consoleErrorSpy).toHaveBeenCalledWith('Provider is required for OAuth initiation');
      expect(window.location.href).toBe('');

      consoleErrorSpy.mockRestore();
    });

    it('should handle missing provider with userAuthUrl', () => {
      // When userAuthUrl is provided with empty provider, it should still redirect
      initiateOAuth('', 'http://custom.url');

      expect(localStorage.getItem('oauth_provider')).toBe('');
      expect(window.location.href).toBe('http://custom.url');
    });

    it('should handle whitespace-only provider', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      initiateOAuth('   ');

      // Whitespace is truthy, so it shouldn't trigger the error check
      // But toLowerCase() will convert it
      expect(window.location.href).toBe('http://localhost:3000/api/oauth/   /authorize');

      consoleErrorSpy.mockRestore();
    });
  });

  describe('connectGitHubForTesting', () => {
    it('should connect GitHub for testing', async () => {
      const mockResponse = { success: true, userId: 'user-123' };
      (axios.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await connectGitHubForTesting('gh_token123', 'testuser');

      expect(result).toEqual(mockResponse);
      expect(axios.post).toHaveBeenCalledWith(
        `${API_CONFIG.baseURL}/api/test/github/simulate-github-connection`,
        {
          github_token: 'gh_token123',
          github_username: 'testuser',
        }
      );
    });

    it('should handle errors when connecting GitHub', async () => {
      const error = new Error('Invalid token');
      (axios.post as jest.Mock).mockRejectedValue(error);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(connectGitHubForTesting('invalid', 'user')).rejects.toThrow('Invalid token');
      expect(consoleErrorSpy).toHaveBeenCalledWith('GitHub connection error:', error);

      consoleErrorSpy.mockRestore();
    });
  });
});
