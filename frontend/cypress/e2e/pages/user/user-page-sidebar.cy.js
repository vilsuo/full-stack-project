import { RELATION_BLOCK, RELATION_FOLLOW } from '../../../../src/constants';
import { URLS } from '../../../support/constants';

/*
TODO
- test visiting links from the sidebar:
  - images
  - relations
  - details
*/

const credentials = { name: 'ville', username: 'ville123', password: 'qwerty123' };
const otherCredentials = { name: 'matti', username: 'matti123', password: 'fghjkl789' };
const disabledCredentials = { name: 'sampsa', username: 'samp', password: 'qweyu456' };

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

const expectUserPageHidden = function (pattern) {
  cy.getSideBar().should('not.exist');
  cy.expectErrorElement(pattern);
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
    
    cy.expectUserPageHidden('user is disabled');
  });

  it('can not visit the page of a user that does not exist', function () {
    const username = 'nonexistinguser'
    cy.visitUser(username);

    cy.expectUserPageHidden('user does not exist');
  });

  describe('not logged in', function () {
    const username = credentials.username;

    beforeEach(function () {
      cy.visitUser(username);
    });

    it('can visit user profile', function () {
      cy.getErrorElement().should('not.exist');
    });

    it('sidebar contains the user username', function () {
      cy.getSideBar().contains(username);
    });
  });

  describe('logged in', function () {
    const username = credentials.username;
    const otherUsername = otherCredentials.username;

    beforeEach(function () {
      // remove all relations
      cy.resetRelations();

      // login
      cy.dispatchLogin(credentials);
    });

    describe('visiting own user page', function () {
      beforeEach(function () {
        cy.visitUser(username);
      });

      it('can visit own user page', function () {
        cy.expectUserPageVisible();
      });

      it('sidebar relation actions are not displayed', function () {
        getSideBarRelationActions().should('not.exist');
      });

      describe('sidebar links', function () {
        describe('user settings option', function () {
          it('is displayed', function () {
            cy.getSideBarNavigationAction('Settings');
          });

          it('can navigate to user settings', function () {
            cy.getSideBarNavigationAction('Settings').click();

            cy.expectUrl(`${URLS.getUserUrl(username)}/settings`);
          });
        });
      });
    });

    describe('visiting other user page', function () {
      describe('without any relations', function () {
        beforeEach(function () {
          cy.visitUser(otherUsername);
        });

        it('can visit other user page', function () {
          cy.expectUserPageVisible();
        });

        describe('sidebar relation actions', function () {
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
    
                it('can visit the user page', function () {
                  cy.visit(URLS.HOME_URL);
                  cy.visitUser(otherUsername);
    
                  cy.expectUserPageVisible();
    
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
  
                it('can not visit the user page', function () {
                  cy.visit(URLS.HOME_URL);
                  cy.visitUser(otherUsername);
  
                  cy.expectUserPageHidden('block exists');
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
  
                  it('can visit the user page', function () {
                    cy.visit(URLS.HOME_URL);
                    cy.visitUser(otherUsername);
    
                    cy.expectUserPageVisible();
                  });
                });
              });
            });
          });
        });

        describe('sidebar links', function () {
          describe('user settings option', function () {
            it('is not displayed', function () {
              cy.getSideBarNavigationAction('Settings').should('not.exist');
            });
    
            it('can not navigate to user settings', function () {
              cy.visit(`${URLS.getUserUrl(otherUsername)}/settings`);
    
              // do not allow user to visit other users settings page
              cy.expectUrl(URLS.FALLBACK_URL);
            });
          });
        });
      });

      describe('when the other user has blocked the user', function () {
        beforeEach(function () {
          cy.addRelation({ 
            sourceUserUsername: otherUsername,
            targetUserUsername: username,
            type: RELATION_BLOCK.value 
          });
        });
  
        it('can not visit the user page', function () {
          cy.visit(URLS.HOME_URL);
          cy.visitUser(otherUsername);
  
          cy.expectUserPageHidden('block exists');
        });
      });
    });
  });
});
