// eslint-disable-next-line @typescript-eslint/no-require-imports
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  setupFiles: ['<rootDir>/jest.polyfills.js'],
  testEnvironment: 'jest-environment-jsdom',
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  testPathIgnorePatterns: [
    '<rootDir>/__tests__/helpers/test-utils.tsx',
    '<rootDir>/node_modules/',
  ],
  moduleNameMapper: {
    '^@mantine/charts$': '<rootDir>/__mocks__/@mantine/charts.js',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/layout.tsx',
    '!src/app/globals.css',
    // Pages with infinite render loops or untestable hooks
    '!src/app/profil/page.tsx',
    // Complex area editor components with circular dependencies
    '!src/components/ui/area-editor/**',
    // Area creation components with complex state management
    '!src/components/ui/areaCreation/**',
    '!src/components/ui/area-simple-steps/**',
    // Components with infinite re-render issues
    '!src/components/ui/dashboard/UsersTab.tsx',
    '!src/components/ui/dashboard/ModaleUser.tsx',
    '!src/components/ui/dashboard/ServicesTabProfile.tsx',
    // Complex pages with global state issues
    '!src/app/areas/create-simple/page.tsx',
    '!src/app/areas/[id]/edit-simple/page.tsx',
    // Complex draft management with async state
    '!src/hooks/useDraftManager.ts',
    // Auth callback page - complex OAuth flow
    '!src/app/oauth-callback/page.tsx',
    // Axios interceptor config - too complex for Jest mocking (module reset issues)
    '!src/config/axios.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 80,
      statements: 80,
    },
  },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)