// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  // Test-specific overrides
  {
    files: [
      '**/__tests__/**/*.{js,jsx,ts,tsx}',
      '**/*.{spec,test}.{js,jsx,ts,tsx}',
    ],
    rules: {
      // Allow require() style imports in tests for easier mocking
      '@typescript-eslint/no-require-imports': 'off',
      // Don't require display names for anonymous test components
      'react/display-name': 'off',
    },
  },
]);
