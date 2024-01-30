import { URLS, CREDENTIALS } from '../../../../support/constants';

const credentials = CREDENTIALS.USER;
const otherCredentials = CREDENTIALS.OTHER_USER;

const getSideBarNavigationAction = function (label) {
  return cy.getSideBar()
    .find(`ul li a:contains(${label})`);
};

const testPublicNavigations = function (username) {
  const PUBLIC_ROUTES = [
    { label: 'Images',    url: `${URLS.getUserUrl(username)}/images` },
    { label: 'Relations', url: `${URLS.getUserUrl(username)}/relations` },
    { label: 'Details',   url: `${URLS.getUserUrl(username)}/details` },
  ];

  describe('public navigations', function () {
    PUBLIC_ROUTES.forEach(function ({ label, url }) {
      describe(label, function() {
        it('is displayed', function () {
          getSideBarNavigationAction(label);
        });

        it(`can navigate to user ${label}`, function () {
          getSideBarNavigationAction(label)
            .click();

          cy.expectUrl(url);

          cy.getUserSubPageHeading(label);

          // sidebar navigation link is active
          getSideBarNavigationAction(label)
            .should('have.class', 'active');
        });
      });
    });
  });
};

const getPrivateRoutes = function (username) {
  return [
    { label: 'Settings', url: `${URLS.getUserUrl(username)}/settings` },
  ];
};

const testPrivateNavigationsNotAllowed = function (username) {
  describe('private navigations', function () {
    getPrivateRoutes(username)
      .forEach(function ({ label, url }) {
        describe(label, function() {
          it('is not displayed', function () {
            getSideBarNavigationAction(label)
              .should('not.exist');
          });
        });
      });
  });
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
  const username = credentials.username;
  const otherUsername = otherCredentials.username;

  describe('not logged in', function () {
    beforeEach(function () {
      cy.visitUser(username);
    });

    testPublicNavigations(username);

    testPrivateNavigationsNotAllowed(username);
  });

  describe('logged in', function () {
    beforeEach(function () {
      cy.dispatchLogin(credentials);
    });

    describe('own user page', function () {
      beforeEach(function () {
        cy.visitUser(username);
      });

      testPublicNavigations(username);

      describe('private navigations', function () {
        getPrivateRoutes(username)
          .forEach(function ({ label, url }) {
            describe(label, function() {
              it('is displayed', function () {
                getSideBarNavigationAction(label);
              });
      
              it(`can navigate to user ${label}`, function () {
                getSideBarNavigationAction(label).click();
      
                cy.expectUrl(url);
    
                cy.getUserSubPageHeading(label);

                // sidebar navigation link is active
                getSideBarNavigationAction(label)
                  .should('have.class', 'active');
              });
            });
          });
      });
    });

    describe('other user page', function () {
      beforeEach(function () {
        cy.visitUser(otherUsername);
      });

      testPublicNavigations(otherUsername);

      testPrivateNavigationsNotAllowed(otherUsername);
    });
  });
});
