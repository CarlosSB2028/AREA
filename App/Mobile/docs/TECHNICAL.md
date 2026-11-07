# AREA Mobile - Technical Documentation

Complete technical reference for AREA Mobile.

---

## Tech Stack

### Core
- **React Native** 0.76+ - Mobile framework
- **Expo** 54 - Development platform
- **TypeScript** 5.3 - Static typing
- **Expo Router** 6.0 - File-based routing

### UI
- **Gluestack-UI** - Component library
- **NativeWind** 4.2 - Tailwind for React Native
- **Lucide React Native** - Icons

### State & Data
- **Context API** - State management
- **Expo Secure Store** - Secure storage
- **react-i18next** - Internationalization

### Testing
- **Jest** - Test runner
- **React Testing Library** - Component testing

---

## Architecture

### Layer Model

```
Presentation (UI)
    ↓
Application Logic (Contexts)
    ↓
Business Logic (Services)
    ↓
Data (API/Storage)
```

### Patterns Used

**Context Pattern** - Global state (Auth)
```typescript
const { user, login, logout } = useAuth();
```

**Service Layer** - Business logic
```typescript
authService.login({ email, password });
```

**Repository** - Data abstraction
```typescript
storage.saveTokens(tokens);
```

---

## Project Structure

```
app/
├── _layout.tsx              # Root layout
├── index.tsx                # Home page
├── (tabs)/                  # Tab navigation
│   ├── login.tsx
│   ├── register.tsx
│   └── profile.tsx
└── screens/
    ├── HomeScreen.tsx
    └── PlaceholderScreen.tsx

components/
├── ActionReactionItem.tsx   # Action→Reaction component
└── ui/                      # Gluestack UI components

contexts/
└── AuthContext.tsx          # Authentication state

services/
├── auth.ts                  # Auth service
├── storage.ts               # Storage service
└── __mocks__/              # Test mocks

locales/
├── en.json                  # English translations
└── fr.json                  # French translations
```

---

## Key Components

### ActionReactionItem

Reusable component for Action → Reaction pairs.

```tsx
<ActionReactionItem
  actionService="github"
  reactionService="microsoft"
  actionLabel={t('actionReaction.githubAction')}
  reactionLabel={t('actionReaction.microsoftReaction')}
  isConnected={true}
  onConnectPress={() => console.log('Connect')}
/>
```

### PlaceholderScreen

"Under construction" screen.

```tsx
import PlaceholderScreen from '@/app/screens/PlaceholderScreen';

export default function SomePage() {
  return <PlaceholderScreen />;
}
```

---

## Development Workflow

### Scripts

```bash
yarn start          # Start Expo dev server
yarn android        # Run on Android
yarn ios            # Run on iOS
yarn web            # Run on Web
yarn test           # Run tests
yarn test:watch     # Tests in watch mode
yarn coverage       # Tests with coverage
yarn lint           # Check code style
```

### Environment Variables

```bash
# .env.local
EXPO_PUBLIC_API_URL=http://localhost:8080/api
EXPO_PUBLIC_ENVIRONMENT=development
EXPO_PUBLIC_USE_MOCK_DATA=false
EXPO_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
```

## Internationalization

### Setup

- Default: French
- Available: French, English
- Library: react-i18next

### Usage

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation();
  
  return (
    <>
      <Text>{t('home.greeting')}</Text>
      <Button onPress={() => i18n.changeLanguage('en')}>
        {t('profile.toggleToEnglish')}
      </Button>
    </>
  );
}
```

### File Structure

```json
{
  "home": { "greeting": "Hello!" },
  "login": { "title": "Login" },
  "profile": { "title": "Profile" }
}
```

---

## Testing

### Stack
- Jest + React Testing Library
- 26 test suites, 169 tests
- 75.7% code coverage

### Example

```tsx
import { render, screen, fireEvent } from '@testing-library/react-native';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeTruthy();
  });

  it('handles press', () => {
    const onPress = jest.fn();
    render(<MyComponent onPress={onPress} />);
    
    fireEvent.press(screen.getByTestId('button'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

### Commands

```bash
yarn test           # All tests
yarn test:watch     # Watch mode
yarn coverage       # With coverage
yarn test MyComp    # Specific test
```

---

## Code Conventions

### TypeScript

```typescript
// ✅ Good
interface UserProps {
  name: string;
  onPress: () => void;
}

function UserCard({ name, onPress }: UserProps) {
  return <Box>{name}</Box>;
}

// ❌ Bad
function UserCard(props: any) {
  return <Box>{props.name}</Box>;
}
```

### Styling

```tsx
// ✅ Use NativeWind
<Box className="flex-1 bg-background-50 p-4">
  <Text className="text-lg font-bold">Hello</Text>
</Box>

// ❌ Avoid inline styles
<Box style={{ flex: 1, padding: 16 }}>
  <Text style={{ fontSize: 18 }}>Hello</Text>
</Box>
```

### i18n

```tsx
// ✅ Always use translations
<Text>{t('common.hello')}</Text>

// ❌ Never hardcode text
<Text>Hello</Text>
```

---

## Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `UserCard.tsx` |
| Functions | camelCase | `getUserData()` |
| Hooks | camelCase + use | `useAuth()` |
| Constants | UPPER_SNAKE_CASE | `API_URL` |
| Types | PascalCase | `interface User` |

---

## Deployment

### Environments

- **Development** - Internal testing
- **Staging** - Pre-production
- **Production** - Public release

### Build Commands

```bash
# Development
eas build --profile development --platform android

# Staging
eas build --profile staging --platform android

# Production
eas build --profile production --platform all
```

### Submit to Stores

```bash
# iOS App Store
eas submit -p ios

# Google Play Store
eas submit -p android
```

---

## Scripts

```bash
yarn start          # Start Expo dev server
yarn android        # Run on Android
yarn ios            # Run on iOS
yarn web            # Run on Web
yarn test           # Run tests
yarn test:watch     # Tests in watch mode
yarn coverage       # Tests with coverage
yarn lint           # Check code style
```

---

## Related Documentation

For detailed guides on specific topics:

- **[Development Guide](DEVELOPMENT_GUIDE.md)** - Code standards, testing practices, performance guidelines
- **[API Integration Guide](API_INTEGRATION.md)** - Backend API integration, authentication, endpoints
- **[Internationalization Guide](I18N_GUIDE.md)** - Translation management, language switching
- **[Architecture Guide](ARCHITECTURE.md)** - Global platform architecture

---

**Last updated**: October 2025  
**Version**: 1.1.0
