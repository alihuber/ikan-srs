/* globals cy */

describe('paginate-users-table-more-than-10-users', () => {
  before(() => {
    cy.resetDatabase();
    cy.seedUsers();
    cy.seedPaginateUsers();
  });

  beforeEach(() => {
    cy.visit('http://localhost:3000/');
  });

  it('does paginate', () => {
    cy.contains('Login').click();
    cy.get('input[name=username]').type('admin');
    cy.get('input[name=password]').type('adminadmin');
    cy.get('input[type=submit]').click();

    cy.url().should('eq', 'http://localhost:3000/');

    cy.window().then(() => {
      cy.get('a[itemname=usersButton]').click();

      cy.window().then(() => {
        cy.url().should('eq', 'http://localhost:3000/users');
        cy.get('div.header').should('contain', 'Users');
        cy.get('table').should('contain', 'testuser');
        cy.get('a[type="nextItem"]').click();
        cy.wait(1000);
        cy.get('table').should('not.contain', 'testuser');
      });
    });
  });
});
