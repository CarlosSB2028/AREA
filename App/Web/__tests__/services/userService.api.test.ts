/**
 * userService API tests with real backend response structures
 * Tests user profile, avatar upload, and connected services
 */
import axios from '../../src/config/axios';
import * as userService from '../../src/services/userService';
import { API_CONFIG } from '../../src/config/api';
import { UserContent, ConnectedService, BackendService } from '../../src/types';

jest.mock('../../src/config/axios');

// Mock USE_MOCK_DATA to force API mode
jest.mock('../../src/config/api', () => {
  const actualApi = jest.requireActual('../../src/config/api');
  return {
    ...actualApi,
    USE_MOCK_DATA: false,
  };
});

const mockAxios = axios as jest.Mocked<typeof axios>;

describe('userService with real API responses', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUser', () => {
    it('should fetch user by email', async () => {
      const mockUser: UserContent = {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        avatarSrc: 'https://example.com/avatar.jpg',
        password: '',
        isAdmin: false,
        isVerified: true,
        profileData: {
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          username: 'johndoe',
          language: 'en'
        }
      };

      mockAxios.get.mockResolvedValueOnce({ data: mockUser });

      const result = await userService.getUser('john@example.com');

      expect(mockAxios.get).toHaveBeenCalledWith(
        `${API_CONFIG.endpoints.user.getUser}/john@example.com`
      );
      expect(result).toEqual(mockUser);
    });

    it('should handle user not found', async () => {
      mockAxios.get.mockRejectedValueOnce(new Error('User not found'));

      await expect(userService.getUser('nonexistent@example.com')).rejects.toThrow();
    });

    it('should handle network error', async () => {
      mockAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(userService.getUser('test@example.com')).rejects.toThrow('Network error');
    });
  });

  describe('getUserInfo', () => {
    it('should fetch current user info', async () => {
      const mockBackendUser = {
        id: 'user-2',
        email: 'jane@example.com',
        firstname: 'Jane',
        lastname: 'Smith',
        username: 'janesmith',
        isAdmin: false,
        isActive: true,
        avatarUrl: 'https://example.com/jane-avatar.jpg'
      };

      mockAxios.get.mockResolvedValueOnce({ data: mockBackendUser });

      const result = await userService.getUserInfo();

      expect(mockAxios.get).toHaveBeenCalledWith(API_CONFIG.endpoints.user.getUser);
      expect(result.name).toBe('Jane Smith');
      expect(result.email).toBe('jane@example.com');
      expect(result.isAdmin).toBe(false);
    });

    it('should handle user with no name', async () => {
      const mockBackendUser = {
        id: 'user-3',
        email: 'noname@example.com',
        firstname: '',
        lastname: '',
        isAdmin: false,
        isActive: true
      };

      mockAxios.get.mockResolvedValueOnce({ data: mockBackendUser });

      const result = await userService.getUserInfo();

      expect(result.name).toBe('noname@example.com');
    });

    it('should handle admin user', async () => {
      const mockBackendUser = {
        id: 'admin-1',
        email: 'admin@example.com',
        firstname: 'Admin',
        lastname: 'User',
        isAdmin: true,
        isActive: true,
        avatarUrl: 'https://example.com/admin-avatar.jpg'
      };

      mockAxios.get.mockResolvedValueOnce({ data: mockBackendUser });

      const result = await userService.getUserInfo();

      expect(result.isAdmin).toBe(true);
      expect(result.isVerified).toBe(true);
    });

    it('should handle inactive user', async () => {
      const mockBackendUser = {
        id: 'user-4',
        email: 'inactive@example.com',
        firstname: 'Inactive',
        lastname: 'User',
        isAdmin: false,
        isActive: false
      };

      mockAxios.get.mockResolvedValueOnce({ data: mockBackendUser });

      const result = await userService.getUserInfo();

      expect(result.isVerified).toBe(false);
    });

    it('should handle user with null avatar', async () => {
      const mockBackendUser = {
        id: 'user-5',
        email: 'noavatar@example.com',
        firstname: 'No',
        lastname: 'Avatar',
        isAdmin: false,
        isActive: true,
        avatarUrl: null
      };

      mockAxios.get.mockResolvedValueOnce({ data: mockBackendUser });

      const result = await userService.getUserInfo();

      expect(result.avatarSrc).toBe('');
    });

    it('should handle fetch error', async () => {
      mockAxios.get.mockRejectedValueOnce(new Error('Unauthorized'));

      await expect(userService.getUserInfo()).rejects.toThrow('Unauthorized');
    });
  });

  describe('getUserById', () => {
    it('should fetch user by id', async () => {
      const mockBackendUser = {
        id: 'user-6',
        email: 'byid@example.com',
        firstname: 'By',
        lastname: 'Id',
        isAdmin: false,
        isActive: true,
        avatarUrl: 'https://example.com/avatar.jpg'
      };

      mockAxios.get.mockResolvedValueOnce({ data: mockBackendUser });

      const result = await userService.getUserById('user-6');

      expect(mockAxios.get).toHaveBeenCalledWith(
        `${API_CONFIG.endpoints.user.getUserById}/user-6`
      );
      expect(result.id).toBe('user-6');
      expect(result.name).toBe('By Id');
    });

    it('should handle missing username field', async () => {
      const mockBackendUser = {
        id: 'user-7',
        email: 'nousername@example.com',
        firstname: 'No',
        lastname: 'Username',
        isAdmin: false,
        isActive: true
      };

      mockAxios.get.mockResolvedValueOnce({ data: mockBackendUser });

      const result = await userService.getUserById('user-7');

      expect(result.profileData.username).toBeUndefined();
    });

    it('should handle user not found by id', async () => {
      mockAxios.get.mockRejectedValueOnce(new Error('User not found'));

      await expect(userService.getUserById('invalid-id')).rejects.toThrow();
    });
  });

  describe('uploadAvatar', () => {
    it('should upload avatar file', async () => {
      const mockFile = new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' });
      mockAxios.post.mockResolvedValueOnce({
        data: { avatarUrl: 'https://example.com/uploaded-avatar.jpg' }
      });

      const result = await userService.uploadAvatar(mockFile);

      expect(mockAxios.post).toHaveBeenCalledWith(
        API_CONFIG.endpoints.user.avatar,
        expect.any(FormData),
        expect.objectContaining({
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      );
      expect(result).toBe('https://example.com/uploaded-avatar.jpg');
    });

    it('should handle upload errors', async () => {
      const mockFile = new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' });
      mockAxios.post.mockRejectedValueOnce(new Error('Upload failed'));

      await expect(userService.uploadAvatar(mockFile)).rejects.toThrow('Upload failed');
    });

    it('should handle file too large', async () => {
      const mockFile = new File(['x'.repeat(10000000)], 'large.jpg', { type: 'image/jpeg' });
      mockAxios.post.mockRejectedValueOnce(new Error('File too large'));

      await expect(userService.uploadAvatar(mockFile)).rejects.toThrow('File too large');
    });

    it('should handle invalid file type', async () => {
      const mockFile = new File(['content'], 'file.txt', { type: 'text/plain' });
      mockAxios.post.mockRejectedValueOnce(new Error('Invalid file type'));

      await expect(userService.uploadAvatar(mockFile)).rejects.toThrow('Invalid file type');
    });

    it('should send formdata with correct structure', async () => {
      const mockFile = new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' });
      mockAxios.post.mockResolvedValueOnce({
        data: { avatarUrl: 'https://example.com/new-avatar.jpg' }
      });

      await userService.uploadAvatar(mockFile);

      const callArgs = mockAxios.post.mock.calls[0];
      expect(callArgs[0]).toBe(API_CONFIG.endpoints.user.avatar);
      expect(callArgs[1]).toBeInstanceOf(FormData);
      expect(callArgs[2]?.headers?.['Content-Type']).toBe('multipart/form-data');
    });
  });

  describe('getConnectedServices', () => {
    it('should fetch connected services', async () => {
      const mockServices: ConnectedService[] = [
        {
          serviceKey: 'github',
          serviceName: 'GitHub',
          iconUrl: 'https://github.com/logo.png',
          connectionType: 'OAUTH2',
          userEmail: 'user@github.com',
          userName: 'johndoe',
          avatarUrl: 'https://avatars.githubusercontent.com/u/123',
          providerUserId: 'gh-123',
          isConnected: true
        },
        {
          serviceKey: 'discord',
          serviceName: 'Discord',
          iconUrl: 'https://discord.com/logo.png',
          connectionType: 'OAUTH2',
          userEmail: 'user@discord.com',
          userName: 'johndoe#1234',
          avatarUrl: 'https://cdn.discordapp.com/avatars/456',
          providerUserId: 'dc-456',
          isConnected: true
        }
      ];

      mockAxios.get.mockResolvedValueOnce({ data: mockServices });

      const result = await userService.getConnectedServices();

      expect(mockAxios.get).toHaveBeenCalledWith(API_CONFIG.endpoints.user.connectedServices);
      expect(result).toHaveLength(2);
      expect(result[0].serviceKey).toBe('github');
      expect(result[1].serviceKey).toBe('discord');
    });

    it('should handle empty connected services', async () => {
      mockAxios.get.mockResolvedValueOnce({ data: [] });

      const result = await userService.getConnectedServices();

      expect(result).toEqual([]);
    });

    it('should handle non-array response', async () => {
      mockAxios.get.mockResolvedValueOnce({ data: null });

      const result = await userService.getConnectedServices();

      expect(result).toEqual([]);
    });

    it('should handle fetch error gracefully', async () => {
      mockAxios.get.mockRejectedValueOnce(new Error('Fetch failed'));

      await expect(userService.getConnectedServices()).rejects.toThrow();
    });
  });

  describe('getAllServices', () => {
    it('should fetch all services with pageable response', async () => {
      const mockServices: BackendService[] = [
        {
          id: '1',
          key: 'github',
          name: 'GitHub',
          auth: 'OAUTH2',
          isActive: true,
          iconLightUrl: 'https://github.com/logo-light.png',
          iconDarkUrl: 'https://github.com/logo-dark.png'
        },
        {
          id: '2',
          key: 'google',
          name: 'Google',
          auth: 'OAUTH2',
          isActive: true,
          iconLightUrl: 'https://google.com/logo-light.png',
          iconDarkUrl: 'https://google.com/logo-dark.png'
        }
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { content: mockServices }
      });

      const result = await userService.getAllServices();

      expect(mockAxios.get).toHaveBeenCalledWith(API_CONFIG.endpoints.services.list);
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('GitHub');
    });

    it('should handle direct array response', async () => {
      const mockServices: BackendService[] = [
        {
          id: '1',
          key: 'github',
          name: 'GitHub',
          auth: 'OAUTH2',
          isActive: true
        }
      ];

      mockAxios.get.mockResolvedValueOnce({ data: mockServices });

      const result = await userService.getAllServices();

      expect(result).toEqual(mockServices);
    });

    it('should handle empty services list', async () => {
      mockAxios.get.mockResolvedValueOnce({ data: { content: [] } });

      const result = await userService.getAllServices();

      expect(result).toEqual([]);
    });

    it('should handle null response', async () => {
      mockAxios.get.mockResolvedValueOnce({ data: null });

      const result = await userService.getAllServices();

      expect(result).toEqual([]);
    });

    it('should handle inactive services', async () => {
      const mockServices: BackendService[] = [
        {
          id: '1',
          key: 'github',
          name: 'GitHub',
          auth: 'OAUTH2',
          isActive: true
        },
        {
          id: '2',
          key: 'deprecated',
          name: 'Deprecated Service',
          auth: 'OAUTH2',
          isActive: false
        }
      ];

      mockAxios.get.mockResolvedValueOnce({ data: mockServices });

      const result = await userService.getAllServices();

      expect(result).toHaveLength(2);
      expect(result.find(s => s.key === 'deprecated')?.isActive).toBe(false);
    });

    it('should handle fetch error', async () => {
      mockAxios.get.mockRejectedValueOnce(new Error('Fetch failed'));

      await expect(userService.getAllServices()).rejects.toThrow();
    });
  });
});
