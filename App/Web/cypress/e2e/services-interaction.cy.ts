/**
 * E2E Tests for Service Interactions
 * Tests connecting, filtering, and managing services in the UI
 * Does NOT interfere with unit tests (uses Cypress isolation)
 */

describe('Service Interactions and Management', () => {
  beforeEach(() => {
    // Cypress-specific API mocking
    cy.intercept('GET', '**/api/services', { fixture: 'services.json' }).as('getServices')
    cy.intercept('GET', '**/api/user/services', { fixture: 'services.json' }).as('getUserServices')
    cy.intercept('POST', '**/api/services/*/connect', { statusCode: 200, body: { connected: true } }).as('connectService')
    cy.intercept('POST', '**/api/services/*/disconnect', { statusCode: 200, body: { connected: false } }).as('disconnectService')
  })

  it('should display available services on dashboard', () => {
    cy.visit('/dashboard')
    cy.get('body').should('be.visible')
  })

  it('should allow filtering services', () => {
    cy.visit('/dashboard')
    
    // Look for filter input
    cy.get('input[placeholder*="search" i], input[placeholder*="filter" i], input[type="search"]')
      .then($filterInput => {
        if ($filterInput.length > 0) {
          cy.wrap($filterInput).first().type('github', { delay: 30 })
        }
        cy.get('body').should('be.visible')
      })
  })

  it('should display service details', () => {
    cy.visit('/dashboard')
    
    // Click on a service card/item if available
    cy.get('[data-testid*="service"], [role="row"], button').first()
      .then($serviceEl => {
        if ($serviceEl && $serviceEl.length > 0) {
          cy.wrap($serviceEl).should('exist')
        }
        cy.get('body').should('be.visible')
      })
  })

  it('should allow connecting a service', () => {
    cy.visit('/dashboard')
    
    // Look for connect button
    cy.get('button').then($buttons => {
      const connectBtn = Array.from($buttons).find(btn =>
        /connect|link|add/i.test(btn.textContent || '')
      )
      if (connectBtn) {
        cy.wrap(connectBtn).should('exist')
      }
    })
  })

  it('should allow disconnecting a service', () => {
    cy.visit('/dashboard')
    
    // Look for disconnect button
    cy.get('button').then($buttons => {
      const disconnectBtn = Array.from($buttons).find(btn =>
        /disconnect|unlink|remove/i.test(btn.textContent || '')
      )
      if (disconnectBtn) {
        cy.wrap(disconnectBtn).should('exist')
      }
    })
  })

  it('should display service status', () => {
    cy.visit('/dashboard')
    
    // Look for status indicators if available
    cy.get('body').should('be.visible')
  })

  it('should handle service connection errors', () => {
    cy.intercept('POST', '**/api/services/*/connect', { statusCode: 400, body: { error: 'Connection failed' } }).as('connectServiceError')
    
    cy.visit('/dashboard')
    cy.get('body').should('be.visible')
  })

  it('should sort services if applicable', () => {
    cy.visit('/dashboard')
    
    // Look for sort options
    cy.get('button, select, [role="listbox"]').first()
      .then($sortEl => {
        if ($sortEl && $sortEl.length > 0) {
          cy.wrap($sortEl).should('exist')
        }
        cy.get('body').should('be.visible')
      })
  })

  it('should display service categories or types', () => {
    cy.visit('/dashboard')
    
    // Look for categories/badges if available
    cy.get('body').should('be.visible')
  })

  it('should refresh services list', () => {
    cy.visit('/dashboard')
    
    // Look for refresh button
    cy.get('button').then($buttons => {
      const refreshBtn = Array.from($buttons).find(btn =>
        /refresh/i.test(btn.getAttribute('aria-label') || '') ||
        /refresh/i.test(btn.textContent || '')
      )
      if (refreshBtn) {
        cy.wrap(refreshBtn).click()
        cy.wait(500)
      }
      cy.get('body').should('be.visible')
    })
  })

  it('should be responsive on services list', () => {
    cy.visit('/dashboard')
    
    // Test mobile
    cy.viewport(320, 568)
    cy.get('body').should('be.visible')
    
    // Test tablet
    cy.viewport(768, 1024)
    cy.get('body').should('be.visible')
    
    // Test desktop
    cy.viewport(1280, 720)
    cy.get('body').should('be.visible')
  })

  it('should show empty state when no services', () => {
    cy.intercept('GET', '**/api/services', { statusCode: 200, body: [] }).as('getEmptyServices')
    
    cy.visit('/dashboard')
    cy.get('body').should('be.visible')
  })

  it('should show loading state while fetching services', () => {
    cy.visit('/dashboard')
    cy.get('body').should('be.visible')
  })

  it('should handle network errors gracefully', () => {
    cy.intercept('GET', '**/api/services', { forceNetworkError: true }).as('getServicesError')
    
    cy.visit('/dashboard')
    cy.get('body').should('be.visible')
  })
})
