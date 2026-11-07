import { apiClient } from './api';
import { ENV, getApiUrl } from './api.config';
import type {
  User,
  Area,
  Service,
  LineDataPoint,
  BarDataPoint,
  CardUserDataPoint,
  AreaRun,
  AreaStat,
  ServiceBarData,
} from '../types/admin';

// Mock data for development
const mockLineData: LineDataPoint[] = [
  { date: '2024-01-01', users: 10 },
  { date: '2024-01-02', users: 15 },
  { date: '2024-01-03', users: 20 },
  { date: '2024-01-04', users: 18 },
  { date: '2024-01-05', users: 25 },
];

const mockBarData: BarDataPoint[] = [
  { month: 'Jan', users: 50 },
  { month: 'Feb', users: 75 },
  { month: 'Mar', users: 100 },
  { month: 'Apr', users: 85 },
  { month: 'May', users: 120 },
];

const mockCardUserData: CardUserDataPoint[] = [
  { title: 'Total Users', icon: 'user', value: '1,234', diff: 12 },
  { title: 'Active Users', icon: 'discount', value: '890', diff: 8 },
  { title: 'New Users', icon: 'receipt', value: '45', diff: -3 },
  { title: 'Revenue', icon: 'coin', value: '$12,345', diff: 15 },
];

const mockUsers: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', username: 'johndoe', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', username: 'janesmith', role: 'User' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', username: 'bobjohnson', role: 'User' },
];

const mockAreas: Area[] = [
  { id: 1, name: 'Weather Alert', description: 'Get weather alerts', lastRun: '2024-01-15', status: 'success', user: 'john@example.com', enabled: true },
  { id: 2, name: 'Email Backup', description: 'Backup emails', lastRun: '2024-01-14', status: 'failed', user: 'jane@example.com', enabled: true },
  { id: 3, name: 'Social Media Post', description: 'Auto post to social media', lastRun: '2024-01-13', status: 'in progress', user: 'bob@example.com', enabled: false },
];

const mockServices: Service[] = [
  { id: 1, name: 'Gmail', logo: 'https://via.placeholder.com/50' },
  { id: 2, name: 'Slack', logo: 'https://via.placeholder.com/50' },
  { id: 3, name: 'Twitter', logo: 'https://via.placeholder.com/50' },
];

const mockServicesBarData: ServiceBarData[] = [
  { service: 'Gmail', usage: 150 },
  { service: 'Slack', usage: 120 },
  { service: 'Twitter', usage: 90 },
  { service: 'Discord', usage: 75 },
];

const mockAreaRuns: AreaRun[] = [
  { id: 1, areaName: 'Weather Alert', user: 'john@example.com', timestamp: '2024-01-15 10:30', status: 'success', duration: '2s' },
  { id: 2, areaName: 'Email Backup', user: 'jane@example.com', timestamp: '2024-01-15 09:15', status: 'failed', duration: '5s' },
  { id: 3, areaName: 'Social Media Post', user: 'bob@example.com', timestamp: '2024-01-15 08:00', status: 'success', duration: '3s' },
];

const mockAreaStats: AreaStat[] = [
  { title: 'Total Areas', value: '156', icon: 'map' },
  { title: 'Active Areas', value: '128', icon: 'check' },
  { title: 'Failed Runs', value: '12', icon: 'alert' },
  { title: 'Success Rate', value: '94%', icon: 'trending-up' },
];

/**
 * Get line chart data (users connected per day)
 */
export const getLineData = async (): Promise<LineDataPoint[]> => {
  if (ENV.USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockLineData), ENV.MOCK_DELAY);
    });
  }

  try {
    const response = await apiClient.get<LineDataPoint[]>('/api/admin/user-connected-per-day');
    return response;
  } catch (error) {
    console.error('Get line data error:', error);
    throw error;
  }
};

/**
 * Get bar chart data (new users per month)
 */
export const getBarData = async (): Promise<BarDataPoint[]> => {
  if (ENV.USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockBarData), ENV.MOCK_DELAY);
    });
  }

  try {
    const response = await apiClient.get<BarDataPoint[]>('/api/admin/new-user-per-month');
    return response;
  } catch (error) {
    console.error('Get bar data error:', error);
    throw error;
  }
};

/**
 * Get card user data (stats)
 */
export const getCardUserData = async (): Promise<CardUserDataPoint[]> => {
  if (ENV.USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockCardUserData), ENV.MOCK_DELAY);
    });
  }

  try {
    const response = await apiClient.get<CardUserDataPoint[]>('/api/admin/card-user-data');
    return response;
  } catch (error) {
    console.error('Get card user data error:', error);
    throw error;
  }
};

/**
 * Get all users
 */
export const getUsers = async (): Promise<User[]> => {
  if (ENV.USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockUsers), ENV.MOCK_DELAY);
    });
  }

  try {
    const response = await apiClient.get<User[]>('/api/admin/users');
    return response;
  } catch (error) {
    console.error('Get users error:', error);
    throw error;
  }
};

/**
 * Get all areas
 */
export const getAreas = async (): Promise<Area[]> => {
  if (ENV.USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockAreas), ENV.MOCK_DELAY);
    });
  }

  try {
    const response = await apiClient.get<Area[]>('/api/admin/areas');
    return response;
  } catch (error) {
    console.error('Get areas error:', error);
    throw error;
  }
};

/**
 * Get all services
 */
export const getServices = async (): Promise<Service[]> => {
  if (ENV.USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockServices), ENV.MOCK_DELAY);
    });
  }

  try {
    const response = await apiClient.get<Service[]>('/api/admin/services');
    return response;
  } catch (error) {
    console.error('Get services error:', error);
    throw error;
  }
};

/**
 * Get services usage data
 */
export const getServicesBarData = async (): Promise<ServiceBarData[]> => {
  if (ENV.USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockServicesBarData), ENV.MOCK_DELAY);
    });
  }

  try {
    const response = await apiClient.get<ServiceBarData[]>('/api/admin/services-usage');
    return response;
  } catch (error) {
    console.error('Get services bar data error:', error);
    throw error;
  }
};

/**
 * Get area runs
 */
export const getAreaRuns = async (): Promise<AreaRun[]> => {
  if (ENV.USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockAreaRuns), ENV.MOCK_DELAY);
    });
  }

  try {
    const response = await apiClient.get<AreaRun[]>('/api/admin/area-runs');
    return response;
  } catch (error) {
    console.error('Get area runs error:', error);
    throw error;
  }
};

/**
 * Get area stats
 */
export const getAreaStats = async (): Promise<AreaStat[]> => {
  if (ENV.USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockAreaStats), ENV.MOCK_DELAY);
    });
  }

  try {
    const response = await apiClient.get<AreaStat[]>('/api/admin/area-stats');
    return response;
  } catch (error) {
    console.error('Get area stats error:', error);
    throw error;
  }
};

/**
 * Create a new user
 * Note: This function bypasses the apiClient to avoid saving cookies/tokens
 * which would log out the current admin user.
 */
export const createUser = async (userData: { firstName: string; lastName: string; username: string; email: string; password: string; isAdmin: boolean; }): Promise<User> => {
  if (ENV.USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser: User = {
          id: Date.now(),
          name: `${userData.firstName} ${userData.lastName}`,
          email: userData.email,
          username: userData.username,
          role: userData.isAdmin ? 'Admin' : 'User',
        };
        resolve(newUser);
      }, ENV.MOCK_DELAY);
    });
  }

  try {
    const apiUrl = await getApiUrl();
    
    // dont get credentials from the current admin user to avoid to log out
    const response = await fetch(`${apiUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'omit',
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        username: userData.username,
        isAdmin: userData.isAdmin,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Registration failed with status ${response.status}`);
    }
    const data = await response.json();
    return {
      id: data.id || Date.now(),
      name: `${userData.firstName} ${userData.lastName}`,
      email: userData.email,
      username: userData.username,
      role: userData.isAdmin ? 'Admin' : 'User',
    };
  } catch (error) {
    console.error('Create user error:', error);
    throw error;
  }
};

/**
 * Update an existing user
 */
export const updateUser = async (
  id: string,
  userData: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password?: string;
    isAdmin: boolean;
  }
): Promise<User> => {
  if (ENV.USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const updatedUser: User = {
          id: parseInt(id),
          name: `${userData.firstName} ${userData.lastName}`,
          email: userData.email,
          username: userData.username,
          role: userData.isAdmin ? 'Admin' : 'User',
        };
        resolve(updatedUser);
      }, ENV.MOCK_DELAY);
    });
  }

  try {
    const updateData: any = {
      email: userData.email,
      firstname: userData.firstName,
      lastname: userData.lastName,
      username: userData.username,
      isAdmin: userData.isAdmin,
    };
    if (userData.password)
      updateData.password = userData.password;
    const response = await apiClient.put<User>(`/api/users/${id}`, updateData);
    return response;
  } catch (error) {
    console.error('Update user error:', error);
    throw error;
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (id: string): Promise<any> => {
  if (ENV.USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = mockUsers.find(u => u.id === parseInt(id));
        if (user) {
          resolve(user);
        } else {
          resolve(mockUsers[0]);
        }
      }, ENV.MOCK_DELAY);
    });
  }

  try {
    const response = await apiClient.get<any>(`/api/users/${id}`);
    return response;
  } catch (error) {
    console.error('Get user by ID error:', error);
    throw error;
  }
};

/**
 * Delete a user
 */
export const deleteUser = async (id: string): Promise<void> => {
  if (ENV.USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), ENV.MOCK_DELAY);
    });
  }

  try {
    await apiClient.delete(`/api/users/${id}`);
  } catch (error) {
    console.error('Delete user error:', error);
    throw error;
  }
};

/**
 * Delete an area
 */
export const deleteArea = async (id: string): Promise<void> => {
  if (ENV.USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), ENV.MOCK_DELAY);
    });
  }

  try {
    await apiClient.delete(`/api/admin/areas/${id}`);
  } catch (error) {
    console.error('Delete area error:', error);
    throw error;
  }
};

/**
 * Enable/Disable an area
 */
export const enableDisableArea = async (id: string, enabled: boolean): Promise<void> => {
  if (ENV.USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), ENV.MOCK_DELAY);
    });
  }

  try {
    await apiClient.patch(`/api/admin/areas/${id}`, { enabled });
  } catch (error) {
    console.error('Enable/Disable area error:', error);
    throw error;
  }
};
