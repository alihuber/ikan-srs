/* globals Cypress cy */
Cypress.Commands.add('resetDatabase', () =>
  cy.exec(
    '~/mongodb4/bin/mongo mongodb://localhost:3001/meteor --eval "db.dropDatabase()"'
  )
);

Cypress.Commands.add('seedUsers', () =>
  cy.exec(
    `~/mongodb4/bin/mongo mongodb://localhost:3001/meteor ./${process.cwd()}tests/cypress/support/seedUsers`
  )
);

Cypress.Commands.add('seedSettings', () =>
  cy.exec(
    `~/mongodb4/bin/mongo mongodb://localhost:3001/meteor ./${process.cwd()}tests/cypress/support/seedSettings`
  )
);

Cypress.Commands.add('seedPaginateUsers', () =>
  cy.exec(
    `~/mongodb4/bin/mongo mongodb://localhost:3001/meteor ./${process.cwd()}tests/cypress/support/seedPaginateUsers`
  )
);
