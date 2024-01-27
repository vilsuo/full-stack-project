import { URLS } from '../support/constants';

describe('', function () {
  it('can visit Home page', function () {
    cy.visit(URLS.HOME_URL);
  });

  describe('from the Home page', function () {
    beforeEach(function () {
      cy.visit(URLS.HOME_URL);
    });

    [
      { name: 'Search', url: URLS.SEARCH_URL },
      { name: 'About', url: URLS.ABOUT_URL },
      { name: 'Login', url: URLS.LOGIN_URL },
    ].forEach(function ({ name, url }) {
      it(`can navigate to ${name} page`, function () {
        cy.getNavBar()
          .find(`a:contains(${name})`)
          .click();

        cy.expectUrl(url);
      });
    });
  });
});