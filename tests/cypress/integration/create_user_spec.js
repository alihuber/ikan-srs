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
    cy.get('input[type=submit]').click();

    cy.url().should('eq', 'http://localhost:3000/');

    cy.window().then(() => {
      cy.get('a[itemname=usersButton]').click();

      cy.window().then(() => {
        cy.url().should('eq', 'http://localhost:3000/users');
        cy.get('table').should('contain', 'admin');
        cy.get('table').should('contain', 'testuser');
        cy.get('button[name="addUserButton"]').click();
        cy.get('input[name=username]').type('newuser');
        cy.get('input[name=password]').type('newpassword');
        cy.get('div.checkbox').click();
        cy.get('input[type=submit]').click();
        cy.get('table').should('contain', 'newuser');
        // header tr, footer tr and 3 users
        cy.get('table').find('tr').should('have.length', 5);
      });
    });
  });
});
