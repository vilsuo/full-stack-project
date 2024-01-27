import { URLS } from '../support/constants';

import { login } from '../../src/reducers/auth';

const credentials = { name: 'ville', username: 'ville123', password: 'qwerty123' };
const otherCredentials = { name: 'matti', username: 'matti123', password: 'fghjkl789' };
const disabledCredentials = { name: 'sampsa', username: 'samp', password: 'qweyu456' };

const getSideBarRelationActions = function () {
  return cy.get('.sidebar .relation-actions');
};

const getSideBarNavigation = function () {
  return cy.get('.sidebar ul');
};

const getSideBarNavigationAction = function (label) {
  return getSideBarNavigation()
    .find(`li a:contains(${label})`);
};

before(function () {
  cy.resetDb();
});

beforeEach(function () {
  cy.home();
});

describe('visiting user pages', function () {
  before(function () {
    cy.register(credentials);
    cy.register(otherCredentials);
    cy.register(disabledCredentials, { disabled: true });
  });

  it('can not visit disabled users page', function () {
    cy.visitUser(disabledCredentials.username);
    
    cy.expectErrorElement('user is disabled');
  });

  it('can not visit the page of a user that does not exist', function () {
    const username = 'nonexistinguser'
    cy.visitUser(username);

    cy.expectErrorElement('user does not exist');
  });

  describe('not logged in', function () {
    it('can visit user profile', function () {
      cy.visitUser(credentials.username);

      cy.getErrorElement().should('not.exist');
    });
  });

  describe('logged in', function () {
    const username = credentials.username;
    const otherUsername = otherCredentials.username;

    beforeEach(function () {
      // login
      cy.dispatch(login, credentials);
    });

    describe('visiting own user page', function () {
      beforeEach(function () {
        cy.visitUser(username);
      });

      it('can visit own user page', function () {
        cy.getErrorElement().should('not.exist');
      });

      it('relation actions are not displayed', function () {
        getSideBarRelationActions().should('not.exist');
      });

      it('Settings option is displayed', function () {
        getSideBarNavigationAction('Settings');
      });
    });

    describe('visiting other user page', function () {
      describe('without any blocks', function () {
        beforeEach(function () {
          cy.visitUser(otherUsername);
        });

        it('can visit other user page', function () {
          cy.getErrorElement().should('not.exist');
        });

        it('relation actions are displayed', function () {
          getSideBarRelationActions().should('exist');
        });

        it('Settings option is not displayed', function () {
          getSideBarNavigationAction('Settings').should('not.exist');
        });
      });
    });
  });
});
