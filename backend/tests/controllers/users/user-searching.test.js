const supertest = require('supertest');
const app = require('../../../src/app');

const { User } = require('../../../src/models');
const {
  existingUserValues,
  existingDisabledUserValues,
  nonExistingUserValues
} = require('../../helpers/constants');
const {
  compareFoundWithResponse,
  compareFoundArrayWithResponseArray,
  createUser
} = require('../../helpers');
const { getNonSensitiveUser } = require('../../../src/util/dto');

const api = supertest(app);
const baseUrl = '/api/users';

const getAll = async (query = {}) => {
  const response = await api
    .get(baseUrl)
    .query(query)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  return response.body;
};

const getOne = async (username, statusCode = 200) => {
  const response = await api
    .get(`${baseUrl}/${username}`)
    .expect(statusCode)
    .expect('Content-Type', /application\/json/);

  return response.body;
};

describe('get users', () => {
  describe('all', () => {
    test('users having the query string in their name/username are returned', async () => {
      const user1 = await createUser({
        name: 'commonhere', // contains 'nher'
        username: 'jaska',
        password: 'asdpojahfipaf'
      });

      const user2 = await createUser({
        name: 'afpohaf',
        username: 'linHera',  // contains 'nHer'
        password: 'asdpojahfipaf'
      });

      await createUser({
        name: 'dshegaega',
        username: 'NHERs',  // contains 'NHER', but is disabled
        password: 'oasoasugo',
        disabled: true,
      });

      const matchingUsers = [user1, user2];

      const searchParam = 'NHER';
      const returnedUsers = await getAll({ search: searchParam });

      expect(returnedUsers).toHaveLength(matchingUsers.length);

      compareFoundArrayWithResponseArray(
        matchingUsers.map(user => getNonSensitiveUser(user)),
        returnedUsers
      );
    });

    test('without query, all non disabled users are returned', async () => {
      const returnedUsers = await getAll();
      const foundUsers = await User.findAll({ where: { disabled: false } });

      // all non disabled users are returned
      returnedUsers.forEach(user => expect(user.disabled).toBe(false));

      compareFoundArrayWithResponseArray(
        foundUsers.map(user => getNonSensitiveUser(user)),
        returnedUsers
      );
    });
  
    test('password hashes are not returned', async () => {
      const returnedUsers = await getAll();

      returnedUsers.forEach(user => {
        expect(user).not.toHaveProperty('passwordHash');
      });
    });
  });

  describe('single', () => {
    const nonExistinguserValue = nonExistingUserValues[0];
    const existingUserValue = existingUserValues[0];
    const disabledUserValue = existingDisabledUserValues[0];

    test('can access existing user', async () => {
      const username = existingUserValue.username;

      const responseUser = await getOne(username);
      const foundUser = await User.findOne({ where: { username }});

      compareFoundWithResponse(getNonSensitiveUser(foundUser), responseUser);
    });

    test('can not access disabled user', async () => {
      const username = disabledUserValue.username;
      const responseBody = await getOne(username, 400);

      expect(responseBody.message).toBe('user is disabled');
    });

    test('can not access nonexisting user', async () => {
      const username = nonExistinguserValue.username;
      const responseBody = await getOne(username, 404);

      expect(responseBody.message).toBe('user does not exist');
    });

    test('password hashes are not returned', async () => {
      const username = existingUserValue.username;
      const responseUser = await getOne(username);
  
      expect(responseUser).not.toHaveProperty('passwordHash');
    });
  });
});