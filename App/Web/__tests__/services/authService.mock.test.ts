import {
  login,
  register,
  forgotPassword,
  resetPassword,
  updateProfile,
  logout,
  getCurrentUser,
  getAuthStatus,
  refreshToken
} from '../../src/services/authService';

// Note: These tests use the native USE_MOCK_DATA logic
// Enabled in test-setup.ts via process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'true'

describe('authService (mock mode)', () => {
  describe('login', () => {
    it('should successfully login with valid mock credentials', async () => {
      const loginData = { email: 'test@test.com', password: 'password123' };

      const result = await login(loginData);

      expect(result).toBeDefined();
      expect(result.message).toBe('Login successful');
      expect(result.token).toBe('mock-token');
      expect(result.refreshToken).toBe('mock-refresh-token');
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('test@test.com');
    });

    it('should return user object with correct structure', async () => {
      const result = await login({ email: 'test@test.com', password: 'password123' });

      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('email');
      expect(result.user).toHaveProperty('isActive');
      expect(result.user).toHaveProperty('isAdmin');
      expect(result.user).toHaveProperty('createdAt');
    });

    it('should reject invalid mock credentials', async () => {
      const invalidLogin = { email: 'wrong@test.com', password: 'wrongpassword' };

      const promise = login(invalidLogin);
      await expect(promise).rejects.toBeDefined();
    });

    it('should have isAdmin false for non-admin users', async () => {
      const result = await login({ email: 'test@test.com', password: 'password123' });

      expect(result.user.isAdmin).toBe(false);
    });
  });

  describe('register', () => {
    it('should successfully register with mock data', async () => {
      const registerData = {
        email: 'newuser@test.com',
        username: 'newuser',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Doe'
      };

      const result = await register(registerData);

      expect(result).toBeDefined();
      expect(result.message).toBe('Registration successful');
      expect(result.token).toBe('mock-token');
      expect(result.user.email).toBe('newuser@test.com');
    });

    it('should return tokens for registered user', async () => {
      const registerData = {
        email: 'test@test.com',
        username: 'testuser',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      const result = await register(registerData);

      expect(result.token).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.token).toBe('mock-token');
    });
  });

  describe('forgotPassword', () => {
    it('should resolve without error in mock mode', async () => {
      await expect(forgotPassword('test@test.com')).resolves.toBeUndefined();
    });

    it('should handle multiple forgot password requests', async () => {
      await expect(forgotPassword('user1@test.com')).resolves.toBeUndefined();
      await expect(forgotPassword('user2@test.com')).resolves.toBeUndefined();
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully in mock mode', async () => {
      await expect(resetPassword('mock-token', 'newpassword123')).resolves.toBeUndefined();
    });

    it('should handle password reset for any token', async () => {
      await expect(resetPassword('any-token', 'password')).resolves.toBeUndefined();
    });
  });

  describe('updateProfile', () => {
    it('should update profile and return user object', async () => {
      const profileData = {
        email: 'updated@test.com',
        firstName: 'John',
        lastName: 'Updated'
      };

      const result = await updateProfile('1', profileData);

      expect(result).toBeDefined();
      expect(result.email).toBe('updated@test.com');
      expect(result.name).toBe('John Updated');
    });

    it('should include profile data in response', async () => {
      const profileData = {
        email: 'test@test.com',
        firstName: 'John',
        lastName: 'Doe',
        language: 'en'
      };

      const result = await updateProfile('1', profileData);

      expect(result.profileData).toBeDefined();
      expect(result.profileData.firstName).toBe('John');
      expect(result.profileData.lastName).toBe('Doe');
      expect(result.profileData.language).toBe('en');
    });

    it('should update avatar if provided', async () => {
      const profileData = {
        email: 'test@test.com',
        firstName: 'John',
        lastName: 'Doe'
      };

      const result = await updateProfile('1', profileData, 'https://example.com/avatar.jpg');

      expect(result.avatarSrc).toBe('https://example.com/avatar.jpg');
    });

    it('should use default avatar if not provided', async () => {
      const profileData = {
        email: 'test@test.com',
        firstName: 'John',
        lastName: 'Doe'
      };

      const result = await updateProfile('1', profileData);

      expect(result.avatarSrc).toBe('https://mock.jpg');
    });
  });

  describe('logout', () => {
    it('should complete logout without error', async () => {
      await expect(logout()).resolves.toBeUndefined();
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user from mock', async () => {
      const result = await getCurrentUser();

      expect(result).toBeDefined();
      expect(result.name).toBe('Mock User');
      expect(result.email).toBe('mock@example.com');
    });

    it('should return full user profile', async () => {
      const result = await getCurrentUser();

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('avatarSrc');
      expect(result).toHaveProperty('isAdmin');
      expect(result).toHaveProperty('isVerified');
      expect(result).toHaveProperty('profileData');
    });

    it('should have admin privileges in mock', async () => {
      const result = await getCurrentUser();

      expect(result.isAdmin).toBe(true);
      expect(result.isVerified).toBe(true);
    });

    it('should include profile data with language setting', async () => {
      const result = await getCurrentUser();

      expect(result.profileData).toHaveProperty('email');
      expect(result.profileData).toHaveProperty('firstName');
      expect(result.profileData).toHaveProperty('language');
      expect(result.profileData.language).toBe('en');
    });
  });

  describe('getAuthStatus', () => {
    it('should return authenticated status', async () => {
      const result = await getAuthStatus();

      expect(result).toBeDefined();
      expect(result.authenticated).toBe(true);
    });

    it('should return correct structure', async () => {
      const result = await getAuthStatus();

      expect(result).toHaveProperty('authenticated');
      expect(typeof result.authenticated).toBe('boolean');
    });
  });

  describe('refreshToken', () => {
    it('should return new token', async () => {
      const result = await refreshToken();

      expect(result).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.token).toBe('mock-refreshed-token');
    });

    it('should have token in response', async () => {
      const result = await refreshToken();

      expect(result).toHaveProperty('token');
      expect(typeof result.token).toBe('string');
    });
  });
});
