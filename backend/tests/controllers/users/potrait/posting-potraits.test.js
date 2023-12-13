const supertest = require('supertest');
const omit = require('lodash.omit');

const app = require('../../../../src/app');
const { User, Potrait } = require('../../../../src/models');
const {
  existingUserValues, otherExistingUserValues, nonExistingUserValues,
  nonExistingPotraitValues, invalidPotraitTypes, 
} = require('../../../helpers/constants');

const { login, compareFoundWithResponse, findPotrait, createPotrait, createUser } = require('../../../helpers');

const { getNonSensitivePotrait } = require('../../../../src/util/dto');
const imageStorage = require('../../../../src/util/image-storage');

const api = supertest(app);
const baseUrl = '/api/users';

const putPotrait = async (username, extraHeaders, filepath, statusCode = 201) => {
  const headers = {
    'Content-Type': 'multipart/form-data',
    ...extraHeaders
  };

  const response = await api
    .put(`${baseUrl}/${username}/potrait`)
    .set(headers)
    .attach('image', filepath)
    .expect(statusCode)
    .expect('Content-Type', /application\/json/);

  return response.body;
};

describe('posting potraits', () => {
  const { filepath, mimetype, size } = nonExistingPotraitValues;

  const removeFileSpy = jest
    .spyOn(imageStorage, 'removeFile')
    .mockImplementation((filepath) => console.log(`spy called with ${filepath}`));

  test('can not post without authentication', async () => {
    const username = existingUserValues.username;

    const headers = {
      // there is a bug in supertest, this seems to fix it
      // https://stackoverflow.com/questions/54936185/express-mongoose-jest-error-econnaborted
      // https://github.com/ladjs/supertest/issues/230
      'Connection': 'keep-alive',
    };

    const responseBody = await putPotrait(
      username, {} /* headers */, filepath, 401
    );

    expect(responseBody.message).toBe('authentication required');
  });

  describe('with authentication', () => {
    describe('posting to self', () => {
      // expect status '201'
      describe('posting first when user does not have a potrait', () => {
        const credentials = omit(nonExistingUserValues, ['name']);
        const postingUsersUsername = credentials.username;
    
        let authHeader = {};
    
        beforeEach(async () => {
          // new user does not have a potrait
          await createUser(nonExistingUserValues);
          authHeader = await login(api, credentials);
        });

        test('can post a potrait', async () => {
          const returnedPotrait = await putPotrait(
            postingUsersUsername, authHeader, filepath
          );

          const foundUser = await User.findOne({ 
            where: { username: postingUsersUsername }
          });

          // details from the posted file are saved
          expect(returnedPotrait.mimetype).toBe(mimetype);
          expect(returnedPotrait.size).toBe(size);

          // potrait is save to correct user
          expect(returnedPotrait.userId).toBe(foundUser.id);
        });

        test('potrait exists after posting', async () => {
          const foundPotraitBefore = await findPotrait(postingUsersUsername);
          expect(foundPotraitBefore).toBeFalsy();

          const returnedPotrait = await putPotrait(
            postingUsersUsername, authHeader, filepath
          );

          const foundPotraitAfter = await findPotrait(postingUsersUsername);
          compareFoundWithResponse(
            getNonSensitivePotrait(foundPotraitAfter),
            returnedPotrait
          );
        });

        test('potrait filepath is not returned', async () => {
          const returnedPotrait = await putPotrait(
            postingUsersUsername, authHeader, filepath
          );

          expect(returnedPotrait).not.toHaveProperty('filepath');
        });

        test('there is no attempt to delete any files from the filesystem', async () => {
          await putPotrait(postingUsersUsername, authHeader, filepath);

          expect(removeFileSpy).not.toHaveBeenCalled();
        });
      });

      /*
      // TODO
      // expect status '200'
      describe('posting when user already has a potrait', () => {
        const credentials = omit(existingUserValues, ['name']);
        const postingUsersUsername = credentials.username;

        let authHeader = {};

        beforeEach(async () => {
          authHeader = await login(api, credentials);
        });

        test('can post a new potrait', async () => {

        });

        test('old potrait is deleted on succesfull post', async () => {

        });

        test('old potrait is not deleted on unsuccessfull post', async () => {

        });

        describe('invalid files', () => {
          const txtFilepath = invalidPotraitTypes[0].filepath;
  
          test('text files are not allowed', async () => {
            const responseBody = await putPotrait(
              postingUsersUsername, authHeader, txtFilepath, 400
            );
    
            expect(responseBody.message).toMatch(
              /^File upload only supports the following filetypes/
            );
          });
        });
      });
      */
    });

    test('can not post a potrait to other user', async () => {
      const credentials = omit(existingUserValues, ['name']);
      const authHeader = await login(api, credentials);

      const otherUsername = otherExistingUserValues.username;

      const responseBody = await putPotrait(
        otherUsername, authHeader, filepath, 401
      );

      expect(responseBody.message).toBe('session user is not the owner');
    });
  });
});