import { URLS, CREDENTIALS } from '../../../../support/constants';

/*
TODO
- test visiting links from the sidebar:
  - images
  - relations
  - details
*/

const credentials = CREDENTIALS.USER;
const otherCredentials = CREDENTIALS.OTHER_USER;

const getSideBarNavigationAction = function (label) {
  return cy.getSideBar()
    .find(`ul li a:contains(${label})`);
};

before(function () {
  cy.resetDb();

  cy.register(credentials);
  cy.register(otherCredentials);
});

beforeEach(function () {
  cy.home();
});

describe('user page sidebar navigation', function () {
  
  describe('logged in', function () {
    const username = credentials.username;
    const otherUsername = otherCredentials.username;

    beforeEach(function () {
      // login
      cy.dispatchLogin(credentials);
    });

    describe('own user page', function () {
      beforeEach(function () {
        cy.visitUser(username);
      });

      describe('settings', function () {
        it('is displayed', function () {
          getSideBarNavigationAction('Settings');
        });

        it('can navigate to user settings', function () {
          getSideBarNavigationAction('Settings').click();

          cy.expectUrl(`${URLS.getUserUrl(username)}/settings`);
        });
      });
    });

    describe('other user page', function () {
      beforeEach(function () {
        cy.visitUser(otherUsername);
      });

      describe('settings', function () {
        it('is not displayed', function () {
          getSideBarNavigationAction('Settings').should('not.exist');
        });
    
        it('can not navigate to user settings', function () {
          cy.visit(`${URLS.getUserUrl(otherUsername)}/settings`);
    
          // do not allow user to visit other users settings page
          cy.expectUrl(URLS.FALLBACK_URL);
        });
      });
    });
  });
});
