import { URLS, COOKIE_KEY } from '../support/constants';

const credentials = { name: 'ville', username: 'ville123', password: 'qwerty123' };

const submitLogin = function (username, password) {
  // fill the form inputs
  cy.get(".login form input[type='text']:first").type(username);
  cy.get(".login form input[type='password']:first").type(password);

  // submit the form
  cy.get('.login form button')
    .click();
};

const loginAndSaveSession = function (username, password) {
  //cy.session(username, () => {
    cy.visit(URLS.LOGIN_URL);

    submitLogin(username, password);

    cy.expectUrl(URLS.HOME_URL);
  //});

  //cy.visit(URLS.HOME_URL);
};

describe('when in login page', function () {
  beforeEach(function() {
    cy.resetDb();

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

  describe('after registering', function () {
    beforeEach(function() {
      cy.register(credentials);
    });
  
    describe('on successfull login', function () {
      beforeEach(function () {
        loginAndSaveSession(credentials.username, credentials.password);
      });
    
      it('user is dispatched to the redux state', function () {
        cy.getState()
          .should('nested.include', {
            'auth.user.username': credentials.username
          });
      });
  
      it(`session cookie '${COOKIE_KEY}' is set`, function () {
        // cy.getCookies().then((cookies) => { console.log(cookies) });
        // cy.getAllCookies().then((cookies) => { console.log(cookies) });

        cy.getCookie(COOKIE_KEY).should('exist');
      });

      it('username is displayed in the navigation bar', function () {
        cy.get('header nav .user-options').then(function (userOptions) {
          expect(userOptions.text()).to.eq(credentials.username);
        });
      });
    });
  
    it('login fails with wrong password', function () {
      submitLogin(credentials.username, 'wrongpassword');

      // still in login page
      cy.expectUrl(URLS.LOGIN_URL);

      // error alert is displayed
      cy.expectAlert(/^Login failed/);
    });
  });
});