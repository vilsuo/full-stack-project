import { URLS, CREDENTIALS } from '../support/constants';

const userCredentials = CREDENTIALS.USER;

before(function () {
  cy.resetDb();

  cy.register(userCredentials);
});

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
        cy.getNavBarLink(label)
          .click();

        cy.expectUrl(url);
      });
    });

    it('user menu is not present', function () {
      cy.getNavBarUserButton().should('not.exist');
    });

    describe('when logged in', function () {

      beforeEach(function () {
        cy.dispatchLogin(userCredentials);
      });

      it('can open navigation bar dropdown menu', function () {
        // test it is not open
        cy.getNavBarUserDropDownMenu().should('not.exist');

        cy.getNavBarUserButton()
          .click();

        // test it is open
        cy.getNavBarUserDropDownMenu();
      });

      describe('when navigation bar user dropdown menu is open', function () {
        beforeEach(function () {
          cy.getNavBarUserButton()
            .click();
        });

        [
          { label: 'Settings', url: `${URLS.getUserUrl(userCredentials.username)}/settings` },
          { label: 'Profile', url: URLS.getUserUrl(userCredentials.username) },
        ].forEach(function ({ label, url }) {
          it(`can navigate to user ${label} page`, function () {
            cy.getNavBarUserDropDownMenuOption(label)
              .click();
  
            cy.expectUrl(url);

            // navigation bar user dropdown menu is closed after navigating
            cy.getNavBarUserDropDownMenu().should('not.exist');
          });
        });
  
        it('Logout option is available', function () {
          cy.getNavBarUserDropDownMenuOption('Logout');
        });

        it('can close navigation bar user dropdown menu without navigating', function () {
          // it should not matter where to click, it should always close the dropdown
          cy.getNavBarUserButton()
            .click();

          cy.getNavBarUserDropDownMenu().should('not.exist');

          cy.expectUrl(URLS.HOME_URL);
        });
      });
    });
  });
});