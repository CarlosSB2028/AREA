# AREA Platform - Global Architecture

Comprehensive software architecture and design reference for the entire AREA platform.

---

## Overview

AREA (Action REAction) is a comprehensive automation platform that enables users to create custom workflows by connecting different services. The platform consists of three main components:

- **AREA Mobile**: React Native mobile application for end-users to create and manage their automation workflows
- **AREA Web**: Next.js web dashboard for administrators to manage users, services, and system monitoring
- **AREA Backend**: Spring Boot microservice providing REST APIs for the entire platform

### Platform Vision

```
Connect • Automate • Scale
```

The platform allows users to:
- Connect multiple services (GitHub, Slack, Discord, etc.)
- Create complex automation workflows (AREAs)
- Monitor and manage their automations
- Access everything from mobile and web interfaces

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    AREA Platform                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │
│  │ AREA Mobile │    │  AREA Web   │    │ AREA Back   │          │
│  │             │    │             │    │             │          │
│  │ • React     │◄──►│ • Next.js   │◄──►│ • Spring    │          │
│  │ • Expo      │    │ • Admin UI  │    │ • REST API  │          │
│  │ • Mobile UI │    │ • Dashboard │    │ • Services  │          │
│  └─────────────┘    └─────────────┘    └─────────────┘          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              External Services                          │    │
│  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐        │    │
│  │  │GitHu│ │Slack│ │ ... │ │ ... │ |OAuth│ │SMTP │        │    │
│  │  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘        │    │
│  └─────────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Infrastructure                             │    │
│  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐        │    │
│  │  │Postgre│Redis│ │Docke│ │Nginx│ │SSL  │ │CDN  │        │    │
│  │  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘        │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Primary Users | Main Responsibilities |
|-----------|---------------|----------------------|
| **Mobile** | End Users | Create/manage personal automations, connect services, monitor workflows |
| **Web** | Administrators | System administration, user management, service monitoring, analytics |
| **Backend** | All Users | API services, business logic, data persistence, external integrations |

### Data Flow Architecture

```
User Actions → Mobile/Web UI → Backend APIs → Database/External Services
      ↑              ↑              ↑              ↓
   Notifications ← Response ← Processing ← Data Storage
```

---

## AREA Mobile - Architecture

### Layer Architecture

```
┌─────────────────────────────┐
│   Presentation Layer        │  Screens, Components
├─────────────────────────────┤
│   Application Logic         │  Contexts, Hooks
├─────────────────────────────┤
│   Business Logic            │  Services, Validators
├─────────────────────────────┤
│   Data Layer                │  API, Storage
└─────────────────────────────┘
```

### Data Flow

```
User Input
    ↓
Component Handler
    ↓
Context Action
    ↓
Service Call
    ↓
API Request
    ↓
State Update
    ↓
Re-render
```

### Key Design Patterns

#### 1. Context Pattern

Global state management for authentication and app-wide data.

```typescript
// contexts/AuthContext.tsx
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    setUser(response.user);
  };

  return (
    <AuthContext.Provider value={{ user, login }}>
      {children}
    </AuthContext.Provider>
  );
}
```

#### 2. Service Layer

Business logic abstraction with API integration.

```typescript
// services/auth.ts
export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', credentials);
    await storage.saveTokens(response.tokens);
    return response;
  }
};
```

#### 3. Repository Pattern

Data source abstraction for secure storage.

```typescript
// services/storage.ts
export const storage = {
  async saveTokens(tokens: Tokens): Promise<void> {
    await SecureStore.setItemAsync('access_token', tokens.access);
  }
};
```

### Technology Stack

- **Framework**: React Native 0.76+ with Expo 54
- **Language**: TypeScript 5.3
- **Navigation**: Expo Router 6.0 (file-based routing)
- **UI**: Gluestack-UI + NativeWind 4.2
- **State**: React Context API
- **Storage**: Expo Secure Store
- **Internationalization**: react-i18next

---

## AREA Web - Architecture

### Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AREA Web Application                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   Next.js App   │  │   Components    │  │  Services   │  │
│  │   Router (15)   │  │   (React 19)    │  │   Layer     │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   Mantine UI    │  │   Tailwind CSS  │  │   Axios     │  │
│  │   Framework     │  │   4.x           │  │   HTTP      │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   TypeScript    │  │   Jest + RTL    │  │   Cypress   │  │
│  │   5.x           │  │   Testing       │  │   E2E       │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Key Components

#### Area Editor

Advanced drag-and-drop interface for creating complex automations.

```typescript
// Core editor component with multiple layout modes
export default function AreaEditor({ areaId }: AreaEditorProps) {
  const [layoutMode, setLayoutMode] = useState<'list' | 'free'>('list');
  const [services, setServices] = useState<ServiceData[]>([]);
  const [connections, setConnections] = useState<ConnectionData[]>([]);

  // Complex state management for service connections
  // Drag & drop with @dnd-kit
  // Real-time validation and error handling
}
```

#### Service Management

Comprehensive service catalog with OAuth integration.

```typescript
interface BackendService {
  id: string;
  key: string;
  name: string;
  auth: 'OAUTH2' | 'APIKEY' | 'NONE';
  isActive: boolean;
  docsUrl?: string;
}
```

### Technology Stack

- **Framework**: Next.js 15 with App Router
- **Frontend**: React 19 + TypeScript 5.x
- **UI**: Mantine 8.x + Tailwind CSS 4.x
- **HTTP**: Axios with interceptors
- **Drag & Drop**: @dnd-kit 6.3.1
- **Forms**: Mantine Forms + Zod validation
- **Testing**: Jest + Testing Library + Cypress
- **Build**: Turbopack for fast development

---

## AREA Backend - Architecture

### Microservice Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   AREA Backend Service                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   Controllers   │  │   Services      │  │  Repositorie│  │
│  │   (REST API)    │  │   (Business)    │  │   (Data)    │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   Security      │  │   OAuth2        │  │   Email     │  │
│  │   (JWT)         │  │   Integration   │  │   Service   │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   PostgreSQL    │  │   Redis         │  │   Docker    │  │
│  │   Database      │  │   Cache         │  │   Compose   │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Core Components

#### REST API Layer

```java
@RestController
@RequestMapping("/api/areas")
public class AreaController {

    @PostMapping
    public ResponseEntity<AreaResponse> createArea(@RequestBody CreateAreaRequest request) {
        Area area = areaService.createArea(request);
        return ResponseEntity.ok(areaMapper.toResponse(area));
    }
}
```

#### Service Layer

Business logic with external service integrations.

```java
@Service
public class AreaService {

    public Area createArea(CreateAreaRequest request) {
        // Validate request
        // Create area entity
        // Process actions and reactions
        // Save to database
        // Return created area
    }
}
```

#### Data Layer

JPA repositories with PostgreSQL.

```java
@Repository
public interface AreaRepository extends JpaRepository<Area, Long> {
    List<Area> findByUserIdAndEnabledTrue(Long userId);
    Optional<Area> findByIdAndUserId(Long id, Long userId);
}
```

### Technology Stack

- **Framework**: Spring Boot 3.5.6
- **Language**: Java 21
- **Database**: PostgreSQL 15 + Flyway migrations
- **Cache**: Redis for session and data caching
- **Security**: Spring Security + JWT
- **Email**: SMTP + Resend API
- **Testing**: JUnit 5 + Testcontainers + JaCoCo
- **Documentation**: OpenAPI/Swagger
- **Build**: Gradle with Checkstyle

---

## Integration Architecture

### API Communication

```
Mobile App ←─────→ Backend API ←─────→ Web Dashboard
     │                     │                     │
     └─ REST/JSON ─────────┼──────── REST/JSON ──┘
                           │
                    ┌──────┴──────┐
                    │  External   │
                    │  Services   │
                    │  (GitHub,   │
                    │   Slack,    │
                    │   etc.)     │
                    └─────────────┘
```

### Authentication Flow

```
1. User Login → Mobile/Web
2. Credentials → Backend /auth/login
3. JWT Token ← Backend
4. Token Stored → Secure Store/Local Storage
5. Subsequent Requests → Include JWT
6. Token Validation → Backend Middleware
```

### Service Integration

```
AREA Workflow Execution:
1. Trigger Event → External Service Webhook
2. Webhook → Backend Action Processor
3. Process Action → Execute Business Logic
4. Generate Reactions → Call External APIs
5. Update Status → Database
6. Notify User → Push Notification/Email
```

---

## Data Architecture

### Database Schema

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Users     │    │   Areas     │    │  Services   │
│─────────────│    │─────────────│    │─────────────│
│ id          │    │ id          │    │ id          │
│ email       │    │ name        │    │ key         │
│ password    │    │ description │    │ name        │
│ verified    │    │ user_id     │    │ auth_type   │
│ created_at  │    │ enabled     │    │ is_active   │
└─────────────┘    └─────────────┘    └─────────────┘
       │                │                │
       │                │                │
┌──────┴──────┐    ┌────┴─────┐    ┌─────┴──────┐
│User Services│    │  Actions │    │Service Conn│
│─────────────│    │──────────│    │────────────│
│ user_id     │    │ area_id  │    │ user_id    │
│ service_id  │    │service_id│    │ service_id │
│ token       │    │ config   │    │ token      │
│ expires_at  │    │ type     │    │ expires_at │
└─────────────┘    └──────────┘    └────────────┘
       │                │
       └────────────────┼─────────────────────────┐
                        │                         │
               ┌────────┴────────┐      ┌─────────┴─────────┐
               │   Reactions     │      │   Executions      │
               │─────────────────│      │───────────────────│
               │ id              │      │ id                │
               │ action_id       │      │ area_id           │
               │ config          │      │ status            │
               │ order           │      │ started_at        │
               │ conditions      │      │ completed_at      │
               └─────────────────┘      └───────────────────┘
```

### Caching Strategy

- **Redis**: Session storage, API response caching, rate limiting
- **Application Cache**: Service definitions, user permissions
- **CDN**: Static assets (images, icons)

---

## Security Architecture

### Authentication & Authorization

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   JWT Tokens    │    │   OAuth2 Flow   │    │   API Keys      │
│─────────────────│    │─────────────────│    │─────────────────│
│ • Access Token  │    │ • GitHub OAuth  │    │ • Service APIs  │
│ • Refresh Token │    │ • Discord OAuth │    │ • Webhook Sec   │
│ • Secure Store  │    │ • Google OAuth  │    │ • Rate Limiting │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Security Measures

- **Password Hashing**: BCrypt with salt
- **Token Encryption**: AES-256 for sensitive data
- **CORS**: Configured for allowed origins
- **Rate Limiting**: Redis-based request throttling
- **Input Validation**: Server and client-side validation
- **SQL Injection Prevention**: Prepared statements
- **XSS Protection**: Content Security Policy

---

## Deployment Architecture

### Environment Strategy

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Development │    │   Staging   │    │ Production  │    │   Testing   │
├─────────────┤    ├─────────────┤    ├─────────────┤    ├─────────────┤
│ • Local Dev │    │ • Pre-prod  │    │ • Live App  │    │ • CI/CD     │
│ • Hot Reload│    │ • Full Test │    │ • Scalable  │    │ • Automated │
│ • Mock Data │    │ • User Test │    │ • Monitoring│    │ • Coverage  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### Infrastructure Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Production Infrastructure                │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   Load      │    │   Backend   │    │   Database  │      │
│  │  Balancer   │    │   Service   │    │   Cluster   │      │
│  │  (Nginx)    │    │  (Docker)   │    │ (PostgreSQL)│      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   Redis     │    │   CDN       │    │   Monitoring│      │
│  │   Cache     │    │   (Assets)  │    │   (Metrics) │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Mobile App Distribution                │    │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │    │
│  │  │App Store    │ │Play Store   │ │Expo Updates │    │    │
│  │  └─────────────┘ └─────────────┘ └─────────────┘    │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### CI/CD Pipeline

```
Code Push → Lint/Test → Build → Deploy Staging → E2E Tests → Deploy Production
```

---

## Development Practices

### Code Quality

- **Linting**: ESLint (Web/Mobile), Checkstyle (Backend)
- **Testing**: Jest + RTL (Web/Mobile), JUnit (Backend), Cypress (E2E)
- **Coverage**: Minimum 75% (Mobile), 80% (Backend), 70% (Web)
- **Documentation**: OpenAPI (Backend), Component docs (Web), Architecture docs

### Version Control

- **Git Flow**: Feature branches, release branches, hotfixes
- **Conventional Commits**: Structured commit messages
- **Code Reviews**: Required for all merges
- **Branch Protection**: Main branch protected

### Monitoring & Observability

- **Application Metrics**: Response times, error rates, throughput
- **Infrastructure Monitoring**: CPU, memory, disk usage
- **Logging**: Structured logs with correlation IDs
- **Alerting**: Automated alerts for critical issues

---

## Technology Decisions

### Why This Architecture?

| Decision | Rationale |
|----------|-----------|
| **Microservices** | Scalability, technology diversity, team autonomy |
| **REST APIs** | Standard, stateless, cacheable, widely supported |
| **JWT Auth** | Stateless, scalable, mobile-friendly |
| **PostgreSQL** | ACID compliance, complex queries, reliability |
| **Redis** | High-performance caching, session storage |
| **React Native** | Cross-platform mobile development |
| **Next.js** | Full-stack React, excellent performance |
| **Spring Boot** | Mature ecosystem, production-ready |

### Design Principles

- **Separation of Concerns**: Clear boundaries between layers
- **Single Responsibility**: Each component has one primary purpose
- **Dependency Injection**: Loose coupling, testability
- **Fail Fast**: Early error detection and handling
- **Security First**: Defense in depth approach
- **Performance**: Optimized for mobile and web experiences

---

## Future Considerations

### Scalability Plans

- **Horizontal Scaling**: Load balancers, database replication
- **Microservices Evolution**: Service mesh (Istio), API gateway
- **Caching Layers**: CDN integration, advanced Redis strategies
- **Global Distribution**: Multi-region deployment

### Technology Evolution

- **GraphQL**: For complex data requirements
- **WebSockets**: Real-time notifications and updates
- **Machine Learning**: Intelligent workflow suggestions
- **Edge Computing**: Reduced latency for global users
