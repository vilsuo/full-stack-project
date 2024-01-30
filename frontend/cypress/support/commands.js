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

import 'cypress-wait-until';
import 'cypress-file-upload';

import { login } from '../../src/reducers/auth';
import { COOKIE_KEY, URLS } from './constants';

const BACKEND_BASE_URL = '/api';
const BACKEND_TESTING_BASE_URL = '/api/testing';

// TESTING ONLY ROUTES

Cypress.Commands.add('resetDb', () => {
  cy.request('POST', `${BACKEND_TESTING_BASE_URL}/reset`);
});

Cypress.Commands.add('resetRelations', () => {
  cy.request('DELETE', `${BACKEND_TESTING_BASE_URL}/relations`);
});

Cypress.Commands.add('resetPotraits', () => {
  cy.request('DELETE', `${BACKEND_TESTING_BASE_URL}/potraits`);
});

// "MOCKING"

Cypress.Commands.add('stubUsersPotraitContent', (username, filename) => {
  // we set the response to be a fixture
  cy.intercept('GET', `${BACKEND_BASE_URL}/users/${username}/potrait/content`, { 
    statusCode: 200, 
    // Stub response with a fixture that is read as a Buffer:
    // https://docs.cypress.io/api/commands/intercept#With-a-StaticResponse-object
    fixture: `${filename},null`
  })
    .as(`${username}GetPotraitContent`);
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

// for dispatching successfull login only!
Cypress.Commands.add('dispatchLogin', (credentials) => {
  cy.dispatch(login, credentials);

  // wait until authentication cookie is set
  cy.waitForSessionCookie();

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

// does NOT dispatch the relation!
Cypress.Commands.add('addRelation', (body) => {
  cy.request('POST', `${BACKEND_TESTING_BASE_URL}/relations`, body);
});

// GET COMPONENTS

// nav bar
Cypress.Commands.add('getNavBar', () => {
  return cy.get('header nav');
});

Cypress.Commands.add('getNavBarLink', (label) => {
  return cy.getNavBar()
    .find(`a:contains(${label})`);
});

Cypress.Commands.add('getNavBarUserButton', () => {
  return cy.getNavBar().find('button.user-options');
});

Cypress.Commands.add('getNavBarUserDropDownMenu', () => {
  return cy.getNavBar().find('.dropdown .menu');
});

Cypress.Commands.add('getNavBarUserDropDownMenuOption', (label) => {
  return cy.getNavBarUserDropDownMenu().find(`li button:contains(${label})`);
});

// side bar
Cypress.Commands.add('getSideBar', () => {
  return cy.get('.sidebar');
});

// user subpages
Cypress.Commands.add('getUserSubPageHeading', (heading) => {
  return cy.get(`.wrapper .main_content h2:contains(${heading})`);
});

// ALERTS & ERRORS

Cypress.Commands.add('expectAlertError', (pattern) => {
  return cy.get('.alert.error p').then(function (p) {
    expect(p.text()).to.match(new RegExp(pattern));
  });
});

Cypress.Commands.add('expectAlertSuccess', (pattern) => {
  return cy.get('.alert.success p').then(function (p) {
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

// WAITING

Cypress.Commands.add('waitForResponse', (alias) => {
  // wait for get request
  return cy.wait(`@${alias}`);
});

Cypress.Commands.add('waitForSpinners', () => {
  // wait for loading spinner to disappear
  cy.get('.spinner').should('not.exist');
});

Cypress.Commands.add('waitForLoadingSkeletons', () => {
// wait for loading skeleons to disappear
cy.get('.react-loading-skeleton').should('not.exist');
});

Cypress.Commands.add('waitForSessionCookie', () => {
  // wait until authentication cookie is set
  cy.waitUntil(() => cy.getCookie(COOKIE_KEY).then(
    cookie => Boolean(cookie && cookie.value)
  ));
});

Cypress.Commands.add('waitForUserPotraitContent', (username) => {
  // wait until authentication cookie is set
  cy.waitForResponse(`${username}GetPotraitContent`);
});

// VISITING

// waits for autologin to return and checks that no spinners are present
// if autologin succeeds, does NOT wait for login dispatch!
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