import axios from '../config/axios';
import { Area, Service, Action, BackendArea, BackendService, PageableResponse, ServiceData, ActionDefinitionResponse, ServiceState, FieldData } from '../types';
import { data as mockData, services as mockServices, actions as MockActions, labelsTextReaction1, whiteboardCards} from '../mocks/areas';
import { API_CONFIG, USE_MOCK_DATA } from '../config/api';
import { getCurrentUser } from './authService';


export const getAreas = async (): Promise<Area[]> => {
  if (USE_MOCK_DATA)
    return Promise.resolve(mockData);

  try {
    const response = await axios.get<PageableResponse<Area> | Area[]>(API_CONFIG.endpoints.areas.list);

    if (response.data && typeof response.data === 'object' && 'content' in response.data && Array.isArray(response.data.content)) {
      return response.data.content;
    }

    return Array.isArray(response.data) ? response.data : [];
  } catch (error: unknown) {
    console.error('Get areas error:', error);

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 403) {
        console.warn('Access denied to legacy areas endpoint. User might not have proper permissions.');
      }
    }

    throw error;
  }
};

export const getServices = async (): Promise<BackendService[]> => {
  if (USE_MOCK_DATA) {
    return Promise.resolve(mockServices.map(s => ({
      id: s.id.toString(),
      key: s.name.toLowerCase().replace(/\s+/g, '-'),
      name: s.name,
      auth: 'NONE' as const,
      isActive: true,
      iconLightUrl: s.logo,
      iconDarkUrl: s.logo
    })));
  }

  try {
    const response = await axios.get(API_CONFIG.endpoints.services.catalog);
    return response.data;
  } catch (error) {
    console.error('Get services error:', error);
    throw error;
  }
};

export const getServiceById = async (id: number): Promise<Service | undefined> => {
  if (USE_MOCK_DATA) {
    const service = mockServices.find(service => Number(service.id) === id);
    return Promise.resolve(service);
  }

  try {
    const response = await axios.get(API_CONFIG.endpoints.services.getById + id);
    return response.data;
  } catch (error) {
    console.error('Get service by id error:', error);
    throw error;
  }
}

export const getActionsByServiceKey = async (serviceKey: string): Promise<Action[]> => {
  if (USE_MOCK_DATA) {
    const service = mockServices.find(s => s.name.toLowerCase() === serviceKey.toLowerCase());
    if (!service) return Promise.resolve([]);
    const actions = MockActions
      .filter(action => String(action.serviceId) === String(service.id))
      .map(action => ({
        ...action,
        serviceKey: service.name.toLowerCase().replace(/\s+/g, '-'),
        serviceName: service.name,
        description: action.description ?? '',
        name: action.name ?? '',
        id: action.id,
        serviceId: action.serviceId,
        key: `mock-key-${action.id}`,
        isEventCapable: false,
        isExecutable: true,
        version: 1,
        inputSchema: undefined,
        outputSchema: undefined,
        fields: {},
      }));
    return Promise.resolve(actions);
  }

  try {
    const url = API_CONFIG.endpoints.services.actions + serviceKey;
    console.log('Fetching actions from URL:', url);
    console.log('Full URL:', `${API_CONFIG.baseURL}${url}`);
    const response = await axios.get(url);
    console.log('Actions response:', response.data);
    const actionDefinitions: ActionDefinitionResponse[] = response.data;
    const actions: Action[] = actionDefinitions.map(def => ({
      id: def.id,
      serviceId: def.serviceId,
      serviceKey: def.serviceKey,
      serviceName: def.serviceName,
      key: def.key,
      name: def.name,
      description: def.description,
      inputSchema: def.inputSchema as Action['inputSchema'],
      outputSchema: def.outputSchema,
      isEventCapable: def.isEventCapable,
      isExecutable: def.isExecutable,
      version: def.version,
      fields: {}
    }));
    return actions;
  } catch (error) {
    console.error('Get actions by service key error:', error);
    throw error;
  }
};

export const getActionDefinitionById = async (actionDefinitionId: string): Promise<ActionDefinitionResponse> => {
  if (USE_MOCK_DATA) {
    return Promise.resolve({
      id: actionDefinitionId,
      serviceId: '1',
      serviceKey: 'github',
      serviceName: 'GitHub',
      key: 'mock-action',
      name: 'Mock Action',
      description: 'Mock action for testing',
      isEventCapable: true,
      isExecutable: false,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  try {
    const response = await axios.get(API_CONFIG.endpoints.actions.actionDefinitions + actionDefinitionId);
    return response.data;
  } catch (error) {
    console.error('Get action definition by id error:', error);
    throw error;
  }
};

export const getActionFieldsByServiceAndActionId = async (serviceId: number, actionId: number): Promise<unknown[]> => {
  if (USE_MOCK_DATA)
    return Promise.resolve(labelsTextReaction1);

  try {
    const response = await axios.get(API_CONFIG.endpoints.services.actionFields + `${serviceId}/actions/${actionId}/fields`);
    return response.data;
  } catch (error) {
    console.error('Get action fields error:', error);
    throw error;
  }
}

export const getActionFieldsFromActionDefinition = (action: Action): FieldData[] => {
  if (!action.inputSchema || !action.inputSchema.properties) {
    return [];
  }

  const fields: FieldData[] = [];
  const properties = action.inputSchema.properties;
  const required = action.inputSchema.required || [];

  Object.entries(properties).forEach(([fieldName, fieldDef]) => {
    let fieldType: FieldData['type'] = 'text';

    switch (fieldDef.type) {
      case 'string':
        if (fieldDef.format === 'date-time') {
          fieldType = 'datetime';
        } else if (fieldDef.format === 'date') {
          fieldType = 'date';
        } else if (fieldDef.format === 'time') {
          fieldType = 'time';
        } else if (fieldDef.format === 'email') {
          fieldType = 'email';
        } else {
          fieldType = 'text';
        }
        break;
      case 'integer':
      case 'number':
        fieldType = 'number';
        break;
      case 'array':
        fieldType = 'array';
        break;
      default:
        fieldType = 'text';
    }

    fields.push({
      name: fieldName,
      mandatory: required.includes(fieldName),
      type: fieldType,
      format: fieldDef.format,
      description: fieldDef.description,
      placeholder: fieldDef.description || `Enter ${fieldName}`,
      pattern: fieldDef.pattern,
      minLength: fieldDef.minLength,
      maxLength: fieldDef.maxLength,
      minimum: fieldDef.minimum,
      maximum: fieldDef.maximum,
      default: fieldDef.default,
      items: fieldDef.items,
      minItems: fieldDef.minItems
    });
  });

  return fields;
};

export const createAction = async (action: Partial<Action>): Promise<Action> => {
  if (USE_MOCK_DATA) {
    const newAction = { id: Date.now(), ...action } as Action;
    MockActions.push(newAction);
    return Promise.resolve(newAction);
  }

  try {
    const response = await axios.post(API_CONFIG.endpoints.actions.create, action);
    return response.data;
  } catch (error) {
    console.error('Create action error:', error);
    throw error;
  }
}

export const createArea = async (area: Partial<Area>): Promise<Area> => {
  if (USE_MOCK_DATA) {
    const newArea = { id: Date.now(), ...area } as Area;
    mockData.push(newArea);
    return Promise.resolve(newArea);
  }

  try {
    const response = await axios.post(API_CONFIG.endpoints.areas.create, area);
    return response.data;
  } catch (error) {
    console.error('Create area error:', error);
    throw error;
  }
}

interface CreateAreaRequest {
  name: string;
  description?: string;
  userId?: string;
}

export const createAreaSimple = async (areaData: CreateAreaRequest): Promise<BackendArea> => {
  try {
    if (!areaData.userId) {
      const currentUser = await getCurrentUser();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      areaData.userId = (currentUser as any).id || (currentUser as any).userId;
    }

    const response = await axios.post(API_CONFIG.endpoints.areas.create, areaData);
    return response.data;
  } catch (error) {
    console.error('Create simple area error:', error);
    throw error;
  }
};

export const getCardByAreaId = async (areaId: string): Promise<ServiceData[]> => {
  if (!areaId)
    return Promise.resolve([]);
  if (USE_MOCK_DATA) {
    const filteredCards = whiteboardCards.filter(card => String(card.areaId) === areaId);
    return Promise.resolve(filteredCards.map(card => ({
      id: card.id,
      logo: card.logo,
      serviceName: card.serviceName,
      serviceKey: card.serviceName.toLowerCase().replace(/\s+/g, '-'),
      event: card.event,
      cardName: card.cardName,
      state: card.state as ServiceState,
      actionId: typeof card.actionId === 'string' ? Number(card.actionId) : card.actionId,
      serviceId: String(card.serviceId),
      fields: {}
    })));
  }

  try {
    const response = await axios.get(API_CONFIG.endpoints.areas.cards + `${areaId}/cards`);
    return response.data;
  } catch (error) {
    console.error('Get cards by area id error:', error);
    throw error;
  }
}

export const getAreaById = async (areaId: string): Promise<BackendArea | undefined> => {
  if (USE_MOCK_DATA) {
    const area = mockData.find(area => String(area.id) === areaId);
    if (area) {
      return Promise.resolve({
        id: area.id,
        name: area.name,
        description: area.description,
        enabled: true,
        userId: '1', // Mock user id
        userEmail: 'user@example.com',
        actions: [],
        reactions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    return Promise.resolve(undefined);
  }

  try {
    const response = await axios.get(API_CONFIG.endpoints.areas.getById + areaId);
    return response.data;
  } catch (error) {
    console.error('Get area by id error:', error);
    throw error;
  }
}

export const updateArea = async (areaId: string, area: Partial<Area>): Promise<Area> => {
  if (USE_MOCK_DATA) {
    const index = mockData.findIndex(a => String(a.id) === areaId);
    if (index !== -1) {
      mockData[index] = { ...mockData[index], ...area };
      return Promise.resolve(mockData[index]);
    }
    throw new Error('Area not found');
  }

  try {
    const response = await axios.put(API_CONFIG.endpoints.areas.update + areaId, area);
    return response.data;
  } catch (error) {
    console.error('Update area error:', error);
    throw error;
  }
}

export const deleteAreabyId = async (areaId: string): Promise<void> => {
  if (USE_MOCK_DATA) {
    const index = mockData.findIndex(a => String(a.id) === areaId);
    if (index !== -1) {
      mockData.splice(index, 1);
      return Promise.resolve();
    }
    throw new Error('Area not found');
  }

  try {
    await axios.delete(API_CONFIG.endpoints.areas.delete + areaId);
  } catch (error) {
    console.error('Delete area error:', error);
    throw error;
  }
}

export const runAreaById = async (areaId: string): Promise<void> => {
  if (USE_MOCK_DATA) {
    console.log(`Running area with id ${areaId}`);
    return Promise.resolve();
  }

  try {
    await axios.post(API_CONFIG.endpoints.areas.run + `${areaId}/trigger`);
  } catch (error) {
    console.error('Run area error:', error);
    throw error;
  }
}

export const getAreasBackend = async (): Promise<BackendArea[]> => {
  try {
    const response = await axios.get<PageableResponse<BackendArea> | BackendArea[]>(API_CONFIG.endpoints.areas.list);
    if (response.data && typeof response.data === 'object' && 'content' in response.data && Array.isArray(response.data.content)) {
      return response.data.content;
    }
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: unknown) {
    console.error('Get backend areas error:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 403) {
        console.warn('Access denied to areas endpoint. User might not have proper permissions.');
      }
    }
    throw error;
  }
};

export interface CreateAreaPayload {
  name: string;
  description?: string;
  actions: Array<{
    actionDefinitionId: string;
    name: string;
    description?: string;
    serviceAccountId?: string;
    parameters?: Record<string, unknown>;
    activationConfig?: Record<string, unknown>;
  }>;
  reactions: Array<{
    actionDefinitionId: string;
    name: string;
    description?: string;
    serviceAccountId?: string;
    parameters?: Record<string, unknown>;
    mapping?: Record<string, unknown>;
    condition?: Record<string, unknown>;
    order?: number;
    activationConfig?: Record<string, unknown>;
  }>;
  links?: Array<{
    sourceActionId?: string;
    targetReactionId?: string;
    sourceActionDefinitionId?: string;
    targetActionDefinitionId?: string;
    mapping?: Record<string, string>;
    condition?: Record<string, unknown>;
    order?: number;
  }>;
  connections?: Array<{
    sourceServiceId?: string;
    targetServiceId?: string;
    linkType?: string;
    mapping?: Record<string, unknown>;
    condition?: Record<string, unknown>;
    order?: number;
  }>;
  layoutMode?: string;
}

export const createAreaWithActions = async (payload: CreateAreaPayload): Promise<BackendArea> => {
  try {
    const response = await axios.post(API_CONFIG.endpoints.areas.createWithActions, payload, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Create area with actions error:', error);
    throw error;
  }
};

export const updateAreaComplete = async (areaId: string, payload: CreateAreaPayload): Promise<BackendArea> => {
  try {
    const response = await axios.put(
      `${API_CONFIG.endpoints.areas.updateComplete}${areaId}/complete`, 
      payload,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error('Update area complete error:', error);
    throw error;
  }
};

export const updateAreaBackend = async (areaId: string, payload: Partial<CreateAreaPayload>): Promise<BackendArea> => {
  try {
    const response = await axios.put(
      `${API_CONFIG.endpoints.areas.updateComplete}${areaId}/complete`, 
      payload,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error('Update backend area error:', error);
    throw error;
  }
};

export const deleteAreaBackend = async (areaId: string): Promise<void> => {
  try {
    await axios.delete(API_CONFIG.endpoints.areas.delete + areaId);
  } catch (error) {
    console.error('Delete backend area error:', error);
    throw error;
  }
};

export const triggerAreaManually = async (areaId: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await axios.post(`${API_CONFIG.endpoints.areas.run}${areaId}/trigger`);
    return response.data;
  } catch (error) {
    console.error('Trigger area manually error:', error);
    throw error;
  }
};

export const getAreaExecutions = async (areaId: string): Promise<unknown[]> => {
  try {
    const response = await axios.get(`${API_CONFIG.endpoints.areas.getById}${areaId}/executions`);
    return response.data;
  } catch (error) {
    console.error('Get area executions error:', error);
    throw error;
  }
};

export const toggleAreaActivation = async (areaId: string, enabled: boolean): Promise<BackendArea> => {
  try {
    const response = await axios.patch(`${API_CONFIG.endpoints.areas.update}${areaId}/toggle`, { enabled });
    return response.data;
  } catch (error) {
    console.error('Toggle area activation error:', error);
    throw error;
  }
};
