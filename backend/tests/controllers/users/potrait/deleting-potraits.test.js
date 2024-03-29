const supertest = require('supertest');
const app = require('../../../../src/app');
const { Potrait, User } = require('../../../../src/models');
const fileStorage = require('../../../../src/util/file-storage');
const {
  existingUserValues, otherExistingUserValues, getCredentials,
} = require('../../../helpers/constants');
const { login, findPotrait } = require('../../../helpers');

const api = supertest(app);
const baseUrl = '/api/users';

const deletePotrait = async (username, headers, statusCode) => api
  .delete(`${baseUrl}/${username}/potrait`)
  .set(headers)
  .expect(statusCode);

describe('deleting potraits', () => {
  const removeFileSpy = jest.spyOn(fileStorage, 'removeFile')
    .mockImplementation(() => undefined);

  const credentials = getCredentials(existingUserValues);
  const { username } = existingUserValues;
  const otherUsername = otherExistingUserValues.username;

  let potrait;
  beforeEach(async () => {
    potrait = await findPotrait(username);
  });

  test('can not delete potrait without authentication', async () => {
    const response = await deletePotrait(username, {}, 401);

    expect(response.body.message).toBe('Authentication required');
  });

  describe('with authentication', () => {
    let authHeader = {};

    beforeEach(async () => {
      authHeader = await login(api, credentials);
    });

    describe('deleting own potrait', () => {
      test('can delete own potrait', async () => {
        await deletePotrait(username, authHeader, 204);
      });

      test('can not delete potrait if user does not have a potrait', async () => {
        // first delete the users potrait
        const userId = (await User.findByUsername(username)).id;
        await Potrait.destroy({ where: { userId } });

        const response = await deletePotrait(username, authHeader, 404);

        expect(response.body.message).toBe('User does not have a potrait');
      });

      describe('after deleting an potrait', () => {
        beforeEach(async () => {
          await deletePotrait(username, authHeader, 204);
        });

        test('potrait can not be found', async () => {
          const foundPotrait = await findPotrait(username);
          expect(foundPotrait).toBeFalsy();
        });

        test('attempt is made to remove file from the filesystem', async () => {
          expect(removeFileSpy).toHaveBeenCalledWith(potrait.filepath);
        });

        test('user is not deleted', async () => {
          const foundUser = await User.findByUsername(username);
          expect(foundUser).not.toBeFalsy();
          expect(foundUser.id).not.toBeFalsy();
        });
      });
    });

    test('can not delete other users potrait', async () => {
      const response = await deletePotrait(otherUsername, authHeader, 401);

      expect(response.body.message).toBe('Private access');
    });
  });
});
