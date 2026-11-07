/**
 * authService API tests with real backend response structures
 * Tests all authentication flows: login, register, password reset, profile updates
 */
import axios from '../../src/config/axios';
import * as authService from '../../src/services/authService';
import { API_CONFIG } from '../../src/config/api';
import { LoginResponse } from '../../src/types';
import * as secureStorage from '../../src/utils/secureStorage';

jest.mock('../../src/config/axios');
jest.mock('../../src/utils/secureStorage', () => ({
  clearSecureToken: jest.fn(),
}));

// Mock USE_MOCK_DATA to force API mode
jest.mock('../../src/config/api', () => {
  const actualApi = jest.requireActual('../../src/config/api');
  return {
    ...actualApi,
    USE_MOCK_DATA: false,
  };
});

const mockAxios = axios as jest.Mocked<typeof axios>;
const mockSecureStorage = secureStorage as jest.Mocked<typeof secureStorage>;

describe('authService with real API responses', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login with email credentials', async () => {
      const loginData = { email: 'user@example.com', password: 'password123' };
      const mockResponse: LoginResponse = {
        message: 'Login successful',
        user: {
          id: 'user-1',
          email: 'user@example.com',
          isActive: true,
          isAdmin: false,
          createdAt: '2025-01-10T10:00:00Z'
        },
        token: 'access-token-123',
        refreshToken: 'refresh-token-123'
      };

      mockAxios.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await authService.login(loginData);

      expect(mockAxios.post).toHaveBeenCalledWith(
        API_CONFIG.endpoints.auth.login,
        loginData
      );
      expect(result).toEqual(mockResponse);
      expect(result.token).toBe('access-token-123');
    });

    it('should login with username credentials', async () => {
      const loginData = { username: 'testuser', password: 'password123' };
      const mockResponse: LoginResponse = {
        message: 'Login successful',
        user: {
          id: 'user-2',
          username: 'testuser',
          email: 'testuser@example.com',
          isActive: true,
          isAdmin: false,
          createdAt: '2025-01-10T10:00:00Z'
        },
        token: 'access-token-456',
        refreshToken: 'refresh-token-456'
      };

      mockAxios.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await authService.login(loginData);

      expect(result.user.id).toBe('user-2');
      expect(result.token).toBe('access-token-456');
    });

    it('should handle invalid credentials', async () => {
      const loginData = { email: 'invalid@example.com', password: 'wrong' };
      mockAxios.post.mockRejectedValueOnce(
        new Error('401 Unauthorized')
      );

      await expect(authService.login(loginData)).rejects.toThrow();
    });

    it('should handle network error', async () => {
      mockAxios.post.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        authService.login({ email: 'user@example.com', password: 'pass' })
      ).rejects.toThrow('Network error');
    });

    it('should include user metadata', async () => {
      const mockResponse: LoginResponse = {
        message: 'Login successful',
        user: {
          id: 'user-3',
          email: 'user3@example.com',
          isActive: true,
          isAdmin: true,
          createdAt: '2025-01-10T10:00:00Z',
          confirmedAt: '2025-01-11T10:00:00Z',
          lastLoginAt: '2025-01-15T14:30:00Z',
          avatarUrl: 'https://example.com/avatar.jpg'
        },
        token: 'token-123',
        refreshToken: 'refresh-123'
      };

      mockAxios.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await authService.login({ email: 'user3@example.com', password: 'pass' });

      expect(result.user.isAdmin).toBe(true);
      expect(result.user.avatarUrl).toBe('https://example.com/avatar.jpg');
    });
  });

  describe('register', () => {
    it('should register new user', async () => {
      const registerData = {
        email: 'newuser@example.com',
        username: 'newuser',
        firstName: 'New',
        lastName: 'User',
        password: 'SecurePass123!'
      };

      const mockResponse: LoginResponse = {
        message: 'Registration successful',
        user: {
          id: 'user-4',
          email: 'newuser@example.com',
          isActive: false,
          isAdmin: false,
          createdAt: '2025-01-20T12:00:00Z'
        },
        token: 'access-token-new',
        refreshToken: 'refresh-token-new'
      };

      mockAxios.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await authService.register(registerData);

      expect(mockAxios.post).toHaveBeenCalledWith(
        API_CONFIG.endpoints.auth.register,
        registerData
      );
      expect(result.user.email).toBe('newuser@example.com');
      expect(result.user.isActive).toBe(false); // Email not verified
    });

    it('should handle registration errors', async () => {
      mockAxios.post.mockRejectedValueOnce(
        new Error('Email already exists')
      );

      await expect(
        authService.register({
          email: 'existing@example.com',
          username: 'existing',
          firstName: 'User',
          lastName: 'Test',
          password: 'pass'
        })
      ).rejects.toThrow('Email already exists');
    });

    it('should handle registration with admin flag', async () => {
      const registerData = {
        email: 'admin@example.com',
        username: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        password: 'AdminPass123!',
        isAdmin: true
      };

      mockAxios.post.mockResolvedValueOnce({
        data: {
          message: 'Registration successful',
          user: {
            id: 'admin-1',
            email: 'admin@example.com',
            isActive: false,
            isAdmin: true,
            createdAt: '2025-01-20T12:00:00Z'
          },
          token: 'admin-token',
          refreshToken: 'admin-refresh'
        }
      });

      const result = await authService.register(registerData);

      expect(result.user.isAdmin).toBe(true);
    });
  });

  describe('forgotPassword', () => {
    it('should request password reset', async () => {
      mockAxios.post.mockResolvedValueOnce({ data: { message: 'Reset email sent' } });

      await authService.forgotPassword('user@example.com');

      expect(mockAxios.post).toHaveBeenCalledWith(
        API_CONFIG.endpoints.auth.forgotPassword,
        { email: 'user@example.com' }
      );
    });

    it('should handle user not found', async () => {
      mockAxios.post.mockRejectedValueOnce(new Error('User not found'));

      await expect(
        authService.forgotPassword('nonexistent@example.com')
      ).rejects.toThrow('User not found');
    });

    it('should handle invalid email format', async () => {
      mockAxios.post.mockRejectedValueOnce(new Error('Invalid email'));

      await expect(
        authService.forgotPassword('not-an-email')
      ).rejects.toThrow('Invalid email');
    });
  });

  describe('resetPassword', () => {
    it('should reset password with token', async () => {
      mockAxios.post.mockResolvedValueOnce({ data: { message: 'Password reset successful' } });

      await authService.resetPassword('reset-token-123', 'NewPassword123!');

      expect(mockAxios.post).toHaveBeenCalledWith(
        API_CONFIG.endpoints.auth.resetPassword,
        { token: 'reset-token-123', newPassword: 'NewPassword123!' }
      );
    });

    it('should handle expired token', async () => {
      mockAxios.post.mockRejectedValueOnce(new Error('Token expired'));

      await expect(
        authService.resetPassword('expired-token', 'NewPass123!')
      ).rejects.toThrow('Token expired');
    });

    it('should handle invalid token', async () => {
      mockAxios.post.mockRejectedValueOnce(new Error('Invalid token'));

      await expect(
        authService.resetPassword('invalid-token', 'NewPass123!')
      ).rejects.toThrow('Invalid token');
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const updateData = {
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe'
      };

      const mockResponse = {
        id: 'user-1',
        email: 'user@example.com',
        firstname: 'John',
        lastname: 'Doe',
        username: 'johndoe',
        isAdmin: false,
        isActive: true,
        avatarUrl: 'https://example.com/avatar.jpg'
      };

      mockAxios.put.mockResolvedValueOnce({ data: mockResponse });

      const result = await authService.updateProfile('user-1', updateData);

      expect(mockAxios.put).toHaveBeenCalledWith(
        `${API_CONFIG.endpoints.user.profile}/user-1`,
        expect.objectContaining({
          firstname: 'John',
          lastname: 'Doe'
        })
      );
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('user@example.com');
    });

    it('should update profile with password', async () => {
      const updateData = {
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'NewPass123!'
      };

      mockAxios.put.mockResolvedValueOnce({
        data: {
          id: 'user-1',
          email: 'user@example.com',
          firstname: 'John',
          lastname: 'Doe',
          isAdmin: false,
          isActive: true
        }
      });

      await authService.updateProfile('user-1', updateData);

      expect(mockAxios.put).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          password: 'NewPass123!'
        })
      );
    });

    it('should update profile with avatar', async () => {
      const updateData = {
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe'
      };
      const avatarUrl = 'https://example.com/new-avatar.jpg';

      mockAxios.put.mockResolvedValueOnce({
        data: {
          id: 'user-1',
          email: 'user@example.com',
          firstname: 'John',
          lastname: 'Doe',
          isAdmin: false,
          isActive: true,
          avatarUrl
        }
      });

      const result = await authService.updateProfile('user-1', updateData, avatarUrl);

      expect(mockAxios.put).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          avatarUrl
        })
      );
      expect(result.avatarSrc).toBe(avatarUrl);
    });

    it('should skip empty password in update', async () => {
      const updateData = {
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: '   ' // Empty/whitespace password
      };

      mockAxios.put.mockResolvedValueOnce({
        data: {
          id: 'user-1',
          email: 'user@example.com',
          firstname: 'John',
          lastname: 'Doe',
          isAdmin: false,
          isActive: true
        }
      });

      await authService.updateProfile('user-1', updateData);

      expect(mockAxios.put).toHaveBeenCalledWith(
        expect.any(String),
        expect.not.objectContaining({
          password: expect.anything()
        })
      );
    });

    it('should handle profile update errors', async () => {
      mockAxios.put.mockRejectedValueOnce(new Error('Profile update failed'));

      await expect(
        authService.updateProfile('user-1', {
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe'
        })
      ).rejects.toThrow('Profile update failed');
    });
  });

  describe('logout', () => {
    it('should logout and clear tokens', async () => {
      mockAxios.post.mockResolvedValueOnce({ data: { message: 'Logged out' } });
      mockSecureStorage.clearSecureToken.mockResolvedValueOnce(undefined);

      await authService.logout();

      expect(mockAxios.post).toHaveBeenCalledWith(API_CONFIG.endpoints.auth.logout);
      expect(mockSecureStorage.clearSecureToken).toHaveBeenCalled();
    });

    it('should clear tokens even if logout fails', async () => {
      mockAxios.post.mockRejectedValueOnce(new Error('Logout failed'));
      mockSecureStorage.clearSecureToken.mockResolvedValueOnce(undefined);

      await authService.logout();

      expect(mockSecureStorage.clearSecureToken).toHaveBeenCalled();
    });
  });

  describe('getCurrentUser', () => {
    it('should fetch current user profile', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'user@example.com',
        firstname: 'John',
        lastname: 'Doe',
        username: 'johndoe',
        isAdmin: false,
        isActive: true,
        avatarUrl: 'https://example.com/avatar.jpg'
      };

      mockAxios.get.mockResolvedValueOnce({ data: mockUser });

      const result = await authService.getCurrentUser();

      expect(mockAxios.get).toHaveBeenCalledWith(API_CONFIG.endpoints.auth.me);
      expect(result.id).toBe('user-1');
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('user@example.com');
      expect(result.avatarSrc).toBe('https://example.com/avatar.jpg');
    });

    it('should handle user with no name', async () => {
      const mockUser = {
        id: 'user-2',
        email: 'user2@example.com',
        firstname: '',
        lastname: '',
        isAdmin: false,
        isActive: true
      };

      mockAxios.get.mockResolvedValueOnce({ data: mockUser });

      const result = await authService.getCurrentUser();

      expect(result.name).toBe('user2@example.com'); // Falls back to email
    });

    it('should handle user with only first name', async () => {
      const mockUser = {
        id: 'user-3',
        email: 'user3@example.com',
        firstname: 'Jane',
        lastname: '',
        isAdmin: false,
        isActive: true
      };

      mockAxios.get.mockResolvedValueOnce({ data: mockUser });

      const result = await authService.getCurrentUser();

      expect(result.name).toBe('Jane');
    });

    it('should handle unauthorized error', async () => {
      mockAxios.get.mockRejectedValueOnce(new Error('Unauthorized'));

      await expect(authService.getCurrentUser()).rejects.toThrow();
    });
  });

  describe('getAuthStatus', () => {
    it('should return authenticated status', async () => {
      mockAxios.get.mockResolvedValueOnce({ data: { authenticated: true } });

      const result = await authService.getAuthStatus();

      expect(mockAxios.get).toHaveBeenCalledWith(API_CONFIG.endpoints.auth.status);
      expect(result.authenticated).toBe(true);
    });

    it('should return false on error', async () => {
      mockAxios.get.mockRejectedValueOnce(new Error('Unauthorized'));

      const result = await authService.getAuthStatus();

      expect(result.authenticated).toBe(false);
    });
  });

  describe('refreshToken', () => {
    it('should refresh auth token', async () => {
      mockAxios.post.mockResolvedValueOnce({ data: { token: 'new-access-token' } });

      const result = await authService.refreshToken();

      expect(mockAxios.post).toHaveBeenCalledWith(API_CONFIG.endpoints.auth.refresh);
      expect(result.token).toBe('new-access-token');
    });

    it('should handle refresh failure', async () => {
      mockAxios.post.mockRejectedValueOnce(new Error('Refresh failed'));

      await expect(authService.refreshToken()).rejects.toThrow('Refresh failed');
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with token', async () => {
      mockAxios.get.mockResolvedValueOnce({ data: { message: 'Email verified' } });

      await authService.verifyEmail('verify-token-123');

      expect(mockAxios.get).toHaveBeenCalledWith(
        API_CONFIG.endpoints.auth.verifyEmail,
        { params: { token: 'verify-token-123' } }
      );
    });

    it('should handle invalid verification token', async () => {
      mockAxios.get.mockRejectedValueOnce(new Error('Invalid token'));

      await expect(authService.verifyEmail('invalid-token')).rejects.toThrow();
    });

    it('should handle expired verification token', async () => {
      mockAxios.get.mockRejectedValueOnce(new Error('Token expired'));

      await expect(authService.verifyEmail('expired-token')).rejects.toThrow();
    });
  });

  describe('deleteAccount', () => {
    it('should delete user account', async () => {
      mockAxios.delete.mockResolvedValueOnce({ data: { message: 'Account deleted' } });

      await authService.deleteAccount('user-1');

      expect(mockAxios.delete).toHaveBeenCalledWith(
        `${API_CONFIG.endpoints.user.profile}/user-1`
      );
    });

    it('should handle deletion errors', async () => {
      mockAxios.delete.mockRejectedValueOnce(new Error('Cannot delete account'));

      await expect(authService.deleteAccount('user-1')).rejects.toThrow();
    });
  });
});
