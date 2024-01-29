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

import { login } from '../../src/reducers/auth';
import { URLS } from './constants';

const BACKEND_BASE_URL = '/api';

const BACKEND_TESTING_BASE_URL = '/api/testing';

// TESTING ONLY ROUTES

Cypress.Commands.add('resetDb', () => {
  cy.request('POST', `${BACKEND_TESTING_BASE_URL}/reset`);
});

Cypress.Commands.add('resetRelations', () => {
  cy.request('DELETE', `${BACKEND_TESTING_BASE_URL}/relations`);
});

// REDUX

Cypress.Commands.add('dispatch', (fn, value) => {
  return cy.window()
    .its('store')
    .then(store => store.dispatch(fn(value)));
});

Cypress.Commands.add('getStore', () => {
  return cy.window()
    .its('store')
    .invoke('getState');
});

/**
 * For dispatching successfull login only!
 */
Cypress.Commands.add('dispatchLogin', (credentials) => {
  /*
  cy.intercept('POST', `${BACKEND_BASE_URL}/auth/login`)
    .as('postLogin');

  cy.intercept('GET', `${BACKEND_BASE_URL}/users/${credentials.username}/potrait`)
    .as('getPotrait');

  cy.intercept('GET', `${BACKEND_BASE_URL}/users/${credentials.username}/relations`)
    .as('getRelations');
  */

  cy.dispatch(login, credentials);

  /*
  cy.waitForResponse('postLogin')
    .its('response.statusCode')
    .should('eq', 200);

  cy.waitForResponse('getPotrait')
    .its('response.statusCode')
    .should('be.oneOf', [200, 404]);

  cy.waitForResponse('getRelations')
    .its('response.statusCode')
    .should('eq', 200);
  */

  // wait for user to be saved in the redux store
  cy.getStore()
    .should('nested.include', {
      'auth.user.username': credentials.username
    });

  cy.waitForSpinners();
});

// BYPASS UI

Cypress.Commands.add('register', (credentials, options = {}) => {
  if (options.disabled) {
    cy.request('POST', `${BACKEND_TESTING_BASE_URL}/disabled`, credentials);
  } else {
    cy.request('POST', `${BACKEND_BASE_URL}/auth/register`, credentials);
  }
});

Cypress.Commands.add('addRelation', (body) => {
  cy.request('POST', `${BACKEND_TESTING_BASE_URL}/relations`, body);
});

// GET COMPONENTS

Cypress.Commands.add('getNavBar', () => {
  return cy.get('header nav');
});

Cypress.Commands.add('getNavBarUser', () => {
  return cy.getNavBar().find('.user-options');
});

// side bar
Cypress.Commands.add('getSideBar', () => {
  return cy.get('.sidebar');
});

Cypress.Commands.add('getSideBarNavigationAction', (label) => {
  return cy.getSideBar()
    .find(`ul li a:contains(${label})`);
});

// ALERTS & ERRORS

Cypress.Commands.add('expectAlert', (pattern) => {
  return cy.get('.alert.error p').then(function (p) {
    expect(p.text()).to.match(new RegExp(pattern));
  });
});

Cypress.Commands.add('getErrorElement', function () {
  return cy.get('.error-element');
});

Cypress.Commands.add('expectErrorElement', (pattern) => {
  return cy.getErrorElement().find('p').then(function (p) {
    expect(p.text()).to.match(new RegExp(pattern, 'i'));
  });
});

// OTHER

Cypress.Commands.add('expectUrl', (url) => {
  cy.url()
    .should('eq', Cypress.config().baseUrl + url);
});

Cypress.Commands.add('expectUserPageVisible', () => {
  cy.getSideBar();
  cy.getErrorElement().should('not.exist');
});

Cypress.Commands.add('expectUserPageHidden', (pattern) => {
  cy.getSideBar().should('not.exist');
  cy.expectErrorElement(pattern);
});

// WAITING

Cypress.Commands.add('waitForResponse', (alias) => {
  // wait for get request
  return cy.wait(`@${alias}`);
});

Cypress.Commands.add('waitForSpinners', () => {
  // wait for loading spinner to disappear
  cy.get('.spinner').should('not.exist');
});

// VISITING

// waits for autologin to return and checks that no spinners are present
Cypress.Commands.add('home', () => {
  cy.intercept('GET', `${BACKEND_BASE_URL}/auth/auto-login`).as('getAutoLogin');

  cy.visit(URLS.HOME_URL);

  cy.waitForResponse('getAutoLogin');
  cy.waitForSpinners();
});

Cypress.Commands.add('visitUser', (username) => {
  cy.intercept('GET', `/api/users/${username}`).as('getUser');

  cy.visit(URLS.getUserUrl(username));

  cy.waitForResponse('getUser');
});