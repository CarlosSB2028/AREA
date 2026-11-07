/**
 * API Configuration
 * Centralized configuration for backend API
 */

import { getServerUrl } from './storage';

const DEFAULT_SERVER_URL = 'http://127.0.0.1:8080';

/**
 * Get the configured API URL from storage (user's server settings)
 */
let cachedServerUrl: string | null = null;

export async function getApiUrl(): Promise<string> {
    if (cachedServerUrl) {
        return cachedServerUrl;
    }
    const storedUrl = await getServerUrl();
    const url = storedUrl || DEFAULT_SERVER_URL;
    cachedServerUrl = url;
    return url;
}

/**
 * Update the cached server URL (call after changing server settings)
 */
export function updateCachedServerUrl(url: string | null): void {
    cachedServerUrl = url;
}

/**
 * Environment variables
 */
export const ENV = {
    API_URL: DEFAULT_SERVER_URL,
    USE_MOCK: process.env.EXPO_PUBLIC_USE_MOCK === 'true',
    MOCK_DELAY: parseInt(process.env.EXPO_PUBLIC_MOCK_DELAY || '1000', 10),
} as const;

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    ME: '/api/auth/me',
    UPDATE_PROFILE: '/api/users',
    UPLOAD_AVATAR: '/api/users/avatar',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
} as const;

/**
 * API configuration
 */
export const API_CONFIG = {
    BASE_URL: ENV.API_URL,
    ENDPOINTS: API_ENDPOINTS,
    TIMEOUT: 10000,
    HEADERS: {
        'Content-Type': 'application/json',
    },
} as const;

/**
 * HTTP methods
 */
export const HTTP_METHODS = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    PATCH: 'PATCH',
    DELETE: 'DELETE',
} as const;

/**
 * API Response status codes
 */
export const STATUS_CODES = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    TIMEOUT: 'Request timeout. Please try again.',
    UNAUTHORIZED: 'Unauthorized. Please login again.',
    SERVER_ERROR: 'Server error. Please try again later.',
    UNKNOWN: 'An unknown error occurred.',
} as const;
