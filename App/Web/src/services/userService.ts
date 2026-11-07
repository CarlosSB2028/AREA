import axios from '../config/axios';
import { UserContent, ConnectedService, BackendService } from '@/types';
import { mockUser } from '@/mocks/user';
import { API_CONFIG, USE_MOCK_DATA } from '@/config/api';

export const getUser = async (email: string): Promise<UserContent> => {
  if (USE_MOCK_DATA)
    return mockUser;

  try {
    const response = await axios.get(`${API_CONFIG.endpoints.user.getUser}/${email}`);
    return response.data;
  } catch (error) {
    console.error('Get user error:', error);
    throw error;
  }
};

export const uploadAvatar = async (file: File): Promise<string> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return 'https://mock.jpg';
  }

  try {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await axios.post(API_CONFIG.endpoints.user.avatar, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.avatarUrl;
  } catch (error) {
    console.error('Upload avatar error:', error);
    throw error;
  }
};

export const getUserInfo = async (): Promise<UserContent> => {
  if (USE_MOCK_DATA)
    return mockUser;

  try {
    const response = await axios.get(API_CONFIG.endpoints.user.getUser);
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
    console.error('Get user info error:', error);
    throw error;
  }
}

export const getUserById = async (id: string): Promise<UserContent> => {
  if (USE_MOCK_DATA)
    return mockUser;
  try {
    const response = await axios.get(`${API_CONFIG.endpoints.user.getUserById}/${id}`);
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
        firstName: backendUser.firstname || '',
        lastName: backendUser.lastname || '',
        language: 'en'
      }
    };
  } catch (error) {
    console.error('Get user by id error:', error);
    throw error;
  }
};

export const getConnectedServices = async (): Promise<ConnectedService[]> => {
  if (USE_MOCK_DATA) {
    return [
      {
        serviceKey: 'github',
        serviceName: 'GitHub',
        iconUrl: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
        connectionType: 'OAUTH2',
        userEmail: 'user@example.com',
        userName: 'John Doe',
        avatarUrl: 'https://avatars.githubusercontent.com/u/123456',
        providerUserId: '123456',
        isConnected: true
      }
    ];
  }

  try {
    const response = await axios.get(API_CONFIG.endpoints.user.connectedServices);
    const data = response.data;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Get connected services error:', error);
    throw error;
  }
};

export const getAllServices = async (): Promise<BackendService[]> => {
  if (USE_MOCK_DATA) {
    return [
      {
        id: '1',
        key: 'github',
        name: 'GitHub',
        auth: 'OAUTH2',
        isActive: true,
        iconLightUrl: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
        iconDarkUrl: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'
      },
      {
        id: '2',
        key: 'google',
        name: 'Google',
        auth: 'OAUTH2',
        isActive: true,
        iconLightUrl: 'https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png',
        iconDarkUrl: 'https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png'
      },
      {
        id: '3',
        key: 'discord',
        name: 'Discord',
        auth: 'OAUTH2',
        isActive: true,
        iconLightUrl: 'https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png',
        iconDarkUrl: 'https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png'
      }
    ];
  }

  try {
    const response = await axios.get(API_CONFIG.endpoints.services.list);
    const data = response.data;
    if (data && typeof data === 'object' && Array.isArray(data.content))
      return data.content;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Get all services error:', error);
    throw error;
  }
};