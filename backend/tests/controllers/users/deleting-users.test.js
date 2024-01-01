const supertest = require('supertest');
const omit = require('lodash.omit');

const app = require('../../../src/app');
const { Image, User, Potrait, Relation } = require('../../../src/models');
const { 
  existingUserValues, otherExistingUserValues, nonExistingUserValues 
} = require('../../helpers/constants');
const { login, createRelationsOfAllTypes } = require('../../helpers');
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

      describe('after deleting', () => {

        let userId;

        beforeEach(async () => {
          userId = (await User.findOne({ where: { username } })).id;

          const otherUserId = (await User.findOne({
            where: { username: otherExistingUserValues.username }
          })).id;

          // create relations of all types where the user is the source
          await createRelationsOfAllTypes(userId, otherUserId);

          // create relations of all types where the user is the target
          await createRelationsOfAllTypes(otherUserId, userId);

          await deleteUser(username, authHeader, 204);
        });

        test('user can not be found', async () => {
          const foundUserPyPk = await User.findByPk(userId);
          expect(foundUserPyPk).toBeFalsy();

          const foundUserByUsername = await User.findOne({ where: { username } });
          expect(foundUserByUsername).toBeFalsy();
        });

        test('users images can not be found', async () => {
          const foundImages = await Image.findAll({ where: { userId } });
          expect(foundImages).toHaveLength(0);
        });

        test('users potrait can not be found', async () => {
          const foundPotrait = await Potrait.findAll({ where: { userId } })
          expect(foundPotrait).toHaveLength(0);
        });

        test('relation where the user is the source can not be found', async () => {
          const foundRelations = await Relation.findAll({ where: { sourceUserId: userId } });
          expect(foundRelations).toHaveLength(0);
        });
  
        test('relation where the user is the target can not be found', async () => {
          const foundRelations = await Relation.findAll({ where: { targetUserId: userId } });
          expect(foundRelations).toHaveLength(0);
        });
      });
    });

    test('user can not delete other user', async () => {
      const response = await deleteUser(otherExistingUserValues.username, authHeader, 401);
      expect(response.body.message).toBe('session user is not the owner');
    });
  })
});