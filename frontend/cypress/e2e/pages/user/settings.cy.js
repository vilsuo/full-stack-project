import { URLS, CREDENTIALS } from '../../../support/constants';

/*
TODO
- test upload
  - success:
    - input is resetted
    - potrait is dispatched
- test remove
  - potrait is dispatched
*/

const credentials = CREDENTIALS.USER;
const otherCredentials = CREDENTIALS.OTHER_USER;

const filename = 'test.PNG';
const fileInputInitialValue = '';

const visitUserSettings = function (username) {
  cy.intercept('GET', `/api/users/${username}`).as('getUser');
  cy.intercept('GET', `/api/users/${username}/potrait/content`).as('getPotraitContent');

  cy.visit(getSettingsUrl(username));

  cy.waitForResponse('getUser');
  cy.waitForResponse('getPotraitContent');

  cy.waitForLoadingSkeletons();
};

const getSettingsUrl = function (username) {
  return `${URLS.getUserUrl(username)}/settings`;
};

const getSettingsSubUrl = function (username, sub) {
  return `${getSettingsUrl(username)}/${sub}`;
};

const clickOptionsNavigationAction = function (label) {
  cy.get(`.settings-layout nav a:contains(${label})`).click();
};

// POTRAIT SETTINGS

const getFileInput = function () {
  return cy.get('.settings-potrait-page .file-input input[type="file"]');
};

const getFileInputReset = function () {
  return cy.get('.settings-potrait-page .file-input button.close-btn');
};

const expectEmptyFileInput = function () {
  getFileInput()
    .should('have.value', fileInputInitialValue)
    .then(($input) => {
      const files = $input[0].files;
      expect(files).to.have.lengthOf(0);
    });
};

const getUploadButton = function () {
  return cy.get(".settings-potrait-page button:contains('Upload')");
};

const getDeleteButton = function () {
  return cy.get(".settings-potrait-page button:contains('Remove')");
};

const uploadPotrait = function (username, filename) {
  cy.stubUsersPotraitContent(username, filename);

  // upload the second potrait
  getFileInput().attachFile(filename);
  getUploadButton().click();

  cy.waitForUserPotraitContent(username);
  cy.waitForLoadingSkeletons();
};

before(function () {
  cy.resetDb();

  cy.register(credentials);
  cy.register(otherCredentials);
});

beforeEach(function () {
  cy.home();
});

describe('visiting user settings page', function () {
  const username = credentials.username;
  const otherUsername = otherCredentials.username;

  describe('not logged in', function () {
    beforeEach(function () {
      visitUserSettings(username);
    });

    it('can not visit the page', function () {
      // do not allow user to visit other users settings page
      cy.expectUrl(URLS.FALLBACK_URL);

      cy.getUserSubPageHeading('Settings')
        .should('not.exist');
    });
  });

  describe('logged in', function () {
    beforeEach(function () {
      cy.dispatchLogin(credentials);
    });

    describe('own settings page', function () {
      beforeEach(function () {
        visitUserSettings(username);
      });

      it('can visit the page', function () {
        cy.getUserSubPageHeading('Settings');

        cy.expectUrl(getSettingsUrl(username));
      });
    });

    describe('other user settings page', function () {
      beforeEach(function () {
        visitUserSettings(otherUsername);
      });

      it('can not visit the page', function () {
        // do not allow user to visit other users settings page
        cy.expectUrl(URLS.FALLBACK_URL);

        cy.getUserSubPageHeading('Settings')
          .should('not.exist');
      });
    });
  });
});

describe('on users own settings page', function () {
  const username = credentials.username;

  beforeEach(function () {
    cy.resetPotraits();

    cy.dispatchLogin(credentials);
    visitUserSettings(username);
  });

  it('Settings header is present', function () {
    cy.getUserSubPageHeading('Settings');
  });

  it('can navigate to potrait settings', function () {
    clickOptionsNavigationAction('Potrait');

    cy.expectUrl(getSettingsSubUrl(username, 'potrait'));
    cy.get('.settings-potrait-page').should('exist');
  });

  it('can navigate to other settings', function () {
    clickOptionsNavigationAction('Other');

    cy.expectUrl(getSettingsSubUrl(username, 'other'));
    cy.get('.settings-other-page').should('exist');
  });

  describe('on potrait settings page', function () {
    beforeEach(function () {
      cy.visit(getSettingsSubUrl(username, 'potrait'))
    });

    describe('change potrait', function () {
      describe('when file is not selected', function () {
        it('file input has initial value', function () {
          expectEmptyFileInput();
        });

        it('can not reset file input', function () {
          getFileInputReset().should('not.exist');
        });

        it('upload button is disabled', function () {
          getUploadButton().should('be.disabled');
        });
      });

      describe('after file has been selected', function () {
        beforeEach(function () {
          getFileInput().attachFile(filename);
        });

        it('file input has a value', function () {
          // only one file is selected
          // selected file has the correct filename
          getFileInput()
            .then(($input) => {
              const files = $input[0].files;
              expect(files).to.have.lengthOf(1);
              expect(files[0].name).to.eq(filename);
            });
        });

        it('can reset the file input', function () {
          getFileInputReset().click();

          expectEmptyFileInput();
        });

        it('upload button is not disabled', function () {
          getUploadButton().should('not.be.disabled');
        });

        describe('after uploading first potrait', function () {
          beforeEach(function () {
            uploadPotrait(username, filename);
          });

          it('upload success message is displayed', function () {
            cy.expectAlertSuccess(/^Potrait uploaded/);
          });

          it('file input is resetted', function () {
            expectEmptyFileInput();
          });

          it('file is added to redux store', function () {
            cy.getStore()
              .its('auth.potrait')
              .should('not.eq', null);
          });

          describe('after uploading second potrait', function () {
            const secondFilename = filename;

            beforeEach(function () {
              // remember old potrait to be compared for later
              cy.getStore()
                .its('auth.potrait')
                .as('oldPotrait');

              uploadPotrait(username, secondFilename);
            });

            it('upload success message is displayed', function () {
              cy.expectAlertSuccess(/^Potrait uploaded/);
            });

            it('potrait is replaced in the redux store', function () {
              cy.getStore()
                .its('auth.potrait')
                .should('not.eq', null)
                .should('not.eq', this.oldPotrait);
            });
          });
        });
      });
    });

    describe('delete potrait', function () {
      describe('when user does not have a potrait', function () {
        it('delete button is not visible', function () {
          getDeleteButton()
            .should('not.exist');
        });
      });

      describe('when user has a potrait', function () {
        beforeEach(function () {
          uploadPotrait(username, filename);
        });

        it('delete button is visible', function () {
          getDeleteButton();
        });

        describe('after deleting potrait', function () {
          beforeEach(function () {
            getDeleteButton().click();
          });

          it('delete success message is displayed', function () {
            cy.expectAlertSuccess(/^Potrait removed/);
          });

          it('delete button is not visible', function () {
            getDeleteButton()
              .should('not.exist');
          });

          it('potrait is removed from redux store', function () {
            cy.getStore()
              .its('auth.potrait')
              .should('eq', null);
          });
        });
      });
    });
  });
});