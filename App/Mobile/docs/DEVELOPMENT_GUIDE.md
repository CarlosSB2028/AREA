# AREA Mobile - Development Best Practices

Comprehensive guide for maintaining code quality and consistency across the AREA Mobile project.

---

## 📋 Table of Contents

- [Code Style & Conventions](#code-style--conventions)
- [Component Development](#component-development)
- [State Management](#state-management)
- [Performance Guidelines](#performance-guidelines)
- [Git Workflow](#git-workflow)
- [Related Documentation](#related-documentation)

---

## Code Style & Conventions

### TypeScript Standards

#### ✅ Good Practices

```typescript
// Use explicit types for function parameters
interface UserProps {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
}

function UserCard({ id, name, email, isActive }: UserProps) {
  // Implementation
}

// Use union types for constrained values
type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

function AuthGuard({ status }: { status: AuthStatus }) {
  // Implementation
}

// Prefer interfaces over types for object shapes
interface Service {
  id: string;
  name: string;
  baseUrl: string;
}
```

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| **Components** | PascalCase | `UserProfile.tsx` |
| **Hooks** | camelCase + `use` | `useAuth.ts` |
| **Services** | camelCase | `authService.ts` |
| **Types** | PascalCase | `interface User` |
| **Constants** | UPPER_SNAKE_CASE | `API_BASE_URL` |
| **Files** | kebab-case | `user-profile.tsx` |

## Component Development

### Component Structure

```typescript
// components/UserCard.tsx
import React from 'react';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import type { User } from '@/types/auth';

interface UserCardProps {
  user: User;
  onPress?: () => void;
  showDetails?: boolean;
}

export function UserCard({ user, onPress, showDetails = false }: UserCardProps) {
  return (
    <VStack className="p-4 border rounded-lg" onPress={onPress}>
      <Text className="font-bold text-lg">{user.name}</Text>
      <Text className="text-gray-600">{user.email}</Text>
      {showDetails && (
        <Text className="text-sm text-gray-500">
          Member since: {formatDate(user.createdAt)}
        </Text>
      )}
    </VStack>
  );
}
```

### Custom Hooks Pattern

```typescript
// hooks/useUserProfile.ts
import { useState, useEffect } from 'react';
import { userService } from '@/services/user';
import type { User } from '@/types/auth';

export function useUserProfile(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const userData = await userService.getUser(userId);
        setUser(userData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  return { user, loading, error, refetch: () => fetchUser() };
}
```

### Component Composition

```typescript
// Prefer composition over complex props
function UserList({ users, renderItem }) {
  return (
    <VStack space="md">
      {users.map(user => renderItem(user))}
    </VStack>
  );
}

// Usage
<UserList
  users={users}
  renderItem={(user) => (
    <UserCard
      key={user.id}
      user={user}
      onPress={() => navigateToUser(user.id)}
    />
  )}
/>
```

---

## Related Documentation

For specialized topics, refer to these dedicated guides:

- **[API Integration Guide](API_INTEGRATION.md)**: Backend API integration, authentication, and service layer patterns
- **[Testing Guide](TESTING_GUIDE.md)**: Comprehensive testing practices, component testing, and test utilities
- **[Security Guide](SECURITY_GUIDE.md)**: Security best practices, secure storage, and input validation
- **[Internationalization Guide](I18N_GUIDE.md)**: Localization setup and translation management
- **[Technical Reference](TECHNICAL.md)**: Mobile platform technical specifications and architecture

---