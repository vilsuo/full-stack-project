import { URLS } from '../support/constants';

/*
TODO
- test pagination
- test results per page
*/

const credentials = { name: 'ville', username: 'ville123', password: 'qwerty123' };
const otherCredentials = { name: 'matti', username: 'matti123', password: 'fghjkl789' };
const disabledCredentials = { name: 'katti', username: 'katti123', password: 'asdjkl123' };

const getResetButton = function () {
  return cy.get(".search-form button[type='button']");
};

const getSearchInput = function () {
  return cy.get(".search-form input[type='text']");
};

const search = function (value) {
  // type text into search input
  if (value) getSearchInput().type(value);

  // click search button
  cy.get(".search-form button[type='submit']").click();

  // wait for loading spinner to disappear
  cy.get('.search-results .spinner').should('not.exist');
};

const getSearchResultsTable = function () {
  return cy.get('table');
};

const getSearchResultsTableRows = function () {
  return getSearchResultsTable().find('tbody').children();
};

describe('on search page', function () {
  beforeEach(function () {
    cy.resetDb();
    cy.visit(URLS.SEARCH_URL);
  });

  describe('before searching', function () {
    it('search form is present', function () {
      cy.get('.search-form');
    });

    it('search results table is not present', function () {
      cy.get('.search-form');
      getSearchResultsTable().should('not.exist');
    });

    it('can reset search input', function () {
      // search input is empty => reset button is disabled
      getResetButton().should('be.disabled');

      const string = 'cat';
      getSearchInput().type(string);
      getSearchInput().should('have.value', string);

      getResetButton().click();

      getSearchInput().should('have.value', '');
    });
  });

  describe('after searching', function () {
    it('the given search query is displayed', function () {
      const query = 'cat';
      search(query);

      cy.get('.search-results').should('contain', query);
    });

    describe('without any registed users', function () {
      it('without a query, users table is empty', function () {
        search();

        getSearchResultsTableRows()
          .should('have.length', 0);
      });

      it('with a query, users table is empty', function () {
        const query = 'cat';
        search(query);

        getSearchResultsTableRows()
          .should('have.length', 0);
      });
    });
  
    describe('with registered users', function () {
      
      beforeEach(function () {
        cy.register(credentials);
        cy.register(otherCredentials);
        cy.register(disabledCredentials, { disabled: true });
      });

      it('without a query table displays only non-disabled users', function () {
        search();

        getSearchResultsTableRows()
          .should('have.length', 2)
          .should('contain', credentials.username)
          .should('contain', otherCredentials.username)
          .should('not.contain', disabledCredentials.username);
      });

      it('with a query of user username, the table displays the user', function () {
        const username = credentials.username;
        search(username);

        getSearchResultsTableRows()
          .should('have.length', 1)
          .should('contain', username);
      });

      it('with a query of disabled user username, the table does not display the user', function () {
        const username = disabledCredentials.username;
        search(username);

        getSearchResultsTableRows()
          .should('have.length', 0);
      });

      it('searching with a bad query, the table is empty', function () {
        const badQuery = 'asdiasfhafphafph';
        search(badQuery);

        getSearchResultsTableRows()
          .should('have.length', 0);
      });

      it('can navigate to users page from the table', function () {
        const username = credentials.username;
        search(username);

        getSearchResultsTableRows()
          .should('contain', username).click();

        cy.expectUrl(URLS.getUserUrl(username));
      });
    });
  });
});