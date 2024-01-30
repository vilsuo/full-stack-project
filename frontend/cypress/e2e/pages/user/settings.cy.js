import { URLS, CREDENTIALS } from '../../../support/constants';

const credentials = CREDENTIALS.USER;
const otherCredentials = CREDENTIALS.OTHER_USER;

const getSettingsUrl = function (username) {
  return `${URLS.getUserUrl(username)}/settings`;
};

before(function () {
  cy.resetDb();

  cy.register(credentials);
  cy.register(otherCredentials);
});

beforeEach(function () {
  cy.home();
});

describe('visiting user settings page', function () {
  const username = credentials.username;
  const otherUsername = otherCredentials.username;

  describe('not logged in', function () {
    beforeEach(function () {
      cy.visit(getSettingsUrl(username));
    });

    it('can not visit the page', function () {
      // do not allow user to visit other users settings page
      cy.expectUrl(URLS.FALLBACK_URL);

      cy.getUserSubPageHeading('Settings')
        .should('not.exist');
    });
  });

  describe('logged in', function () {
    beforeEach(function () {
      cy.dispatchLogin(credentials);
    });

    describe('own settings page', function () {
      beforeEach(function () {
        cy.visit(getSettingsUrl(username));
      });

      it('can visit the page', function () {
        cy.getUserSubPageHeading('Settings');

        cy.expectUrl(getSettingsUrl(username));
      });
    });

    describe('other user settings page', function () {
      beforeEach(function () {
        cy.visit(getSettingsUrl(otherUsername));
      });

      it('can not visit the page', function () {
        // do not allow user to visit other users settings page
        cy.expectUrl(URLS.FALLBACK_URL);

        cy.getUserSubPageHeading('Settings')
          .should('not.exist');
      });
    });
  });
});

describe.only('on users own settings page', function () {
  const username = credentials.username;

  beforeEach(function () {
    cy.dispatchLogin(credentials);
    cy.visit(getSettingsUrl(username));
  });

  it('Settings header is present', function () {
    cy.getUserSubPageHeading('Settings');
  });
});