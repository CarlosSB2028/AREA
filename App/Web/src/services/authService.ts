import axios from '../config/axios';
import { LoginData, RegisterData, ProfileData, UserContent, LoginResponse } from '../types';
import { API_CONFIG, USE_MOCK_DATA } from '../config/api';
import { clearSecureToken } from '../utils/secureStorage';

export const login = async (data: LoginData): Promise<LoginResponse> => {
  if (USE_MOCK_DATA) {
    if (data.email !== 'test@test.com' || data.password !== 'password123') {
      const error = {
        response: {
          status: 401,
          data: { message: 'Invalid credentials' }
        },
        message: 'Invalid email or password'
      };
      throw error;
    }
    return Promise.resolve({
      message: 'Login successful',
      user: {
        id: 1,
        email: data.email,
        isActive: true,
        isAdmin: false,
        createdAt: new Date().toISOString()
      },
      token: 'mock-token',
      refreshToken: 'mock-refresh-token'
    });
  }

  try {
    const response = await axios.post(API_CONFIG.endpoints.auth.login, data);
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (data: RegisterData): Promise<LoginResponse> => {
  if (USE_MOCK_DATA)
    return Promise.resolve({
      message: 'Registration successful',
      user: {
        id: 1,
        email: data.email,
        isActive: true,
        isAdmin: false,
        createdAt: new Date().toISOString()
      },
      token: 'mock-token',
      refreshToken: 'mock-refresh-token'
    });

  try {
    const response = await axios.post(API_CONFIG.endpoints.auth.register, data);
    return response.data;
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
};

export const forgotPassword = async (email: string): Promise<void> => {
  if (USE_MOCK_DATA)
    return Promise.resolve();

  try {
    await axios.post(API_CONFIG.endpoints.auth.forgotPassword, { email });
  } catch (error) {
    console.error('Forgot password error:', error);
    throw error;
  }
};

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  if (USE_MOCK_DATA)
    return Promise.resolve();

  try {
    await axios.post(API_CONFIG.endpoints.auth.resetPassword, { token, newPassword });
  } catch (error) {
    console.error('Reset password error:', error);
    throw error;
  }
};

export const updateProfile = async (userId: string, data: ProfileData, avatarUrl?: string): Promise<UserContent> => {
  if (USE_MOCK_DATA)
    return Promise.resolve({
      id: userId,
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      avatarSrc: avatarUrl || 'https://mock.jpg',
      password: '',
      isAdmin: false,
      isVerified: true,
      profileData: data
    });

  try {
    const updateData: Record<string, string | undefined> = {
      firstname: data.firstName,
      lastname: data.lastName,
    };
    if (data.username)
      updateData.username = data.username;
    if (data.password && data.password.trim() !== '')
      updateData.password = data.password;
    if (avatarUrl)
      updateData.avatarUrl = avatarUrl;

    const response = await axios.put(`${API_CONFIG.endpoints.user.profile}/${userId}`, updateData);
    const backendUser = response.data;
    return {
      id: backendUser.id,
      name: `${backendUser.firstname || ''} ${backendUser.lastname || ''}`.trim(),
      email: backendUser.email,
      avatarSrc: backendUser.avatarUrl || '',
      password: '',
      isAdmin: backendUser.isAdmin || false,
      isVerified: backendUser.isActive || false,
      profileData: {
        email: backendUser.email,
        username: backendUser.username || '',
        firstName: backendUser.firstname || '',
        lastName: backendUser.lastname || '',
        language: data.language || 'en'
      }
    };
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await axios.post(API_CONFIG.endpoints.auth.logout);
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    await clearSecureToken();
  }
};

export const getCurrentUser = async (): Promise<UserContent> => {
  if (USE_MOCK_DATA)
    return Promise.resolve({
      id: '1',
      name: 'Mock User',
      email: 'mock@example.com',
      avatarSrc: 'https://mock.jpg',
      password: 'feafze235fùd*a',
      isAdmin: true,
      isVerified: true,
      profileData: {
        email: 'mock@example.com',
        firstName: 'Mock',
        lastName: 'User',
        language: 'en'
      }
    });

  try {
    const response = await axios.get(API_CONFIG.endpoints.auth.me);
    const backendUser = response.data;
    return {
      id: backendUser.id,
      name: `${backendUser.firstname || ''} ${backendUser.lastname || ''}`.trim() || backendUser.email,
      email: backendUser.email,
      avatarSrc: backendUser.avatarUrl || '',
      password: '',
      isAdmin: backendUser.isAdmin || false,
      isVerified: backendUser.isActive || false,
      profileData: {
        email: backendUser.email,
        username: backendUser.username || '',
        firstName: backendUser.firstname || '',
        lastName: backendUser.lastname || '',
        language: 'en'
      }
    };
  } catch (error) {
    console.error('Get current user error:', error);
    throw error;
  }
};

export const getAuthStatus = async (): Promise<{ authenticated: boolean }> => {
  if (USE_MOCK_DATA)
    return Promise.resolve({ authenticated: true });

  try {
    const response = await axios.get(API_CONFIG.endpoints.auth.status);
    return response.data;
  } catch (error) {
    console.error('Get auth status error:', error);
    return { authenticated: false };
  }
};

export const refreshToken = async (): Promise<{ token: string }> => {
  if (USE_MOCK_DATA)
    return Promise.resolve({ token: 'mock-refreshed-token' });

  try {
    const response = await axios.post(API_CONFIG.endpoints.auth.refresh);
    return response.data;
  } catch (error) {
    console.error('Refresh token error:', error);
    throw error;
  }
};

export const verifyEmail = async (token: string): Promise<void> => {
  if (USE_MOCK_DATA)
    return Promise.resolve();

  try {
    await axios.get(API_CONFIG.endpoints.auth.verifyEmail, { params: { token } });
  } catch (error) {
    console.error('Verify email error:', error);
    throw error;
  }
};

export const deleteAccount = async (userId: string): Promise<void> => {
  if (USE_MOCK_DATA)
    return Promise.resolve();

  try {
    await axios.delete(`${API_CONFIG.endpoints.user.profile}/${userId}`);
  } catch (error) {
    console.error('Delete account error:', error);
    throw error;
  }
};
