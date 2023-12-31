const supertest = require('supertest');

const app = require('../../../../src/app');
const { User, Relation } = require('../../../../src/models');
const { 
  existingUserValues, otherExistingUserValues, getCredentials 
} = require('../../../helpers/constants');

const { login } = require('../../../helpers');

const api = supertest(app);
const baseUrl = '/api/users';

/*
TODO
- write test to deleting source/target users also (when deleting user: all
  relations with the user as source OR target will be removed): the other
  user is not deleted
*/
const relationTypes = Relation.getAttributes().type.values;

const deleteRelation = async (username, relationId, headers, statusCode = 204) => {

  const response = await api
    .delete(`${baseUrl}/${username}/relations/${relationId}`)
    .set(headers)
    .expect(statusCode);

  return response.body;
};

describe('deleting relations', () => {
  const credentials = getCredentials(existingUserValues);
  const username = credentials.username;

  const otherUsername = otherExistingUserValues.username;

  let relations = {};

  // create relations from user to other user
  beforeEach(async () => {
    const user = await User.findOne({ where: { username } });
    const otherUser = await User.findOne({ where: { username: otherUsername } });

    relations['follow'] = await Relation.create({
      sourceUserId: user.id, targetUserId: otherUser.id, type: 'follow'
    });
    relations['block'] = await Relation.create({
      sourceUserId: user.id, targetUserId: otherUser.id, type: 'block'
    });
  });

  test.each(relationTypes)
  ('can not delete of relation of type %s without authentication', async (type) => {
    const responseBody = await deleteRelation(
      username, relations[type].id, {}, 401
    );

    expect(responseBody.message).toBe('authentication required');
  });

  describe('with authentication', () => {
    beforeEach(async () => {
      authHeader = await login(api, credentials);
    });

    describe('deleting relations where the user is the source', () => {
      test.each(relationTypes)('can delete relation of type %s', async (type) => {
        await deleteRelation(username, relations[type].id, authHeader);
      });

      /*
      describe('after succesully deleting a relation', () => {
        test.each(relationTypes)
        ('relation of type %s can not be found after deleting', async () => {

        });

        test.each(relationTypes)
        ('relation of type %s is not removed the other way', async () => {

        });

        test.each(relationTypes)
        ('users other relations of type %s with the user are not removed', async () => {

        });

        test('neither the source or the target user are removed', async () => {

        });
      });
      */
    });

    /*
    test('can not delete relations where the user is the target', () => {

    });
    */

    test('can not delete relation if it does not exist', async () => {
      const nonExistingRelationId = 2024;
      const responseBody = await deleteRelation(
        username, nonExistingRelationId, authHeader, 404
      );

      expect(responseBody.message).toBe('relation does not exist');
    });
  });
});