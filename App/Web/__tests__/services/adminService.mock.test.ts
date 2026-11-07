import {
  getLineData,
  getBarData,
  getUsers,
  getAreas,
  getServices,
  getServicesBarData,
  getAreaRuns,
  getAreaStats,
  getCardUserData,
  createUser,
  addUser,
  updateUser,
  deleteUser,
  deleteArea,
  deleteService
} from '../../src/services/adminService';

describe('adminService (mock mode)', () => {
  describe('chart data endpoints', () => {
    it('should get line data for user connections per day', async () => {
      const result = await getLineData();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should get bar data for new users per month', async () => {
      const result = await getBarData();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should get services bar data', async () => {
      const result = await getServicesBarData();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('user management', () => {
    it('should get all users', async () => {
      const result = await getUsers();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should create new user with id', async () => {
      const userData = {
        email: 'newuser@test.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123',
        isAdmin: false
      };

      const result = await createUser(userData);

      expect(result).toBeDefined();
      expect(result.email).toBe(userData.email);
      expect(result.id).toBeDefined();
    });

    it('should add user successfully', async () => {
      const user = {
        id: '123',
        name: 'John Doe',
        email: 'john@test.com',
        avatarSrc: '',
        password: '',
        isAdmin: false,
        isVerified: true,
        profileData: {
          email: 'john@test.com',
          firstName: 'John',
          lastName: 'Doe',
          language: 'en'
        }
      };

      const result = await addUser(user);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.email).toBe(user.email);
    });

    it('should update user successfully', async () => {
      const user = {
        id: '123',
        name: 'Jane Doe',
        email: 'jane@test.com',
        avatarSrc: '',
        password: '',
        isAdmin: true,
        isVerified: true,
        profileData: {
          email: 'jane@test.com',
          firstName: 'Jane',
          lastName: 'Doe',
          language: 'en'
        }
      };

      const result = await updateUser('123', user);

      expect(result).toBeDefined();
      expect(result.id).toBe('123');
      expect(result.email).toBe(user.email);
    });

    it('should delete user successfully', async () => {
      await expect(deleteUser('123')).resolves.toBeUndefined();
    });
  });

  describe('area management', () => {
    it('should get all areas', async () => {
      const result = await getAreas();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should get area runs', async () => {
      const result = await getAreaRuns();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should get area statistics', async () => {
      const result = await getAreaStats();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should delete area successfully', async () => {
      await expect(deleteArea('area-123')).resolves.toBeUndefined();
    });
  });

  describe('service management', () => {
    it('should get all services', async () => {
      const result = await getServices();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should delete service successfully', async () => {
      await expect(deleteService('service-123')).resolves.toBeUndefined();
    });
  });

  describe('dashboard metrics', () => {
    it('should get card user data for dashboard', async () => {
      const result = await getCardUserData();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should include user count metrics', async () => {
      const result = await getCardUserData();

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('title');
      expect(result[0]).toHaveProperty('value');
    });
  });

  describe('data consistency', () => {
    it('should return consistent users list', async () => {
      const users1 = await getUsers();
      const users2 = await getUsers();

      expect(users1).toEqual(users2);
    });

    it('should return consistent areas list', async () => {
      const areas1 = await getAreas();
      const areas2 = await getAreas();

      expect(areas1).toEqual(areas2);
    });

    it('should return consistent services list', async () => {
      const services1 = await getServices();
      const services2 = await getServices();

      expect(services1).toEqual(services2);
    });
  });

  describe('mock user operations', () => {
    it('should generate random IDs for new users', async () => {
      const userData = {
        email: 'user1@test.com',
        firstName: 'User',
        lastName: 'One',
        password: 'pass123',
        isAdmin: false
      };

      const user1 = await createUser(userData);
      const user2 = await createUser(userData);

      expect(user1.id).not.toBe(user2.id);
    });

    it('should preserve all user properties on update', async () => {
      const user = {
        id: '456',
        name: 'Test User',
        email: 'test@test.com',
        avatarSrc: 'https://example.com/avatar.jpg',
        password: '',
        isAdmin: true,
        isVerified: false,
        profileData: {
          email: 'test@test.com',
          firstName: 'Test',
          lastName: 'User',
          language: 'fr'
        }
      };

      const result = await updateUser('456', user);

      expect(result.name).toBe(user.name);
      expect(result.avatarSrc).toBe(user.avatarSrc);
      expect(result.isAdmin).toBe(user.isAdmin);
      expect(result.profileData.language).toBe('fr');
    });
  });
});
