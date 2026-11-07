# AREA Mobile - API Integration Guide

Complete guide for integrating with the AREA Backend API from the mobile application.

---

## 📋 Overview

The AREA Mobile app communicates with the AREA Backend through REST APIs. This guide covers all API endpoints, authentication, error handling, and integration patterns used in the mobile app.

---

## 🔧 API Configuration

### Base Configuration

```typescript
// services/api.config.ts
export const API_CONFIG = {
  baseURL: __DEV__
    ? 'http://localhost:8080/api'
    : 'https://api.area-project.com/api',

  timeout: 10000,

  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};
```

### Axios Client Setup

```typescript
// services/api.ts
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { API_CONFIG } from './api.config';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers,
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshAuthToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Redirect to login
        logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

---

## 🔐 Authentication Endpoints

### Login

```typescript
// services/auth.ts
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
  return response.data;
};
```

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "user": {
    "id": "123",
    "email": "user@example.com",
    "name": "John Doe",
    "verified": true
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600
}
```

### Register

```typescript
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/register', userData);
  return response.data;
};
```

**Endpoint:** `POST /api/auth/register`

### Refresh Token

```typescript
export const refreshToken = async (): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/refresh');
  return response.data;
};
```

**Endpoint:** `POST /api/auth/refresh`

### Logout

```typescript
export const logout = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
};
```

**Endpoint:** `POST /api/auth/logout`

### Get Current User

```typescript
export interface User {
  id: string;
  email: string;
  name: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<User>('/auth/me');
  return response.data;
};
```

**Endpoint:** `GET /api/auth/me`

---

## 🤖 AREA Endpoints

### List AREAs

```typescript
export interface Area {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  userId: string;
  actions: Action[];
  reactions: Reaction[];
  createdAt: string;
  updatedAt: string;
}

export const getAreas = async (): Promise<Area[]> => {
  const response = await apiClient.get<Area[]>('/areas');
  return response.data;
};
```

**Endpoint:** `GET /api/areas`

**Query Parameters:**
- `page` (number): Page number (0-based)
- `size` (number): Page size (default: 20)
- `enabled` (boolean): Filter by enabled status

### Create AREA

```typescript
export interface CreateAreaRequest {
  name: string;
  description?: string;
  actions: CreateActionRequest[];
  reactions: CreateReactionRequest[];
}

export const createArea = async (areaData: CreateAreaRequest): Promise<Area> => {
  const response = await apiClient.post<Area>('/areas', areaData);
  return response.data;
};
```

**Endpoint:** `POST /api/areas`

### Get AREA by ID

```typescript
export const getArea = async (areaId: string): Promise<Area> => {
  const response = await apiClient.get<Area>(`/areas/${areaId}`);
  return response.data;
};
```

**Endpoint:** `GET /api/areas/{areaId}`

### Update AREA

```typescript
export interface UpdateAreaRequest {
  name?: string;
  description?: string;
  enabled?: boolean;
  actions?: UpdateActionRequest[];
  reactions?: UpdateReactionRequest[];
}

export const updateArea = async (
  areaId: string,
  updates: UpdateAreaRequest
): Promise<Area> => {
  const response = await apiClient.put<Area>(`/areas/${areaId}`, updates);
  return response.data;
};
```

**Endpoint:** `PUT /api/areas/{areaId}`

### Delete AREA

```typescript
export const deleteArea = async (areaId: string): Promise<void> => {
  await apiClient.delete(`/areas/${areaId}`);
};
```

**Endpoint:** `DELETE /api/areas/{areaId}`

### Run AREA

```typescript
export interface AreaExecution {
  id: string;
  areaId: string;
  status: 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  error?: string;
}

export const runArea = async (areaId: string): Promise<AreaExecution> => {
  const response = await apiClient.post<AreaExecution>(`/areas/${areaId}/run`);
  return response.data;
};
```

**Endpoint:** `POST /api/areas/{areaId}/run`

---

## 🔌 Service Endpoints

### List Services

```typescript
export interface Service {
  id: string;
  key: string;
  name: string;
  description: string;
  auth: 'OAUTH2' | 'APIKEY' | 'NONE';
  isActive: boolean;
  docsUrl?: string;
  iconUrl?: string;
}

export const getServices = async (): Promise<Service[]> => {
  const response = await apiClient.get<Service[]>('/services');
  return response.data;
};
```

**Endpoint:** `GET /api/services`

### Get Service Actions

```typescript
export interface ActionDefinition {
  id: string;
  name: string;
  description: string;
  parameters: ParameterDefinition[];
}

export const getServiceActions = async (
  serviceId: string
): Promise<ActionDefinition[]> => {
  const response = await apiClient.get<ActionDefinition[]>(
    `/services/${serviceId}/actions`
  );
  return response.data;
};
```

**Endpoint:** `GET /api/services/{serviceId}/actions`

### Get Service Reactions

```typescript
export const getServiceReactions = async (
  serviceId: string
): Promise<ActionDefinition[]> => {
  const response = await apiClient.get<ActionDefinition[]>(
    `/services/${serviceId}/reactions`
  );
  return response.data;
};
```

**Endpoint:** `GET /api/services/{serviceId}/reactions`

---

## 👤 User Endpoints

### Update Profile

```typescript
export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

export const updateProfile = async (
  updates: UpdateProfileRequest
): Promise<User> => {
  const response = await apiClient.put<User>('/auth/profile', updates);
  return response.data;
};
```

**Endpoint:** `PUT /api/auth/profile`

### Connected Services

```typescript
export interface ConnectedService {
  id: string;
  serviceId: string;
  serviceName: string;
  connectedAt: string;
  expiresAt?: string;
}

export const getConnectedServices = async (): Promise<ConnectedService[]> => {
  const response = await apiClient.get<ConnectedService[]>(
    '/user/connected-services'
  );
  return response.data;
};
```

**Endpoint:** `GET /api/user/connected-services`

### Connect Service

```typescript
export interface ConnectServiceRequest {
  serviceId: string;
  authCode?: string;
  apiKey?: string;
}

export const connectService = async (
  connectionData: ConnectServiceRequest
): Promise<ConnectedService> => {
  const response = await apiClient.post<ConnectedService>(
    '/user/service-connection',
    connectionData
  );
  return response.data;
};
```

**Endpoint:** `POST /api/user/service-connection`

---

## 🔧 Action & Reaction Types

### Action Structure

```typescript
export interface Action {
  id: string;
  actionDefinitionId: string;
  name: string;
  parameters: Record<string, any>;
  activationConfig: ActivationConfig;
}

export interface CreateActionRequest {
  actionDefinitionId: string;
  parameters: Record<string, any>;
  activationConfig: ActivationConfig;
}
```

### Reaction Structure

```typescript
export interface Reaction {
  id: string;
  actionDefinitionId: string;
  name: string;
  parameters: Record<string, any>;
  mapping?: Record<string, string>;
  condition?: ConditionGroup;
  order: number;
  continue_on_error: boolean;
  activationConfig?: ActivationConfig;
}
```

### Activation Config

```typescript
export interface ActivationConfig {
  type: 'webhook' | 'cron' | 'manual' | 'poll' | 'chain';
  webhook_url?: string;
  events?: string[];
  cron_expression?: string;
  poll_interval?: number;
  secret_token?: string;
}
```

### Condition System

```typescript
export interface ConditionGroup {
  operator: 'and' | 'or';
  conditions: (Condition | ConditionGroup)[];
}

export interface Condition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}
```

---

## 🚨 Error Handling

### API Error Response

```typescript
export interface APIError {
  message: string;
  code?: string;
  status: number;
  details?: any;
}

// Error handler utility
export const handleAPIError = (error: any): APIError => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data?.message || 'Server error',
      code: error.response.data?.code,
      status: error.response.status,
      details: error.response.data,
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: 'Network error - please check your connection',
      status: 0,
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'Unknown error occurred',
      status: 0,
    };
  }
};
```

### Common HTTP Status Codes

| Status Code | Meaning | Action |
|-------------|---------|--------|
| 200 | OK | Success |
| 201 | Created | Resource created |
| 400 | Bad Request | Validate input |
| 401 | Unauthorized | Refresh token or login |
| 403 | Forbidden | Check permissions |
| 404 | Not Found | Check resource ID |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Implement backoff |
| 500 | Internal Server Error | Retry or report |

---

## 🔄 Retry & Backoff Strategy

```typescript
// utils/apiRetry.ts
export const apiRetry = async <T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;

      // Don't retry on client errors (4xx)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

// Usage
export const getAreasWithRetry = () => apiRetry(getAreas);
```

---

## 📊 Pagination

### Paginated Response

```typescript
export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      empty: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    empty: boolean;
    unsorted: boolean;
  };
  empty: boolean;
}

// Paginated areas fetch
export const getAreasPaginated = async (
  page: number = 0,
  size: number = 20
): Promise<PaginatedResponse<Area>> => {
  const response = await apiClient.get<PaginatedResponse<Area>>('/areas', {
    params: { page, size },
  });
  return response.data;
};
```

---

## 🔐 Security Best Practices

### Token Storage

```typescript
// utils/secureStorage.ts
import * as SecureStore from 'expo-secure-store';

export const tokenStorage = {
  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await SecureStore.setItemAsync('access_token', accessToken, {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
    });
    await SecureStore.setItemAsync('refresh_token', refreshToken, {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
    });
  },

  async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('access_token');
    } catch {
      return null;
    }
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('refresh_token');
    } catch {
      return null;
    }
  },

  async clearTokens(): Promise<void> {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
  },
};
```

### Input Validation

```typescript
// utils/validation.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const areaSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
});

export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  return schema.parse(data);
};
```

---

## 🧪 Testing API Calls

### Mocking API Responses

```typescript
// __mocks__/axios.ts
const mockAxios = jest.createMockFromModule('axios');

mockAxios.create = jest.fn(() => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
}));

export default mockAxios;
```

### Service Testing

```typescript
// __tests__/authService.test.ts
import { login } from '../authService';
import { apiClient } from '../api';

jest.mock('../api');
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('calls API with correct credentials', async () => {
      const credentials = { email: 'test@example.com', password: 'password' };
      const mockResponse = {
        user: { id: '1', email: 'test@example.com' },
        accessToken: 'token',
      };

      mockApiClient.post.mockResolvedValue({ data: mockResponse });

      const result = await login(credentials);

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(result).toEqual(mockResponse);
    });

    it('handles API errors', async () => {
      const error = new Error('Invalid credentials');
      mockApiClient.post.mockRejectedValue(error);

      await expect(login({ email: '', password: '' })).rejects.toThrow();
    });
  });
});
```

---

## 📚 API Documentation

- **Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **About Endpoint**: `GET /about.json`

---

## 🚀 Production Considerations

### Environment Variables

```typescript
// Use different configs for different environments
export const getApiConfig = () => {
  if (__DEV__) {
    return {
      baseURL: 'http://localhost:8080/api',
      timeout: 10000,
    };
  }

  return {
    baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://api.area-project.com/api',
    timeout: 15000, // Longer timeout for production
  };
};
```

### Monitoring & Logging

```typescript
// utils/apiLogger.ts
export const logApiCall = (
  method: string,
  url: string,
  duration: number,
  status?: number
) => {
  if (__DEV__) {
    console.log(`🚀 ${method} ${url} - ${duration}ms - ${status || 'pending'}`);
  } else {
    // Send to monitoring service (e.g., Sentry, DataDog)
    // analytics.track('api_call', { method, url, duration, status });
  }
};
```