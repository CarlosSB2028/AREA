import { AuthResponse, LoginCredentials, RegisterData, User } from '@/types/auth';
import {
    MOCK_USERS_DB,
    mockGetCurrentUser,
    mockLogin,
    mockLogout,
    mockRegister,
} from './__mocks__/auth.mock';
import { API_CONFIG, ENV, getApiUrl } from './api.config';
import { get, post, put } from './api';
import { clearAuthData, saveUserData, getUserData } from './storage';

/**
 * Mock mode configuration
 * Set EXPO_PUBLIC_USE_MOCK=false in .env to use real backend
 */
const USE_MOCK = ENV.USE_MOCK;
const MOCK_DELAY = ENV.MOCK_DELAY;

/**
 * Login
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (USE_MOCK) {
        const response = await mockLogin(credentials, { delay: MOCK_DELAY });
        if (response.user) {
            await saveUserData(JSON.stringify(response.user));
        }
        return response;
    }

    try {
        const data = await post<AuthResponse>(API_CONFIG.ENDPOINTS.LOGIN, credentials);
        if (data.user) {
            await saveUserData(JSON.stringify(data.user));
        }
        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

/**
 * Register
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
    if (USE_MOCK) {
        const response = await mockRegister(data, { delay: MOCK_DELAY });
        if (response.user) {
            await saveUserData(JSON.stringify(response.user));
        }
        return response;
    }

    try {
        const responseData = await post<AuthResponse>(API_CONFIG.ENDPOINTS.REGISTER, data);
        if (responseData.user) {
            await saveUserData(JSON.stringify(responseData.user));
        }
        return responseData;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

/**
 * Logout
 */
export async function logout(): Promise<void> {
    if (USE_MOCK) {
        await mockLogout({ delay: MOCK_DELAY / 2 });
        await clearAuthData();
        return;
    }

    try {
        await post<void>(API_CONFIG.ENDPOINTS.LOGOUT);
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        await clearAuthData();
    }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
    if (USE_MOCK) {
        return mockGetCurrentUser({ delay: MOCK_DELAY / 2 });
    }

    try {
        const response = await get<any>(API_CONFIG.ENDPOINTS.ME);
        if (!response)
            return null;
        const backendUser = response.user || response;
        const user: User = {
            id: backendUser.id?.toString() || '',
            email: backendUser.email || '',
            username: backendUser.username || '',
            firstname: backendUser.firstname || '',
            lastname: backendUser.lastname || '',
            name: backendUser.firstname && backendUser.lastname
                ? `${backendUser.firstname} ${backendUser.lastname}`.trim()
                : backendUser.email || '',
            avatarUrl: backendUser.avatarUrl || null,
            isActive: backendUser.isActive || false,
            isAdmin: backendUser.isAdmin || false,
            createdAt: backendUser.createdAt,
            lastLoginAt: backendUser.lastLoginAt,
        };
        await saveUserData(JSON.stringify(user));
        return user;
    } catch (error) {
        console.error('Get current user error:', error);
        return null;
    }
}

/**
 * Forgot Password - Send reset link to email
 */
export async function forgotPassword(email: string): Promise<void> {
    if (USE_MOCK) {
        await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));

        const userExists = MOCK_USERS_DB.some(user => user.email === email);

        if (!userExists) {
            throw new Error('Email not found');
        }

        return;
    }

    try {
        await post<{ message: string }>(API_CONFIG.ENDPOINTS.FORGOT_PASSWORD, { email });
    } catch (error) {
        console.error('Forgot password error:', error);
        throw error;
    }
}

/**
 * Configuration to toggle mock mode and access mock users
 */
export const authConfig = {
    useMock: USE_MOCK,
    mockDelay: MOCK_DELAY,
    mockUsers: MOCK_USERS_DB,
    apiBaseUrl: API_CONFIG.BASE_URL,
};

/**
 * Update user profile
 */
export async function updateUserProfile(userId: string, updates: {
    firstname?: string;
    lastname?: string;
    username?: string;
    password?: string;
    avatarUrl?: string;
}): Promise<User> {
    if (USE_MOCK) {
        await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));
        const existingDataStr = await getUserData();
        const existingData = existingDataStr ? JSON.parse(existingDataStr) : {};
        const updatedUser = {
            ...existingData,
            username: updates.username || existingData.username,
            firstname: updates.firstname || existingData.firstname,
            lastname: updates.lastname || existingData.lastname,
            avatarUrl: updates.avatarUrl || existingData.avatarUrl,
            name: updates.firstname && updates.lastname
                ? `${updates.firstname} ${updates.lastname}`
                : existingData.name,
        };
        await saveUserData(JSON.stringify(updatedUser));
        return updatedUser;
    }

    try {
        const response = await put<any>(`${API_CONFIG.ENDPOINTS.UPDATE_PROFILE}/${userId}`, updates);
        const backendUser = response;
        const user: User = {
            id: backendUser.id?.toString() || userId,
            email: backendUser.email || '',
            username: backendUser.username || '',
            firstname: backendUser.firstname || '',
            lastname: backendUser.lastname || '',
            name: backendUser.firstname && backendUser.lastname
                ? `${backendUser.firstname} ${backendUser.lastname}`.trim()
                : backendUser.email || '',
            avatarUrl: backendUser.avatarUrl || null,
            isActive: backendUser.isActive || false,
            isAdmin: backendUser.isAdmin || false,
            createdAt: backendUser.createdAt,
            lastLoginAt: backendUser.lastLoginAt,
        };
        await saveUserData(JSON.stringify(user));
        return user;
    } catch (error) {
        console.error('Update profile error:', error);
        throw error;
    }
}

/**
 * Convert image file to base64 data URL
 * The backend doesn't have a file upload endpoint, so we convert to base64
 * and send it as a data URL in the avatarUrl field (like the web version does)
 */
export async function uploadAvatarImage(fileUri: string): Promise<string> {
    if (USE_MOCK) {
        await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));
        return fileUri;
    }

    try {
        const base64 = await fetch(fileUri)
            .then(res => res.blob())
            .then(blob => {
                return new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        if (typeof reader.result === 'string') {
                            resolve(reader.result);
                        } else {
                            reject(new Error('Failed to read file as data URL'));
                        }
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            });

        return base64;
    } catch (error) {
        console.error('Failed to convert avatar to base64:', error);
        throw error;
    }
}
