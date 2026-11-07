import { API_CONFIG } from '../config/api';

export const hasSecureToken = async (): Promise<boolean> => {
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
      return data.authenticated === true;
    }
    return false;
  } catch (error) {
    console.error('Error checking auth status:', error);
    return false;
  }
};

export const clearSecureToken = async (): Promise<void> => {
  try {
    await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.auth.logout}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error during logout:', error);
  }
  if (typeof window !== 'undefined') {
    localStorage.removeItem('_at');
    localStorage.removeItem('_ate');
    sessionStorage.removeItem('_sk');
    localStorage.removeItem('authToken');
  }
};

export const isWebCryptoSupported = (): boolean => {
  return typeof window !== 'undefined' &&
         typeof crypto !== 'undefined' &&
         typeof crypto.subtle !== 'undefined';
};
