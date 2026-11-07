import { apiClient } from './api';
import type {
  ActionDto,
  AreaDto,
  ReactionDto,
  BackendService,
  ActionDefinition,
  CreateAreaPayload as CreateAreaPayloadType
} from '@/types/areas';
import * as mockService from './__mocks__/areas.mock';
import { ENV } from './api.config';

const USE_MOCK = ENV.USE_MOCK;
const MOCK_DELAY = ENV.MOCK_DELAY;

export interface CreateAreaPayload {
  name: string;
  description?: string;
  enabled?: boolean;
  actions: ActionDto[];
  reactions: ReactionDto[];
}

export type UpdateAreaPayload = Partial<CreateAreaPayload>;

export async function listAreas(): Promise<AreaDto[]> {
  if (USE_MOCK) {
    return mockService.listAreas({ delay: MOCK_DELAY });
  }

  const response = await apiClient.get<{ content: AreaDto[] } | AreaDto[]>('/api/areas');
  if (response && typeof response === 'object' && 'content' in response && Array.isArray(response.content)) {
    return response.content;
  }
  return Array.isArray(response) ? response : [];
}

export async function getArea(id: string): Promise<AreaDto | null> {
  if (USE_MOCK) {
    return mockService.getArea(id, { delay: MOCK_DELAY });
  }

  try {
    return await apiClient.get<AreaDto>(`/api/areas/${encodeURIComponent(id)}`);
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      return null;
    }
    throw error;
  }
}

export async function getUserAreas(userId: string): Promise<AreaDto[]> {
  if (USE_MOCK) {
    return mockService.listAreas({ delay: MOCK_DELAY });
  }
  return apiClient.get<AreaDto[]>(`/api/areas/user/${encodeURIComponent(userId)}`);
}

export async function createArea(payload: CreateAreaPayload): Promise<AreaDto> {
  if (USE_MOCK) {
    return mockService.createArea(payload, { delay: MOCK_DELAY });
  }

  return apiClient.post<AreaDto>('/api/areas', payload);
}

export async function createAreaWithActions(payload: CreateAreaPayloadType): Promise<AreaDto> {
  if (USE_MOCK) {
    return mockService.createArea(payload as CreateAreaPayload, { delay: MOCK_DELAY });
  }

  return apiClient.post<AreaDto>('/api/areas/with-links', payload);
}

export async function updateArea(id: string, updates: UpdateAreaPayload): Promise<AreaDto> {
  if (USE_MOCK) {
    return mockService.updateArea(id, updates, { delay: MOCK_DELAY });
  }

  return apiClient.put<AreaDto>(`/api/areas/${encodeURIComponent(id)}`, updates);
}

export async function updateAreaComplete(id: string, payload: CreateAreaPayloadType): Promise<AreaDto> {
  if (USE_MOCK) {
    return mockService.updateArea(id, payload as UpdateAreaPayload, { delay: MOCK_DELAY });
  }

  return apiClient.put<AreaDto>(`/api/areas/${encodeURIComponent(id)}/complete`, payload);
}

/**
 * Delete an area
 */
export async function deleteArea(id: string): Promise<void> {
  if (USE_MOCK) {
    await mockService.deleteArea(id, { delay: MOCK_DELAY });
    return;
  }

  await apiClient.delete<void>(`/api/areas/${encodeURIComponent(id)}`);
}

/**
 * Toggle area activation (enable/disable)
 */
export async function toggleArea(id: string, enabled: boolean): Promise<AreaDto> {
  if (USE_MOCK) {
    return mockService.updateArea(id, { enabled }, { delay: MOCK_DELAY });
  }

  return apiClient.patch<AreaDto>(`/api/areas/${encodeURIComponent(id)}/toggle`, { enabled });
}

/**
 * Manually trigger/run an area
 */
export async function runArea(id: string): Promise<{ success: boolean; message?: string }> {
  if (USE_MOCK) {
    return { success: true, message: 'Area triggered successfully (mock)' };
  }

  return apiClient.post<{ success: boolean; message?: string }>(
    `/api/areas/${encodeURIComponent(id)}/trigger`,
    {}
  );
}

/**
 * Get catalog of available services
 */
export async function getServices(): Promise<BackendService[]> {
  if (USE_MOCK) {
    return [
      {
        id: '1',
        key: 'github',
        name: 'GitHub',
        auth: 'OAUTH2',
        isActive: true,
        iconLightUrl: '/github.svg',
        iconDarkUrl: '/github.svg',
      },
      {
        id: '2',
        key: 'gmail',
        name: 'Gmail',
        auth: 'OAUTH2',
        isActive: true,
        iconLightUrl: '/gmail.svg',
        iconDarkUrl: '/gmail.svg',
      },
      {
        id: '3',
        key: 'slack',
        name: 'Slack',
        auth: 'OAUTH2',
        isActive: true,
        iconLightUrl: '/slack.svg',
        iconDarkUrl: '/slack.svg',
      },
    ];
  }

  return apiClient.get<BackendService[]>('/api/services');
}

/**
 * Get actions available for a specific service
 */
export async function getActionsByServiceKey(serviceKey: string): Promise<ActionDefinition[]> {
  if (USE_MOCK) {
    return [
      {
        id: '1',
        serviceId: '1',
        serviceKey,
        serviceName: serviceKey.charAt(0).toUpperCase() + serviceKey.slice(1),
        key: 'push',
        name: 'On Push Event',
        description: 'Triggered when a push event occurs',
        isEventCapable: true,
        isExecutable: false,
        version: 1,
      },
    ];
  }

  return apiClient.get<ActionDefinition[]>(`/api/services/${encodeURIComponent(serviceKey)}/actions`);
}

/**
 * Get a specific action definition by ID
 */
export async function getActionDefinitionById(actionDefinitionId: string): Promise<ActionDefinition> {
  if (USE_MOCK) {
    return {
      id: actionDefinitionId,
      serviceId: '1',
      serviceKey: 'mock',
      serviceName: 'Mock Service',
      key: 'mock-action',
      name: 'Mock Action',
      description: 'Mock action for testing',
      isEventCapable: true,
      isExecutable: false,
      version: 1,
    };
  }

  return apiClient.get<ActionDefinition>(`/api/action-definitions/${encodeURIComponent(actionDefinitionId)}`);
}

/**
 * Get execution history for an area
 */
export async function getAreaExecutions(areaId: string): Promise<unknown[]> {
  if (USE_MOCK) {
    return [];
  }

  return apiClient.get<unknown[]>(`/api/areas/${encodeURIComponent(areaId)}/executions`);
}
