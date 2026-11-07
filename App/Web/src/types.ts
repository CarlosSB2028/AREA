export interface Service {
  id: string;
  name: string;
  logo: string;
}

export interface BackendService {
  id: string;
  key: string;
  name: string;
  auth: 'OAUTH2' | 'APIKEY' | 'NONE';
  isActive: boolean;
  docsUrl?: string;
  iconLightUrl?: string;
  iconDarkUrl?: string;
}

export interface BackendArea {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  userId: string;
  userEmail: string;
  actions: BackendAction[];
  reactions: BackendReaction[];
  links?: ActionLinkResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface ActionLinkResponse {
  sourceActionInstanceId: string;
  targetActionInstanceId: string;
  sourceActionName: string;
  targetActionName: string;
  areaId: string;
  linkType: string;
  mapping?: Record<string, unknown>;
  condition?: Record<string, unknown>;
  order?: number;
  createdAt: string;
}

export interface BackendAction {
  id: string;
  actionDefinitionId: string;
  name: string;
  actionKey: string;
  description: string;
  parameters: Record<string, unknown>;
  activationConfig: ActivationConfig;
  serviceKey: string;
  serviceId: string;
  serviceName: string;
}

export interface BackendReaction {
  id: string;
  actionDefinitionId: string;
  name: string;
  actionKey: string;
  description: string;
  parameters: Record<string, unknown>;
  mapping?: Record<string, string>;
  condition?: ConditionGroup;
  order: number;
  continue_on_error: boolean;
  activationConfig?: ActivationConfig;
  serviceKey: string;
  serviceId: string;
  serviceName: string;
}

export interface ActionDefinitionResponse {
  id: string;
  serviceId: string;
  serviceKey: string;
  serviceName: string;
  key: string;
  name: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
  docsUrl?: string;
  isEventCapable: boolean;
  isExecutable: boolean;
  version: number;
  defaultPollIntervalSeconds?: number;
  throttlePolicy?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ActivationConfig {
  type: 'webhook' | 'cron' | 'manual' | 'poll' | 'chain';
  webhook_url?: string;
  events?: string[];
  cron_expression?: string;
  poll_interval?: number;
  secret_token?: string;
}

export interface ConditionGroup {
  operator: 'and' | 'or';
  conditions: (Condition | ConditionGroup)[];
}

export interface Condition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'contains_any' | 'not_empty' | 'greater_than' | 'less_than';
  value: unknown;
}

export interface ActionDefinition {
  id: string;
  serviceId: string;
  key: string;
  name: string;
  description: string;
  isEventCapable: boolean;
  isExecutable: boolean;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  version: number;
  defaultPollIntervalSeconds?: number;
}

export enum ServiceState {
  Configuration = 'configuration',
  InProgress = 'in_progress',
  Failed = 'failed',
  Success = 'success'
}

export interface Action {
  id: string;
  serviceId: string;
  serviceKey: string;
  serviceName: string;
  key: string;
  name: string;
  description: string;
  inputSchema?: {
    type: string;
    required?: string[];
    properties?: Record<string, {
      type: string;
      description?: string;
      format?: string;
      pattern?: string;
      minLength?: number;
      maxLength?: number;
      minimum?: number;
      maximum?: number;
      default?: string | number;
      items?: { type: string; format?: string };
      minItems?: number;
    }>;
  };
  outputSchema?: Record<string, unknown>;
  isEventCapable: boolean;
  isExecutable: boolean;
  version: number;
  fields?: Record<string, unknown>;
}

export interface Area {
  id: string;
  name: string;
  description: string;
  lastRun: string;
  services: string[];
  status: 'success' | 'failed' | 'in progress' | 'not started';
}

// Discriminated union to ensure at least one identifier is provided
export type LoginData = 
  | { email: string; username?: never; password: string }
  | { username: string; email?: never; password: string }
  | { email: string; username: string; password: string };

export interface LoginResponse {
  message: string;
  user: {
    id: string | number;
    email: string;
    username?: string;
    isActive: boolean;
    isAdmin: boolean;
    createdAt: string;
    confirmedAt?: string;
    lastLoginAt?: string;
    avatarUrl?: string;
  };
  token: string;
  refreshToken: string;
}

export interface RegisterData {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  isAdmin?: boolean;
}

export interface OAuthProvider {
  providerKey: string;
  providerLabel: string;
  providerLogoUrl: string;
  userAuthUrl: string;
  clientId: string;
}

export interface UserContent {
  id: string;
  name: string;
  email: string;
  username?: string;
  password: string;
  avatarSrc: string;
  profileData: ProfileData;
  isAdmin: boolean;
  isVerified: boolean;
}

export interface ProfileData {
  email: string;
  username?: string;
  firstName: string;
  lastName: string;
  language?: string;
  password?: string;
  isAdmin?: boolean;
}

export interface NavbarLinkProps {
  icon: typeof import('@tabler/icons-react').IconHome2;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export interface ServiceFilterProps {
  services: Service[];
  value: string[];
  onChange: (value: string[]) => void;
}

export interface CardProps {
  image: string;
}

export interface FormValues {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
}

export interface AreaListCardProps {
  areas: (Area | BackendArea)[];
  services: Service[];
  onDelete?: (id: string | number) => void;
  onRun?: (id: string | number) => void;
  onEnableDisable?: (id: string | number, enable: boolean) => void;
}

export interface ServiceCardProps {
  logo: string;
  serviceName: string;
  cardName: string;
  event: string;
  state: ServiceState;
  onRemove?: () => void;
  onEdit?: () => void;
  onUp?: () => void;
  onDown?: () => void;
  onDuplicate?: () => void;
  linkInfo?: {
    type?: LinkData['type'];
    sourceService?: string;
    hasChainTarget?: boolean;
    isParallel?: boolean;
    isConditional?: boolean;
  };
}

export interface AccountCardProps {
  logo: string;
  accountName: string;
  email?: string;
  isLoggedIn: boolean;
  onView?: () => void;
  onChange?: () => void;
  onDelete?: () => void;
  onConnect?: () => void;
}

export interface ServiceData {
  id: string;
  logo: string;
  serviceName: string;
  serviceKey?: string;
  event: string;
  cardName: string;
  state: ServiceState;
  actionId: number;
  actionDefinitionId?: string;
  serviceId: string;
  fields?: Record<string, unknown>;
  serviceToken?: string;
  activationConfig?: ActivationConfig;
  selectedAction?: ActionDefinitionResponse;
  linkedTo?: string[];
  linkData?: { [targetId: string]: LinkData };
  position?: { x: number; y: number };
}

export interface LinkData {
  type: 'chain' | 'conditional' | 'parallel' | 'sequential';
  mapping?: Record<string, string>;
  condition?: Record<string, unknown>;
  order?: number;
  metadata?: Record<string, unknown>;
}

export interface LinkEffect {
  sourceService: ServiceData;
  targetService: ServiceData;
  linkType: LinkData['type'];
  metadata?: Record<string, unknown>;
}

export interface ConnectionData {
  id: string;
  sourceId: string;
  targetId: string;
  sourceOutput?: string;
  targetInput?: string;
  linkData: LinkData;
}

export interface ConnectedService {
  serviceKey: string;
  serviceName: string;
  iconUrl: string;
  connectionType: string;
  userEmail: string;
  userName: string;
  avatarUrl: string;
  providerUserId: string;
  isConnected: boolean;
  canDisconnect?: boolean;
  isPrimaryAuth?: boolean;
}

export interface SetupStepProps {
  service: ServiceData;
  onRemove: () => void;
  onServiceChange?: (newService: ServiceData) => void;
}

export interface ConfigureStepProps {
  service: ServiceData;
  onFieldsChange?: (fields: Record<string, unknown>) => void;
}

export interface FinishStepProps {
  service: ServiceData;
}

export interface InfoServiceCardProps {
  service: ServiceData;
  onServiceChange?: (newService: ServiceData) => void;
}

export interface ModalServicesSelectionProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (service: BackendService) => void;
}

export interface FieldData {
  name: string;
  mandatory: boolean;
  type: 'text' | 'number' | 'dropdown' | 'date' | 'datetime' | 'time' | 'email' | 'array' | 'token';
  description?: string;
  placeholder?: string;
  pattern?: string;
  format?: string;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  default?: string | number;
  options?: string[];
  items?: { type: string; format?: string };
  minItems?: number;
  serviceKey?: string;
}

export interface PageableResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      unsorted: boolean;
      sorted: boolean;
      empty: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  sort: {
    unsorted: boolean;
    sorted: boolean;
    empty: boolean;
  };
  first: boolean;
  empty: boolean;
}
