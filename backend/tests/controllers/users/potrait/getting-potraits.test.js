const supertest = require('supertest');
const path = require('path');

const app = require('../../../../src/app');
const {
  existingUserValues, disabledExistingUserValues, nonExistingUserValues,
  existingUserPotraitValues, 
} = require('../../../helpers/constants');

const { compareFoundWithResponse, createUser, findPotrait } = require('../../../helpers');

const { getNonSensitivePotrait } = require('../../../../src/util/dto');
const imageStorage = require('../../../../src/util/image-storage');

const api = supertest(app);
const baseUrl = '/api/users';

const getPotrait = async (username, statusCode = 200, headers = {}) => {
  const response = await api
    .get(`${baseUrl}/${username}/potrait/`)
    .set(headers)
    .expect(statusCode)
    .expect('Content-Type', /application\/json/);

    return response.body;
};

const getPotraitContent = async (username, statusCode = 200, headers = {}) => {
  return await api
    .get(`${baseUrl}/${username}/potrait/content`)
    .set(headers)
    .expect(statusCode);
};

describe('find users potrait', () => {
  const getImageFilePathSpy = jest.spyOn(imageStorage, 'getImageFilePath');

  test('can not get non-existing users potrait', async () => {
    const username = nonExistingUserValues.username;
    const responseBody = await getPotrait(username, 404)

    expect(responseBody.message).toBe('user does not exist');
  });

  test('can not get disabled users potrait', async () => {
    const username = disabledExistingUserValues.username;
    const responseBody = await getPotrait(username, 400)

    expect(responseBody.message).toBe('user is disabled');
  });

  test('getting potrait of a user that does not have one is bad request', async () => {
    // create a new user that does not have any images
    const newUser = await createUser(nonExistingUserValues);

    const responseBody = await getPotrait(newUser.username, 404);
  
    expect(responseBody.message).toBe('user does not have a potrait');
  });

  test('can not view users potrait content when user does not have a potrait', async () => {
    const newUser = await createUser(nonExistingUserValues);

    const response = await getPotraitContent(newUser.username, 404);
  
    expect(response.body.message).toBe('user does not have a potrait');
  });

  describe('when potraits have been created', () => {
    const username = existingUserValues.username;

    let foundPotrait;
    beforeEach(async () => {
      foundPotrait = await findPotrait(username);
    });

    test('can get a potrait without authentication', async () => {
      const returnedPotrait = await getPotrait(username);

      compareFoundWithResponse(
        getNonSensitivePotrait(foundPotrait),
        returnedPotrait
      );
    });

    describe('getting potrait content', () => {
      beforeEach(async () => {
        getImageFilePathSpy.mockImplementationOnce(filepath => {
          return path.join(path.resolve(), foundPotrait.filepath);
        });
      });

      afterEach(async () => {
        expect(getImageFilePathSpy).toHaveBeenCalledWith(foundPotrait.filepath);
      });

      test('can view a potrait content without authentication', async () => {
        await getPotraitContent(username);
      });
  
      test('potrait content response has correct content-type', async () => {
        const response = await getPotraitContent(username);
  
        expect(response.get('content-type')).toBe(foundPotrait.mimetype);
      });
    });
  });
});