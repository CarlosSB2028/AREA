/**
 * adminService comprehensive tests with all error paths and edge cases
 */
import axios from '../../src/config/axios';
import * as adminService from '../../src/services/adminService';
import { API_CONFIG } from '../../src/config/api';
import { UserContent, Service } from '../../src/types';

jest.mock('../../src/config/axios');

// Mock USE_MOCK_DATA to force API mode
jest.mock('../../src/config/api', () => {
  const actualApi = jest.requireActual('../../src/config/api');
  return {
    ...actualApi,
    USE_MOCK_DATA: false,
  };
});

const mockAxios = axios as jest.Mocked<typeof axios>;

describe('adminService - Comprehensive Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Analytics Data - Success Cases', () => {
    it('should fetch line data (users connected per day)', async () => {
      const mockData = [
        { date: '2025-01-01', count: 10 },
        { date: '2025-01-02', count: 15 }
      ];

      mockAxios.get.mockResolvedValueOnce({ data: mockData });

      const result = await adminService.getLineData();

      expect(mockAxios.get).toHaveBeenCalledWith(API_CONFIG.endpoints.admin.userConnectedPerDay);
      expect(result).toEqual(mockData);
    });

    it('should fetch bar data (new users per month)', async () => {
      const mockData = [
        { month: 'January', count: 50 },
        { month: 'February', count: 75 }
      ];

      mockAxios.get.mockResolvedValueOnce({ data: mockData });

      const result = await adminService.getBarData();

      expect(result).toEqual(mockData);
    });

    it('should fetch services bar data (services usage)', async () => {
      const mockData = [
        { service: 'GitHub', usage: 100 },
        { service: 'Discord', usage: 80 }
      ];

      mockAxios.get.mockResolvedValueOnce({ data: mockData });

      const result = await adminService.getServicesBarData();

      expect(result).toEqual(mockData);
    });

    it('should fetch area runs statistics', async () => {
      const mockData = {
        totalRuns: 500,
        successfulRuns: 480,
        failedRuns: 20
      };

      mockAxios.get.mockResolvedValueOnce({ data: mockData });

      const result = await adminService.getAreaRuns();

      expect(result).toEqual(mockData);
    });

    it('should fetch area stats', async () => {
      const mockData = {
        totalAreas: 50,
        enabledAreas: 45,
        disabledAreas: 5
      };

      mockAxios.get.mockResolvedValueOnce({ data: mockData });

      const result = await adminService.getAreaStats();

      expect(result).toEqual(mockData);
    });

    it('should fetch card user data', async () => {
      const mockData = [
        { userId: '1', name: 'User 1', cards: 5 },
        { userId: '2', name: 'User 2', cards: 3 }
      ];

      mockAxios.get.mockResolvedValueOnce({ data: mockData });

      const result = await adminService.getCardUserData();

      expect(result).toEqual(mockData);
    });
  });

  describe('Analytics Data - Error Cases', () => {
    it('should handle error fetching line data', async () => {
      mockAxios.get.mockRejectedValueOnce(new Error('Fetch failed'));

      await expect(adminService.getLineData()).rejects.toThrow('Fetch failed');
    });

    it('should handle error fetching bar data', async () => {
      mockAxios.get.mockRejectedValueOnce(new Error('Fetch failed'));

      await expect(adminService.getBarData()).rejects.toThrow();
    });

    it('should handle error fetching services bar data', async () => {
      mockAxios.get.mockRejectedValueOnce(new Error('Fetch failed'));

      await expect(adminService.getServicesBarData()).rejects.toThrow();
    });

    it('should handle 401 unauthorized fetching analytics', async () => {
      const error = new Error('Unauthorized');
      (error as unknown as Record<string, unknown>).response = { status: 401 };

      mockAxios.get.mockRejectedValueOnce(error);

      await expect(adminService.getLineData()).rejects.toThrow();
    });

    it('should handle 403 forbidden fetching analytics', async () => {
      const error = new Error('Forbidden');
      (error as unknown as Record<string, unknown>).response = { status: 403 };

      mockAxios.get.mockRejectedValueOnce(error);

      await expect(adminService.getAreaRuns()).rejects.toThrow();
    });
  });

  describe('User Management - CRUD Operations', () => {
    const mockUser: UserContent = {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      avatarSrc: 'https://example.com/avatar.jpg',
      password: 'hashed_password',
      isAdmin: false,
      isVerified: true,
      profileData: {
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe'
      }
    };

    it('should fetch all users', async () => {
      const mockUsers = [mockUser];

      mockAxios.get.mockResolvedValueOnce({ data: mockUsers });

      const result = await adminService.getUsers();

      expect(mockAxios.get).toHaveBeenCalledWith(API_CONFIG.endpoints.admin.users);
      expect(result).toEqual(mockUsers);
    });

    it('should create new user', async () => {
      const userData = {
        email: 'newuser@example.com',
        firstName: 'New',
        lastName: 'User',
        password: 'Password123!',
        isAdmin: false
      };

      mockAxios.post.mockResolvedValueOnce({
        data: { id: 'new-user-1', ...userData }
      });

      const result = await adminService.createUser(userData);

      expect(mockAxios.post).toHaveBeenCalledWith(
        API_CONFIG.endpoints.auth.register,
        userData
      );
      expect(result.id).toBe('new-user-1');
    });

    it('should handle error creating user', async () => {
      const userData = {
        email: 'invalid@example.com',
        firstName: 'Invalid',
        lastName: 'User',
        password: 'weak',
        isAdmin: false
      };

      mockAxios.post.mockRejectedValueOnce(new Error('Invalid password'));

      await expect(adminService.createUser(userData)).rejects.toThrow('Invalid password');
    });

    it('should add user to system', async () => {
      mockAxios.post.mockResolvedValueOnce({
        data: { ...mockUser, id: 'user-add-1' }
      });

      const result = await adminService.addUser(mockUser);

      expect(mockAxios.post).toHaveBeenCalledWith(
        API_CONFIG.endpoints.admin.users,
        mockUser
      );
      expect(result.id).toBe('user-add-1');
    });

    it('should handle error adding user', async () => {
      mockAxios.post.mockRejectedValueOnce(new Error('User already exists'));

      await expect(adminService.addUser(mockUser)).rejects.toThrow();
    });

    it('should update existing user', async () => {
      const updatedUser = { ...mockUser, name: 'Jane Doe' };

      mockAxios.put.mockResolvedValueOnce({ data: updatedUser });

      const result = await adminService.updateUser('user-1', updatedUser);

      expect(mockAxios.put).toHaveBeenCalledWith(
        `${API_CONFIG.endpoints.admin.users}/user-1`,
        updatedUser
      );
      expect(result.name).toBe('Jane Doe');
    });

    it('should handle error updating user', async () => {
      mockAxios.put.mockRejectedValueOnce(new Error('User not found'));

      await expect(adminService.updateUser('nonexistent', mockUser)).rejects.toThrow();
    });

    it('should delete user', async () => {
      mockAxios.delete.mockResolvedValueOnce({ status: 200 });

      await adminService.deleteUser('user-1');

      expect(mockAxios.delete).toHaveBeenCalledWith(
        `${API_CONFIG.endpoints.user.profile}/user-1`
      );
    });

    it('should handle error deleting user', async () => {
      mockAxios.delete.mockRejectedValueOnce(new Error('User not found'));

      await expect(adminService.deleteUser('nonexistent')).rejects.toThrow();
    });
  });

  describe('Area Management - CRUD Operations', () => {
    it('should fetch all areas', async () => {
      const mockAreas = [
        { id: '1', name: 'Area 1', enabled: true },
        { id: '2', name: 'Area 2', enabled: false }
      ];

      mockAxios.get.mockResolvedValueOnce({ data: mockAreas });

      const result = await adminService.getAreas();

      expect(mockAxios.get).toHaveBeenCalledWith(API_CONFIG.endpoints.admin.areas);
      expect(result).toEqual(mockAreas);
    });

    it('should handle error fetching areas', async () => {
      mockAxios.get.mockRejectedValueOnce(new Error('Fetch failed'));

      await expect(adminService.getAreas()).rejects.toThrow();
    });

    it('should delete area', async () => {
      mockAxios.delete.mockResolvedValueOnce({ status: 200 });

      await adminService.deleteArea('area-1');

      expect(mockAxios.delete).toHaveBeenCalledWith(
        `${API_CONFIG.endpoints.admin.areas}/area-1`
      );
    });

    it('should handle error deleting area', async () => {
      mockAxios.delete.mockRejectedValueOnce(new Error('Area not found'));

      await expect(adminService.deleteArea('nonexistent')).rejects.toThrow();
    });

    it('should enable area', async () => {
      mockAxios.patch.mockResolvedValueOnce({ status: 200 });

      await adminService.enableDisableArea('area-1', true);

      expect(mockAxios.patch).toHaveBeenCalledWith(
        `${API_CONFIG.endpoints.admin.areas}/area-1`,
        { enabled: true }
      );
    });

    it('should disable area', async () => {
      mockAxios.patch.mockResolvedValueOnce({ status: 200 });

      await adminService.enableDisableArea('area-1', false);

      expect(mockAxios.patch).toHaveBeenCalledWith(
        `${API_CONFIG.endpoints.admin.areas}/area-1`,
        { enabled: false }
      );
    });

    it('should handle error toggling area activation', async () => {
      mockAxios.patch.mockRejectedValueOnce(new Error('Area not found'));

      await expect(adminService.enableDisableArea('nonexistent', true)).rejects.toThrow();
    });
  });

  describe('Service Management - CRUD Operations', () => {
    const mockService: Service = {
      id: '1',
      name: 'GitHub',
      logo: 'github.png'
    };

    it('should fetch all services', async () => {
      const mockServices = [mockService];

      mockAxios.get.mockResolvedValueOnce({ data: mockServices });

      const result = await adminService.getServices();

      expect(mockAxios.get).toHaveBeenCalledWith(API_CONFIG.endpoints.admin.services);
      expect(result).toEqual(mockServices);
    });

    it('should handle error fetching services', async () => {
      mockAxios.get.mockRejectedValueOnce(new Error('Fetch failed'));

      await expect(adminService.getServices()).rejects.toThrow();
    });

    it('should add service', async () => {
      mockAxios.post.mockResolvedValueOnce({
        data: { ...mockService, id: 'service-1' }
      });

      const result = await adminService.addService(mockService);

      expect(mockAxios.post).toHaveBeenCalledWith(
        API_CONFIG.endpoints.admin.services,
        mockService
      );
      expect(result.id).toBe('service-1');
    });

    it('should handle error adding service', async () => {
      mockAxios.post.mockRejectedValueOnce(new Error('Service already exists'));

      await expect(adminService.addService(mockService)).rejects.toThrow();
    });

    it('should update service', async () => {
      const updatedService = { ...mockService, name: 'GitHub Updated' };

      mockAxios.put.mockResolvedValueOnce({ data: updatedService });

      const result = await adminService.updateService('1', updatedService);

      expect(mockAxios.put).toHaveBeenCalledWith(
        `${API_CONFIG.endpoints.admin.services}/1`,
        updatedService
      );
      expect(result.name).toBe('GitHub Updated');
    });

    it('should handle error updating service', async () => {
      mockAxios.put.mockRejectedValueOnce(new Error('Service not found'));

      await expect(adminService.updateService('nonexistent', mockService)).rejects.toThrow();
    });

    it('should delete service', async () => {
      mockAxios.delete.mockResolvedValueOnce({ status: 200 });

      await adminService.deleteService('1');

      expect(mockAxios.delete).toHaveBeenCalledWith(
        `${API_CONFIG.endpoints.admin.services}/1`
      );
    });

    it('should handle error deleting service', async () => {
      mockAxios.delete.mockRejectedValueOnce(new Error('Service not found'));

      await expect(adminService.deleteService('nonexistent')).rejects.toThrow();
    });
  });

  describe('Error Handling - Network Issues', () => {
    it('should handle network timeout', async () => {
      const error = new Error('Network timeout');
      mockAxios.get.mockRejectedValueOnce(error);

      await expect(adminService.getUsers()).rejects.toThrow('Network timeout');
    });

    it('should handle 500 server error', async () => {
      const error = new Error('Internal server error');
      (error as unknown as Record<string, unknown>).response = { status: 500 };

      mockAxios.get.mockRejectedValueOnce(error);

      await expect(adminService.getAreas()).rejects.toThrow();
    });

    it('should handle malformed response', async () => {
      mockAxios.get.mockResolvedValueOnce({ data: null });

      const result = await adminService.getUsers();

      expect(result).toBeNull();
    });
  });
});
