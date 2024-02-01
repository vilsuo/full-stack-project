import { URLS, COOKIE_KEY, CREDENTIALS } from '../../support/constants';

const userCredentials = CREDENTIALS.USER;
const disabledUserCredentials = CREDENTIALS.DISABLED_USER;

const submitLogin = function (username, password) {
  // fill the form inputs
  cy.get(".login form input[type='text']:first").type(username);
  cy.get(".login form input[type='password']:first").type(password);

  cy.intercept('POST', '/api/auth/login').as('postLogin')

  // submit the form
  cy.get('.login form button')
    .click();

  cy.waitForResponse('postLogin');
  cy.waitForSpinners();
};

before(function () {
  cy.resetDb();

  cy.register(userCredentials);
  cy.register(disabledUserCredentials, { disabled: true });
});

describe('when in login page', function () {
  beforeEach(function() {
    cy.visit(URLS.LOGIN_URL);
  });

  it('login form is present', function () {
    cy.get('.login form');
  });

  it('can navigate to register page', function () {
    cy.get('.login p a')
      .click();

    cy.expectUrl(URLS.REGISTER_URL);
  });

  describe('when registered', function () {
    describe('on successfull login', function () {
      beforeEach(function () {
        submitLogin(userCredentials.username, userCredentials.password);
      });

      it('login redirects to the home page', function () {
        cy.expectUrl(URLS.HOME_URL);
      });
    
      it('user is dispatched to the redux state', function () {
        cy.getStore()
          .should('nested.include', {
            'auth.user.username': userCredentials.username
          });
      });
  
      it(`session cookie '${COOKIE_KEY}' is set`, function () {
        // does NOT retry!
        cy.getCookie(COOKIE_KEY).should('exist');
      });

      it('username is displayed in the navigation bar', function () {
        cy.getNavBarUserButton()
          .should('contain', userCredentials.username);
      });
    });
  
    it('login fails with wrong password', function () {
      submitLogin(userCredentials.username, 'wrongpassword');

      // error alert is displayed
      cy.expectAlertError(/^Login failed/);

      // still in login page
      cy.expectUrl(URLS.LOGIN_URL);
    });

    it('disabled user can not login', function () {
      submitLogin(disabledUserCredentials.username, disabledUserCredentials.password);

      // error alert is displayed
      cy.expectAlertError(/^Login failed/);

      // still in login page
      cy.expectUrl(URLS.LOGIN_URL);
    });
  });
});