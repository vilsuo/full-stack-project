
const PORT = 5173;
const BASE_URL = `http://localhost:${PORT}/#/`;

describe('Fullstack project', () => {
  it('frontpage can be opened', () => {
    cy.visit(BASE_URL);

    cy.contains('Home page');
  })
})