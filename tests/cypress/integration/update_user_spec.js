/* globals cy expect */

describe('update-user', () => {
  beforeEach(() => {
    cy.resetDatabase();
    cy.seedUsers();
    cy.visit('http://localhost:3000/');
  });

  it('should update an user, omitting password', () => {
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
        cy.get('button[name=editUser_ryfEzeGqzRvW7FbL5').click();

        cy.get('input[name=username]').clear().type('newuser');
        cy.get('input[type=submit]').click();

        cy.get('table').should('not.contain', 'testuser');
        cy.get('table').should('contain', 'newuser');
        // header tr, footer tr and 2 users
        cy.get('table').find('tr').should('have.length', 4);

        // login with updated username
        cy.get('a[itemname="logoutButton"]').click();
        cy.window().then(() => {
          cy.url().should('eq', 'http://localhost:3000/');

          cy.window().then(() => {
            cy.get('a[itemname="loginButton"]').click();
            cy.url().should('eq', 'http://localhost:3000/login');
            cy.get('input[name=username]').type('newuser');
            cy.get('input[name=password]').type('testuser');
            cy.get('input[type=submit]').click();

            cy.url().should('eq', 'http://localhost:3000/dashboard');

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

  it('should update an user with new password', () => {
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
        cy.get('button[name=editUser_ryfEzeGqzRvW7FbL5').click();

        cy.get('input[name=username]').clear().type('newuser');
        cy.get('input[name=password]').type('newpassword');
        cy.get('div.checkbox').click();
        cy.get('input[type=submit]').click();

        cy.get('table').should('not.contain', 'testuser');
        cy.get('table').should('contain', 'newuser');
        // header tr, footer tr and 2 users
        cy.get('table').find('tr').should('have.length', 4);

        // login with updated user
        cy.get('a[itemname="logoutButton"]').click();
        cy.window().then(() => {
          cy.url().should('eq', 'http://localhost:3000/');

          cy.window().then(() => {
            cy.get('a[itemname="loginButton"]').click();
            cy.url().should('eq', 'http://localhost:3000/login');
            cy.get('input[name=username]').type('newuser');
            cy.get('input[name=password]').type('newpassword');
            cy.get('input[type=submit]').click();

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
