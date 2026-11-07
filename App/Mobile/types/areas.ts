
export interface Area {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  lastRun: string;
  services: string[];
  status: 'success' | 'failed' | 'in progress' | 'not started';
}


export interface AreaDto {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  userId: string;
  userEmail: string;
  actions: ActionDto[];
  reactions: ReactionDto[];
  links?: LinkDto[];
  createdAt: string;
  updatedAt: string;
}


export interface AreaList {
  areas: (Area | AreaDto)[];
  services: Service[];
  onDelete?: (id: string | number) => void;
  onRun?: (id: string | number) => void;
  onToggleActivation?: (id: number, enabled: boolean) => void;
}


export interface Service {
  id: string;
  name: string;
  logo: string;
  key?: string;
}


export interface BackendService {
  id: string;
  key: string;
  name: string;
  auth: 'NONE' | 'OAUTH2' | 'API_KEY' | 'BASIC';
  isActive: boolean;
  iconLightUrl?: string;
  iconDarkUrl?: string;
}


export interface Condition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'contains_any' | 'not_empty' | 'greater_than' | 'less_than';
  value: unknown;
}


export interface ConditionGroup {
  operator: 'and' | 'or';
  conditions: (Condition | ConditionGroup)[];
}


export interface ActivationConfig {
  type: 'webhook' | 'cron' | 'manual' | 'poll' | 'chain';
  webhook_url?: string;
  events?: string[];
  cron_expression?: string;
  poll_interval?: number;
  interval_seconds?: number;
  secret_token?: string;
}


export interface ActionDto {
  id: string;
  actionDefinitionId: string;
  name: string;
  description?: string;
  parameters: Record<string, unknown>;
  activationConfig: ActivationConfig;
  serviceAccountId?: string;
}


export interface ReactionDto {
  id: string;
  actionDefinitionId: string;
  name: string;
  description?: string;
  parameters: Record<string, unknown>;
  mapping?: Record<string, string>;
  condition?: ConditionGroup;
  order: number;
  continue_on_error?: boolean;
  activationConfig?: ActivationConfig;
  serviceAccountId?: string;
}


export interface LinkDto {
  id?: string;
  sourceActionInstanceId: string;
  targetActionInstanceId: string;
  sourceActionName?: string;
  targetActionName?: string;
  sourceActionDefinitionId?: string;
  targetActionDefinitionId?: string;
  linkType?: 'chain' | 'conditional' | 'parallel' | 'sequential';
  mapping?: Record<string, unknown>;
  condition?: Record<string, unknown>;
  order?: number;
}


export interface ActionDefinition {
  id: string;
  serviceId: string;
  serviceKey: string;
  serviceName: string;
  key: string;
  name: string;
  description: string;
  isEventCapable: boolean;
  isExecutable: boolean;
  version: number;
  inputSchema?: InputSchema;
  outputSchema?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}


export interface InputSchema {
  type: string;
  properties: Record<string, PropertySchema>;
  required?: string[];
}


export interface PropertySchema {
  type: 'string' | 'integer' | 'number' | 'boolean' | 'array' | 'object';
  description?: string;
  format?: string;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  default?: unknown;
  items?: PropertySchema;
  minItems?: number;
  enum?: unknown[];
}


export interface FieldData {
  name: string;
  mandatory: boolean;
  type: 'text' | 'number' | 'email' | 'date' | 'time' | 'datetime' | 'array';
  format?: string;
  description?: string;
  placeholder?: string;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  default?: unknown;
  items?: PropertySchema;
  minItems?: number;
}


export enum ServiceState {
  Configuration = 'configuration',
  Success = 'success',
  Error = 'error',
  Pending = 'pending',
}


export interface ServiceData {
  id: string;
  logo: string;
  serviceName: string;
  serviceKey: string;
  event: string;
  cardName: string;
  state: ServiceState;
  actionId: number;
  serviceId: string;
  actionDefinitionId?: string;
  fields?: Record<string, unknown>;
  activationConfig?: ActivationConfig;
  position?: {
    x: number;
    y: number;
  };
}


export interface ConnectionData {
  id: string;
  sourceId: string;
  targetId: string;
  linkData: {
    type: 'chain' | 'conditional' | 'parallel' | 'sequential';
    mapping?: Record<string, string>;
    condition?: Record<string, unknown>;
    order?: number;
  };
}


export interface CreateAreaPayload {
  name: string;
  description?: string;
  actions: Array<{
    actionDefinitionId: string;
    name: string;
    description?: string;
    serviceAccountId?: string;
    parameters?: Record<string, unknown>;
    activationConfig?: ActivationConfig;
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
    activationConfig?: ActivationConfig;
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
