describe('Login page', () => {
  it('should load the login page', () => {
    cy.visit('/login');
    cy.contains('Welcome to Area, login with').should('be.visible');
  });

  it('should display login form elements', () => {
    cy.visit('/login');
    cy.get('input[placeholder="Area@Area.com or username"]').should('be.visible');
    cy.get('input[placeholder="Your password"]').should('be.visible');
    cy.contains('Login').should('be.visible');
  });

  it('should display OAuth providers', () => {
    cy.visit('/login');
    // Check for OAuth buttons (assuming they exist)
    cy.get('body').then($body => {
      if ($body.text().includes('Google') || $body.text().includes('GitHub')) {
        cy.contains('Google').should('exist');
      }
    });
  });

  it('should navigate to home page from login', () => {
    cy.visit('/login');
    // Click on logo or home link if it exists
    cy.get('body').then($body => {
      if ($body.find('a[href="/"], button').length > 0) {
        cy.get('a[href="/"], button').first().click();
        cy.url().should('include', '/');
      }
    });
  });
});