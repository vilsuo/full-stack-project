const supertest = require('supertest');

const parser = require('../../../../src/util/parser');
const app = require('../../../../src/app');
const { User, Relation } = require('../../../../src/models');
const { 
  existingUserValues, otherExistingUserValues, getCredentials 
} = require('../../../helpers/constants');

const { login, compareFoundWithResponse } = require('../../../helpers');
const { RELATION_TYPES, RELATION_FOLLOW } = require('../../../../src/constants');

const api = supertest(app);
const baseUrl = '/api/users';

const parseRelationTypeSpy = jest.spyOn(parser, 'parseRelationType');

const postRelation = async (username, relationValues, headers, statusCode) => {
  const response = await api
    .post(`${baseUrl}/${username}/relations`)
    .set(headers)
    .send(relationValues)
    .expect(statusCode)
    .expect('Content-Type', /application\/json/);

  return response.body;
};

describe('posting relations', () => {
  const username = existingUserValues.username;
  const otherUsername = otherExistingUserValues.username;

  let targetUserId;

  // find the target user id
  beforeEach(async () => {
    const targetUser = await User.findOne({ where: { username: otherUsername } });
    targetUserId = targetUser.id;
  });

  test.each(RELATION_TYPES)('can not post relation of type %s without authentication', async (type) => {
    const responseBody = await postRelation(
      username, { targetUserId, type }, {}, 401,
    );

    expect(responseBody.message).toBe('authentication required');
  });

  describe('with authentication', () => {

    let authHeader = {};
    let sourceUserId;

    // log in
    beforeEach(async () => {
      const sourceUser = await User.findOne({ where: { username } });
      sourceUserId = sourceUser.id;

      const credentials = getCredentials(existingUserValues);
      authHeader = await login(api, credentials);
    });

    describe('posting to self', () => {
      test.each(RELATION_TYPES)('user can create a relation of type %s', async (type) => {
        await postRelation(username, { targetUserId, type }, authHeader, 201);
      });

      test.each(RELATION_TYPES)('user can not create a relation of type %s with a disabled user', async (type) => {
        const disabledUser = await User.findOne({ where: { disabled: true } });
        const responseBody = await postRelation(
          username, { targetUserId: disabledUser.id, type }, authHeader, 400
        );

        expect(responseBody.message).toBe('target user is disabled');
      });

      test('user can have multiple relations of different type with the same user', async () => {
        await Promise.all(RELATION_TYPES.map(async type => {
          await postRelation(username, { targetUserId, type }, authHeader, 201);
        }));
      });

      test.each(RELATION_TYPES)('relation type %s is parsed', async (type) => {
        await postRelation(username, { targetUserId, type }, authHeader, 201);

        expect(parseRelationTypeSpy).toHaveBeenCalledWith(type);
      });

      describe('after creating a relation', () => {
        test.each(RELATION_TYPES)('response contains created relation of type %s', async (type) => {
          const responseBody = await postRelation(
            username, { targetUserId, type }, authHeader, 201
          );

          expect(responseBody.sourceUserId).toBe(sourceUserId);
          expect(responseBody.targetUserId).toBe(targetUserId);
          expect(responseBody.type).toBe(type);
        });

        test.each(RELATION_TYPES)
        ('relation of type %s can be found after creating it', async (type) => {
          const responseBody = await postRelation(
            username, { targetUserId, type }, authHeader, 201
          );

          const foundRelation = await Relation.findByPk(responseBody.id);

          compareFoundWithResponse(foundRelation.toJSON(), responseBody);
        });

        test.each(RELATION_TYPES)
        ('relation of type %s can not be created again with same user', async (type) => {
          // create the relation for the first time
          await postRelation(username, { targetUserId, type }, authHeader, 201);

          // create the relation for the second time
          const responseBody = await postRelation(
            username, { targetUserId, type }, authHeader, 400
          );

          expect(responseBody.message).toBe(`relation with type '${type}' already exists`);
        });

        test.each(RELATION_TYPES)
        ('relation of type %s is not added the other way', async (type) => {
          await postRelation(username, { targetUserId, type }, authHeader, 201);

          const relations = await Relation.findAll({
            where: { sourceUserId: targetUserId, targetUserId: sourceUserId, type }
          });

          expect(relations).toHaveLength(0);
        });
      });

      describe('user can not create relation with...', () => {
        const validType = RELATION_FOLLOW;

        test('missing relation type', async () => {
          const responseBody = await postRelation(
            username, { targetUserId }, authHeader, 400
          );

          expect(responseBody.message).toBe('relation type is missing');
        });

        test('invalid relation type', async () => {
          const invalidType = 'asdkdk';

          const responseBody = await postRelation(
            username, { targetUserId, type: invalidType }, authHeader, 400
          );

          expect(responseBody.message).toBe('invalid relation type');
        });

        test('missing target user id', async () => {
          const responseBody = await postRelation(
            username, { type: validType }, authHeader, 400
          );

          expect(responseBody.message).toBe('id is missing');
        });
  
        test('invalid target user id', async () => {
          const invalidTargetUserId = 1.1;

          const responseBody = await postRelation(
            username, { targetUserId: invalidTargetUserId, type: validType }, authHeader, 400
          );

          expect(responseBody.message).toBe('id is invalid');
        });
  
        test('target user that does not exist', async () => {
          const nonExistingUserId = 999;
          const responseBody = await postRelation(
            username, { targetUserId: nonExistingUserId, type: validType }, authHeader, 404
          );

          expect(responseBody.message).toBe('target user does not exist');
        });

        test.each(RELATION_TYPES)('itself of type %s', async (type) => {
          const responseBody = await postRelation(
            username, { targetUserId: sourceUserId, type }, authHeader, 400
          );

          expect(responseBody.message).toBe('user can not have a relation with itself');
        });
      });
    });

    test.each(RELATION_TYPES)('can not post relation of type %s to other user', async (type) => {
      const responseBody = await postRelation(
        otherUsername, { targetUserId, type }, authHeader, 401,
      );

      expect(responseBody.message).toBe('session user is not the owner');
    });
  });
})