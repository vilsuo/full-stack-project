const name = 'ville';
const username = 'viltsu';
const password = 'secret';

describe('template spec', function() {
  beforeEach(function() {
    // reset the testing databases
    cy.request('POST', 'http://localhost:3001/api/testing/reset');

    cy.visit('http://localhost:5173');
  });

  it('can view homepage', function() {
    cy.contains('Public Content');
  });

  it('can view register page', function() {
    cy.get('#nav-register').click();
    cy.get('#register-form').should('be.visible');
  });

  describe('when registering', function() {
    it('can register', function() {
      cy.register(name, username, password, password);
  
      // redirects to login page
      cy.get('#register-form').should('not.exist');
      cy.get('#login-form').should('be.visible');
    });

    it('passwords must be equal', function() {
      cy.register('matti', 'matsu', 'secret1', 'secret2');

      // shows error 
      cy.contains('Registration failed: passwords do not match')
      // does not redirect to login page
      cy.get('#register-form').should('be.visible');
    });
  });

  describe('when registered', function() {
    beforeEach(function() {
      // bypass the UI when registering
      const user = { name, username, password };
      cy.request('POST', 'http://localhost:3001/api/auth/register', user);
    });

    it('can not register with taken username', function() {
      const tempPassword = 'salauinen';
      cy.register('samuel', username, tempPassword, tempPassword);

      cy.contains('Registration failed: username has already been taken')
      cy.get('#register-form').should('be.visible');
    });
  });
});