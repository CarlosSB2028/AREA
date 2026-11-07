import {
  login,
  register,
  forgotPassword,
  updateProfile,
  logout,
  getCurrentUser,
  getAuthStatus,
  refreshToken
} from '../../src/services/authService';
import axios from '../../src/config/axios';
import { clearSecureToken } from '../../src/utils/secureStorage';

jest.mock('../../src/config/axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('../../src/utils/secureStorage', () => ({
  clearSecureToken: jest.fn()
}));
const mockClearSecureToken = clearSecureToken as jest.MockedFunction<typeof clearSecureToken>;

jest.mock('../../src/config/api', () => ({
  API_CONFIG: {
    endpoints: {
      auth: {
        login: '/auth/login',
        register: '/auth/register',
        forgotPassword: '/auth/forgot-password',
        logout: '/auth/logout',
        me: '/auth/me',
        status: '/auth/status',
        refresh: '/auth/refresh'
      },
      user: {
        profile: '/user/profile'
      }
    }
  },
  USE_MOCK_DATA: true
}));

const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy.mockClear();
    mockClearSecureToken.mockClear();
  });

  describe('login', () => {
    it('should handle login with mock data', async () => {
      const loginData = { email: 'test@test.com', password: 'password123' };

      const result = await login(loginData);

      expect(result.message).toBe('Login successful');
      expect(result.token).toBe('mock-token');
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it('should handle login attempt with any credentials in mock mode', async () => {
      const loginData = { email: 'test@test.com', password: 'password123' };

      const result = await login(loginData);

      expect(result).toBeDefined();
      expect(result.message).toBe('Login successful');
      expect(result.token).toBe('mock-token');
      expect(result.user).toBeDefined();
    });
  });

  describe('register', () => {
    it('should handle registration with mock data', async () => {
      const registerData = {
        email: 'test@test.com',
        username: 'testuser',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const result = await register(registerData);

      expect(result.message).toBe('Registration successful');
      expect(result.token).toBe('mock-token');
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });
  });

  describe('forgotPassword', () => {
    it('should handle forgot password successfully', async () => {
      await expect(forgotPassword('test@test.com')).resolves.toBeUndefined();
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const profileData = {
        email: 'test@test.com',
        firstName: 'John',
        lastName: 'Doe',
        language: 'en'
      };

      const result = await updateProfile("1", profileData);

      expect(result).toBeDefined();
      expect(result.email).toBe('test@test.com');
      expect(result.name).toBe('John Doe');
    });
  });

  describe('logout', () => {
    it('should handle logout operations', async () => {
      await logout();

      expect(mockClearSecureToken).toHaveBeenCalled();
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user from mock', async () => {
      const result = await getCurrentUser();

      expect(result).toBeDefined();
      expect(result.name).toBeDefined();
      expect(result.email).toBeDefined();
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });
  });

  describe('getAuthStatus', () => {
    it('should get auth status from mock', async () => {
      const result = await getAuthStatus();

      expect(result).toEqual({ authenticated: true });
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('should refresh token from mock', async () => {
      const result = await refreshToken();

      expect(result).toBeDefined();
      expect(result.token).toBeDefined();
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });
  });
});