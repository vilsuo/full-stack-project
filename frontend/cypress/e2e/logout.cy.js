import { login } from '../../src/reducers/auth';
import { COOKIE_KEY, URLS } from '../support/constants';

const credentials = { name: 'ville', username: 'ville123', password: 'qwerty123' };

const logout = function () {
  cy.getNavBarUser()
    .click();

  cy.get('.dropdown')
    .contains('Logout')
    .click();
};

describe('', function () {

  beforeEach(function () {
    cy.resetDb();
    cy.visit(URLS.HOME_URL);

    cy.register(credentials);
    cy.dispatch(login, credentials);
  });

  it('navigation bar contains logout option', function () {
    // open navigation bar user menu
    cy.getNavBarUser()
      .click();

    cy.get('.dropdown').contains('Logout');
  });

  describe('after loggin out', function () {
    beforeEach(function () {
      cy.getCookie(COOKIE_KEY).should('exist');
      logout();
    });

    it('loggin out redirects to login page', function () {
      cy.expectUrl(URLS.LOGIN_URL);
    });

    it('user is not displayed in the navigation bar', function () {
      cy.getNavBarUser().should('not.exist');
    });

    it('user does not exist in the redux store', function () {
      cy.getState()
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
});