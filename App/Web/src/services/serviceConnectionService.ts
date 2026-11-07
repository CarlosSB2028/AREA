import axios from '../config/axios';
import { API_CONFIG, USE_MOCK_DATA } from '../config/api';

export interface ServiceConnectionStatus {
  serviceKey: string;
  serviceName: string;
  iconUrl: string;
  isConnected: boolean;
  connectionType: 'LOCAL' | 'OAUTH' | 'BOTH' | 'NONE';
  userEmail: string;
  userName: string;
  avatarUrl?: string;
  providerUserId?: string;
  canDisconnect?: boolean;
  isPrimaryAuth?: boolean;
}

const mockConnectionStatus: ServiceConnectionStatus = {
  serviceKey: 'github',
  serviceName: 'GitHub',
  iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg',
  isConnected: true,
  canDisconnect: true,
  isPrimaryAuth: false,
  connectionType: 'OAUTH',
  userEmail: 'user@example.com',
  userName: 'Test User',
  avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/76/Slack_Icon.png',
  providerUserId: 'github123'
};

const mockConnectedServices: ServiceConnectionStatus[] = [
  {
    serviceKey: 'github',
    serviceName: 'GitHub',
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg',
    isConnected: true,
    connectionType: 'OAUTH',
    userEmail: 'user@example.com',
    userName: 'Test User',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/76/Slack_Icon.png',
    providerUserId: 'github123',
    canDisconnect: false,
    isPrimaryAuth: true
  },
  {
    serviceKey: 'google',
    serviceName: 'Google',
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1024px-Google_%22G%22_logo.svg.png',
    isConnected: true,
    connectionType: 'OAUTH',
    userEmail: 'user@example.com',
    userName: 'Test User',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/76/Slack_Icon.png',
    providerUserId: 'google123',
    canDisconnect: true,
    isPrimaryAuth: false
  }
];

export const getServiceConnectionStatus = async (serviceKey: string): Promise<ServiceConnectionStatus> => {
  if (USE_MOCK_DATA) {
    return Promise.resolve({
      ...mockConnectionStatus,
      serviceKey,
      serviceName: getServiceDisplayName(serviceKey),
      iconUrl: getServiceIconUrl(serviceKey)
    });
  }

  try {
    const response = await axios.get(`${API_CONFIG.endpoints.user.serviceConnection}/${serviceKey}`);
    return response.data;
  } catch (error) {
    console.error('Get service connection status error:', error);
    throw error;
  }
};

export const getConnectedServices = async (): Promise<ServiceConnectionStatus[]> => {
  if (USE_MOCK_DATA) {
    return Promise.resolve(mockConnectedServices);
  }

  try {
    const response = await axios.get(API_CONFIG.endpoints.user.connectedServices);
    return response.data;
  } catch (error) {
    console.error('Get connected services error:', error);
    throw error;
  }
};

export const initiateServiceConnection = async (serviceKey: string, returnUrl?: string): Promise<void> => {
  if (USE_MOCK_DATA) {
    console.log(`Mock service connection initiation for ${serviceKey}`);
    return;
  }

  try {
    const redirectAfterAuth = returnUrl || window.location.href;
    localStorage.setItem('oauth_return_url', redirectAfterAuth);

    localStorage.setItem('oauth_link_mode', 'true');

    const provider = mapServiceKeyToOAuthProvider(serviceKey);
    localStorage.setItem('oauth_provider', provider);
    const oauthUrl = `${API_CONFIG.baseURL}/api/oauth/${provider}/authorize`;

    window.location.href = oauthUrl;
  } catch (error) {
    console.error('Initiate service connection error:', error);
    throw error;
  }
};

export const disconnectService = async (serviceKey: string): Promise<void> => {
  if (USE_MOCK_DATA) {
    console.log(`Mock service disconnection for ${serviceKey}`);
    return;
  }

  try {
    const response = await axios.delete(`${API_CONFIG.endpoints.user.serviceConnection}/${serviceKey}`);
    return response.data;
  } catch (error) {
    console.error('Disconnect service error:', error);
    throw error;
  }
};

function mapServiceKeyToOAuthProvider(serviceKey: string): string {
  switch (serviceKey.toLowerCase()) {
    case 'github':
      return 'github';
    case 'google':
      return 'google';
    case 'microsoft':
      return 'microsoft';
    default:
      return serviceKey.toLowerCase();
  }
}

function getServiceDisplayName(serviceKey: string): string {
  switch (serviceKey.toLowerCase()) {
    case 'github':
      return 'GitHub';
    case 'google':
      return 'Google';
    case 'microsoft':
      return 'Microsoft';
    default:
      return serviceKey;
  }
}

function getServiceIconUrl(serviceKey: string): string {
  switch (serviceKey.toLowerCase()) {
    case 'github':
      return 'https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg';
    case 'google':
      return 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1024px-Google_%22G%22_logo.svg.png';
    case 'microsoft':
      return 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg';
    default:
      return '/file.svg';
  }
}