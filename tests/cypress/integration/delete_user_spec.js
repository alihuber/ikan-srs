/* globals cy expect */

describe('delete-user', () => {
  before(() => {
    cy.resetDatabase();
    cy.seedUsers();
  });

  beforeEach(() => {
    cy.visit('http://localhost:3000/');
  });

  it('should update an user', () => {
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
        cy.get('button[name=deleteUser_ryfEzeGqzRvW7FbL5').click();
        cy.get('table').should('not.contain', 'testuser');
        // 3 icons per row + 4 pagination icons
        cy.get('table')
          .find('svg')
          .should('have.length', 7);
      });
    });
  });
});
