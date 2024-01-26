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

const BACKEND_BASE_URL = '/api';

Cypress.Commands.add('resetDb', () => {
  cy.request('POST', `${BACKEND_BASE_URL}/testing/reset`);
});


// REDUX

Cypress.Commands.add('dispatch', (fn, value) => {
  return cy.window()
    .its('store')
    .then(store => store.dispatch(fn(value)));
});

Cypress.Commands.add('getState', () => {
  return cy.window()
    .its('store')
    .invoke('getState');
});

// BYPASS UI

Cypress.Commands.add('register', (credentials, options = {}) => {
  if (options.disabled) {
    cy.request('POST', `${BACKEND_BASE_URL}/testing/disabled`, credentials);
  } else {
    cy.request('POST', `${BACKEND_BASE_URL}/auth/register`, credentials);
  }
});

// GET COMPONENTS

Cypress.Commands.add('getNavBarUser', (pattern) => {
  return cy.get('header nav .user-options');
});

Cypress.Commands.add('expectAlert', (pattern) => {
  return cy.get('.alert.error p').then(function (p) {
    expect(p.text()).to.match(new RegExp(pattern));
  });
});

// OTHER

Cypress.Commands.add('expectUrl', (url) => {
  cy.url()
    .should('eq', Cypress.config().baseUrl + url);
});