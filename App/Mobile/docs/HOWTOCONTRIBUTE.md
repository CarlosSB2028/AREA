# How to Contribute to AREA Mobile

Welcome to the AREA Mobile project! We're thrilled that you're interested in contributing to our automation platform. This comprehensive guide will help you get started and ensure your contributions are valuable and well-integrated.

---

## 📋 Table of Contents

- [🎯 Ways to Contribute](#-ways-to-contribute)
- [🚀 Quick Start](#-quick-start)
- [🛠️ Development Environment](#️-development-environment)
- [📝 Code Standards & Guidelines](#-code-standards--guidelines)
- [🧪 Testing Guidelines](#-testing-guidelines)
- [🔒 Security Guidelines](#-security-guidelines)
- [♿ Accessibility Guidelines](#-accessibility-guidelines)
- [🌐 Internationalization](#-internationalization)
- [📋 Pull Request Process](#-pull-request-process)
- [🏷️ Issue Management](#️-issue-management)
- [📦 Release Process](#-release-process)

---

## 🎯 Ways to Contribute

### Code Contributions
- 🐛 **Bug Fixes**: Fix reported issues
- ✨ **Features**: Implement new functionality
- 🔧 **Refactoring**: Improve code quality
- 🧪 **Tests**: Add or improve test coverage
- 📚 **Documentation**: Improve docs and guides

### Non-Code Contributions
- 📖 **Documentation**: Write, update, or translate docs
- 🎨 **Design**: UI/UX improvements and design systems
- 🌍 **Translation**: Add new languages or improve existing ones
- 🐛 **Bug Reports**: Report issues with detailed information
- 💡 **Ideas**: Suggest new features or improvements
- 👥 **Community**: Help other contributors, review PRs

---

## 🚀 Quick Start

### Prerequisites

**Required:**
- **Node.js**: 18+ (LTS recommended)
- **Yarn**: 1.x or 3.x+ (Corepack recommended)
- **Git**: 2.30+

**Platform-Specific:**
- **Android**: Android Studio (for emulator) or physical device
- **iOS**: macOS with Xcode 14+ (for iOS development)
- **Web**: Modern web browser

**Recommended:**
- **Expo CLI**: `npm install -g @expo/cli`

### 1. Fork & Clone

```bash
# Fork the repository on GitHub
# Then clone your fork locally
git clone https://github.com/YOUR_USERNAME/AREA_Mobile.git
cd AREA_Mobile

# Set up upstream remote for staying in sync
git remote add upstream https://github.com/SamTess/AREA_Mobile.git

# Verify remotes
git remote -v
```

### 2. Environment Setup

```bash
# Install dependencies
yarn install

# Set up environment variables (if needed)
cp .env.example .env.local

# Verify setup
yarn --version
node --version
```

### 3. First Run

```bash
# Start the development server
yarn start

# In the Expo terminal, choose your platform:
# - 'a' for Android
# - 'i' for iOS
# - 'w' for Web
```

### 4. Verify Everything Works

```bash
# Run tests
yarn test

# Check code quality
yarn lint

# Type checking
npx tsc --noEmit
```

---

## 🛠️ Development Environment

### Environment Configuration

Create `.env.local` for local development:

```bash
# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:8080/api

# Development flags
EXPO_PUBLIC_ENVIRONMENT=development
EXPO_PUBLIC_USE_MOCK_DATA=false

# Analytics/Debugging (optional)
EXPO_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
```

### Project Structure Overview

```
AREA_Mobile/
├── app/                    # Expo Router pages/screens
│   ├── _layout.tsx        # Root layout
│   ├── index.tsx          # Home screen
│   └── (tabs)/            # Tab navigation
├── components/            # Reusable UI components
│   ├── ui/               # Gluestack UI components
│   └── ActionReactionItem.tsx
├── contexts/             # React Context providers
│   ├── AuthContext.tsx
│   └── AreaContext.tsx
├── services/             # API and business logic
│   ├── auth.ts
│   ├── api.ts
│   └── area.ts
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
├── i18n/                 # Internationalization
│   └── locales/
├── assets/               # Images, icons, fonts
├── docs/                 # Documentation
└── __tests__/            # Test files
```

---


## 📝 Code Standards & Guidelines

### TypeScript Best Practices

#### ✅ Do's

```typescript
// 1. Use explicit types for function parameters
interface UserCardProps {
  user: User;
  onPress?: () => void;
  showAvatar?: boolean;
}

function UserCard({ user, onPress, showAvatar = true }: UserCardProps) {
  // Implementation
}

// 2. Use union types for constrained values
type LoadingState = 'idle' | 'loading' | 'success' | 'error';

function DataFetcher({ state }: { state: LoadingState }) {
  // Implementation
}

// 3. Use generics for reusable components
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return <VStack>{items.map(renderItem)}</VStack>;
}

// 4. Prefer interfaces over types for object shapes
interface Service {
  id: string;
  name: string;
  baseUrl: string;
  auth: AuthMethod;
}
```

#### ❌ Don'ts

```typescript
// Avoid any type
function processData(data: any) { // ❌
  return data.name;
}

// Avoid implicit any
const users = []; // ❌ - should be User[]
const users: User[] = [];

// Don't use optional properties when field is always required
interface User {
  name?: string; // ❌ - if name is always required
}
```

### Component Guidelines

#### Component Structure

```typescript
import React, { useState, useEffect } from 'react';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { useTranslation } from 'react-i18next';
import type { User } from '@/types/auth';

interface UserProfileProps {
  userId: string;
  showActions?: boolean;
}

export function UserProfile({ userId, showActions = false }: UserProfileProps) {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user data
  }, [userId]);

  if (loading) {
    return <Text>{t('common.loading')}</Text>;
  }

  return (
    <VStack className="p-4">
      <Text className="text-xl font-bold">{user?.name}</Text>
      {showActions && (
        <Button onPress={() => console.log('Edit')}>
          <Button.Text>{t('common.edit')}</Button.Text>
        </Button>
      )}
    </VStack>
  );
}
```

#### Custom Hooks

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

### Styling Guidelines

#### NativeWind (Tailwind) Usage

```tsx
// ✅ Good - Use utility classes
<Box className="flex-1 bg-background-50 p-4 rounded-lg shadow-sm">
  <Text className="text-lg font-semibold text-typography-900">
    Welcome
  </Text>
  <Text className="text-sm text-typography-600 mt-2">
    This is a description
  </Text>
</Box>

// ❌ Bad - Avoid inline styles
<Box style={{ flex: 1, padding: 16, backgroundColor: 'white' }}>
  <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
    Welcome
  </Text>
</Box>
```

#### Responsive Design

```tsx
// Use responsive breakpoints
<Box className="p-4 md:p-6 lg:p-8">
  <Text className="text-base md:text-lg lg:text-xl">
    Responsive text
  </Text>
</Box>
```

### Error Handling

```typescript
// Service level error handling
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Component level error handling
function UserProfile({ userId }: { userId: string }) {
  const { user, loading, error } = useUserProfile(userId);

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={() => refetch()}
      />
    );
  }

  // ... rest of component
}
```

---

## 🧪 Testing Guidelines

### Testing Philosophy

- **Test Behavior, Not Implementation**: Test what the user sees and interacts with
- **Fast and Reliable**: Tests should run quickly and consistently
- **Maintainable**: Tests should be easy to understand and update
- **Comprehensive**: Cover happy paths, edge cases, and error scenarios


### Component Testing

```typescript
// __tests__/UserCard.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { UserCard } from '../UserCard';

const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  avatarUrl: 'https://example.com/avatar.jpg',
};

describe('UserCard', () => {
  it('renders user information correctly', () => {
    render(<UserCard user={mockUser} />);

    expect(screen.getByText('John Doe')).toBeTruthy();
    expect(screen.getByText('john@example.com')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    render(<UserCard user={mockUser} onPress={mockOnPress} />);

    fireEvent.press(screen.getByText('John Doe'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<UserCard user={mockUser} loading />);

    expect(screen.getByText('Loading...')).toBeTruthy();
  });

  it('handles missing avatar gracefully', () => {
    const userWithoutAvatar = { ...mockUser, avatarUrl: undefined };
    render(<UserCard user={userWithoutAvatar} />);

    // Should render without crashing
    expect(screen.getByText('John Doe')).toBeTruthy();
  });
});
```

### Hook Testing

```typescript
// __tests__/useAuth.test.ts
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAuth } from '../AuthContext';

// Mock dependencies
jest.mock('@/services/auth');
const mockAuthService = require('@/services/auth');

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides initial auth state', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current).toHaveProperty('user', null);
    expect(result.current).toHaveProperty('isAuthenticated', false);
    expect(result.current).toHaveProperty('loading', true);
  });

  it('handles successful login', async () => {
    const mockUser = { id: '1', name: 'John' };
    mockAuthService.authService.login.mockResolvedValue({
      user: mockUser,
      token: 'token123'
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('email', 'password');
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.loading).toBe(false);
    });
  });

  it('handles login errors', async () => {
    const errorMessage = 'Invalid credentials';
    mockAuthService.authService.login.mockRejectedValue(
      new Error(errorMessage)
    );

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      try {
        await result.current.login('email', 'wrongpassword');
      } catch (error) {
        // Expected error
      }
    });

    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.loading).toBe(false);
    });
  });
});
```

### Service Testing

```typescript
// __tests__/authService.test.ts
import { authService } from '../authService';
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
        user: { id: '1' },
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresIn: 3600
      };

      mockApiClient.post.mockResolvedValue({ data: mockResponse });

      const result = await authService.login(credentials);

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(result).toEqual(mockResponse);
    });

    it('handles network errors', async () => {
      const networkError = new Error('Network Error');
      mockApiClient.post.mockRejectedValue(networkError);

      await expect(authService.login({ email: '', password: '' }))
        .rejects.toThrow('Network Error');
    });

    it('handles API validation errors', async () => {
      const validationError = {
        response: {
          status: 400,
          data: { message: 'Email is required' }
        }
      };
      mockApiClient.post.mockRejectedValue(validationError);

      await expect(authService.login({ email: '', password: 'pass' }))
        .rejects.toThrow();
    });
  });
});
```

### E2E Testing

```typescript
// cypress/e2e/auth.cy.ts
describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should login successfully', () => {
    cy.get('[data-cy="email-input"]').type('user@example.com');
    cy.get('[data-cy="password-input"]').type('password123');
    cy.get('[data-cy="login-button"]').click();

    cy.url().should('include', '/dashboard');
    cy.contains('Welcome back').should('be.visible');
  });

  it('should show error for invalid credentials', () => {
    cy.get('[data-cy="email-input"]').type('invalid@example.com');
    cy.get('[data-cy="password-input"]').type('wrongpassword');
    cy.get('[data-cy="login-button"]').click();

    cy.contains('Invalid credentials').should('be.visible');
  });

  it('should navigate to register page', () => {
    cy.contains('Create account').click();
    cy.url().should('include', '/register');
  });
});
```

---

## 🔒 Security Guidelines

### Input Validation

```typescript
// Use Zod for runtime validation
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const userSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email'),
  age: z.number().min(13, 'Must be at least 13 years old').optional(),
});

// Usage
export function validateLogin(data: unknown) {
  return loginSchema.safeParse(data);
}
```

### Secure Storage

```typescript
// Use Expo SecureStore for sensitive data
import * as SecureStore from 'expo-secure-store';

export const secureStorage = {
  async setToken(token: string): Promise<void> {
    await SecureStore.setItemAsync('auth_token', token, {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
    });
  },

  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('auth_token');
    } catch {
      return null;
    }
  },

  async clearTokens(): Promise<void> {
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('refresh_token');
  },
};
```

### API Security

- **HTTPS Only**: All API calls must use HTTPS in production
- **Token Management**: Implement proper token refresh logic
- **Input Sanitization**: Sanitize all user inputs before API calls
- **Rate Limiting**: Respect API rate limits and implement backoff
- **Error Handling**: Don't expose sensitive information in error messages

---

## ♿ Accessibility Guidelines

### Semantic HTML

```tsx
// ✅ Use proper accessibility props
<Button
  accessibilityLabel="Create new AREA"
  accessibilityHint="Opens the AREA creation form"
  accessibilityRole="button"
>
  <Button.Text>Create AREA</Button.Text>
</Button>

// ✅ Use proper heading hierarchy
<Text accessibilityRole="header" aria-level={1}>
  Welcome to AREA
</Text>

<Text accessibilityRole="header" aria-level={2}>
  Recent AREAs
</Text>
```

### Focus Management

```tsx
// ✅ Manage focus for dynamic content
const inputRef = useRef<TextInput>(null);

useEffect(() => {
  if (showForm) {
    inputRef.current?.focus();
  }
}, [showForm]);

return (
  <TextInput
    ref={inputRef}
    accessibilityLabel="Email address"
    placeholder="Enter your email"
  />
);
```

### Color Contrast

- **Text on background**: Minimum 4.5:1 contrast ratio
- **Large text**: Minimum 3:1 contrast ratio
- **Interactive elements**: Clear visual states (hover, focus, active)

### Screen Reader Support

```tsx
// ✅ Provide context for screen readers
<VStack accessibilityLabel="User profile information">
  <Text accessibilityRole="header">John Doe</Text>
  <Text>Software Developer</Text>
  <Text accessibilityLabel="Email address">john@example.com</Text>
</VStack>

// ✅ Hide decorative elements
<Image
  source={decorativeIcon}
  accessibilityElementsHidden={true}
  importantForAccessibility="no"
/>
```

---

## 🌐 Internationalization

### Translation Keys

```typescript
// ✅ Use descriptive, hierarchical keys
{
  "auth": {
    "login": {
      "title": "Se connecter",
      "email": "Adresse email",
      "password": "Mot de passe",
      "submit": "Se connecter"
    }
  },
  "area": {
    "create": {
      "title": "Créer une AREA",
      "description": "Description de l'AREA"
    }
  }
}

// ❌ Avoid generic keys
{
  "button1": "Save",
  "text1": "Welcome"
}
```

### Pluralization

```typescript
// Translation file
{
  "items": {
    "count_zero": "Aucun élément",
    "count_one": "{{count}} élément",
    "count_other": "{{count}} éléments"
  }
}

// Usage
<Text>{t('items.count', { count: items.length })}</Text>
```

### Date and Number Formatting

```typescript
// Use Intl for locale-aware formatting
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat(i18n.language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat(i18n.language).format(num);
}
```

## 📚 Additional Resources

### Documentation
- [Technical Documentation](docs/TECHNICAL.md)
- [Architecture Guide](docs/ARCHITECTURE.md)
- [Development Guide](docs/DEVELOPMENT_GUIDE.md)
- [API Integration Guide](docs/API_INTEGRATION.md)
- [Testing Guide](docs/LOCAL_CI_TESTING.md)

### External Resources
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [Gluestack UI Documentation](https://gluestack.io/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Conventional Commits](https://conventionalcommits.org/)
