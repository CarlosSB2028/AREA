/**
 * Mock Authentication Service
 * This file contains mock data and functions for testing authentication
 * without a real backend. It simulates realistic API behavior.
 */

import { AuthResponse, LoginCredentials, RegisterData, User } from '@/types/auth';

/**
 * Mock users database
 * These users can be used for testing login
 */
export const MOCK_USERS_DB = [
    {
        email: 'user@example.com',
        username: 'johndoe',
        password: 'password123',
        user: {
            id: '1',
            email: 'user@example.com',
            username: 'johndoe',
            name: 'John Doe',
            avatarUrl: 'https://i.pravatar.cc/150?img=1',
            createdAt: '2024-01-01T00:00:00.000Z',
            isAdmin: true,
            isActive: true,
        },
    },
    {
        email: 'test@test.com',
        username: 'janesmith',
        password: 'test123',
        user: {
            id: '2',
            email: 'test@test.com',
            username: 'janesmith',
            name: 'Jane Smith',
            avatarUrl: 'https://i.pravatar.cc/150?img=2',
            createdAt: '2024-01-02T00:00:00.000Z',
            isAdmin: false,
            isActive: true,
        },
    },
    {
        email: 'admin@example.com',
        username: 'admin',
        password: 'admin123',
        user: {
            id: '3',
            email: 'admin@example.com',
            username: 'admin',
            name: 'Admin User',
            avatarUrl: 'https://i.pravatar.cc/150?img=3',
            createdAt: '2024-01-03T00:00:00.000Z',
            isAdmin: true,
            isActive: true,
        },
    },
];

/**
 * Registered users storage (for new registrations)
 */
let registeredUsers: typeof MOCK_USERS_DB = [...MOCK_USERS_DB];

/**
 * Reset registered users (useful for tests)
 */
export function resetMockUsers(): void {
    registeredUsers = [...MOCK_USERS_DB];
}

/**
 * Simulate network delay
 */
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generate a mock JWT token
 */
// Private token emulation (not exposed)
function generateMockToken(prefix = 'access'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `mock_${prefix}_${timestamp}_${random}`;
}

/**
 * Mock API Error
 */
export class MockAPIError extends Error {
    constructor(
        message: string,
        public statusCode: number = 400,
        public code?: string
    ) {
        super(message);
        this.name = 'MockAPIError';
    }
}

/**
 * Mock login
 * Simulates API POST /auth/login
 */
export async function mockLogin(
    credentials: LoginCredentials,
    options: { delay: number } = { delay: 1000 }
): Promise<AuthResponse> {
    await delay(options.delay);

    // Validate input
    const hasEmail = 'email' in credentials && credentials.email;
    const hasUsername = 'username' in credentials && credentials.username;
    
    if ((!hasEmail && !hasUsername) || !credentials.password) {
        throw new MockAPIError('Email/username and password are required', 400, 'MISSING_FIELDS');
    }

    // Find user by email or username
    const mockUser = registeredUsers.find(u => {
        const matchEmail = hasEmail && u.email === credentials.email;
        const matchUsername = hasUsername && u.username === credentials.username;
        return (matchEmail || matchUsername) && u.password === credentials.password;
    });

    if (!mockUser) {
        throw new MockAPIError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Emulate cookie set (internal only)
    generateMockToken('access');
    generateMockToken('refresh');

    // Return auth response contract
    return {
        message: 'Login successful',
        user: mockUser.user,
    };
}

/**
 * Mock registration
 * Simulates API POST /auth/register
 */
export async function mockRegister(
    data: RegisterData,
    options: { delay: number } = { delay: 1000 }
): Promise<AuthResponse> {
    await delay(options.delay);

    // Validate input
    if (!data.email || !data.password || !data.username) {
        throw new MockAPIError('Email, username and password are required', 400, 'MISSING_FIELDS');
    }

    if (data.password.length < 8) {
        throw new MockAPIError('Password must be at least 8 characters', 400, 'WEAK_PASSWORD');
    }

    // Check if email already exists
    if (registeredUsers.some(u => u.email === data.email)) {
        throw new MockAPIError('Email already registered', 409, 'EMAIL_EXISTS');
    }

    // Check if username already exists
    if (registeredUsers.some(u => u.username === data.username)) {
        throw new MockAPIError('Username already taken', 409, 'USERNAME_EXISTS');
    }

    // Create new user
    const newUser: User = {
        id: String(registeredUsers.length + 1),
        email: data.email,
        username: data.username,
        isActive: true,
        isAdmin: false,
        avatarUrl: data.avatarUrl || `https://i.pravatar.cc/150?img=${registeredUsers.length + 1}`,
        createdAt: new Date().toISOString(),
    };

    // Add to registered users
    registeredUsers.push({
        email: data.email,
        username: data.username,
        password: data.password,
        user: {
            id: newUser.id,
            email: newUser.email,
            username: data.username,
            name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'New User',
            avatarUrl: newUser.avatarUrl || `https://i.pravatar.cc/150?img=${registeredUsers.length + 1}`,
            createdAt: newUser.createdAt || new Date().toISOString(),
            isAdmin: false,
            isActive: true,
        },
    });

    generateMockToken('access');
    generateMockToken('refresh');

    return {
        message: 'Registration successful',
        user: newUser,
    };
}

/**
 * Mock logout
 * Simulates API POST /auth/logout
 */
export async function mockLogout(
    options: { delay: number } = { delay: 500 }
): Promise<void> {
    await delay(options.delay);
    // In real API, this would invalidate the token
    return;
}

/**
 * Mock get current user
 * Simulates API GET /auth/me
 */
export async function mockGetCurrentUser(
    arg?: { delay: number } | string,
    maybeOptions?: { delay: number }
): Promise<User | null> {
    const options = (typeof arg === 'object' && arg !== null ? arg : maybeOptions) || { delay: 500 };
    await delay(options.delay);
    // Ignore token if provided (cookie-based)
    return registeredUsers[0]?.user || null;
}

/**
 * Mock refresh token
 * Simulates API POST /auth/refresh
 */
export async function mockRefreshToken() {
    await delay(0);
    return { accessToken: '', refreshToken: '', expiresIn: 0 };
}

/**
 * Mock configuration
 */
export const mockConfig = {
    users: MOCK_USERS_DB,
    delay: {
        login: 1000,
        register: 1000,
        logout: 500,
        getCurrentUser: 500,
        refreshToken: 500,
    },
};
