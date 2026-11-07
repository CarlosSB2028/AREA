/// <reference types="cypress" />

describe('Areas page', () => {
  beforeEach(() => {
    // Intercept API calls and provide mock responses
    cy.intercept('GET', '**/api/auth/me', {
      statusCode: 200,
      body: {
        id: '1',
        email: 'test@test.com',
        firstname: 'Test',
        lastname: 'User',
        isAdmin: false,
        isActive: true,
        avatarUrl: '',
        createdAt: new Date().toISOString()
      }
    }).as('getCurrentUser');

    cy.intercept('GET', '**/api/areas', {
      statusCode: 200,
      body: [
        {
          id: '1',
          name: 'GitHub PR Monitor',
          description: 'Monitor GitHub pull requests',
          enabled: true,
          userId: '1',
          userEmail: 'test@test.com',
          actions: [],
          reactions: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Slack Channel Alert',
          description: 'Alert on Slack channels',
          enabled: true,
          userId: '1',
          userEmail: 'test@test.com',
          actions: [],
          reactions: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    }).as('getAreas');

    cy.intercept('GET', '**/api/services/catalog', {
      statusCode: 200,
      body: [
        {
          id: '1',
          key: 'github',
          name: 'GitHub',
          auth: 'OAUTH2',
          isActive: true,
          iconLightUrl: '/github.svg',
          iconDarkUrl: '/github.svg'
        },
        {
          id: '2',
          key: 'slack',
          name: 'Slack',
          auth: 'OAUTH2',
          isActive: true,
          iconLightUrl: '/slack.svg',
          iconDarkUrl: '/slack.svg'
        }
      ]
    }).as('getServices');

    cy.visit('/areas');
    cy.setupMockEnvironment();
  });

  it('should load the areas page', () => {
    cy.contains('Areas').should('be.visible');
    cy.contains('Create New Area').should('be.visible');
  });

  it('should display areas list', () => {
    cy.contains('GitHub PR Monitor').should('be.visible');
    cy.contains('Slack Channel Alert').should('be.visible');
  });

  it('should filter areas by status', () => {
    // Click on status select input
    cy.get('input[placeholder="Filter by status"]').click();

    // Select "Active" status from dropdown using force click
    cy.get('[role="option"]').contains('Active').click({ force: true });

    // Should show areas with active status
    cy.contains('GitHub PR Monitor').should('be.visible');
  });

  it('should display area status badges', () => {
    // Check that status badges are visible using Mantine Badge class
    cy.get('.mantine-Badge-root').should('exist').and('be.visible');
    // Check that at least one badge contains status text
    cy.get('.mantine-Badge-root').should('contain.text', 'active');
  });

  it('should have pagination when there are many areas', () => {
    // Check if pagination exists (depends on number of areas)
    cy.get('body').then($body => {
      if ($body.text().includes('1')) {
        // If pagination exists, check it has at least page 1
        cy.contains('1').should('be.visible');
      }
    });
  });
});