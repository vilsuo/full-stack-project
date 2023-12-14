const supertest = require('supertest');
const omit = require('lodash.omit');

const app = require('../../../../src/app');
const { User, Potrait } = require('../../../../src/models');
const {
  existingUserValues, otherExistingUserValues, nonExistingUserValues,
  nonExistingPotraitValues, invalidPotraitTypes, 
} = require('../../../helpers/constants');

const { login, compareFoundWithResponse, findPotrait, createUser } = require('../../../helpers');

const { getNonSensitivePotrait } = require('../../../../src/util/dto');
const imageStorage = require('../../../../src/util/image-storage');
const { ValidationError } = require('sequelize');

const api = supertest(app);
const baseUrl = '/api/users';

/*
TODO
- 'on unsuccessull put':
  - how to check that file being removed was the posted one?
*/

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

describe('putting potraits', () => {
  const { filepath, mimetype, size } = nonExistingPotraitValues;

  const removeFileSpy = jest.spyOn(imageStorage, 'removeFile');

  beforeEach(() => {
    removeFileSpy.mockImplementation((filepath) => {
      console.log(`'removeFileSpy' called with '${filepath}'`)
    });
  });

  test('can not put without authentication', async () => {
    const username = existingUserValues.username;

    const headers = {
      // there is a bug in supertest, this seems to fix it
      // https://stackoverflow.com/questions/54936185/express-mongoose-jest-error-econnaborted
      // https://github.com/ladjs/supertest/issues/230
      'Connection': 'keep-alive',
    };

    const responseBody = await putPotrait(
      username, headers, filepath, 401
    );

    expect(responseBody.message).toBe('authentication required');
  });

  describe('with authentication', () => {
    describe('putting to self', () => {
      // expect status '201'
      describe('putting first when user does not have a potrait', () => {
        const credentials = omit(nonExistingUserValues, ['name']);
        const postingUsersUsername = credentials.username;
    
        let authHeader = {};
    
        beforeEach(async () => {
          // new user does not have a potrait
          await createUser(nonExistingUserValues);
          authHeader = await login(api, credentials);
        });

        test('can put a potrait', async () => {
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

        test('potrait exists after putting', async () => {
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

      // expect status '200'
      describe('putting when user already has a potrait', () => {
        const credentials = omit(existingUserValues, ['name']);
        const puttingUsersUsername = credentials.username;

        let authHeader = {};

        beforeEach(async () => {
          authHeader = await login(api, credentials);
        });

        test('can put a potrait', async () => {
          const returnedPotrait = await putPotrait(
            puttingUsersUsername, authHeader, filepath, 200
          );

          const foundUser = await User.findOne({ 
            where: { username: puttingUsersUsername }
          });

          // details from the posted file are saved
          expect(returnedPotrait.mimetype).toBe(mimetype);
          expect(returnedPotrait.size).toBe(size);

          // potrait is save to correct user
          expect(returnedPotrait.userId).toBe(foundUser.id);
        });

        describe('on successfull put', () => {
          let oldPotraitBefore;
          let returnedPotrait;
          beforeEach(async () => {
            oldPotraitBefore = await findPotrait(puttingUsersUsername);
            expect(oldPotraitBefore).not.toBeFalsy();

            returnedPotrait = await putPotrait(
              puttingUsersUsername, authHeader, filepath, 200
            );
          });

          test('putting replaces the old potrait', async () => {
            expect(returnedPotrait.id).not.toBe(oldPotraitBefore.id);

            const foundPotrait = await findPotrait(puttingUsersUsername);
            compareFoundWithResponse(
              getNonSensitivePotrait(foundPotrait),
              returnedPotrait
            );
          });

          test('old potrait is no longer found after succesfull put', async () => {
            const oldPotraitAfter = await Potrait.findByPk(oldPotraitBefore.id);
            expect(oldPotraitAfter).toBeFalsy();
          });

          test('user has only one potrait', async () => {
            const user = await User.findOne({ where: { username: puttingUsersUsername } });
            const usersPotraits = await Potrait.findAll({ where: { userId: user.id } });

            expect(usersPotraits).toHaveLength(1);
          });

          test('there is an attempt to remove the old potrait file from the filesystem', async () => {
            // mock was called with old potraits filepath
            expect(removeFileSpy).toHaveBeenCalledWith(oldPotraitBefore.filepath);
          });
        });

        describe('on unsuccessull put', () => {
          describe('when failing potrait validation', () => {
            const createPotraitSpy = jest.spyOn(Potrait, 'create');

            beforeEach(() => {
              // mock routes 'reatePotrait' to throw error on create...
              createPotraitSpy.mockImplementationOnce(async (values, options) => {
                throw new ValidationError('mocked validation error');
              });
            });

            afterEach(() => {
              expect(createPotraitSpy).toHaveBeenCalled();
            });

            test('old potrait can be found after failing to create a potrait', async () => {
              const potraitBefore = await findPotrait(puttingUsersUsername);

              await putPotrait(puttingUsersUsername, authHeader, filepath, 400);

              const potraitAfter = await findPotrait(puttingUsersUsername);
              expect(potraitAfter).toStrictEqual(potraitBefore);
            });

            test('there is an attempt to remove a file from the filesystem', async () => {
              await putPotrait(puttingUsersUsername, authHeader, filepath, 400);

              expect(removeFileSpy).toHaveBeenCalled();
            });
          });

          describe('invalid file', () => {
            const txtFilepath = invalidPotraitTypes[0].filepath;
            const filepathToInvalidFile = txtFilepath;

            test('text files are not allowed', async () => {
              const responseBody = await putPotrait(
                puttingUsersUsername, authHeader, txtFilepath, 400
              );
      
              expect(responseBody.message).toMatch(
                /^File upload only supports the following filetypes/
              );
            });

            test('old potrait can be found after putting invalid file', async () => {
              const potraitBefore = await findPotrait(puttingUsersUsername);
  
              await putPotrait(puttingUsersUsername, authHeader, filepathToInvalidFile, 400);
  
              const potraitAfter = await findPotrait(puttingUsersUsername);
  
              expect(potraitAfter).toStrictEqual(potraitBefore);
            });

            test('there is no attempt to remove a file from the filesystem', async () => {
              await putPotrait(puttingUsersUsername, authHeader, filepathToInvalidFile, 400);

              expect(removeFileSpy).not.toHaveBeenCalled();
            });
          });
        });
      });
    });

    test('can not put a potrait to other user', async () => {
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