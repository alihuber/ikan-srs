/* globals cy expect */

describe('login-logout-user', () => {
  before(() => {
    cy.resetDatabase();
    cy.seedUsers();
  });

  beforeEach(() => {
    cy.visit('http://localhost:3000/');
  });

  it('should login and logout the user', () => {
    cy.contains('Login').click();
    cy.get('input[name=username]').type('testuser');
    cy.get('input[name=password]').type('testuser');
    cy.get('input[type=submit]').click();

    cy.url().should('eq', 'http://localhost:3000/decks');

    cy.window().then((win) => {
      // this allows accessing the window object within the browser
      const user = win.Meteor.user();
      expect(user).to.exist;
      expect(user.username).to.equal('testuser');
      cy.contains('Menu').click();
      cy.contains('Logout').click();

      cy.wait(1000);
      cy.window().then((win2) => {
        cy.url().should('eq', 'http://localhost:3000/');
        const user2 = win2.Meteor.user();
        expect(user2).to.not.exist;
      });
    });
  });
});
