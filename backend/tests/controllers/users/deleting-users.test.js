const supertest = require('supertest');

const app = require('../../../src/app');
const fileStorage = require('../../../src/util/file-storage');
const { Image, User, Potrait, Relation } = require('../../../src/models');
const { 
  existingUserValues, otherExistingUserValues, nonExistingUserValues,
  getCredentials
} = require('../../helpers/constants');
const { login, createRelationsOfAllTypes } = require('../../helpers');
const api = supertest(app);
const baseUrl = '/api/users';

const removeUserFilesSpy = jest.spyOn(fileStorage, 'removeUserFiles')
  .mockImplementation(userId => undefined);

const deleteUser = async (username, headers, statusCode) => {
  return await api
    .delete(`${baseUrl}/${username}`)
    .set(headers)
    .expect(statusCode);
};

describe('deleting users', () => {
  const credentials = getCredentials(existingUserValues);
  const username = credentials.username;

  describe('without authentication', () => {
    test('can not delete user', async () => {
      const response = await deleteUser(username, {}, 401);
      expect(response.body.message).toBe('Authentication required');
    });

    test('can not delete non-existing user', async () => {
      const response = await deleteUser(nonExistingUserValues.username, {}, 404);
      expect(response.body.message).toBe('User does not exist');
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

        test('user images can not be found', async () => {
          const foundImages = await Image.findAll({ where: { userId } });
          expect(foundImages).toHaveLength(0);
        });

        test('user potrait can not be found', async () => {
          const foundPotrait = await Potrait.findAll({ where: { userId } })
          expect(foundPotrait).toHaveLength(0);
        });

        test('there is an attempt to remove all user files from the filesystem', async () => {
          expect(removeUserFilesSpy).toHaveBeenCalledWith(userId);
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
      expect(response.body.message).toBe('Private access');

      expect(removeUserFilesSpy).not.toHaveBeenCalled();
    });
  })
});