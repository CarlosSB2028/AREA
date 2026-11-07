# Testing strategy

This document explains the testing approach used by AREA Web: unit tests, integration tests, and end-to-end (E2E) tests.

Overview
--------

- Unit tests (Jest + Testing Library) for components and pure logic
- Integration tests for services and hooks
- E2E tests (Cypress) for critical user flows

Unit tests
----------

- Location: `__tests__/` and `src/**/__tests__` files
- Run: `yarn test` (Jest)
- Aim for targeted, fast tests. Mock network calls where appropriate.

Coverage
--------

- Coverage target: aim for >80% overall. Focus on meaningful coverage (critical paths).
- Generate coverage with `yarn test --coverage`.

E2E tests
---------

- Location: `cypress/e2e/` with fixtures in `cypress/fixtures/`.
- Run locally with `yarn cypress:open` or headless via `yarn cypress:run`.
- Prefer a small set of stable E2E tests covering login, area creation, and critical admin flows.

CI considerations
----------------

- Run unit tests and lint on every PR.
- Run E2E tests conditionally (e.g., nightly or when label `run-e2e` is set) to keep feedback fast.

Writing tests
-------------

- Use `@testing-library/react` for component tests (render+assert user-visible output).
- Mock external APIs in unit tests; for E2E use fixtures or a test backend.
- Keep tests deterministic and avoid flaky timing-based assertions.

Debugging failing tests
----------------------

- Run failing tests with `--runInBand` and increase timeouts for Cypress/Jest when investigating.
- Capture Cypress artifacts (screenshots, videos) in CI to speed debugging.

# 🧪 Testing Strategy Guide

## 🎯 **Testing Philosophy**

Our testing strategy follows the **Testing Pyramid** approach:
- **70% Unit Tests** - Fast, isolated component testing
- **20% Integration Tests** - Component interaction testing
- **10% E2E Tests** - Full user workflow testing

---

## 🏗️ **Testing Architecture**

### **Testing Stack**
```
Unit Testing     → Jest + Testing Library
E2E Testing      → Cypress
Test Runner      → Jest (unit) + Cypress (e2e)
Mocking          → Jest mocks + MSW (API)
Coverage         → Jest coverage + Codecov
CI Integration   → GitHub Actions
```

### **Test File Structure**
```
src/
├── components/
│   └── Button/
│       ├── Button.tsx
│       └── Button.module.css
├── lib/
│   └── utils.ts
└── types/
    └── index.ts

__tests__/                    ← Unit tests
├── components/
│   └── Button.test.tsx
├── lib/
│   └── utils.test.ts
└── setup/
    └── jest.setup.js

cypress/                      ← E2E tests
├── e2e/
│   ├── auth.cy.ts
│   ├── home.cy.ts
│   └── user-flow.cy.ts
├── fixtures/
│   └── users.json
└── support/
    ├── commands.ts
    └── e2e.ts
```

---

## 🧪 **Unit Testing with Jest**

### **Configuration**

**jest.config.js**
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
  },
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}

module.exports = createJestConfig(customJestConfig)
```

**jest.setup.js**
```javascript
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    }
  },
}))

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }) => (
    <img src={src} alt={alt} {...props} />
  ),
}))

// Global test setup
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks()
})
```

### **Testing Utilities**

**test-utils.tsx**
```typescript
import { render, RenderOptions } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { ReactElement, ReactNode } from 'react'

// Custom render function with providers
const AllTheProviders = ({ children }: { children: ReactNode }) => {
  return (
    <MantineProvider>
      {children}
    </MantineProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }
```

### **Component Testing Patterns**

**Basic Component Test**
```typescript
// __tests__/components/Button.test.tsx
import { render, screen, fireEvent } from '../test-utils'
import { Button } from '@/components/Button'

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)

    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies custom className', () => {
    render(<Button className="custom-class">Test</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })
})
```

**Hook Testing**
```typescript
// __tests__/hooks/useCounter.test.ts
import { renderHook, act } from '@testing-library/react'
import { useCounter } from '@/hooks/useCounter'

describe('useCounter Hook', () => {
  it('initializes with default value', () => {
    const { result } = renderHook(() => useCounter())

    expect(result.current.count).toBe(0)
  })

  it('initializes with custom value', () => {
    const { result } = renderHook(() => useCounter(10))

    expect(result.current.count).toBe(10)
  })

  it('increments count', () => {
    const { result } = renderHook(() => useCounter())

    act(() => {
      result.current.increment()
    })

    expect(result.current.count).toBe(1)
  })
})
```

**API Integration Testing**
```typescript
// __tests__/lib/api.test.ts
import { fetchUser } from '@/lib/api'

// Mock fetch
global.fetch = jest.fn()

describe('API Functions', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear()
  })

  it('fetches user data successfully', async () => {
    const mockUser = { id: 1, name: 'John Doe' }

    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    })

    const user = await fetchUser(1)

    expect(fetch).toHaveBeenCalledWith('/api/users/1')
    expect(user).toEqual(mockUser)
  })

  it('handles API errors', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
    })

    await expect(fetchUser(999)).rejects.toThrow('User not found')
  })
})
```

---

## 🎭 **E2E Testing with Cypress**

### **Configuration**

**cypress.config.ts**
```typescript
import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',

    // Viewport
    viewportWidth: 1280,
    viewportHeight: 720,

    // Timeouts
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,

    // Video and screenshots
    video: false,
    screenshotOnRunFailure: true,

    // Test isolation
    testIsolation: true,

    env: {
      // Environment variables for tests
      apiUrl: 'http://localhost:8000',
    },
  },
})
```

**cypress/support/commands.ts**
```typescript
// Custom commands
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login')
  cy.get('[data-testid="email-input"]').type(email)
  cy.get('[data-testid="password-input"]').type(password)
  cy.get('[data-testid="login-button"]').click()
  cy.url().should('include', '/dashboard')
})

Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click()
  cy.get('[data-testid="logout-button"]').click()
  cy.url().should('include', '/login')
})

// Type declarations
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>
      logout(): Chainable<void>
    }
  }
}
```

### **E2E Testing Patterns**

**Page Object Model**
```typescript
// cypress/support/pages/LoginPage.ts
export class LoginPage {
  visit() {
    cy.visit('/login')
  }

  fillEmail(email: string) {
    cy.get('[data-testid="email-input"]').type(email)
    return this
  }

  fillPassword(password: string) {
    cy.get('[data-testid="password-input"]').type(password)
    return this
  }

  submit() {
    cy.get('[data-testid="login-button"]').click()
    return this
  }

  shouldShowError(message: string) {
    cy.get('[data-testid="error-message"]').should('contain', message)
    return this
  }
}
```

**User Flow Testing**
```typescript
// cypress/e2e/user-authentication.cy.ts
import { LoginPage } from '../support/pages/LoginPage'

describe('User Authentication Flow', () => {
  const loginPage = new LoginPage()

  beforeEach(() => {
    // Reset database state
    cy.task('db:seed')
  })

  context('Valid Credentials', () => {
    it('should login successfully', () => {
      loginPage
        .visit()
        .fillEmail('user@example.com')
        .fillPassword('password123')
        .submit()

      cy.url().should('include', '/dashboard')
      cy.get('[data-testid="welcome-message"]').should('be.visible')
    })
  })

  context('Invalid Credentials', () => {
    it('should show error for invalid email', () => {
      loginPage
        .visit()
        .fillEmail('invalid@example.com')
        .fillPassword('password123')
        .submit()
        .shouldShowError('Invalid credentials')
    })

    it('should show error for wrong password', () => {
      loginPage
        .visit()
        .fillEmail('user@example.com')
        .fillPassword('wrongpassword')
        .submit()
        .shouldShowError('Invalid credentials')
    })
  })
})
```

**API Testing**
```typescript
// cypress/e2e/api/users.cy.ts
describe('Users API', () => {
  beforeEach(() => {
    // Set auth token
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'valid-token')
    })
  })

  it('should fetch user profile', () => {
    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/api/users/profile`,
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('id')
      expect(response.body).to.have.property('email')
    })
  })
})
```

### **Advanced E2E Patterns**

**Network Stubbing**
```typescript
// cypress/e2e/with-stubs.cy.ts
describe('With API Stubs', () => {
  beforeEach(() => {
    // Stub API calls
    cy.intercept('GET', '/api/users', {
      fixture: 'users.json'
    }).as('getUsers')

    cy.intercept('POST', '/api/users', {
      statusCode: 201,
      body: { id: 1, name: 'New User' }
    }).as('createUser')
  })

  it('should create a new user', () => {
    cy.visit('/users')
    cy.wait('@getUsers')

    cy.get('[data-testid="add-user-button"]').click()
    cy.get('[data-testid="name-input"]').type('John Doe')
    cy.get('[data-testid="submit-button"]').click()

    cy.wait('@createUser')
    cy.get('[data-testid="success-message"]').should('be.visible')
  })
})
```

---

## 📊 **Test Coverage & Quality**

### **Coverage Configuration**
```javascript
// jest.config.js - Coverage settings
module.exports = {
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/index.{js,jsx,ts,tsx}', // Re-exports
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
    // Per-directory thresholds
    './src/components/': {
      statements: 85,
      branches: 80,
    },
    './src/lib/': {
      statements: 90,
      branches: 85,
    },
  },
  coverageReporters: [
    'text',
    'lcov',
    'html',
  ],
}
```

### **Coverage Commands**
```bash
# Generate coverage report
yarn test:coverage

# View HTML report
open coverage/lcov-report/index.html

# Coverage summary
yarn test:coverage --verbose=false --silent

# Watch with coverage
yarn test:watch --coverage --watchAll=false
```

---

## 🎯 **Testing Best Practices**

### **Unit Test Guidelines**

**✅ DO:**
```typescript
// ✅ Test behavior, not implementation
it('should show error message when form is invalid', () => {
  render(<LoginForm />)
  fireEvent.click(screen.getByRole('button', { name: /submit/i }))
  expect(screen.getByText(/email is required/i)).toBeInTheDocument()
})

// ✅ Use semantic queries
const button = screen.getByRole('button', { name: /submit/i })
const input = screen.getByLabelText(/email/i)

// ✅ Test user interactions
fireEvent.click(button)
fireEvent.type(input, 'user@example.com')

// ✅ Use meaningful test names
it('should disable submit button when form is loading', () => {})
```

**❌ DON'T:**
```typescript
// ❌ Don't test implementation details
expect(component.state.isLoading).toBe(true)

// ❌ Don't use fragile selectors
cy.get('.css-1234-button')
cy.get('div:nth-child(2) > button')

// ❌ Don't test library code
expect(useState).toHaveBeenCalled()
```

### **E2E Test Guidelines**

**✅ DO:**
```typescript
// ✅ Test complete user workflows
it('should complete checkout process', () => {
  cy.visit('/products')
  cy.get('[data-testid="add-to-cart-1"]').click()
  cy.get('[data-testid="cart-icon"]').click()
  cy.get('[data-testid="checkout-button"]').click()
  // ... complete flow
})

// ✅ Use data-testid attributes
<button data-testid="submit-button">Submit</button>
cy.get('[data-testid="submit-button"]')

// ✅ Wait for elements properly
cy.get('[data-testid="loading"]').should('not.exist')
cy.get('[data-testid="content"]').should('be.visible')
```

**❌ DON'T:**
```typescript
// ❌ Don't test every edge case in E2E
it('should show error for invalid email format', () => {}) // Unit test this

// ❌ Don't rely on fixed wait times
cy.wait(3000) // Use proper waits instead

// ❌ Don't test API responses directly
// Use API tests for this, E2E for user experience
```

---

## 🚀 **Test Execution & CI**

### **Local Development**
```bash
# Unit tests
yarn test              # Run all tests
yarn test:watch        # Watch mode
yarn test Button       # Run specific tests
yarn test:coverage     # With coverage

# E2E tests
yarn cypress:open      # Interactive mode (requires running dev server)
yarn cypress:run       # Headless mode (requires running dev server)
yarn test:e2e:ci       # Automated: starts dev server, runs tests, stops server
yarn test:e2e:prod     # Production: builds app, starts prod server, runs tests

# E2E tests with manual server management
yarn dev               # Start dev server in one terminal
yarn cypress:run       # Run tests in another terminal
```

### **Automated E2E Testing**

We use `start-server-and-test` for automated server management:

```json
// package.json scripts
{
  "test:e2e:ci": "start-server-and-test dev http://localhost:3000 cypress:run",
  "test:e2e:prod": "yarn build && start-server-and-test start http://localhost:3000 cypress:run"
}
```

**Benefits:**
- ✅ **No manual server management** - automatically starts/stops server
- ✅ **CI-friendly** - works reliably in GitHub Actions
- ✅ **Fast feedback** - waits for server to be ready before running tests
- ✅ **Clean teardown** - properly stops server after tests complete

### **CI Integration**
```yaml
# .github/workflows/CI_Front_Web.yaml
test:
  runs-on: ubuntu-latest
  steps:
    - name: Run unit tests
      run: yarn test --coverage --watchAll=false

    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        files: ./coverage/lcov.info

test-e2e:
  runs-on: ubuntu-latest
  steps:
    - name: Start dev server
      run: yarn dev &

    - name: Wait for server
      run: npx wait-on http://localhost:3000

    - name: Run E2E tests
      run: yarn cypress:run

    - name: Upload artifacts on failure
      if: failure()
      uses: actions/upload-artifact@v3
      with:
        name: cypress-screenshots
        path: cypress/screenshots
```

---

## 🛠️ **Debugging Tests**

### **Jest Debugging**
```bash
# Debug specific test
node --inspect-brk node_modules/.bin/jest Button.test.tsx --runInBand

# VS Code debugging
# Add to .vscode/launch.json:
{
  "type": "node",
  "request": "launch",
  "name": "Debug Jest Test",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "${relativeFile}"],
  "console": "integratedTerminal"
}
```

### **Cypress Debugging**
```typescript
// Add debugger statements
it('should debug test', () => {
  cy.visit('/page')
  cy.debug()  // Pause execution
  cy.get('[data-testid="button"]').click()
})

// Browser debugging
cy.pause()  // Pause in Cypress UI
```

### **Common Issues**

**Flaky Tests:**
```typescript
// ❌ Flaky: Race condition
cy.get('[data-testid="button"]').click()
cy.get('[data-testid="result"]').should('contain', 'Success')

// ✅ Stable: Proper waiting
cy.get('[data-testid="button"]').click()
cy.get('[data-testid="loading"]').should('not.exist')
cy.get('[data-testid="result"]').should('contain', 'Success')
```

**Memory Leaks:**
```typescript
// Clean up after tests
afterEach(() => {
  cleanup()  // React Testing Library
  jest.clearAllMocks()
})
```

---

## 📈 **Test Metrics & Reporting**

### **Coverage Reports**
- **HTML Report**: `coverage/lcov-report/index.html`
- **LCOV**: `coverage/lcov.info` (for CI)
- **Console**: Real-time feedback

### **Test Performance**
```bash
# Test execution time
yarn test --verbose --testTimeout=10000

# Find slow tests
yarn test --listTests --verbose | head -10
```

### **Quality Gates**
```javascript
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
  },
  // Fail if coverage drops below threshold
  collectCoverage: true,
  coverageReporters: ['text-summary', 'lcov'],
}
```

---

## 🎯 **Testing Checklist**

### **Before Committing**
- [ ] All unit tests pass (`yarn test`)
- [ ] Coverage meets threshold (`yarn test:coverage`)
- [ ] E2E tests pass (`yarn cypress:run`)
- [ ] No linting errors in tests (`yarn lint`)
- [ ] Test files follow naming convention

### **For New Features**
- [ ] Unit tests for components/functions
- [ ] Integration tests for complex flows
- [ ] E2E tests for critical user paths
- [ ] Edge cases covered
- [ ] Error states tested

### **For Bug Fixes**
- [ ] Reproduction test written first
- [ ] Test passes after fix
- [ ] Related tests still pass
- [ ] Regression prevention

---

## 🔗 **Related Documentation**

- 🚀 [Getting Started](./getting-started.md)
- 🛠️ [Development Setup](./development-setup.md)
- 🚀 [CI Pipeline Guide](./ci-pipeline.md)
- 🛠️ [Troubleshooting](./troubleshooting.md)

---

**Happy Testing!** 🧪✅

Remember: Good tests are your safety net. Write tests that give you confidence to refactor and deploy with assurance.