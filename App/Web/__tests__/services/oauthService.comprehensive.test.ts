/**
 * oauthService comprehensive tests
 */
import axios from '../../src/config/axios';
import * as oauthService from '../../src/services/oauthService';
import { API_CONFIG } from '../../src/config/api';
import { OAuthProvider } from '../../src/types';

jest.mock('../../src/config/axios');

// Mock USE_MOCK_DATA to force API mode
jest.mock('../../src/config/api', () => {
  const actualApi = jest.requireActual('../../src/config/api');
  return {
    ...actualApi,
    USE_MOCK_DATA: false,
  };
});

// Mock window.location.href
(window as unknown as Record<string, unknown>).location = { href: '' };

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

const mockAxios = axios as jest.Mocked<typeof axios>;

describe('oauthService - Comprehensive Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    window.location.href = '';
  });

  describe('getOAuthProviders', () => {
    it('should fetch OAuth providers from API', async () => {
      const mockProviders: OAuthProvider[] = [
        {
          providerKey: 'google',
          providerLabel: 'Google',
          providerLogoUrl: 'https://example.com/google.png',
          userAuthUrl: 'https://accounts.google.com/oauth',
          clientId: 'google-client-id'
        },
        {
          providerKey: 'github',
          providerLabel: 'GitHub',
          providerLogoUrl: 'https://example.com/github.png',
          userAuthUrl: 'https://github.com/oauth',
          clientId: 'github-client-id'
        },
        {
          providerKey: 'microsoft',
          providerLabel: 'Microsoft',
          providerLogoUrl: 'https://example.com/microsoft.png',
          userAuthUrl: 'https://login.microsoft.com/oauth',
          clientId: 'microsoft-client-id'
        }
      ];

      mockAxios.get.mockResolvedValueOnce({ data: mockProviders });

      const result = await oauthService.getOAuthProviders();

      expect(mockAxios.get).toHaveBeenCalledWith(`${API_CONFIG.baseURL}/api/oauth/providers`);
      expect(result).toEqual(mockProviders);
      expect(result).toHaveLength(3);
    });

    it('should handle empty providers list', async () => {
      mockAxios.get.mockResolvedValueOnce({ data: [] });

      const result = await oauthService.getOAuthProviders();

      expect(result).toEqual([]);
    });

    it('should handle API error when fetching providers', async () => {
      mockAxios.get.mockRejectedValueOnce(new Error('API error'));

      await expect(oauthService.getOAuthProviders()).rejects.toThrow('API error');
    });

    it('should handle 401 unauthorized error', async () => {
      const error = new Error('Unauthorized');
      (error as unknown as Record<string, unknown>).response = { status: 401 };

      mockAxios.get.mockRejectedValueOnce(error);

      await expect(oauthService.getOAuthProviders()).rejects.toThrow();
    });

    it('should handle 500 server error', async () => {
      const error = new Error('Server error');
      (error as unknown as Record<string, unknown>).response = { status: 500 };

      mockAxios.get.mockRejectedValueOnce(error);

      await expect(oauthService.getOAuthProviders()).rejects.toThrow();
    });

    it('should handle network timeout', async () => {
      mockAxios.get.mockRejectedValueOnce(new Error('Network timeout'));

      await expect(oauthService.getOAuthProviders()).rejects.toThrow('Network timeout');
    });

    it('should return provider with all required fields', async () => {
      const mockProviders: OAuthProvider[] = [
        {
          providerKey: 'google',
          providerLabel: 'Google',
          providerLogoUrl: 'https://example.com/google.png',
          userAuthUrl: 'https://accounts.google.com/oauth',
          clientId: 'client-123'
        }
      ];

      mockAxios.get.mockResolvedValueOnce({ data: mockProviders });

      const result = await oauthService.getOAuthProviders();

      expect(result[0].providerKey).toBe('google');
      expect(result[0].providerLabel).toBe('Google');
      expect(result[0].clientId).toBe('client-123');
    });
  });

  describe('initiateOAuth', () => {
    it('should store provider in localStorage when userAuthUrl provided', () => {
      const provider = 'google';
      const userAuthUrl = 'https://accounts.google.com/oauth?client_id=123';

      oauthService.initiateOAuth(provider, userAuthUrl);

      expect(localStorageMock.getItem('oauth_provider')).toBe('google');
    });

    it('should handle provider name case insensitivity', () => {
      const provider = 'GITHUB';

      oauthService.initiateOAuth(provider, 'https://github.com/oauth');

      expect(localStorageMock.getItem('oauth_provider')).toBe('github');
    });

    it('should handle provider with mixed case', () => {
      const provider = 'MiCrOsOfT';

      oauthService.initiateOAuth(provider, 'https://microsoft.com/oauth');

      expect(localStorageMock.getItem('oauth_provider')).toBe('microsoft');
    });

    it('should store provider when userAuthUrl provided', () => {
      const provider = 'discord';
      const userAuthUrl = 'https://discord.com/oauth';

      oauthService.initiateOAuth(provider, userAuthUrl);

      expect(localStorageMock.getItem('oauth_provider')).toBe('discord');
    });

    it('should handle empty provider', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      oauthService.initiateOAuth('');

      expect(consoleErrorSpy).toHaveBeenCalledWith('Provider is required for OAuth initiation');
      consoleErrorSpy.mockRestore();
    });

    it('should not redirect when userAuthUrl is not provided and provider is empty', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      oauthService.initiateOAuth('');

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('connectGitHubForTesting', () => {
    it('should connect GitHub with token and username', async () => {
      const token = 'github_token_123';
      const username = 'testuser';

      mockAxios.post.mockResolvedValueOnce({
        data: { success: true, userId: 'user-1' }
      });

      const result = await oauthService.connectGitHubForTesting(token, username);

      expect(mockAxios.post).toHaveBeenCalledWith(
        `${API_CONFIG.baseURL}/api/test/github/simulate-github-connection`,
        {
          github_token: token,
          github_username: username
        }
      );
      expect(result.success).toBe(true);
    });

    it('should handle GitHub connection error', async () => {
      mockAxios.post.mockRejectedValueOnce(new Error('Invalid token'));

      await expect(
        oauthService.connectGitHubForTesting('invalid_token', 'testuser')
      ).rejects.toThrow('Invalid token');
    });

    it('should handle GitHub API error', async () => {
      const error = new Error('GitHub API unavailable');
      (error as unknown as Record<string, unknown>).response = { status: 503 };

      mockAxios.post.mockRejectedValueOnce(error);

      await expect(
        oauthService.connectGitHubForTesting('token', 'user')
      ).rejects.toThrow();
    });

    it('should return GitHub connection response data', async () => {
      const responseData = {
        success: true,
        userId: 'user-123',
        username: 'testuser',
        avatar: 'https://github.com/testuser.png',
        email: 'test@github.com'
      };

      mockAxios.post.mockResolvedValueOnce({ data: responseData });

      const result = await oauthService.connectGitHubForTesting('token', 'testuser');

      expect(result).toEqual(responseData);
      expect(result.userId).toBe('user-123');
    });

    it('should handle empty token', async () => {
      mockAxios.post.mockRejectedValueOnce(new Error('Token required'));

      await expect(
        oauthService.connectGitHubForTesting('', 'testuser')
      ).rejects.toThrow('Token required');
    });

    it('should handle empty username', async () => {
      mockAxios.post.mockRejectedValueOnce(new Error('Username required'));

      await expect(
        oauthService.connectGitHubForTesting('token', '')
      ).rejects.toThrow('Username required');
    });

    it('should send correct request headers for GitHub connection', async () => {
      mockAxios.post.mockResolvedValueOnce({ data: { success: true } });

      await oauthService.connectGitHubForTesting('token_123', 'user_123');

      const callArgs = mockAxios.post.mock.calls[0];
      expect(callArgs[1]).toEqual({
        github_token: 'token_123',
        github_username: 'user_123'
      });
    });

    it('should handle authentication failure', async () => {
      const error = new Error('Authentication failed');
      (error as unknown as Record<string, unknown>).response = { status: 401 };

      mockAxios.post.mockRejectedValueOnce(error);

      await expect(
        oauthService.connectGitHubForTesting('invalid_token', 'user')
      ).rejects.toThrow();
    });

    it('should handle rate limiting', async () => {
      const error = new Error('Rate limit exceeded');
      (error as unknown as Record<string, unknown>).response = { status: 429 };

      mockAxios.post.mockRejectedValueOnce(error);

      await expect(
        oauthService.connectGitHubForTesting('token', 'user')
      ).rejects.toThrow();
    });
  });

  describe('Provider specific tests', () => {
    it('should handle Google OAuth initiation with userAuthUrl', () => {
      oauthService.initiateOAuth('google', 'https://accounts.google.com/o/oauth2/v2/auth');

      expect(localStorageMock.getItem('oauth_provider')).toBe('google');
    });

    it('should handle Microsoft OAuth initiation with userAuthUrl', () => {
      oauthService.initiateOAuth('microsoft', 'https://login.microsoft.com/oauth');

      expect(localStorageMock.getItem('oauth_provider')).toBe('microsoft');
    });

    it('should handle Discord OAuth initiation with userAuthUrl', () => {
      oauthService.initiateOAuth('discord', 'https://discord.com/api/oauth2/authorize');

      expect(localStorageMock.getItem('oauth_provider')).toBe('discord');
    });
  });
});
