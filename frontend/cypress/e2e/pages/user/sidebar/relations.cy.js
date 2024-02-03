import { RELATION_BLOCK, RELATION_FOLLOW } from '../../../../../src/constants';
import { CREDENTIALS } from '../../../../support/constants';

const credentials = CREDENTIALS.USER;
const otherCredentials = CREDENTIALS.OTHER_USER;
const disabledCredentials = CREDENTIALS.DISABLED_USER;

const follow = RELATION_FOLLOW.value;
const block = RELATION_BLOCK.value;

const getSideBarRelationActions = function () {
  return cy.getSideBar().find('.relation-actions');
};

const getFollowButton = function () {
  return getSideBarRelationActions().find('.follow-btn');
};

const getBlockButton = function () {
  return getSideBarRelationActions().find('.block-btn');
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

describe('user page sidebar relations', function () {
  const username = credentials.username;
  const otherUsername = otherCredentials.username;

  describe('not logged in', function () {
    beforeEach(function () {
      cy.visitUser(username);
    });

    it('relation actions are not displayed', function () {
      getSideBarRelationActions().should('not.exist');
    });
  });

  describe('logged in', function () {
    beforeEach(function () {
      // remove all relations
      cy.resetRelations();

      // login
      cy.dispatchLogin(credentials);
    });

    describe('own user page', function () {
      beforeEach(function () {
        cy.visitUser(username);
      });

      it('relation actions are not displayed', function () {
        getSideBarRelationActions().should('not.exist');
      });
    });

    describe('other user page', function () {
      describe('without any relations', function () {
        beforeEach(function () {
          cy.visitUser(otherUsername);
        });

        it('relation actions are displayed', function () {
          getSideBarRelationActions().should('exist');
        });
  
        it("follow button has the text 'Follow'", function () {
          getFollowButton().should('contain', 'Follow');
        });
  
        it("block button has the text 'Block'", function () {
          getBlockButton().should('contain', 'Block');
        });
  
        describe('adding relations', function () {
          describe(`relation of type ${follow}`, function () {
            it('following adds a relation to redux store', function () {
              // before adding a relation, the stored relations are empty
              cy.getStore()
                .its('auth.relations')
                .should('have.length', 0);
  
              // follow
              getFollowButton().click();
  
              // after adding a relation
              cy.getStore()
                .its('auth.relations')
                .should('have.length', 1) // one relation is stored
                .then(function (relations) {
                  expect(relations[0].type).to.eq(follow); // relation type is follow
                });
            });
  
            describe('after following the other user', function () {
              beforeEach(function () {
                // follow the other user
                cy.intercept(`/api/users/${username}/relations`)
                  .as('follow');
    
                getFollowButton().click();
    
                cy.waitForResponse('follow');
              });
    
              it("follow button has text 'Unfollow", function () {
                getFollowButton().should('contain', 'Unfollow');
              });
  
              describe('after unfollowing', function () {
                beforeEach(function () {
                  getFollowButton().click();
                });
  
                it("follow button has text 'Follow'", function () {
                  getFollowButton().should('contain', 'Follow');
                });
  
                it('relation is removed from the redux store', function () {
                  cy.getStore()
                    .its('auth.relations')
                    .should('have.length', 0);
                });
              });
            });
          });
  
          describe(`relation of type ${block}`, function () {
            it('blocking adds a relation to redux store', function () {
              // before adding a relation, the stored relations are empty
              cy.getStore()
                .its('auth.relations')
                .should('have.length', 0);
  
              // block
              getBlockButton().click();
  
              // after adding a relation
              cy.getStore()
                .its('auth.relations')
                .should('have.length', 1) // one relation is stored
                .then(function (relations) {
                  expect(relations[0].type).to.eq(block); // relation type is block
                });
            });

            describe('after blocking the other user', function () {
              beforeEach(function () {
                // block the other user
                cy.intercept(`/api/users/${username}/relations`)
                  .as('block');
  
                getBlockButton().click();
  
                cy.waitForResponse('block');
              });
  
              it("block button has text 'Unblock", function () {
                getBlockButton().should('contain', 'Unblock');
              });
  
              describe('after unblocking', function () {
                beforeEach(function () {
                  getBlockButton().click();
                });
  
                it("block button has text 'Block'", function () {
                  getBlockButton().should('contain', 'Block');
                });
  
                it('relation is removed from the redux store', function () {
                  cy.getStore()
                    .its('auth.relations')
                    .should('have.length', 0);
                });
              });
            });
          });
        });
      });
    });
  });
});
