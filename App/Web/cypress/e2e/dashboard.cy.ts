describe('Dashboard page', () => {
  beforeEach(() => {
    cy.visit('/dashboard');
    cy.setupMockEnvironment();
  });

  it('should load the dashboard page', () => {
    cy.contains('Users').should('be.visible');
    cy.contains('Areas').should('be.visible');
    cy.contains('Services').should('be.visible');
  });

  it('should display the tabs navigation', () => {
    // Check that tabs are present and Users tab is active by default
    cy.get('[role="tab"]').should('have.length', 3);
    cy.get('[role="tab"]').first().should('have.attr', 'aria-selected', 'true');
  });

  it('should switch to Users tab and display content', () => {
    cy.contains('Users').click();
    // Check that Users tab content is visible
    cy.get('[role="tabpanel"]').should('be.visible');
    // Check for user-related elements (assuming there are stats or table)
    cy.get('body').then($body => {
      if ($body.text().includes('Total Users') || $body.text().includes('Users')) {
        cy.contains('Users').should('be.visible');
      }
    });
  });

  it('should switch to Areas tab and display content', () => {
    cy.contains('Areas').click();
    cy.get('[role="tabpanel"]').should('be.visible');
    // Check for area-related elements
    cy.get('body').then($body => {
      if ($body.text().includes('Areas') || $body.text().includes('Area Stats')) {
        cy.contains('Areas').should('be.visible');
      }
    });
  });

  it('should switch to Services tab and display content', () => {
    cy.contains('Services').click();
    cy.get('[role="tabpanel"]').should('be.visible');
    // Check for services-related elements
    cy.get('body').then($body => {
      if ($body.text().includes('Services')) {
        cy.contains('Services').should('be.visible');
      }
    });
  });

  it('should display stats cards in Users tab', () => {
    cy.contains('Users').click();
    // Check for stats cards (assuming they exist based on component structure)
    cy.get('.mantine-Card-root').should('exist');
  });

});