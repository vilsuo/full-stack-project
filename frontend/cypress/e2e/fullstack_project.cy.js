
const PORT = 5173;
const BASE_URL = `http://localhost:${PORT}/#`;
const LOGIN_URL = `${BASE_URL}/login`;
const REGISTER_URL = `${BASE_URL}/register`;

const credentials = { name: 'ville', username: 'ville123', password: 'qwerty123' };

const reset = function () {
  cy.request('POST', 'http://localhost:3001/api/testing/reset');
};

const getAlert = function () {
  return cy.get('.alert.error p');
};

// REGISTER

const clickRegisterButton = function () {
  return cy.get('.register form button')
    .click();
};

const fillRegisterForm = function (credentials) {
  cy.get(".register form input[type='text']:first").type(credentials.name);
  cy.get(".register form input[type='text']:last").type(credentials.username);

  cy.get(".register form input[type='password']:first").type(credentials.password);
  cy.get(".register form input[type='password']:last").type(
    credentials.password2 ? credentials.password2 : credentials.password
  );
};

const register = function (credentials) {
  cy.request('POST', 'http://localhost:3001/api/auth/register', credentials);
};

// LOGIN

const fillLoginForm = function (username, password) {
  cy.get(".login form input[type='text']:first").type(username);
  cy.get(".login form input[type='password']:first").type(password);
};

const clickLoginButton = function () {
  return cy.get('.login form button')
    .click();
};

const login = function (username, password) {
  cy.visit(LOGIN_URL);
  fillLoginForm(username, password);
  return clickLoginButton();
};

describe('Fullstack project', () => {
  beforeEach(function() {
    reset();
    cy.visit(BASE_URL);
  });

  it('frontpage can be opened', function () {
    cy.contains('Home page');
  });

  it('can navigate to the login page', function () {
    cy.get('header nav > div a:last')
      .then(function (link) {
        const text = link.text();
        expect(text).to.eq('Login');
      })
      .click()

    cy.url().should('eq', LOGIN_URL);
  });

  describe('when in login page', function () {
    beforeEach(function() {
      cy.visit(LOGIN_URL);
    });

    it('login form is present', function () {
      cy.get('.login form');
    });

    it('can navigate to register page', function () {
      cy.get('.login p a')
        .click();

      cy.url()
        .should('eq', REGISTER_URL);
    });
  });

  describe('when in register page', function () {
    beforeEach(function() {
      cy.visit(REGISTER_URL);
    });

    it('registering successfully redirects to login page', function () {
      fillRegisterForm(credentials);
      clickRegisterButton();

      cy.url().should('eq', LOGIN_URL);
    });

    it('can not register with taken username', function () {
      register(credentials);

      fillRegisterForm(credentials);
      clickRegisterButton()
        .then(function () {
          // redirect does not take place
          cy.url().should('eq', REGISTER_URL);

          // register error alert is shown
          getAlert().should('contains', /^Registering failed/);
        });
    });

    it('can not register with mismatch passwords', function () {
      fillRegisterForm({ ...credentials, password2: 'asdfgh456' });
      clickRegisterButton()
        .then(function () {
          // redirect does not take place
          cy.url().should('eq', REGISTER_URL);

          // register error alert is shown
          getAlert().should('contains', /^Registering failed/);
        });
    });
  });

  describe('after registering', function () {
    beforeEach(function() {
      register(credentials);
    });

    it('can login with correct credentials', function () {
      login(credentials.username, credentials.password)
        .then(function () {
          cy.url().should('eq', `${BASE_URL}/`);
        });
    });

    it('successfull login dispatches user to the redux state', function () {
      login(credentials.username, credentials.password)
        .then(function () {
          cy.window()
            .its('store')
            .invoke('getState')
            .should('nested.include', {
              'auth.user.username': credentials.username
            });
        });
    });

    it('login fails with wrong password', function () {
      login(credentials.username, 'wrongpassword')
        .then(function () {
          getAlert().should('contain', /^Login failed/);
        });
    });

    describe.only('when logged in', function () {
      beforeEach(function () {
        login(credentials.username, credentials.password);
      });
  
      it('username is displayed in the navigation bar', function () {
        cy.get('header nav .user-options').then(function (userOptions) {
          expect(userOptions.text()).to.eq(credentials.username);
        });
      });
    });
  });
});