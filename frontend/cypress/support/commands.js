// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('register', (name, username, password1, password2) => {
  cy.get('#nav-register').click();

  cy.get('#register-form').within(function() {
    cy.get('#name').type(name);
    cy.get('#username').type(username);
    cy.get('#password1').type(password1);
    cy.get('#password2').type(password2);
    cy.get('#register').click();
  });
});

Cypress.Commands.add('login', (username, password) => {
  cy.get('#nav-login').click();

  cy.get('#login-form').within(function() {
    cy.get('#username').type(username);
    cy.get('#password').type(password);
    cy.get('#login').click();
  });
});