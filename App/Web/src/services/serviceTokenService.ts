import axios from 'axios';

const API_BASE_URL = typeof window !== 'undefined' && window.location.origin.includes('areaaaaaaaaaaaaaaaaaaa.space')
  ? ''
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080');

export interface ServiceTokenRequest {
  serviceKey: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
  remoteAccountId?: string;
  scopes?: Record<string, unknown>;
  webhookSecret?: string;
}

export interface ServiceAccountResponse {
  id: string;
  serviceKey: string;
  serviceName: string;
  remoteAccountId?: string;
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
  expiresAt?: string;
  expired: boolean;
  scopes?: Record<string, unknown>;
  tokenVersion?: number;
  lastRefreshAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceTokenStatusResponse {
  hasValidToken: boolean;
  serviceName: string;
}

export const storeServiceToken = async (request: ServiceTokenRequest): Promise<ServiceAccountResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/service-tokens/${request.serviceKey}`, request, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Error storing service token:', error);
    throw error;
  }
};

export const getUserServiceAccounts = async (): Promise<ServiceAccountResponse[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/service-tokens`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user service accounts:', error);
    throw error;
  }
};

export const getServiceAccount = async (serviceKey: string): Promise<ServiceAccountResponse | null> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/service-tokens/${serviceKey}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    console.error('Error fetching service account:', error);
    throw error;
  }
};

export const hasValidToken = async (serviceKey: string): Promise<boolean> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/service-tokens/${serviceKey}/status`, {
      withCredentials: true,
    });
    const data = response.data as ServiceTokenStatusResponse | boolean;

    if (typeof data === 'object' && data !== null) {
      return data.hasValidToken === true;
    }

    return data === true;
  } catch (error) {
    console.error('Error checking token status:', error);
    return false;
  }
};

export const revokeServiceToken = async (serviceKey: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/api/service-tokens/${serviceKey}`, {
      withCredentials: true,
    });
  } catch (error) {
    console.error('Error revoking service token:', error);
    throw error;
  }
};