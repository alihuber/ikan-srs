/* globals cy */

describe('display-users-table', () => {
  before(() => {
    cy.resetDatabase();
    cy.seedUsers();
  });

  beforeEach(() => {
    cy.visit('http://localhost:3000/');
  });

  it('should display no users button for normal user', () => {
    cy.contains('Login').click();
    cy.get('input[name=username]').type('testuser');
    cy.get('input[name=password]').type('testuser');
    cy.get('input[type=submit]').click();

    cy.wait(1000);
    cy.url().should('eq', 'http://localhost:3000/dashboard');

    cy.window().then(() => {
      cy.get('a').should('not.contain', 'Users');
    });
  });

  it('should redirect to dashboard when normal user visiting the url', () => {
    cy.contains('Login').click();
    cy.get('input[name=username]').type('testuser');
    cy.get('input[name=password]').type('testuser');
    cy.get('input[type=submit]').click();

    cy.wait(1000);
    cy.url().should('eq', 'http://localhost:3000/dashboard');
    cy.visit('http://localhost:3000/users');

    cy.window().then(() => {
      cy.wait(1000);
      cy.get('div.header').should('not.contain', 'Users');
      cy.get('table').should('not.exist');
      cy.url().should('eq', 'http://localhost:3000/dashboard');
    });
  });

  it('should display a users button for admin user', () => {
    cy.contains('Login').click();
    cy.get('input[name=username]').type('admin');
    cy.get('input[name=password]').type('adminadmin');
    cy.get('input[type=submit]').click();

    cy.url().should('eq', 'http://localhost:3000/');

    cy.window().then(() => {
      cy.get('a').should('contain', 'Users');
    });
  });

  it('should display a users table for admin user', () => {
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
        cy.get('table').should('contain', 'admin');
        cy.get('table').should('contain', 'testuser');
      });
    });
  });
});
