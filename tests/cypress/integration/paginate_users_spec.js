/* globals cy */

describe('paginate-users-table-less-than-5-users', () => {
  before(() => {
    cy.resetDatabase();
    cy.seedUsers();
  });

  beforeEach(() => {
    cy.visit('http://localhost:3000/');
  });

  it('does not paginate', () => {
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
        cy.get('a[itemname="prevButton"]').should('have.class', 'disabled');
        cy.get('a[itemname="nextButton"]').should('have.class', 'disabled');
        cy.get('a[itemname="pageButton_0"]').should('have.class', 'disabled');
      });
    });
  });
});

describe('paginate-users-table-more-than-5-users', () => {
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
        cy.get('a[itemname="prevButton"]').should('have.class', 'disabled');
        cy.get('a[itemname="nextButton"]').should('not.have.class', 'disabled');
        cy.get('a[itemname="pageButton_0"]').should('have.class', 'disabled');
        cy.get('a[itemname="pageButton_1"]').should('not.have.class', 'disabled');
        cy.get('table').should('contain', 'testuser');

        cy.get('a[itemname="pageButton_1"]').click();
        cy.get('a[itemname="prevButton"]').should('not.have.class', 'disabled');
        cy.get('a[itemname="nextButton"]').should('have.class', 'disabled');
        cy.get('a[itemname="pageButton_0"]').should('not.have.class', 'disabled');
        cy.get('a[itemname="pageButton_1"]').should('have.class', 'disabled');
        cy.get('table').should('not.contain', 'testuser');
      });
    });
  });
});
