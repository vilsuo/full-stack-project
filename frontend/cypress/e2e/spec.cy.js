const name = 'ville';
const username = 'viltsu';
const password = 'secret';

describe('template spec', function() {
  beforeEach(function() {
    cy.visit('http://localhost:5173');
  });

  it('can view homepage', function() {
    cy.contains('Public Content');
  });

  it('can view register page', function() {
    cy.get('#nav-register').click();
    cy.get('#register-form').should('be.visible');
  });

  it('can view login page', function() {
    cy.get('#nav-login').click();
    cy.get('#login-form').should('be.visible');
  });

  describe('when registering', function() {
    beforeEach(function() {
      cy.get('#nav-register').click();
    });

    it('can register', function() {
      cy.get('#register-form').within(function() {
        cy.get('#name').type(name);
        cy.get('#username').type(username);
        cy.get('#password1').type(password);
        cy.get('#password2').type(password);
        cy.get('#register').click();
      });
  
      // redirects to login page
      cy.get('#register-form').should('not.exist');
      cy.get('#login-form').should('be.visible');
    });

    it('passwords must be equal', function() {
      cy.get('#register-form').within(function() {
        cy.get('#name').type('matti');
        cy.get('#username').type('matsu');
        cy.get('#password1').type('secret1');
        cy.get('#password2').type('secret2');
        cy.get('#register').click();
      });

      cy.contains('Registration failed: passwords do not match')
      cy.get('#register-form').should('be.visible');
    });
  });

  /*
  describe('when registered', function() {
    it('can log in with correct credentials', function() {

    });

    it('can not log in with incorrect credentials', function() {

    });

    describe('when logged in', function() {
      it('can log out', function() {

      });
    });
  });
  */
});