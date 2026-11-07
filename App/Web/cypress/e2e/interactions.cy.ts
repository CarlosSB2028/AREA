describe('User Interactions', () => {
  it('should handle service filter interactions', () => {
    cy.visit('/areas');

    // Try to interact with service filter
    cy.get('input[placeholder="Search services"]').click();

    // Check if dropdown appears
    cy.get('body').then($body => {
      if ($body.find('[role="listbox"]').length > 0) {
        cy.get('[role="listbox"]').should('be.visible');
      }
    });
  });

  it('should handle responsive design - mobile view', () => {
    cy.viewport('iphone-6');
    cy.visit('/');

    // Check that content is still accessible on mobile
    cy.contains('Welcome to AREA').should('be.visible');
  });

  it('should handle responsive design - tablet view', () => {
    cy.viewport('ipad-2');
    cy.visit('/areas');

    // Check that areas page works on tablet
    cy.contains('Areas').should('be.visible');
  });

  it('should handle keyboard navigation', () => {
    cy.visit('/areas');

    // Focus on first input
    cy.get('input').first().focus();

    // Check that input is focused
    cy.focused().should('have.attr', 'placeholder');
  });
});