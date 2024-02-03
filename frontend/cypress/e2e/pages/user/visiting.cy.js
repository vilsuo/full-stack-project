import { RELATION_BLOCK, RELATION_FOLLOW } from '../../../../src/constants';
import { URLS, CREDENTIALS } from '../../../support/constants';

const credentials = CREDENTIALS.USER;
const otherCredentials = CREDENTIALS.OTHER_USER;
const disabledCredentials = CREDENTIALS.DISABLED_USER;

const follow = RELATION_FOLLOW.value;
const block = RELATION_BLOCK.value;

const expectUserPageVisible = function () {
  cy.getSideBar();
  cy.getErrorElement().should('not.exist');
};

const expectUserPageHidden = function (pattern) {
  cy.getSideBar().should('not.exist');
  cy.expectErrorElement(pattern);
};

before(function () {
  cy.resetDb();

  cy.register(credentials);
  cy.register(otherCredentials);
  cy.register(disabledCredentials, { disabled: true });
});

beforeEach(function () {
  cy.home();
});

describe('visiting user pages', function () {
  it('can not visit disabled users page', function () {
    cy.visitUser(disabledCredentials.username);
    
    expectUserPageHidden('user is disabled');
  });

  it('can not visit the page of a user that does not exist', function () {
    const username = 'nonexistinguser'
    cy.visitUser(username);

    expectUserPageHidden('user does not exist');
  });

  describe('not logged in', function () {
    const username = credentials.username;

    beforeEach(function () {
      cy.visitUser(username);
    });

    it('can visit user page', function () {
      cy.getErrorElement().should('not.exist');
    });
  });

  describe('logged in', function () {
    const username = credentials.username;
    const otherUsername = otherCredentials.username;

    beforeEach(function () {
      cy.resetRelations();
    });

    describe('visiting own user page', function () {
      beforeEach(function () {
        cy.dispatchLogin(credentials);

        cy.visitUser(username);
      });

      it('can visit own user page', function () {
        expectUserPageVisible();
      });
    });

    describe('visiting other user page', function () {
      describe('without any relations', function () {
        beforeEach(function () {
          cy.dispatchLogin(credentials);

          cy.visitUser(otherUsername);
        });

        it('can visit other user page', function () {
          expectUserPageVisible();
        });
      });

      describe(`with relation of type ${follow}`, function () {
        beforeEach(function () {
          // create relation of type follow from viewer to viewed
          // relation has to be created before loggin in, so the redux store contains it
          cy.addRelation({ 
            sourceUserUsername: username, 
            targetUserUsername: otherUsername, 
            type: follow 
          });

          cy.dispatchLogin(credentials);

          cy.visitUser(otherUsername);
        });

        it('can visit other user page', function () {
          expectUserPageVisible();
        });
      });
  
      describe('after blocking the other user', function () {
        beforeEach(function () {
          // create relation of type follow from viewer to viewed
          // relation has to be created before loggin in, so the redux store contains it
          cy.addRelation({ 
            sourceUserUsername: username, 
            targetUserUsername: otherUsername, 
            type: block 
          });

          cy.dispatchLogin(credentials);

          cy.visitUser(otherUsername);
        });
  
        it('can not visit the user page', function () {
          cy.visit(URLS.HOME_URL);
          cy.visitUser(otherUsername);
  
          expectUserPageHidden('You have blocked the user');
        });
      });

      describe('when the other user has blocked the user', function () {
        beforeEach(function () {
          cy.dispatchLogin(credentials);

          // relation does not need to be created before loggin in, becouse other users
          // relations are not stored in redux store
          cy.addRelation({ 
            sourceUserUsername: otherUsername,
            targetUserUsername: username,
            type: RELATION_BLOCK.value 
          });
        });
  
        it('can not visit the user page', function () {
          cy.visit(URLS.HOME_URL);
          cy.visitUser(otherUsername);
  
          expectUserPageHidden('You have been blocked by the user');
        });
      });
    });
  });
});
