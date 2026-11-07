import * as adminService from '../../src/services/adminService';
import axios from '../../src/config/axios';
import { API_CONFIG } from '../../src/config/api';

jest.mock('../../src/config/axios');
jest.mock('../../src/config/api', () => ({
  USE_MOCK_DATA: false,
  API_CONFIG: {
    baseURL: 'http://localhost:3000',
    endpoints: {
      admin: {
        userConnectedPerDay: '/api/admin/stats/userConnectedPerDay',
        newUserPerMonth: '/api/admin/stats/newUserPerMonth',
        users: '/api/admin/users',
        areas: '/api/admin/areas',
        services: '/api/admin/services',
        servicesUsage: '/api/admin/stats/servicesUsage',
        areaRuns: '/api/admin/stats/areaRuns',
        areaStats: '/api/admin/stats/areaStats',
        cardUserData: '/api/admin/stats/cardUserData',
      },
      auth: {
        register: '/api/auth/register',
      },
      user: {
        profile: '/api/user/profile',
      },
    },
  },
}));

describe('adminService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getLineData', () => {
    it('should fetch line data successfully', async () => {
      const mockData = [
        { date: '2024-01-01', value: 10 },
        { date: '2024-01-02', value: 15 },
      ];
      (axios.get as jest.Mock).mockResolvedValue({ data: mockData });

      const result = await adminService.getLineData();

      expect(result).toEqual(mockData);
      expect(axios.get).toHaveBeenCalledWith(API_CONFIG.endpoints.admin.userConnectedPerDay);
    });

    it('should handle error when fetching line data', async () => {
      const error = new Error('Network error');
      (axios.get as jest.Mock).mockRejectedValue(error);

      await expect(adminService.getLineData()).rejects.toThrow('Network error');
    });

    it('should return array from getLineData', async () => {
      (axios.get as jest.Mock).mockResolvedValue({ data: [] });

      const result = await adminService.getLineData();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getBarData', () => {
    it('should fetch bar data successfully', async () => {
      const mockData = [
        { month: 'January', count: 5 },
        { month: 'February', count: 8 },
      ];
      (axios.get as jest.Mock).mockResolvedValue({ data: mockData });

      const result = await adminService.getBarData();

      expect(result).toEqual(mockData);
      expect(axios.get).toHaveBeenCalledWith(API_CONFIG.endpoints.admin.newUserPerMonth);
    });

    it('should handle error when fetching bar data', async () => {
      const error = new Error('API error');
      (axios.get as jest.Mock).mockRejectedValue(error);

      await expect(adminService.getBarData()).rejects.toThrow('API error');
    });

    it('should return array from getBarData', async () => {
      (axios.get as jest.Mock).mockResolvedValue({ data: [] });

      const result = await adminService.getBarData();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getUsers', () => {
    it('should fetch users successfully', async () => {
      const mockUsers = [
        { id: '1', email: 'user1@example.com', firstName: 'John' },
      ];
      (axios.get as jest.Mock).mockResolvedValue({ data: mockUsers });

      const result = await adminService.getUsers();

      expect(result).toEqual(mockUsers);
      expect(axios.get).toHaveBeenCalledWith(API_CONFIG.endpoints.admin.users);
    });

    it('should handle error when fetching users', async () => {
      const error = new Error('Unauthorized');
      (axios.get as jest.Mock).mockRejectedValue(error);

      await expect(adminService.getUsers()).rejects.toThrow('Unauthorized');
    });

    it('should return array of users', async () => {
      (axios.get as jest.Mock).mockResolvedValue({ data: [] });

      const result = await adminService.getUsers();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getAreas', () => {
    it('should fetch areas successfully', async () => {
      const mockAreas = [
        { id: '1', name: 'Area 1' },
      ];
      (axios.get as jest.Mock).mockResolvedValue({ data: mockAreas });

      const result = await adminService.getAreas();

      expect(result).toEqual(mockAreas);
      expect(axios.get).toHaveBeenCalledWith(API_CONFIG.endpoints.admin.areas);
    });

    it('should handle error when fetching areas', async () => {
      const error = new Error('Server error');
      (axios.get as jest.Mock).mockRejectedValue(error);

      await expect(adminService.getAreas()).rejects.toThrow('Server error');
    });

    it('should return array of areas', async () => {
      (axios.get as jest.Mock).mockResolvedValue({ data: [] });

      const result = await adminService.getAreas();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getServices', () => {
    it('should fetch services successfully', async () => {
      const mockServices = [
        { id: '1', name: 'Service 1', key: 'svc1' },
      ];
      (axios.get as jest.Mock).mockResolvedValue({ data: mockServices });

      const result = await adminService.getServices();

      expect(result).toEqual(mockServices);
      expect(axios.get).toHaveBeenCalledWith(API_CONFIG.endpoints.admin.services);
    });

    it('should handle error when fetching services', async () => {
      const error = new Error('Connection failed');
      (axios.get as jest.Mock).mockRejectedValue(error);

      await expect(adminService.getServices()).rejects.toThrow('Connection failed');
    });

    it('should return array of services', async () => {
      (axios.get as jest.Mock).mockResolvedValue({ data: [] });

      const result = await adminService.getServices();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getServicesBarData', () => {
    it('should fetch services bar data successfully', async () => {
      const mockData = [{ name: 'GitHub', usage: 50 }];
      (axios.get as jest.Mock).mockResolvedValue({ data: mockData });

      const result = await adminService.getServicesBarData();

      expect(result).toEqual(mockData);
      expect(axios.get).toHaveBeenCalledWith(API_CONFIG.endpoints.admin.servicesUsage);
    });

    it('should handle error when fetching services bar data', async () => {
      const error = new Error('Error');
      (axios.get as jest.Mock).mockRejectedValue(error);

      await expect(adminService.getServicesBarData()).rejects.toThrow('Error');
    });
  });

  describe('getAreaRuns', () => {
    it('should fetch area runs successfully', async () => {
      const mockData = [{ areaId: '1', runCount: 10 }];
      (axios.get as jest.Mock).mockResolvedValue({ data: mockData });

      const result = await adminService.getAreaRuns();

      expect(result).toEqual(mockData);
      expect(axios.get).toHaveBeenCalledWith(API_CONFIG.endpoints.admin.areaRuns);
    });

    it('should handle error when fetching area runs', async () => {
      const error = new Error('Error');
      (axios.get as jest.Mock).mockRejectedValue(error);

      await expect(adminService.getAreaRuns()).rejects.toThrow('Error');
    });
  });

  describe('getAreaStats', () => {
    it('should fetch area stats successfully', async () => {
      const mockData = { totalAreas: 10, activeAreas: 8 };
      (axios.get as jest.Mock).mockResolvedValue({ data: mockData });

      const result = await adminService.getAreaStats();

      expect(result).toEqual(mockData);
      expect(axios.get).toHaveBeenCalledWith(API_CONFIG.endpoints.admin.areaStats);
    });

    it('should handle error when fetching area stats', async () => {
      const error = new Error('Error');
      (axios.get as jest.Mock).mockRejectedValue(error);

      await expect(adminService.getAreaStats()).rejects.toThrow('Error');
    });
  });

  describe('getCardUserData', () => {
    it('should fetch card user data successfully', async () => {
      const mockData = { totalUsers: 100, newUsers: 10 };
      (axios.get as jest.Mock).mockResolvedValue({ data: mockData });

      const result = await adminService.getCardUserData();

      expect(result).toEqual(mockData);
      expect(axios.get).toHaveBeenCalledWith(API_CONFIG.endpoints.admin.cardUserData);
    });

    it('should handle error when fetching card user data', async () => {
      const error = new Error('Error');
      (axios.get as jest.Mock).mockRejectedValue(error);

      await expect(adminService.getCardUserData()).rejects.toThrow('Error');
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        firstName: 'New',
        lastName: 'User',
        password: 'password123',
        isAdmin: false,
      };
      const mockResponse = { ...userData, id: '123' };
      (axios.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await adminService.createUser(userData);

      expect(result).toEqual(mockResponse);
      expect(axios.post).toHaveBeenCalledWith(API_CONFIG.endpoints.auth.register, userData);
    });

    it('should handle error when creating user', async () => {
      const userData = {
        email: 'user@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'pass',
        isAdmin: false,
      };
      const error = new Error('Duplicate email');
      (axios.post as jest.Mock).mockRejectedValue(error);

      await expect(adminService.createUser(userData)).rejects.toThrow('Duplicate email');
    });
  });

  describe('addUser', () => {
    it('should add user successfully', async () => {
      const user = { email: 'add@example.com', firstName: 'Add', lastName: 'User', isAdmin: false };
      const mockResponse = { ...user, id: '124' };
      (axios.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await adminService.addUser(user as any);

      expect(result).toEqual(mockResponse);
      expect(axios.post).toHaveBeenCalledWith(API_CONFIG.endpoints.admin.users, user);
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const userId = '123';
      const user = { email: 'updated@example.com', firstName: 'Updated', lastName: 'User', isAdmin: false };
      const mockResponse = { ...user, id: userId };
      (axios.put as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await adminService.updateUser(userId, user as any);

      expect(result).toEqual(mockResponse);
      expect(axios.put).toHaveBeenCalledWith(`${API_CONFIG.endpoints.admin.users}/${userId}`, user);
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const userId = '123';
      (axios.delete as jest.Mock).mockResolvedValue({ data: null });

      await adminService.deleteUser(userId);

      expect(axios.delete).toHaveBeenCalledWith(`${API_CONFIG.endpoints.user.profile}/${userId}`);
    });
  });

  describe('deleteArea', () => {
    it('should delete area successfully', async () => {
      const areaId = '1';
      (axios.delete as jest.Mock).mockResolvedValue({ data: null });

      await adminService.deleteArea(areaId);

      expect(axios.delete).toHaveBeenCalledWith(`${API_CONFIG.endpoints.admin.areas}/${areaId}`);
    });
  });

  describe('enableDisableArea', () => {
    it('should enable area successfully', async () => {
      const areaId = '1';
      (axios.patch as jest.Mock).mockResolvedValue({ data: null });

      await adminService.enableDisableArea(areaId, true);

      expect(axios.patch).toHaveBeenCalledWith(`${API_CONFIG.endpoints.admin.areas}/${areaId}`, { enabled: true });
    });

    it('should disable area successfully', async () => {
      const areaId = '1';
      (axios.patch as jest.Mock).mockResolvedValue({ data: null });

      await adminService.enableDisableArea(areaId, false);

      expect(axios.patch).toHaveBeenCalledWith(`${API_CONFIG.endpoints.admin.areas}/${areaId}`, { enabled: false });
    });
  });

  describe('addService', () => {
    it('should add service successfully', async () => {
      const service = { name: 'NewService', key: 'new_service' };
      const mockResponse = { ...service, id: '1' };
      (axios.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await adminService.addService(service as any);

      expect(result).toEqual(mockResponse);
      expect(axios.post).toHaveBeenCalledWith(API_CONFIG.endpoints.admin.services, service);
    });
  });

  describe('updateService', () => {
    it('should update service successfully', async () => {
      const serviceId = '1';
      const service = { name: 'UpdatedService', key: 'updated_svc' };
      const mockResponse = { ...service, id: serviceId };
      (axios.put as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await adminService.updateService(serviceId, service as any);

      expect(result).toEqual(mockResponse);
      expect(axios.put).toHaveBeenCalledWith(`${API_CONFIG.endpoints.admin.services}/${serviceId}`, service);
    });
  });

  describe('deleteService', () => {
    it('should delete service successfully', async () => {
      const serviceId = '1';
      (axios.delete as jest.Mock).mockResolvedValue({ data: null });

      await adminService.deleteService(serviceId);

      expect(axios.delete).toHaveBeenCalledWith(`${API_CONFIG.endpoints.admin.services}/${serviceId}`);
    });
  });
});
