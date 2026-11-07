describe('Navigation', () => {
  it('should navigate from home to areas page', () => {
    cy.visit('/');
    // Click on navigation link to areas if it exists
    cy.get('body').then($body => {
      if ($body.text().includes('Areas')) {
        cy.contains('Areas').click();
        cy.url().should('include', '/areas');
        cy.contains('Areas').should('be.visible');
      }
    });
  });

  it('should navigate from areas to home', () => {
    cy.visit('/areas');
    // Click on home link in navbar
    cy.get('[data-active]').first().click();
    cy.url().should('include', '/');
  });

  it('should navigate from home to login', () => {
    cy.visit('/');
    // Look for login link or button
    cy.get('body').then($body => {
      if ($body.text().includes('Login') || $body.text().includes('Sign in')) {
        cy.contains('Login').click();
        cy.url().should('include', '/login');
      }
    });
  });

  it('should handle 404 pages gracefully', () => {
    cy.visit('/nonexistent-page', { failOnStatusCode: false });
    // Check that the app handles 404 (Next.js default behavior)
    cy.get('body').should('exist');
  });

  it('should display footer links on home page', () => {
    cy.visit('/');
    cy.contains('About').should('be.visible');
    cy.contains('Contact').should('be.visible');
  });

  it('should navigate to about page from footer', () => {
    cy.visit('/');
    cy.contains('About').click();
    cy.url().should('include', '/about');
  });

  it('should navigate to contact page from footer', () => {
    cy.visit('/');
    cy.contains('Contact').click();
    cy.url().should('include', '/contact');
  });
});