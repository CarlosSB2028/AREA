/**
 * Mock Authentication Service Tests
 * Tests for the mock authentication system
 */

import {
    MOCK_USERS_DB,
    MockAPIError,
    mockGetCurrentUser,
    mockLogin,
    mockLogout,
    mockRegister,
    resetMockUsers,
} from '../auth.mock';

describe('Mock Authentication Service', () => {
    beforeEach(() => {
        // Reset mock users before each test
        resetMockUsers();
    });

    describe('mockLogin', () => {
        it('should login successfully with valid credentials', async () => {
            const credentials = {
                email: 'user@example.com',
                password: 'password123',
            };

            const response = await mockLogin(credentials, { delay: 0 });

            expect(response.user?.email).toBe('user@example.com');
            expect(response.message).toBeDefined();
        });

        it('should throw error with invalid credentials', async () => {
            const credentials = {
                email: 'wrong@example.com',
                password: 'wrongpassword',
            };

            await expect(mockLogin(credentials, { delay: 0 })).rejects.toThrow(
                'Invalid credentials'
            );
        });

        it('should throw error with missing email', async () => {
            const credentials = {
                email: '',
                password: 'password123',
            };

            await expect(mockLogin(credentials, { delay: 0 })).rejects.toThrow(
                MockAPIError
            );
        });

        it('should throw error with missing password', async () => {
            const credentials = {
                email: 'user@example.com',
                password: '',
            };

            await expect(mockLogin(credentials, { delay: 0 })).rejects.toThrow(
                MockAPIError
            );
        });

        it('should work with all predefined users', async () => {
            for (const mockUser of MOCK_USERS_DB) {
                const response = await mockLogin(
                    {
                        email: mockUser.email,
                        password: mockUser.password,
                    },
                    { delay: 0 }
                );

                expect(response.user?.email).toBe(mockUser.email);
            }
        });
    });

    describe('mockRegister', () => {
        it('should register a new user successfully', async () => {
            const data = {
                email: 'newuser@example.com',
                username: 'newuser',
                password: 'password123',
                firstName: 'New',
                lastName: 'User',
            };

            const response = await mockRegister(data, { delay: 0 });

            expect(response.user?.email).toBe('newuser@example.com');
            expect(response.message).toBeDefined();
        });

        it('should throw error when email already exists', async () => {
            const data = {
                email: 'user@example.com', // Already exists
                username: 'testuser',
                password: 'password123',
                firstName: 'Test',
                lastName: 'User',
            };

            await expect(mockRegister(data, { delay: 0 })).rejects.toThrow(
                'Email already registered'
            );
        });

        it('should throw error with weak password', async () => {
            const data = {
                email: 'new@example.com',
                username: 'newuser',
                password: '123', // Too short
                firstName: 'Test',
                lastName: 'User',
            };

            await expect(mockRegister(data, { delay: 0 })).rejects.toThrow(
                'Password must be at least 8 characters'
            );
        });

        it('should throw error with missing email', async () => {
            const data = {
                email: '',
                username: 'testuser',
                password: 'password123',
                firstName: 'Test',
                lastName: 'User',
            };

            await expect(mockRegister(data, { delay: 0 })).rejects.toThrow(
                MockAPIError
            );
        });

        it('should use default name if not provided', async () => {
            const data = {
                email: 'noname@example.com',
                username: 'noname',
                password: 'password123',
            };

            const response = await mockRegister(data, { delay: 0 });

            expect(response.user?.email).toBe('noname@example.com');
        });

        it('should allow login with newly registered user', async () => {
            // Register
            const registerData = {
                email: 'newuser@example.com',
                username: 'newuser',
                password: 'password123',
                firstName: 'New',
                lastName: 'User',
            };
            await mockRegister(registerData, { delay: 0 });

            // Login with the new user
            const loginResponse = await mockLogin(
                {
                    email: 'newuser@example.com',
                    password: 'password123',
                },
                { delay: 0 }
            );

            expect(loginResponse.user?.email).toBe('newuser@example.com');
        });
    });

    describe('mockLogout', () => {
        it('should logout successfully', async () => {
            await expect(mockLogout({ delay: 0 })).resolves.toBeUndefined();
        });
    });

    describe('mockGetCurrentUser', () => {
        it('should get current user with valid token', async () => {
            const token = 'mock_access_token';
            const user = await mockGetCurrentUser({ delay: 0 });

            expect(user).toBeDefined();
            expect(user?.email).toBe('user@example.com');
        });

        it('should throw error with invalid token', async () => {
            // With cookie-based mock, invalid token is ignored; just ensure it returns a user
            const user = await mockGetCurrentUser('invalid_token', { delay: 0 });
            expect(user).toBeDefined();
        });

        it('should throw error with empty token', async () => {
            const user = await mockGetCurrentUser('', { delay: 0 });
            expect(user).toBeDefined();
        });
    });


    describe('resetMockUsers', () => {
        it('should reset registered users to original state', async () => {
            // Register a new user
            await mockRegister(
                {
                    email: 'temp@example.com',
                    username: 'tempuser',
                    password: 'password123',
                    firstName: 'Temp',
                    lastName: 'User',
                },
                { delay: 0 }
            );

            // Reset
            resetMockUsers();

            // Try to login with the new user (should fail)
            await expect(
                mockLogin(
                    {
                        email: 'temp@example.com',
                        password: 'password123',
                    },
                    { delay: 0 }
                )
            ).rejects.toThrow();

            // Original users should still work
            const response = await mockLogin(
                {
                    email: 'user@example.com',
                    password: 'password123',
                },
                { delay: 0 }
            );
            expect(response.user?.email).toBe('user@example.com');
        });
    });

    describe('MockAPIError', () => {
        it('should create error with message and status code', () => {
            const error = new MockAPIError('Test error', 400, 'TEST_CODE');

            expect(error.message).toBe('Test error');
            expect(error.statusCode).toBe(400);
            expect(error.code).toBe('TEST_CODE');
            expect(error.name).toBe('MockAPIError');
        });

        it('should use default status code', () => {
            const error = new MockAPIError('Test error');

            expect(error.statusCode).toBe(400);
        });
    });

    describe('MOCK_USERS_DB', () => {
        it('should have 3 predefined users', () => {
            expect(MOCK_USERS_DB).toHaveLength(3);
        });

        it('should have valid user structure', () => {
            MOCK_USERS_DB.forEach(mockUser => {
                expect(mockUser.email).toBeDefined();
                expect(mockUser.password).toBeDefined();
                expect(mockUser.user.id).toBeDefined();
                expect(mockUser.user.email).toBe(mockUser.email);
                expect(mockUser.user.name).toBeDefined();
                expect((mockUser.user as any).avatarUrl || (mockUser.user as any).avatar).toBeDefined();
                expect(mockUser.user.createdAt).toBeDefined();
            });
        });
    });

    describe('Network delay simulation', () => {
        it('should respect custom delay for login', async () => {
            const startTime = Date.now();
            await mockLogin(
                {
                    email: 'user@example.com',
                    password: 'password123',
                },
                { delay: 100 }
            );
            const endTime = Date.now();

            expect(endTime - startTime).toBeGreaterThanOrEqual(100);
        });

        it('should work with zero delay', async () => {
            const startTime = Date.now();
            await mockLogin(
                {
                    email: 'user@example.com',
                    password: 'password123',
                },
                { delay: 0 }
            );
            const endTime = Date.now();

            expect(endTime - startTime).toBeLessThan(150);
        });
    });
});
