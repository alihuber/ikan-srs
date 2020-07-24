/* globals cy expect */

describe('user settings', () => {
  before(() => {
    cy.resetDatabase();
    cy.seedUsers();
    cy.seedSettings();
  });

  beforeEach(() => {
    cy.visit('http://localhost:3000/');
  });

  it('should save seeded settings', () => {
    cy.contains('Login').click();
    cy.get('input[name=username]').type('testuser');
    cy.get('input[name=password]').type('testuser');
    cy.get('input[type=submit]').click();

    cy.wait(1000);
    cy.url().should('eq', 'http://localhost:3000/decks');

    cy.window().then((win) => {
      // this allows accessing the window object within the browser
      const user = win.Meteor.user();
      expect(user).to.exist;
      expect(user.username).to.equal('testuser');
      cy.contains('Menu').click();
      cy.contains('Settings').click();

      cy.window().then((win2) => {
        cy.url().should('eq', 'http://localhost:3000/settings');
        cy.get('input[type=submit]').click();
        cy.get('body').should('contain', 'Update successful!');
      });
    });
  });
});
