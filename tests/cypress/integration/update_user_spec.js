/* globals cy expect */

describe('update-user', () => {
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
        cy.get('button[name=editUser_ryfEzeGqzRvW7FbL5').click();

        cy.get(':nth-child(1) > .col-xs-12 > .MuiFormControl-root-123 > .MuiInputBase-root-140 > .MuiInputBase-input-150')
          .clear()
          .type('newuser');
        cy.get('input[name=password]').type('newpassword');
        cy.get('input[name=admin]').click();
        cy.get('button[name="updateUserButton"]').click();

        cy.get('table').should('not.contain', 'testuser');
        cy.get('table').should('contain', 'newuser');
        // 2 checkmarks for admin and 4 button icons
        cy.get('table')
          .find('svg')
          .should('have.length', 6);

        // login with updated user
        cy.get('button[name="logoutButton"]').click();
        cy.window().then(() => {
          cy.url().should('eq', 'http://localhost:3000/');

          cy.window().then(() => {
            cy.get('a[name="loginButton"]').click();
            cy.url().should('eq', 'http://localhost:3000/login');
            cy.get('input[name=username]').type('newuser');
            cy.get('input[name=password]').type('newpassword');
            cy.get('button[type=submit]').click();

            cy.url().should('eq', 'http://localhost:3000/');

            cy.window().then((win) => {
              const user = win.Meteor.user();
              expect(user).to.exist;
              expect(user.username).to.equal('newuser');
            });
          });
        });
      });
    });
  });
});
