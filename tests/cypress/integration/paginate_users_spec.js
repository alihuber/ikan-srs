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
      cy.get('a[itemName=usersButton]').click();

      cy.window().then(() => {
        cy.url().should('eq', 'http://localhost:3000/users');
        cy.get('h2').should('contain', 'Users');
        cy.get('a[itemName="prevButton"]').should('have.class', 'disabled');
        cy.get('a[itemName="nextButton"]').should('have.class', 'disabled');
        cy.get('a[itemName="pageButton_0"]').should('have.class', 'disabled');
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
      cy.get('a[itemName=usersButton]').click();

      cy.window().then(() => {
        cy.url().should('eq', 'http://localhost:3000/users');
        cy.get('h2').should('contain', 'Users');
        cy.get('a[itemName="prevButton"]').should('have.class', 'disabled');
        cy.get('a[itemName="nextButton"]').should('not.have.class', 'disabled');
        cy.get('a[itemName="pageButton_0"]').should('have.class', 'disabled');
        cy.get('a[itemName="pageButton_1"]').should('not.have.class', 'disabled');
        cy.get('table').should('contain', 'testuser');

        cy.get('a[itemName="pageButton_1"]').click();
        cy.get('a[itemName="prevButton"]').should('not.have.class', 'disabled');
        cy.get('a[itemName="nextButton"]').should('have.class', 'disabled');
        cy.get('a[itemName="pageButton_0"]').should('not.have.class', 'disabled');
        cy.get('a[itemName="pageButton_1"]').should('have.class', 'disabled');
        cy.get('table').should('not.contain', 'testuser');
      });
    });
  });
});
