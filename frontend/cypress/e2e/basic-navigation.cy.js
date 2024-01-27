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
      { label: 'Search', url: URLS.SEARCH_URL },
      { label: 'About', url: URLS.ABOUT_URL },
      { label: 'Login', url: URLS.LOGIN_URL },
    ].forEach(function ({ label, url }) {
      it(`can navigate to ${label} page`, function () {
        cy.getNavBar()
          .find(`a:contains(${label})`)
          .click();

        cy.expectUrl(url);
      });
    });
  });
});