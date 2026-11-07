/// <reference types="cypress" />

// Custom commands can be added here
// Cypress.Commands.add('login', (email, password) => { ... })

// Command to set up mock environment
Cypress.Commands.add('setupMockEnvironment', () => {
  // Set environment variable in window object so the app can access it
  cy.window().then((win) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (win as any).process = (win as any).process || { env: {} };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (win as any).process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'true'
  })
})

// Add TypeScript declarations for custom commands
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      setupMockEnvironment(): Chainable<void>
    }
  }
}

export {}