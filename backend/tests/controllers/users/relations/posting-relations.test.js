const supertest = require('supertest');

const app = require('../../../../src/app');
const { User, Relation } = require('../../../../src/models');
const { 
  existingUserValues, otherExistingUserValues, getCredentials 
} = require('../../../helpers/constants');

const { login, compareFoundWithResponse } = require('../../../helpers');

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

    beforeEach(async () => {
      const credentials = getCredentials(existingUserValues);
      authHeader = await login(api, credentials);
    });

    /*
    describe('posting to self', () => {

      test.each(relationTypes)
        ('can not create a relation that already exists', async (type) => {

        });

      test('response contains created relation', async () => {

      });

      describe('user can not create relation with...', () => {
        test('itself', async () => {

        });

        test('invalid relation type', async () => {

        });
  
        test('invalid target user id', async () => {
  
        });
  
        test('target user that does not exist', async () => {
  
        });
      });

      test('relation is not added the other way', async () => {

      });

      test('user can have multiple different relation with the same user', async () => {

      });
    });
    */

    test.each(relationTypes)('can not post relation to other user', async (type) => {
      const responseBody = await postRelation(
        otherUsername, { targetUserId, type }, authHeader, 401,
      );

      expect(responseBody.message).toBe('session user is not the owner');
    });
  });
})