import axios from 'axios';
import * as serviceTokenService from '../../src/services/serviceTokenService';
import type { ServiceTokenRequest, ServiceAccountResponse, ServiceTokenStatusResponse } from '../../src/services/serviceTokenService';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('serviceTokenService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('storeServiceToken', () => {
    it('should store service token successfully', async () => {
      const request: ServiceTokenRequest = {
        serviceKey: 'github',
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };
      const mockResponse: ServiceAccountResponse = {
        id: '1',
        serviceKey: 'github',
        serviceName: 'GitHub',
        hasAccessToken: true,
        hasRefreshToken: true,
        expired: false,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };
      mockedAxios.post.mockResolvedValue({ data: mockResponse });

      const result = await serviceTokenService.storeServiceToken(request);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8080/api/service-tokens/github',
        request,
        { withCredentials: true }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const request: ServiceTokenRequest = {
        serviceKey: 'github',
        accessToken: 'access-token',
      };
      mockedAxios.post.mockRejectedValue(new Error('Network error'));

      await expect(serviceTokenService.storeServiceToken(request)).rejects.toThrow('Network error');
      expect(consoleSpy).toHaveBeenCalledWith('Error storing service token:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('getUserServiceAccounts', () => {
    it('should fetch user service accounts successfully', async () => {
      const mockAccounts: ServiceAccountResponse[] = [
        {
          id: '1',
          serviceKey: 'github',
          serviceName: 'GitHub',
          hasAccessToken: true,
          hasRefreshToken: false,
          expired: false,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ];
      mockedAxios.get.mockResolvedValue({ data: mockAccounts });

      const result = await serviceTokenService.getUserServiceAccounts();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/service-tokens',
        { withCredentials: true }
      );
      expect(result).toEqual(mockAccounts);
    });

    it('should handle errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      await expect(serviceTokenService.getUserServiceAccounts()).rejects.toThrow('Network error');
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching user service accounts:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('getServiceAccount', () => {
    it('should fetch service account successfully', async () => {
      const mockAccount: ServiceAccountResponse = {
        id: '1',
        serviceKey: 'github',
        serviceName: 'GitHub',
        hasAccessToken: true,
        hasRefreshToken: false,
        expired: false,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };
      mockedAxios.get.mockResolvedValue({ data: mockAccount });

      const result = await serviceTokenService.getServiceAccount('github');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/service-tokens/github',
        { withCredentials: true }
      );
      expect(result).toEqual(mockAccount);
    });

    it('should return null for 404 error', async () => {
      mockedAxios.get.mockRejectedValue({
        isAxiosError: true,
        response: { status: 404 },
      });
      mockedAxios.isAxiosError.mockReturnValue(true);

      const result = await serviceTokenService.getServiceAccount('nonexistent');

      expect(result).toBeNull();
    });

    it('should throw for other errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockedAxios.get.mockRejectedValue(new Error('Network error'));
      mockedAxios.isAxiosError.mockReturnValue(false);

      await expect(serviceTokenService.getServiceAccount('github')).rejects.toThrow('Network error');
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching service account:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('hasValidToken', () => {
    it('should return true when token is valid (object response)', async () => {
      const mockResponse: ServiceTokenStatusResponse = {
        hasValidToken: true,
        serviceName: 'GitHub',
      };
      mockedAxios.get.mockResolvedValue({ data: mockResponse });

      const result = await serviceTokenService.hasValidToken('github');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/service-tokens/github/status',
        { withCredentials: true }
      );
      expect(result).toBe(true);
    });

    it('should return false when token is invalid (object response)', async () => {
      const mockResponse: ServiceTokenStatusResponse = {
        hasValidToken: false,
        serviceName: 'GitHub',
      };
      mockedAxios.get.mockResolvedValue({ data: mockResponse });

      const result = await serviceTokenService.hasValidToken('github');

      expect(result).toBe(false);
    });

    it('should return true when token is valid (boolean response)', async () => {
      mockedAxios.get.mockResolvedValue({ data: true });

      const result = await serviceTokenService.hasValidToken('github');

      expect(result).toBe(true);
    });

    it('should return false when token is invalid (boolean response)', async () => {
      mockedAxios.get.mockResolvedValue({ data: false });

      const result = await serviceTokenService.hasValidToken('github');

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      const result = await serviceTokenService.hasValidToken('github');

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Error checking token status:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('revokeServiceToken', () => {
    it('should revoke service token successfully', async () => {
      mockedAxios.delete.mockResolvedValue({});

      await serviceTokenService.revokeServiceToken('github');

      expect(mockedAxios.delete).toHaveBeenCalledWith(
        'http://localhost:8080/api/service-tokens/github',
        { withCredentials: true }
      );
    });

    it('should handle errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockedAxios.delete.mockRejectedValue(new Error('Network error'));

      await expect(serviceTokenService.revokeServiceToken('github')).rejects.toThrow('Network error');
      expect(consoleSpy).toHaveBeenCalledWith('Error revoking service token:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });
});
