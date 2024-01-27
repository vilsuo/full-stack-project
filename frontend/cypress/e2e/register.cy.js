import { URLS } from '../support/constants';

const credentials = { name: 'ville', username: 'ville123', password: 'qwerty123' };

const submitFormRegister = function (credentials) {
  cy.get(".register form input[type='text']:first")
    .type(credentials.name);

  cy.get(".register form input[type='text']:last")
    .type(credentials.username);

  // write passwords
  cy.get(".register form input[type='password']:first")
    .type(credentials.password);

  // if a second password is given, write it, else write the first one
  cy.get(".register form input[type='password']:last")
    .type(
      credentials.password2 ? credentials.password2 : credentials.password
    );

  cy.intercept('POST', '/api/auth/register').as('postRegister');

  // post register
  cy.get('.register form button')
    .click();
};

describe('when in register page', function () {
  beforeEach(function() {
    cy.resetDb();
    cy.visit(URLS.REGISTER_URL);
  });

  it('register form is present', function () {
    cy.get('.register form');
  });

  it('registering successfully redirects to login page', function () {
    submitFormRegister(credentials);

    // wait for register response
    cy.waitForResponse('postRegister');

    cy.expectUrl(URLS.LOGIN_URL);
  });

  describe('registering fails with', function () {
    it('taken username', function () {
      // register for the first time so the username is taken
      cy.register(credentials);
  
      submitFormRegister(credentials);

      // wait for register response
      cy.waitForResponse('postRegister');

      // register error alert is shown
      cy.expectAlert(/^Registering failed/);

      // redirect does not take place
      cy.expectUrl(URLS.REGISTER_URL);
    });
  
    it('mismatch passwords', function () {
      submitFormRegister({ ...credentials, password2: 'asdfgh456' });

      // no need to wait: response is not sent

      // register error alert is shown
      cy.expectAlert(/^Registering failed/);

      // redirect does not take place
      cy.expectUrl(URLS.REGISTER_URL);
    });
  });
});