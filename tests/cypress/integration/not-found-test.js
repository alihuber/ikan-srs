/* globals cy */

describe('not found page', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/asdf');
  });

  it('should display not found', () => {
    cy.window().then((win) => {
      cy.url().should('eq', 'http://localhost:3000/asdf');
      cy.get('h3').should('contain', '404');
    });
  });
});
