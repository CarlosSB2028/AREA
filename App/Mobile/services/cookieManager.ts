/**
 * Cookie Manager Service
 * Manages cookies between WebView and fetch requests
 */

import CookieManager from '@react-native-cookies/cookies';
import { getApiUrl } from './api.config';

/**
 * Get all cookies for the API domain
 */
export async function getApiCookies(): Promise<Record<string, any>> {
  try {
    const apiUrl = await getApiUrl();
    const cookies = await CookieManager.get(apiUrl);
    return cookies;
  } catch (error) {
    console.error('Error getting API cookies:', error);
    return {};
  }
}

/**
 * Get a specific cookie by name
 */
export async function getCookie(name: string): Promise<string | null> {
  try {
    const cookies = await getApiCookies();
    return cookies[name]?.value || null;
  } catch (error) {
    console.error(`Error getting cookie ${name}:`, error);
    return null;
  }
}

/**
 * Get authentication token from cookies
 */
export async function getAuthTokenFromCookies(): Promise<string | null> {
  return await getCookie('authToken');
}

/**
 * Get refresh token from cookies
 */
export async function getRefreshTokenFromCookies(): Promise<string | null> {
  return await getCookie('refreshToken');
}

/**
 * Clear all cookies for the API domain
 */
export async function clearApiCookies(): Promise<void> {
  try {
    const apiUrl = await getApiUrl();
    await CookieManager.clearByName(apiUrl, 'authToken');
    await CookieManager.clearByName(apiUrl, 'refreshToken');
    console.log('API cookies cleared');
  } catch (error) {
    console.error('Error clearing API cookies:', error);
  }
}

/**
 * Clear all cookies (for debugging)
 */
export async function clearAllCookies(): Promise<void> {
  try {
    await CookieManager.clearAll();
    console.log('All cookies cleared');
  } catch (error) {
    console.error('Error clearing all cookies:', error);
  }
}

/**
 * Build Cookie header string from cookies object
 */
export function buildCookieHeader(cookies: Record<string, any>): string {
  return Object.entries(cookies)
    .map(([name, cookie]) => `${name}=${cookie.value}`)
    .join('; ');
}

/**
 * Get Cookie header for API requests
 */
export async function getCookieHeader(): Promise<string> {
  const cookies = await getApiCookies();
  return buildCookieHeader(cookies);
}
