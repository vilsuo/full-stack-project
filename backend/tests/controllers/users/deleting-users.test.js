const supertest = require('supertest');
const omit = require('lodash.omit');

const app = require('../../../src/app');
const { Image, User, Potrait } = require('../../../src/models');
const { existingUserValues, otherExistingUserValues, nonExistingUserValues } = require('../../helpers/constants');
const { login } = require('../../helpers');
const api = supertest(app);
const baseUrl = '/api/users';

const deleteUser = async (username, headers = {}, statusCode = 401) => {
  return await api
    .delete(`${baseUrl}/${username}`)
    .set(headers)
    .expect(statusCode);
};

describe('deleting users', () => {
  const credentials = omit(existingUserValues, ['name']);
  const username = existingUserValues.username;

  describe('without authentication', () => {
    test('can not delete user', async () => {
      const response = await deleteUser(username, {}, 401);
      expect(response.body.message).toBe('authentication required');
    });

    test('can not delete non-existing user', async () => {
      const response = await deleteUser(nonExistingUserValues.username, {}, 404);
      expect(response.body.message).toBe('user does not exist');
    });
  });

  describe('with authentication', () => {
    let authHeader = {};

    beforeEach(async () => {
      authHeader = await login(api, credentials);
    });

    describe('user deleting itself', () => {
      test('user can delete itself', async () => {
        await deleteUser(username, authHeader, 204);
      });

      // do not find by userId after deleting, incorrect cascade could set it to null
      describe('after deleting', () => {
        let user;
        let usersImages;
        let usersPotrait;

        beforeEach(async () => {
          user = await User.findOne({ where: { username } });
          usersImages = await Image.findAll({ where: { userId: user.id } });
          usersPotrait = await Potrait.findOne({ where: { userId: user.id } });

          await deleteUser(username, authHeader, 204);
        });

        test('user can not be found', async () => {
          const foundUser = await User.findOne({ where: { username } });
          expect(foundUser).toBeFalsy();
        });

        test('users images can not be found', async () => {
          usersImages.forEach(async image => {
            const foundImage = await Image.findByPk(image.id);
            expect(foundImage).toBeFalsy();
          });
        });

        test('users potrait can not be found', async () => {
          const foundPotrait = await Potrait.findByPk(usersPotrait.id);
          expect(foundPotrait).toBeFalsy();
        });
      });
    });

    test('user can not delete other user', async () => {
      const response = await deleteUser(otherExistingUserValues.username, authHeader, 401);
      expect(response.body.message).toBe('session user is not the owner');
    });
  })
});