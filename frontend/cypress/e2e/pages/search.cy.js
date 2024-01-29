import { CREDENTIALS, URLS } from '../../support/constants';

/*
TODO
- test pagination
- test results per page
*/

const credentials = CREDENTIALS.USER;
const otherCredentials = CREDENTIALS.OTHER_USER;
const disabledCredentials = CREDENTIALS.DISABLED_USER;

const PAGE_SIZES = [
  { value: '5', size: 5 },
  { value: '10', size: 10 },
  { value: '25', size: 25 },
];

const selectPageSize = function (size) {
  cy.get(".radio-group input[type='radio']")
    .check(size);
};

const getSelectedPageSizeWithValue = function (value) {
  return cy.get(".radio-group input[type='radio']:checked")
    .should('have.attr', 'value', value);
};

const getResetButton = function () {
  return cy.get(".search-form button[type='button']");
};

const getSearchInput = function () {
  return cy.get(".search-form input[type='text']");
};

const search = function (value) {
  // type text into search input
  if (value) getSearchInput().type(value);

  cy.intercept('/api/users?*').as('getUsers');

  // click search button
  cy.get(".search-form button[type='submit']").click();

  cy.waitForResponse('getUsers');
  cy.waitForSpinners();
};

const getSearchResultsTable = function () {
  return cy.get('table');
};

const getSearchResultsTableRows = function () {
  return getSearchResultsTable().find('tbody').children();
};

// #########################
// #         TESTS         #
// #########################

// before hook is equivalent to beforeAll
before(function () {
  cy.resetDb();
});

beforeEach(function () {
  cy.visit(URLS.SEARCH_URL);
});

describe('search form and search info', function () {
  it('search form is present', function () {
    cy.get('.search-form');
  });

  it('search results table is not present', function () {
    cy.get('.search-form');

    getSearchResultsTable().should('not.exist');
  });

  it('can reset the search input when the input is not empty', function () {
    const string = 'cat';

    // without a search input the reset button is disabled
    getResetButton().should('be.disabled');

    getSearchInput().type(string);
    getSearchInput().should('have.value', string);

    getResetButton().click();

    // search input should be resetted
    getSearchInput().should('have.value', '');
  });

  describe('selecting page sizes', function () {
    PAGE_SIZES.forEach(function ({ value, size }) {
      it(`can select page size ${size}`, function () {
        selectPageSize(value);
  
        getSelectedPageSizeWithValue(value);
      });
    });
  });

  describe('after searching', function () {
    const query = 'Hello from Cypress!';

    beforeEach(function () {
      search(query);
    });

    it('the results table is displayed', function () {
      getSearchResultsTable();
    });

    it('the pagination navigation is displayed', function () {
      getPaginationNav();
    });

    describe('the search info', function () {
      it('displays the search query', function () {
        cy.get('.search-results').should('contain', query);
      });
  
      it('displays the search time', function () {
        cy.get('.search-results > span:last-of-type')
          .then(function (span) {
            const text = span.text();
            expect(text).to.match(/Time \d+ ms.$/);
          });
      });
    });
  });
});

describe('search table', function () {
  describe('without any registed users', function () {
    it('without a query, users table is empty', function () {
      search();

      getSearchResultsTableRows()
        .should('have.length', 0);
    });

    it('with a query, users table is empty', function () {
      const query = 'Hello from Cypress!';
      search(query);

      getSearchResultsTableRows()
        .should('have.length', 0);
    });
  });

  describe('with registered users', function () {
    before(function () {
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

      // no results
      getSearchResultsTableRows().should('have.length', 0);
    });

    it('searching with a bad query, the table is empty', function () {
      const badQuery = 'asdiasfhafphafph';
      search(badQuery);

      // no results
      getSearchResultsTableRows().should('have.length', 0);
    });

    describe('navigation', function () {
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

const getPaginationNav = function () {
  return cy.get('.search-results .pagination-nav');
};

const expectCurrentPageToBe = function (page) {
  getPaginationNav()
    .find('span')
    .then(function($span) {
      const text = $span.text();

      expect(text).to.match(new RegExp(`^${page}\/\\d+$`));
    });
};

const expectLastPageToBe = function (page) {
  getPaginationNav()
    .find('span')
    .then(function($span) {
      const text = $span.text();

      expect(text).to.match(new RegExp(`^\\d+\/${page}$`));
    });
};

const NAVIGATION_BUTTONS = {
  FIRST: { description: 'first', index: 1 },
  PREVIOUS: { description: 'previous', index: 2 },
  NEXT: { description: 'next', index: 3 },
  LAST:{ description: 'last', index: 4 },
};

const getPaginationPageButton = function (index) {
  return getPaginationNav()
    .find(`> button:nth-of-type(${index})`);
};

const clickPaginationPageButton = function (index) {
  cy.intercept('/api/users?*')
    .as('getUsers');

  getPaginationPageButton(index)
    .click();

  cy.waitForResponse('getUsers');
  cy.waitForSpinners();
};

describe('search table pagination', function () {
  // when searching with the 'prefix', there are 'total' matches
  const total = 11;
  const prefix = 'test';

  // create many users
  before(function () {
    [ ...Array(total).keys() ].forEach(function (n) {
      cy.register({
        name:     `${prefix}_name_${n}`, 
        username: `${prefix}_username_${n}`, 
        password: 'random123'
      });
    });
  });

  describe(`searching when there are ${total} total results`, function () {
    const initialPage = 1;

    [
      PAGE_SIZES[0], 
      PAGE_SIZES[1]
    ].forEach(function ({ value, size }) {
      const lastPage = Math.ceil(total / size);

      describe(`when page size is ${size}`, function () {
        beforeEach(function () {
          selectPageSize(value);
  
          search(prefix);
        });

        describe('on first page', function () {
          const page = initialPage;
          const rows = Math.min(total, size);

          it(`the page number is ${page}`, function () {
            expectCurrentPageToBe(page);
          });
  
          it(`there are ${lastPage} pages`, function () {
            expectLastPageToBe(lastPage);
          });
  
          it(`contains ${rows} rows`, function () {
            getSearchResultsTableRows()
              .should('have.length', rows);
          });
  
          [ 
            NAVIGATION_BUTTONS.FIRST, 
            NAVIGATION_BUTTONS.PREVIOUS 
          ].forEach(function ({ description, index }) {
            it(`can not navigate to ${description} page`, function () {
              getPaginationPageButton(index).should('be.disabled');
            });
          });
  
          [
            { targetButton: NAVIGATION_BUTTONS.NEXT, targetPage: page + 1 }, 
            { targetButton: NAVIGATION_BUTTONS.LAST, targetPage: lastPage }
          ].forEach(function ({ targetButton: { description, index }, targetPage }) {
            it(`can navigate to ${description} page`, function () {
              clickPaginationPageButton(index);
  
              expectCurrentPageToBe(targetPage);
            });
          });
        });

        describe('on next page', function () {
          const page = initialPage + 1;
          const rows = Math.min(total - size, size);
  
          beforeEach(function () {
            clickPaginationPageButton(NAVIGATION_BUTTONS.NEXT.index);
          });
  
          it(`the page number is ${page}`, function () {
            expectCurrentPageToBe(page);
          });
  
          it(`there are ${lastPage} pages`, function () {
            expectLastPageToBe(lastPage);
          });
  
          it(`contains ${rows} rows`, function () {
            getSearchResultsTableRows()
              .should('have.length', rows);
          });
  
          [
            { targetButton: NAVIGATION_BUTTONS.FIRST,    targetPage: initialPage }, 
            { targetButton: NAVIGATION_BUTTONS.PREVIOUS, targetPage: page - 1 }, 
          ].forEach(function ({ targetButton: { description, index }, targetPage }) {
            it(`can navigate to ${description} page`, function () {
              clickPaginationPageButton(index);
  
              expectCurrentPageToBe(targetPage);
            });
          });

          [
            { targetButton: NAVIGATION_BUTTONS.NEXT, targetPage: page + 1 }, 
            { targetButton: NAVIGATION_BUTTONS.LAST, targetPage: lastPage }
          ].forEach(function ({ targetButton: { description, index }, targetPage }) {
            if (size === PAGE_SIZES[0].size) {
              it(`can navigate to ${description} page`, function () {
                clickPaginationPageButton(index);
    
                expectCurrentPageToBe(targetPage);
              });

            } else { 
              it(`can not navigate to ${description} page`, function () {
                getPaginationPageButton(index).should('be.disabled');
              });
            }
          });
        });

        describe('on last page', function () {
          const page = lastPage;
          const rows = total - (lastPage - 1) * size;
  
          beforeEach(function () {
            clickPaginationPageButton(NAVIGATION_BUTTONS.LAST.index);
          });
  
          it(`the page number is ${page}`, function () {
            expectCurrentPageToBe(page);
          });
  
          it(`there are ${lastPage} pages`, function () {
            expectLastPageToBe(lastPage);
          });
  
          it(`contains ${rows} rows`, function () {
            getSearchResultsTableRows()
              .should('have.length', rows);
          });
  
          [
            { targetButton: NAVIGATION_BUTTONS.FIRST,    targetPage: initialPage }, 
            { targetButton: NAVIGATION_BUTTONS.PREVIOUS, targetPage: page - 1 }, 
          ].forEach(function ({ targetButton: { description, index }, targetPage }) {
            it(`can navigate to ${description} page`, function () {
              clickPaginationPageButton(index);
  
              expectCurrentPageToBe(targetPage);
            });
          });
          
          [ 
            NAVIGATION_BUTTONS.NEXT, 
            NAVIGATION_BUTTONS.LAST 
          ].forEach(function ({ description, index }) {
            it(`can not navigate to ${description} page`, function () {
              getPaginationPageButton(index).should('be.disabled');
            });
          });
        });
      });
    });

    describe(`when page size is ${PAGE_SIZES[2].value}`, function () {
      const { value, size } = PAGE_SIZES[2];
      const lastPage = Math.ceil(total / size);

      beforeEach(function () {
        selectPageSize(value);

        search(prefix);
      });

      describe('on first page', function () {
        const page = initialPage;
        const rows = Math.min(total, size);

        it(`the page number is ${page}`, function () {
          expectCurrentPageToBe(page);
        });

        it(`there are ${lastPage} pages`, function () {
          expectLastPageToBe(lastPage);
        });

        it(`contains ${rows} rows`, function () {
          getSearchResultsTableRows()
            .should('have.length', rows);
        });

        Object.keys(NAVIGATION_BUTTONS).forEach(function (key) {
          const description = NAVIGATION_BUTTONS[key].description;
          const index = NAVIGATION_BUTTONS[key].index;
          
          it(`can not navigate to ${description} page`, function () {
            getPaginationPageButton(index).should('be.disabled');
          });
        });
      });
    });
  });
});