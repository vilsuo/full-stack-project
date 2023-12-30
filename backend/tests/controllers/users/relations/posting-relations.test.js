const supertest = require('supertest');

const app = require('../../../../src/app');
const { User, Relation } = require('../../../../src/models');
const { 
  existingUserValues, otherExistingUserValues, getCredentials 
} = require('../../../helpers/constants');

const { login, compareFoundWithResponse, createPotrait } = require('../../../helpers');

const api = supertest(app);
const baseUrl = '/api/users';

const postRelation = async (username, relationValues, headers, statusCode = 201) => {

  const response = await api
    .post(`${baseUrl}/${username}/relations`)
    .set(headers)
    .send(relationValues)
    .expect(statusCode)
    .expect('Content-Type', /application\/json/);

  return response.body;
};

const relationTypes = Relation.getAttributes().type.values;

describe('posting relations', () => {
  const username = existingUserValues.username;
  const otherUsername = otherExistingUserValues.username;

  let targetUserId;

  // find the target user id
  beforeEach(async () => {
    const targetUser = await User.findOne({ where: { username: otherUsername } });
    targetUserId = targetUser.id;
  });

  test.each(relationTypes)('can not post without authentication', async (type) => {
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
      test.each(relationTypes)('user can create a relation of type %s', async (type) => {
        await postRelation(username, { targetUserId, type }, authHeader);
      });

      test('user can have multiple relations of different type with the same user', async () => {
        await Promise.all(relationTypes.map(async type => {
          await postRelation(username, { targetUserId, type }, authHeader);
        }));
      });

      describe('after creating a relation', () => {
        test.each(relationTypes)('response contains created relation of type %s', async (type) => {
          const responseBody = await postRelation(
            username, { targetUserId, type }, authHeader
          );

          expect(responseBody.sourceUserId).toBe(sourceUserId);
          expect(responseBody.targetUserId).toBe(targetUserId);
          expect(responseBody.type).toBe(type);
        });

        test.each(relationTypes)
        ('relation of type %s can be found after creating it', async (type) => {
          const responseBody = await postRelation(
            username, { targetUserId, type }, authHeader
          );

          const foundRelation = await Relation.findByPk(responseBody.id);

          compareFoundWithResponse(foundRelation.toJSON(), responseBody);
        });

        test.each(relationTypes)
        ('relation of type %s can not be created again with same user', async (type) => {
          // create the relation for the first time
          await postRelation(username, { targetUserId, type }, authHeader);

          // create the relation for the second time
          const responseBody = await postRelation(
            username, { targetUserId, type }, authHeader, 400
          );

          expect(responseBody.message).toBe(`relation with type '${type}' already exists`);
        });

        test.each(relationTypes)
        ('relation of type %s is not added the other way', async (type) => {
          await postRelation(username, { targetUserId, type }, authHeader);

          const relations = await Relation.findAll({
            where: { sourceUserId: targetUserId, targetUserId: sourceUserId, type }
          });

          expect(relations).toHaveLength(0);
        });
      });

      /*
      describe('user can not create relation with...', () => {
        test.each(relationTypes)('itself of type %s', async (type) => {

        });

        test('invalid relation type', async () => {

        });
  
        test('invalid target user id', async () => {
  
        });
  
        test('target user that does not exist', async () => {
  
        });
      });
      */
    });

    test.each(relationTypes)('can not post relation to other user', async (type) => {
      const responseBody = await postRelation(
        otherUsername, { targetUserId, type }, authHeader, 401,
      );

      expect(responseBody.message).toBe('session user is not the owner');
    });
  });
})