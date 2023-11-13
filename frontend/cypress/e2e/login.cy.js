/*
TODO
- implement global setup file? (db reset)
- test loggin in with disabled user
- test that all form inputs must be filled
*/
const name = 'ville';
const username = 'viltsu';
const password = 'secret';

describe('when registered', function() {
  beforeEach(function() {
    // reset the testing databases
    cy.request('POST', 'http://localhost:3001/api/testing/reset');

    cy.visit('http://localhost:5173');
  });

  it('can view login page', function() {
    cy.get('#nav-login').click();
    cy.get('#login-form').should('be.visible');
  });

  describe('when registered', function() {
    beforeEach(function() {
      // bypass the UI when registering
      const user = { name, username, password };
      cy.request('POST', 'http://localhost:3001/api/auth/register', user);
    });

    it('can log in with correct credentials', function() {
      cy.login(username, password);

      cy.get('#nav-username').contains(username);
    });

    it('can not log in with incorrect credentials', function() {
      cy.login(username, 'wrong0ne');

      cy.contains('Login failed: invalid username or password.');
      cy.get('#nav-username').should('not.exist');
    });

    describe('when logged in', function() {
      beforeEach(function() {
        cy.login(username, password);
      });

      it('can view the navigation profile menu', function() {
        cy.get('#nav-profile-menu').should('not.exist');
        cy.get('#nav-icon-btn').click();
        cy.get('#nav-profile-menu').should('be.visible');
      });

      it('can log out', function() {
        cy.get('#nav-icon-btn').click();
        cy.get('#nav-profile-menu').contains('Logout').click();

        // redirected to login page
        cy.get('#login-form').should('be.visible');

        // username is no longer displayed
        cy.get('#nav-username').should('not.exist');
      });

    });
  });
});