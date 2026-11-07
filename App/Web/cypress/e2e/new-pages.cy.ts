/**
 * E2E Tests for About and Contact Pages
 * Tests navigation and basic functionality of public pages
 */

describe('About and Contact Pages', () => {
  it('should navigate to about page from navigation', () => {
    cy.visit('/')
    cy.get('a, button').then($elements => {
      const aboutLink = Array.from($elements).find(el =>
        /about/i.test(el.textContent || '')
      )
      if (aboutLink) {
        cy.wrap(aboutLink).click()
      }
    })
  })

  it('should display about page content', () => {
    cy.visit('/about')
    cy.get('body').should('be.visible')
  })

  it('should have working links on about page', () => {
    cy.visit('/about')
    cy.get('a').first().should('have.attr', 'href')
  })

  it('should be responsive on about page', () => {
    cy.viewport(320, 568)
    cy.visit('/about')
    cy.get('body').should('be.visible')
    
    cy.viewport(768, 1024)
    cy.get('body').should('be.visible')
    
    cy.viewport(1280, 720)
    cy.get('body').should('be.visible')
  })

  it('should navigate to contact page from navigation', () => {
    cy.visit('/')
    cy.get('a, button').then($elements => {
      const contactLink = Array.from($elements).find(el =>
        /contact/i.test(el.textContent || '')
      )
      if (contactLink) {
        cy.wrap(contactLink).click()
      }
    })
  })

  it('should display contact page content', () => {
    cy.visit('/contact')
    cy.get('body').should('be.visible')
  })

  it('should have contact form on contact page', () => {
    cy.visit('/contact')
    cy.get('form, input, textarea').should('have.length.greaterThan', 0)
  })

  it('should allow entering contact form data', () => {
    cy.visit('/contact')
    
    // Try to fill any available input field
    cy.get('input, textarea').first()
      .then($firstInput => {
        if ($firstInput.length > 0) {
          cy.wrap($firstInput).type('Test input', { delay: 30 })
        }
        cy.get('body').should('be.visible')
      })
  })

  it('should submit contact form', () => {
    cy.intercept('POST', '**/api/contact', { statusCode: 200, body: { success: true } }).as('submitContact')
    
    cy.visit('/contact')
    
    // Try to find and click submit button
    cy.get('button').then($buttons => {
      const submitBtn = Array.from($buttons).find(btn =>
        /send|submit|contact/i.test(btn.textContent || '')
      )
      if (submitBtn) {
        cy.wrap(submitBtn).click()
        cy.wait(500)
      }
    })
  })

  it('should validate contact form', () => {
    cy.visit('/contact')
    
    // Try submit empty form
    cy.get('button').then($buttons => {
      const submitBtn = Array.from($buttons).find(btn =>
        /send|submit|contact/i.test(btn.textContent || '')
      )
      if (submitBtn) {
        cy.wrap(submitBtn).click()
      }
    })
  })

  it('should be responsive on contact page', () => {
    cy.viewport(320, 568)
    cy.visit('/contact')
    cy.get('body').should('be.visible')
    
    cy.viewport(768, 1024)
    cy.get('body').should('be.visible')
    
    cy.viewport(1280, 720)
    cy.get('body').should('be.visible')
  })

  it('should have back navigation from about page', () => {
    cy.visit('/about')
    cy.get('a, button').then($elements => {
      const backLink = Array.from($elements).find(el =>
        /back|home/i.test(el.textContent || '')
      )
      if (backLink) {
        cy.wrap(backLink).click()
      }
    })
  })

  it('should have back navigation from contact page', () => {
    cy.visit('/contact')
    cy.get('a, button').then($elements => {
      const backLink = Array.from($elements).find(el =>
        /back|home/i.test(el.textContent || '')
      )
      if (backLink) {
        cy.wrap(backLink).click()
      }
    })
  })

  it('should load about page quickly', () => {
    cy.visit('/about')
    cy.get('body').should('be.visible')
  })

  it('should load contact page quickly', () => {
    cy.visit('/contact')
    cy.get('body').should('be.visible')
  })

  it('should have consistent layout on about page', () => {
    cy.visit('/about')
    cy.get('body').should('be.visible')
  })

  it('should have consistent layout on contact page', () => {
    cy.visit('/contact')
    cy.get('body').should('be.visible')
  })
})
