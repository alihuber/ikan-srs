/* globals cy */

describe('create-user', () => {
  before(() => {
    cy.resetDatabase();
    cy.seedUsers();
  });

  beforeEach(() => {
    cy.visit('http://localhost:3000/');
  });

  it('should create an user and display it', () => {
    cy.contains('Login').click();
    cy.get('input[name=username]').type('admin');
    cy.get('input[name=password]').type('adminadmin');
    cy.get('button[type=submit]').click();

    cy.url().should('eq', 'http://localhost:3000/');

    cy.window().then(() => {
      cy.get('button[name=usersButton]').click();

      cy.window().then(() => {
        cy.url().should('eq', 'http://localhost:3000/users');
        cy.get('table').should('contain', 'admin');
        cy.get('table').should('contain', 'testuser');
        cy.get('button[name="addUserButton"]').click();
        cy.get('#uniforms-0001-0001').type('newuser');
        cy.get('input[name=password]').type('newpassword');
        cy.get('input[name=admin]').click();
        cy.get('button[type=submit]').click();
        cy.get('table').should('contain', 'newuser');
        // 2 checkmarks for admin and 6 button icons
        cy.get('table')
          .find('svg')
          .should('have.length', 8);
      });
    });
  });
});
