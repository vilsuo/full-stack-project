import { COOKIE_KEY, URLS, CREDENTIALS } from '../../support/constants';

const userCredentials = CREDENTIALS.USER;

const logout = function () {
  cy.getNavBarUserButton()
    .click();

  cy.getNavBarUserDropDownMenuOption('Logout')
    .click();
};

before(function () {
  cy.resetDb();
  cy.register(userCredentials);
});

beforeEach(function () {
  cy.visit(URLS.HOME_URL);

  cy.dispatchLogin(userCredentials);
});

describe('after loggin out', function () {
  beforeEach(function () {
    logout();
  });

  it('loggin out redirects to login page', function () {
    cy.expectUrl(URLS.LOGIN_URL);
  });

  it('user is not displayed in the navigation bar', function () {
    cy.getNavBarUserButton().should('not.exist');
  });
  
  it('user does not exist in the redux store', function () {
    cy.getStore()
      .should('deep.equal', {
        auth: {
          user: null,
          potrait: null,
          relations: [],
        }
      });
  });

  it(`session cookie '${COOKIE_KEY}' is not set`, function () {
    cy.getCookie(COOKIE_KEY).should('not.exist');
  });
});