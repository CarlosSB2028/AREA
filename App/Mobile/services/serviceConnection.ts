import { apiClient } from './api';
import { ENV } from './api.config';

const USE_MOCK = ENV.USE_MOCK;

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

/**
 * Get connection status for a specific service
 */
export async function getServiceConnectionStatus(serviceKey: string): Promise<ServiceConnectionStatus> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      serviceKey,
      serviceName: getServiceDisplayName(serviceKey),
      iconUrl: `https://example.com/icons/${serviceKey}.png`,
      isConnected: false,
      connectionType: 'OAUTH',
      userEmail: '',
      userName: '',
      canDisconnect: true,
      isPrimaryAuth: false,
    };
  }

  return apiClient.get<ServiceConnectionStatus>(`/api/user/service-connection/${serviceKey}`);
}

/**
 * Get all connected services for the current user
 */
export async function getConnectedServices(): Promise<ServiceConnectionStatus[]> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      {
        serviceKey: 'github',
        serviceName: 'GitHub',
        iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg',
        isConnected: true,
        connectionType: 'OAUTH',
        userEmail: 'user@github.com',
        userName: 'Test User',
        avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
        providerUserId: 'github123',
        canDisconnect: false,
        isPrimaryAuth: true,
      }
    ];
  }

  return apiClient.get<ServiceConnectionStatus[]>('/api/user/connected-services');
}

/**
 * Disconnect a service
 */
export async function disconnectService(serviceKey: string): Promise<void> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`Mock: Disconnected ${serviceKey}`);
    return;
  }

  return apiClient.delete<void>(`/api/user/service-connection/${serviceKey}`);
}

/**
 * Map service key to OAuth provider name
 */
export function mapServiceKeyToOAuthProvider(serviceKey: string): string {
  return serviceKey.toLowerCase();
}

/**
 * Get display name for a service
 */
function getServiceDisplayName(serviceKey: string): string {
  return serviceKey.charAt(0).toUpperCase() + serviceKey.slice(1);
}
