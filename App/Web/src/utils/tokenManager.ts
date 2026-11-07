import { API_CONFIG } from '../config/api';

let refreshPromise: Promise<boolean> | null = null;

export const refreshAuthToken = async (): Promise<boolean> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = performTokenRefresh();

  try {
    const result = await refreshPromise;
    return result;
  } finally {
    refreshPromise = null;
  }
};

const performTokenRefresh = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.auth.refresh}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      console.log('Token refreshed successfully');
      return true;
    } else {
      console.warn('Token refresh failed:', response.status);
      return false;
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    return false;
  }
};

export const ensureValidToken = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.auth.status}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.authenticated) {
        return true;
      }
    }

    return await refreshAuthToken();
  } catch (error) {
    console.error('Error checking token validity:', error);
    return false;
  }
};

export const handleAuthFailure = async (): Promise<void> => {
  try {
    await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.auth.logout}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Logout error:', error);
  }

  if (typeof window !== 'undefined') {
    localStorage.removeItem('_at');
    localStorage.removeItem('_ate');
    sessionStorage.removeItem('_sk');
    localStorage.removeItem('authToken');
  }
};
