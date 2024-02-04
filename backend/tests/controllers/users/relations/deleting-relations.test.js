const supertest = require('supertest');

const app = require('../../../../src/app');
const { User, Relation } = require('../../../../src/models');
const {
  existingUserValues, otherExistingUserValues, getCredentials,
} = require('../../../helpers/constants');

const {
  login, compareFoundArrayWithResponseArray, createRelationsOfAllTypes,
} = require('../../../helpers');
const { RELATION_TYPES } = require('../../../../src/constants');

const api = supertest(app);
const baseUrl = '/api/users';

const deleteRelation = async (username, relationId, headers, statusCode) => {
  const response = await api
    .delete(`${baseUrl}/${username}/relations/${relationId}`)
    .set(headers)
    .expect(statusCode);

  return response.body;
};

describe('deleting relations', () => {
  const credentials = getCredentials(existingUserValues);
  const { username } = credentials;

  const otherUsername = otherExistingUserValues.username;

  let userId;
  let otherUserId;
  let relations = {};

  // create relations from user to other user
  beforeEach(async () => {
    userId = (await User.findOne({ where: { username } })).id;
    otherUserId = (await User.findOne({ where: { username: otherUsername } })).id;

    relations = {};
    (await createRelationsOfAllTypes(userId, otherUserId))
      .forEach((relation) => { relations[relation.type] = relation; });
  });

  test.each(RELATION_TYPES)(
    'can not delete of relation of type %s without authentication',
    async (type) => {
      const responseBody = await deleteRelation(username, relations[type].id, {}, 401);

      expect(responseBody.message).toBe('Authentication required');
    },
  );

  describe('with authentication', () => {
    let authHeader;

    beforeEach(async () => {
      authHeader = await login(api, credentials);
    });

    describe('deleting relations where the user is the source', () => {
      test.each(RELATION_TYPES)(
        'can delete relation of type %s',
        async (type) => {
          await deleteRelation(username, relations[type].id, authHeader, 204);
        },
      );

      describe.each(RELATION_TYPES)('after succesully deleting a relation of type %s', (type) => {
        let relationToDelete;

        beforeEach(() => {
          relationToDelete = relations[type];
        });

        test('relation can not be found after deleting', async () => {
          await deleteRelation(username, relationToDelete.id, authHeader, 204);

          const foundRelation = await Relation.findByPk(relationToDelete.id);
          expect(foundRelation).toBeFalsy();
        });

        test('relation with the same type is not removed the other way', async () => {
          // create relation with the same type in the other direction
          const relation = await Relation.create({
            sourceUserId: relationToDelete.targetUserId,
            targetUserId: relationToDelete.sourceUserId,
            type,
          });

          await deleteRelation(username, relationToDelete.id, authHeader, 204);

          // the relation is not deleted
          const foundRelation = await Relation.findByPk(relation.id);
          expect(foundRelation).not.toBeFalsy();
        });

        test('users other relations with the same user are not removed', async () => {
          await deleteRelation(username, relationToDelete.id, authHeader, 204);

          const otherRelationTypes = Object.keys(relations)
            .filter((relationType) => relationType !== type);

          const relationsLeft = await Relation.findAll({
            where: { sourceUserId: userId, targetUserId: otherUserId },
          });

          compareFoundArrayWithResponseArray(
            relationsLeft.map((relation) => relation.type),
            otherRelationTypes,
          );
        });

        test('neither the source or the target user are removed', async () => {
          await deleteRelation(username, relationToDelete.id, authHeader, 204);

          const foundSourceUser = await User.findByPk(relationToDelete.sourceUserId);
          const foundTargetUser = await User.findByPk(relationToDelete.targetUserId);

          expect(foundSourceUser).not.toBeFalsy();
          expect(foundTargetUser).not.toBeFalsy();
        });
      });
    });

    test.each(RELATION_TYPES)(
      'can not delete relation of type %s where the user is the target',
      async (type) => {
        const relation = await Relation.create({
          sourceUserId: otherUserId, targetUserId: userId, type,
        });

        const responseBody = await deleteRelation(username, relation.id, authHeader, 404);
        expect(responseBody.message).toBe('Relation does not exist');
      },
    );

    test('can not delete relation if it does not exist', async () => {
      const nonExistingRelationId = 2024;
      const responseBody = await deleteRelation(
        username,
        nonExistingRelationId,
        authHeader,
        404,
      );

      expect(responseBody.message).toBe('Relation does not exist');
    });
  });
});
