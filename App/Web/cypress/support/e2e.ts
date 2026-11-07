// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Handle uncaught exceptions (like network errors)
Cypress.on('uncaught:exception', (err) => {
  // Returning false prevents Cypress from failing the test
  // Only ignore network errors during e2e tests
  if (err.message.includes('Network Error') || err.message.includes('ECONNREFUSED')) {
    return false
  }
  // Allow other errors to fail the test
  return true
})

// Set up global environment for tests
beforeEach(() => {
  // Set environment variable to use mock data
  window.localStorage.setItem('USE_MOCK_DATA', 'true')

  // Mock API calls that might fail
  cy.intercept('GET', '**/api/areas', { fixture: 'areas.json' }).as('getAreas')
  cy.intercept('GET', '**/api/services', { fixture: 'services.json' }).as('getServices')
  cy.intercept('GET', '**/api/user/**', { fixture: 'user.json' }).as('getUser')
  cy.intercept('POST', '**/api/auth/login', { fixture: 'auth.json' }).as('login')
  cy.intercept('POST', '**/api/auth/register', { fixture: 'auth.json' }).as('register')
  cy.intercept('GET', '**/api/auth/providers', { fixture: 'providers.json' }).as('getProviders')
})

// Alternatively you can use CommonJS syntax:
// require('./commands')