describe('Home page', () => {
  beforeEach(() => {
    // Mock the services catalog API call
    cy.intercept('GET', '/api/services/catalog', {
      statusCode: 200,
      body: [
        {
          id: '1',
          key: 'github',
          name: 'GitHub',
          auth: 'NONE',
          isActive: true,
          iconLightUrl: '/github-logo.svg',
          iconDarkUrl: '/github-logo.svg'
        },
        {
          id: '2',
          key: 'google',
          name: 'Google',
          auth: 'NONE',
          isActive: true,
          iconLightUrl: '/google-logo.svg',
          iconDarkUrl: '/google-logo.svg'
        }
      ]
    }).as('getServices');
  });

  it('should load the home page', () => {
    cy.visit('/');
    cy.contains('Welcome to AREA').should('be.visible');
  });

  it('should display the hero banner with description and button', () => {
    cy.visit('/');
    cy.contains('Automate your tasks with custom applets').should('be.visible');
    cy.contains('Get Started').should('be.visible');
  });

  it('should display the features cards', () => {
    cy.visit('/');
    cy.contains('Automate your workflow').should('be.visible');
    cy.contains('Privacy focused').should('be.visible');
    cy.contains('Real-time synchronization').should('be.visible');
  });
});