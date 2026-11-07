# Technical Documentation - AREA Web

## Architecture Overview

AREA Web is a modern frontend application developed with Next.js and React, providing an intuitive

## Technical Architecture

### Technology Stack

| Component | Technology | Version | Role |
|-----------|-------------|---------|------|
| **Framework** | Next.js | 15.5.3 | Full-stack React framework with App Router |
| **React** | React | 19.1.0 | UI library with hooks and Server Components |
| **Language** | TypeScript | 5.x | Static typing and security |
| **UI Framework** | Mantine | 8.x | Accessible and modern UI components |
| **Styling** | Tailwind CSS | 4.x | Utility-first CSS framework |
| **HTTP Client** | Axios | 1.12.2 | HTTP client with interceptors |
| **State Management** | React Hooks | Native | Local state management |
| **Drag & Drop** | @dnd-kit | 6.3.1 | Drag & drop interface |
| **Forms** | Mantine Forms | 8.x | Form management |
| **Validation** | Zod | 4.1.11 | Schema validation |
| **Unit Tests** | Jest + Testing Library | 29.x + 15.x | Component and logic tests |
| **E2E Tests** | Cypress | 13.x | End-to-end tests |
| **Linting** | ESLint | 9.x | Code quality |
| **Build** | Turbopack | Next.js integrated | Fast compilation |

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # Next.js API Routes
│   │   ├── auth/                 # Authentication routes
│   │   ├── areas/                # AREA routes
│   │   ├── client.apk/           # APK download
│   │   └── health/               # Health check
│   ├── areas/                    # AREA pages
│   │   ├── [id]/                 # Dynamic route
│   │   └── new/                  # AREA creation
│   ├── login/                    # Login page
│   ├── logout/                   # Logout page
│   ├── oauth-callback/           # OAuth callback
│   └── profil/                   # User profile
├── components/                   # React components
│   └── ui/                       # UI components
│       ├── areaCreation/         # AREA editor
│       ├── areaList/             # AREA list
│       ├── auth/                 # Authentication components
│       ├── infoDisplay/          # Info components
│       ├── layout/               # Layout/Navbar
│       └── user/                 # User components
├── config/                       # Configuration
│   ├── api.ts                    # API endpoints configuration
│   └── axios.ts                  # HTTP client configuration
├── hooks/                        # Custom React hooks
│   └── useAuth.ts                # Authentication hook
├── services/                     # Business services
│   ├── areasService.ts           # AREAs service
│   ├── authService.ts            # Authentication service
│   ├── oauthService.ts           # OAuth service
│   └── userService.ts            # User service
├── types.ts                      # TypeScript types
├── utils/                        # Utilities
│   ├── constant.ts               # Constants
│   ├── secureStorage.ts          # Secure storage
│   └── tokenManager.ts           # JWT token management
└── mocks/                        # Mock data
```

## TypeScript Type System

### Main Entities

#### Backend Service

```typescript
interface BackendService {
  id: string;
  key: string;
  name: string;
  auth: 'OAUTH2' | 'APIKEY' | 'NONE';
  isActive: boolean;
  docsUrl?: string;
  iconLightUrl?: string;
  iconDarkUrl?: string;
}
```

#### AREA (Automation)

```typescript
interface BackendArea {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  userId: string;
  userEmail: string;
  actions: BackendAction[];
  reactions: BackendReaction[];
  createdAt: string;
  updatedAt: string;
}
```

#### Action in AREA

```typescript
interface BackendAction {
  id: string;
  actionDefinitionId: string;
  name: string;
  parameters: Record<string, unknown>;
  activationConfig: ActivationConfig;
}
```

#### Reaction in AREA

```typescript
interface BackendReaction {
  id: string;
  actionDefinitionId: string;
  name: string;
  parameters: Record<string, unknown>;
  mapping?: Record<string, string>;
  condition?: ConditionGroup;
  order: number;
  continue_on_error: boolean;
  activationConfig?: ActivationConfig;
}
```

#### Activation Configuration

```typescript
interface ActivationConfig {
  type: 'webhook' | 'cron' | 'manual' | 'poll' | 'chain';
  webhook_url?: string;
  events?: string[];
  cron_expression?: string;
  poll_interval?: number;
  secret_token?: string;
}
```

#### Condition System

```typescript
interface ConditionGroup {
  operator: 'and' | 'or';
  conditions: (Condition | ConditionGroup)[];
}

interface Condition {
```

### Build Scripts

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack",
    "start": "next start",
    "lint": "eslint",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "cypress:open": "cypress open",
    "cypress:run": "cypress run",
    "test:e2e": "cypress run",
    "test:e2e:ci": "NEXT_PUBLIC_USE_MOCK_DATA=true start-server-and-test dev http://localhost:3000 cypress:run"
  }
}
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build
EXPOSE 3000
CMD ["yarn", "start"]
```

## Performance and Optimization

### Next.js Optimizations

- **App Router**: Modern routing with shared layouts
- **Server Components**: Server rendering for static content
- **Turbopack**: Fast compilation in development
- **Image optimization**: Automatic image optimization

### UI Optimizations

- **Lazy loading**: Deferred component loading
- **Virtual scrolling**: For long lists
- **Memoization**: `React.memo`, `useMemo`, `useCallback`
- **Bundle splitting**: Automatic chunk separation

### Cache and Persistence

- **SWR**: For API data caching (if implemented)
- **Local Storage**: User preferences cache
- **Service Worker**: Offline cache (potentially)

## Monitoring and Logging

### Logging

```typescript
// Axios interceptor with logging
if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'development') {
  console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
  console.log(`✅ ${response.status} ${response.config.url}`);
}
```

### Error Handling

- **Error boundaries**: React error capture
- **Try/catch**: Asynchronous error handling
- **Toast notifications**: User feedback
- **Sentry**: Error monitoring (recommended)

## Scalability and Maintenance

### Used Patterns

- **Custom hooks**: Reusable logic
- **Composition**: Modular components
- **TypeScript strict**: Type safety
- **Separation of concerns**: Separated responsibilities

### Code Quality

- **ESLint**: Quality rules
- **Prettier**: Automatic formatting
- **Husky**: Pre-commit hooks
- **Conventional commits**: Commit format

This documentation covers the complete architecture of the AREA Web application, allowing developers to quickly understand the internal functioning and contribute effectively to the project.

## Vue d'ensemble de l'architecture

AREA Web est une application frontend moderne développée avec Next.js 15 et React 19, offrant une interface utilisateur intuitive pour créer et gérer des automatisations complexes (AREA - Actions, Reactions, Events, Actions). L'application utilise une architecture modulaire avec séparation claire des responsabilités.

## Architecture technique

### Stack technologique

| Composant | Technologie | Version | Rôle |
|-----------|-------------|---------|------|
| **Framework** | Next.js | 15.5.3 | Framework React full-stack avec App Router |
| **React** | React | 19.1.0 | Bibliothèque UI avec hooks et Server Components |
| **Langage** | TypeScript | 5.x | Typage statique et sécurité |
| **UI Framework** | Mantine | 8.x | Composants UI accessibles et modernes |
| **Styling** | Tailwind CSS | 4.x | Framework CSS utilitaire |
| **HTTP Client** | Axios | 1.12.2 | Client HTTP avec intercepteurs |
| **State Management** | React Hooks | Native | Gestion d'état locale |
| **Drag & Drop** | @dnd-kit | 6.3.1 | Interface drag & drop |
| **Formulaires** | Mantine Forms | 8.x | Gestion des formulaires |
| **Validation** | Zod | 4.1.11 | Schéma de validation |
| **Tests Unitaires** | Jest + Testing Library | 29.x + 15.x | Tests composants et logique |
| **Tests E2E** | Cypress | 13.x | Tests end-to-end |
| **Linting** | ESLint | 9.x | Qualité du code |
| **Build** | Turbopack | Next.js intégré | Compilation rapide |

## Structure du projet

```
src/
├── app/                          # Pages Next.js (App Router)
│   ├── api/                      # Routes API Next.js
│   │   ├── auth/                 # Routes authentification
│   │   ├── areas/                # Routes AREA
│   │   ├── client.apk/           # Téléchargement APK
│   │   └── health/               # Health check
│   ├── areas/                    # Pages AREA
│   │   ├── [id]/                 # Détail AREA
│   │   └── new/                  # Création AREA
│   ├── login/                    # Page connexion
│   ├── logout/                   # Page déconnexion
│   ├── oauth-callback/           # Callback OAuth
│   └── profil/                   # Profil utilisateur
├── components/                   # Composants React
│   └── ui/                       # Composants UI organisés
│       ├── areaCreation/         # Éditeur d'AREA
│       ├── areaList/             # Liste des AREAs
│       ├── auth/                 # Composants authentification
│       ├── infoDisplay/          # Composants informatifs
│       ├── layout/               # Layout (Navbar, Footer)
│       └── user/                 # Composants utilisateur
├── config/                       # Configuration centralisée
│   ├── api.ts                    # Configuration endpoints API
│   └── axios.ts                  # Configuration HTTP client
├── hooks/                        # Hooks React personnalisés
│   └── useAuth.ts                # Hook authentification
├── services/                     # Services métier
│   ├── areasService.ts           # Service AREAs
│   ├── authService.ts            # Service authentification
│   ├── oauthService.ts           # Service OAuth
│   └── userService.ts            # Service utilisateur
├── types.ts                      # Types TypeScript
├── utils/                        # Utilitaires
│   ├── constant.ts               # Constantes
│   ├── secureStorage.ts          # Stockage sécurisé
│   └── tokenManager.ts           # Gestion tokens JWT
└── mocks/                        # Données mockées
```

## Système de types TypeScript

### Types principaux

#### Entités métier

```typescript
// Service backend
interface BackendService {
  id: string;
  key: string;
  name: string;
  auth: 'OAUTH2' | 'APIKEY' | 'NONE';
  isActive: boolean;
  docsUrl?: string;
  iconLightUrl?: string;
  iconDarkUrl?: string;
}

// AREA (automatisation)
interface BackendArea {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  userId: string;
  userEmail: string;
  actions: BackendAction[];
  reactions: BackendReaction[];
  createdAt: string;
  updatedAt: string;
}

// Action dans une AREA
interface BackendAction {
  id: string;
  actionDefinitionId: string;
  name: string;
  parameters: Record<string, unknown>;
  activationConfig: ActivationConfig;
}

// Réaction dans une AREA
interface BackendReaction {
  id: string;
  actionDefinitionId: string;
  name: string;
  parameters: Record<string, unknown>;
  mapping?: Record<string, string>;
  condition?: ConditionGroup;
  order: number;
  continue_on_error: boolean;
  activationConfig?: ActivationConfig;
}
```

#### Configuration d'activation

```typescript
interface ActivationConfig {
  type: 'webhook' | 'cron' | 'manual' | 'poll' | 'chain';
  webhook_url?: string;
  events?: string[];
  cron_expression?: string;
  poll_interval?: number;
  secret_token?: string;
}
```

#### Système de conditions

```typescript
interface ConditionGroup {
  operator: 'and' | 'or';
  conditions: (Condition | ConditionGroup)[];
}

interface Condition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'contains_any' | 'not_empty' | 'greater_than' | 'less_than';
  value: unknown;
}
```

#### Types UI

```typescript
// État des services dans l'éditeur
enum ServiceState {
  Configuration = 'configuration',
  InProgress = 'in_progress',
  Failed = 'failed',
  Success = 'success'
}

// Données d'un service dans l'éditeur
interface ServiceData {
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

// Types de liens entre services
interface LinkData {
  type: 'chain' | 'conditional' | 'parallel' | 'sequential';
  mapping?: Record<string, string>;
  condition?: Record<string, unknown>;
  order?: number;
  metadata?: Record<string, unknown>;
}
```

## Configuration API

### Structure de configuration

```typescript
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  endpoints: {
    auth: {
      login: '/api/auth/login',
      register: '/api/auth/register',
      logout: '/api/auth/logout',
      refresh: '/api/auth/refresh',
      me: '/api/auth/me',
      status: '/api/auth/status',
      forgotPassword: '/api/auth/forgot-password',
      resetPassword: '/api/auth/reset-password',
      verifyEmail: '/api/auth/verify-email',
      providers: '/api/oauth/providers',
      oauth: '/api/auth/oauth/',
      link: '/api/oauth-link/'
    },
    user: {
      profile: '/api/auth/profile',
      avatar: '/api/user/avatar',
      getUser: '/api/auth/me',
      serviceConnection: '/api/user/service-connection',
      connectedServices: '/api/user/connected-services'
    },
    areas: {
      list: '/api/areas',
      create: '/api/areas',
      createWithActions: '/api/areas/with-links',
      update: '/api/areas/',
      delete: '/api/areas/',
      getById: '/api/areas/',
      cards: '/api/areas/',
      run: '/api/areas/',
    },
    services: {
      list: '/api/services',
      catalog: '/api/services/catalog',
      search: '/api/services/search',
      getById: '/api/services/',
      actions: '/api/action-definitions/service/',
      actionFields: '/api/services/',
    },
    actions: {
      create: '/api/actions',
      labels: '/api/services/labels',
      reactions: '/api/services/reactions',
      test: '/api/test/'
    }
  }
};
```

### Configuration Axios

L'application utilise des intercepteurs Axios pour :
- **Authentification automatique** : Ajout des tokens JWT
- **Refresh token** : Renouvellement automatique des tokens expirés
- **Logging** : Logs des requêtes en développement
- **Gestion d'erreurs** : Gestion centralisée des erreurs HTTP

```typescript
// Intercepteur de requête
axios.interceptors.request.use(
  (config) => {
    config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';
    if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'development') {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur de réponse
axios.interceptors.response.use(
  (response) => {
    if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'development') {
      console.log(`✅ ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error) => {
    // Gestion du refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Logique de refresh token
    }
    return Promise.reject(error);
  }
);
```

## Services métier

### Service d'authentification (`authService.ts`)

Responsabilités :
- Connexion/déconnexion utilisateurs
- Inscription
- Gestion des tokens JWT
- Vérification du statut d'authentification
- Support des données mockées

```typescript
export const login = async (data: LoginData): Promise<LoginResponse> => {
  if (USE_MOCK_DATA) {
    // Logique mockée
    return Promise.resolve(mockResponse);
  }

  try {
    const response = await axios.post(API_CONFIG.endpoints.auth.login, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
```

### Service AREAs (`areasService.ts`)

Responsabilités :
- CRUD des automatisations
- Gestion des services disponibles
- Récupération des définitions d'actions
- Pagination des résultats
- Support des données mockées

```typescript
export const getAreas = async (): Promise<Area[]> => {
  if (USE_MOCK_DATA) return Promise.resolve(mockData);

  try {
    const response = await axios.get<PageableResponse<Area> | Area[]>(API_CONFIG.endpoints.areas.list);
    // Gestion de la pagination
    if ('content' in response.data) {
      return response.data.content;
    }
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Get areas error:', error);
    throw error;
  }
};
```

## Gestion d'état et hooks

### Hook d'authentification (`useAuth.ts`)

```typescript
export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null
  });

  const checkAuth = useCallback(async () => {
    try {
      const isAuthenticated = await hasSecureToken();

      if (isAuthenticated) {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });

        if (response.ok) {
          const userData = await response.json();
          setAuthState({
            isAuthenticated: true,
            user: userData,
            loading: false,
            error: null
          });
        }
      }
    } catch (error) {
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: 'Erreur de vérification d\'authentification'
      });
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    ...authState,
    checkAuth,
    logout: async () => {
      await clearSecureToken();
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null
      });
    }
  };
};
```

## Architecture des composants UI

### Éditeur d'AREA (`AreaEditor`)

L'éditeur d'AREA est le composant principal pour créer des automatisations. Il utilise :

- **Mode layout libre** : Positionnement visuel des services
- **Mode liste** : Vue séquentielle
- **Drag & Drop** : @dnd-kit pour l'interface
- **Connexions** : Liens entre services avec différents types

```typescript
export default function AreaEditor({ areaId }: AreaEditorProps) {
  const {
    servicesState,
    selectedService,
    modalOpened,
    connections,
    layoutMode,
    // ... autres états
  } = useAreaEditor(areaId);

  return (
    <div className={styles.container}>
      <AreaEditorToolbar
        areaName={areaName}
        areaDescription={areaDescription}
        onNameChange={setAreaName}
        onDescriptionChange={setAreaDescription}
        onSave={handleSave}
        onRun={handleRun}
        layoutMode={layoutMode}
        onToggleLayout={toggleLayoutMode}
      />

      {layoutMode === 'free' ? (
        <FreeLayoutBoard
          services={servicesState}
          connections={connections}
          onDragEnd={handleDragEnd}
          onServiceSelect={setSelectedService}
          onConnectionCreate={createConnection}
          onConnectionRemove={removeConnection}
        />
      ) : (
        <AreaEditorBoard
          services={servicesState}
          onServiceAdd={addNewServiceBelow}
          onServiceRemove={removeService}
          onServiceEdit={editService}
          onServiceMoveUp={moveServiceUp}
          onServiceMoveDown={moveServiceDown}
          onServiceDuplicate={duplicateService}
        />
      )}

      {/* Panneau d'information du service sélectionné */}
      <Drawer opened={!!selectedService} onClose={() => setSelectedService(null)}>
        {selectedService && (
          <InfoServiceCard
            service={selectedService}
            onServiceChange={updateService}
          />
        )}
      </Drawer>
    </div>
  );
}
```

### Hook personnalisé `useAreaEditor`

Gère toute la logique complexe de l'éditeur :

```typescript
export const useAreaEditor = (areaId?: string) => {
  const [servicesState, setServicesState] = useState<ServiceData[]>([]);
  const [connections, setConnections] = useState<ConnectionData[]>([]);
  const [layoutMode, setLayoutMode] = useState<'list' | 'free'>('list');

  // Logique de gestion des services
  const addNewServiceBelow = useCallback((index: number) => {
    // Ajout d'un nouveau service
  }, []);

  // Logique de connexions
  const createConnection = useCallback((sourceId: string, targetId: string, linkData: LinkData) => {
    // Création de connexion
  }, []);

  // Sauvegarde
  const handleSave = useCallback(async () => {
    // Logique de sauvegarde complexe
  }, [servicesState, connections, areaName, areaDescription]);

  return {
    // États et fonctions exposées
  };
};
```

## Sécurité et stockage

### Stockage sécurisé (`secureStorage.ts`)

```typescript
export const hasSecureToken = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/auth/status', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok && (await response.json()).authenticated === true;
  } catch (error) {
    console.error('Error checking auth status:', error);
    return false;
  }
};

export const clearSecureToken = async (): Promise<void> => {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Error during logout:', error);
  }

  // Nettoyage localStorage/sessionStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('_at');
    localStorage.removeItem('_ate');
    sessionStorage.removeItem('_sk');
    localStorage.removeItem('authToken');
  }
};
```

### Gestionnaire de tokens (`tokenManager.ts`)

Gère le refresh automatique des tokens JWT avec file d'attente pour éviter les appels concurrents.

## Tests

### Tests unitaires (Jest + Testing Library)

```typescript
// Exemple de test de composant
describe('AreaListCard', () => {
  it('renders areas correctly', () => {
    const mockAreas = [/* mock data */];
    const mockServices = [/* mock services */];

    render(
      <AreaListCard
        areas={mockAreas}
        services={mockServices}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Test Area')).toBeInTheDocument();
  });
});

// Test de service
describe('areasService', () => {
  it('fetches areas successfully', async () => {
    // Mock axios
    (axios.get as jest.Mock).mockResolvedValue({ data: mockAreas });

    const result = await getAreas();
    expect(result).toEqual(mockAreas);
  });
});
```

### Tests E2E (Cypress)

```typescript
describe('AREA Creation Flow', () => {
  it('should create a new AREA successfully', () => {
    cy.visit('/areas/new');

    // Simulation du flux de création
    cy.get('[data-cy="area-name"]').type('Test AREA');
    cy.get('[data-cy="add-service"]').click();
    cy.get('[data-cy="service-github"]').click();

    // Configuration du service
    cy.get('[data-cy="configure-service"]').click();

    // Sauvegarde
    cy.get('[data-cy="save-area"]').click();

    // Vérification
    cy.url().should('include', '/areas/');
    cy.contains('AREA créée avec succès');
  });
});
```

## Déploiement et CI/CD

### Variables d'environnement

```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:8080

# Mode mock (développement)
NEXT_PUBLIC_USE_MOCK_DATA=true

# Environnement
NEXT_PUBLIC_ENVIRONMENT=development
```

### Scripts de build

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack",
    "start": "next start",
    "lint": "eslint",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "cypress:open": "cypress open",
    "cypress:run": "cypress run",
    "test:e2e": "cypress run",
    "test:e2e:ci": "NEXT_PUBLIC_USE_MOCK_DATA=true start-server-and-test dev http://localhost:3000 cypress:run"
  }
}
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build
EXPOSE 3000
CMD ["yarn", "start"]
```

## Performance et optimisation

### Optimisations Next.js

- **App Router** : Routage moderne avec layouts partagés
- **Server Components** : Rendu serveur pour le contenu statique
- **Turbopack** : Compilation rapide en développement
- **Image optimization** : Optimisation automatique des images

### Optimisations UI

- **Lazy loading** : Chargement différé des composants
- **Virtual scrolling** : Pour les listes longues
- **Memoization** : `React.memo`, `useMemo`, `useCallback`
- **Bundle splitting** : Séparation automatique des chunks

### Cache et persistance

- **SWR** : Pour le cache des données API (si implémenté)
- **Local Storage** : Cache des préférences utilisateur
- **Service Worker** : Cache offline (potentiellement)

## Monitoring et logging

### Logging

```typescript
// Intercepteur Axios avec logging
if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'development') {
  console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
  console.log(`✅ ${response.status} ${response.config.url}`);
}
```

### Gestion d'erreurs

- **Error boundaries** : Capture des erreurs React
- **Try/catch** : Gestion des erreurs asynchrones
- **Toast notifications** : Feedback utilisateur
- **Sentry** : Monitoring d'erreurs (recommandé)

## Évolutivité et maintenance

### Patterns utilisés

- **Custom hooks** : Logique réutilisable
- **Composition** : Composants modulaires
- **TypeScript strict** : Sécurité des types
- **Separation of concerns** : Responsabilités séparées

### Code quality

- **ESLint** : Règles de qualité
- **Prettier** : Formatage automatique
- **Husky** : Pre-commit hooks
- **Conventional commits** : Format des commits

Cette documentation couvre l'architecture complète de l'application AREA Web, permettant aux développeurs de comprendre rapidement le fonctionnement interne et de contribuer efficacement au projet.</content>
<parameter name="filePath">/home/marin/projet/3teck/AREA/AREA_Web/docs/documentation-technique.md