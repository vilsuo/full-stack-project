const supertest = require('supertest');
const app = require('../../../src/app');

const { User } = require('../../../src/models');
const {
  existingUserValues,
  disabledExistingUserValues,
  nonExistingUserValues,
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
    let nonDisabledUsers;
    let nNonDisabledUsers;

    beforeEach(async () => {
      nonDisabledUsers = await User.findAll({ where: { disabled: false } });
      nNonDisabledUsers = nonDisabledUsers.length;
    });

    test('count-property is equal to the non-disabled users count', async () => {
      const responseBody = await getAll();
      expect(responseBody).toHaveProperty('count');

      expect(responseBody.count).toBe(nNonDisabledUsers);
    });

    test('password hashes are not returned', async () => {
      const responseBody = await getAll();

      responseBody.users.forEach(user => {
        expect(user).not.toHaveProperty('passwordHash');
      });
    });

    describe('pagination', () => {
      test('with large page size, all non disabled users are returned', async () => {
        const responseBody = await getAll({ size: nNonDisabledUsers });
  
        expect(responseBody).toHaveProperty('users');
  
        // all non disabled users are returned
        responseBody.users.forEach(user => expect(user.disabled).toBe(false));
  
        compareFoundArrayWithResponseArray(
          nonDisabledUsers.map(user => getNonSensitiveUser(user)),
          responseBody.users
        );
      });

      test('all pages combined contain all non-disabled users', async () => {
        const size = Math.ceil(nNonDisabledUsers / 2);

        const responseBodyFirstHalf = await getAll({ size, page: 0 });
        const responseBodySecondHalf = await getAll({ size, page: 1 });

        const firstUsers = responseBodyFirstHalf.users;
        const secondUsers = responseBodySecondHalf.users;

        expect(firstUsers.length).toBeGreaterThan(0);
        expect(firstUsers.length).toBeLessThan(nNonDisabledUsers);

        expect(secondUsers.length).toBeGreaterThan(0);
        expect(secondUsers.length).toBeLessThan(nNonDisabledUsers);
        
        expect(firstUsers.length + secondUsers.length).toBe(nNonDisabledUsers);

        compareFoundArrayWithResponseArray(
          nonDisabledUsers.map(user => getNonSensitiveUser(user)),
          [ ...firstUsers, ...secondUsers ]
        );
      });
    });

    describe('querying', () => {
      test('when no users match the query, an empty array is returned', async () => {
        const badQuery = 'ilafnaygflfalsgf';
        const responseBody = await getAll({ q: badQuery });

        expect(responseBody.users).toHaveLength(0);
      });

      test('disabled users username does not return the user', async () => {
        const disabledUsername = disabledExistingUserValues.username;
        
        const responseBody = await getAll({ q: disabledUsername });
  
        expect(responseBody.users).toHaveLength(0);
      });

      test('existing users username returns the user', async () => {
        const existingUsername = existingUserValues.username;
        const foundUser = await User.findOne({ where: { username: existingUsername }});
  
        const returnedUsers = await getAll({ q: existingUsername });
  
        expect(returnedUsers.users).toContainEqual(getNonSensitiveUser(foundUser));
      });
      
      test('users having the query string in their name/username are returned', async () => {
        const searchParam = 'NHER';

        const user1 = await createUser({
          name:     'commonhere',     // contains 'nher'
          username: 'jaska',
          password: 'asdpojahfipaf'
        });
  
        const user2 = await createUser({
          name:     'afpohaf',
          username: 'linHera',      // contains 'nHer'
          password: 'asdpojahfipaf'
        });
  
        await createUser({
          name:     'dshegaega',
          username: 'uNHERs',        // contains 'NHER', but is disabled
          password: 'oasoasugo',
          disabled: true,
        });
  
        const matchingUsers = [user1, user2];
  
        const responseBody = await getAll({ 
          q: searchParam, size: matchingUsers.length
        });
  
        compareFoundArrayWithResponseArray(
          matchingUsers.map(user => getNonSensitiveUser(user)),
          responseBody.users
        );
      });
    });
  });

  describe('single', () => {
    test('can access existing user', async () => {
      const username = existingUserValues.username;

      const responseUser = await getOne(username);
      const foundUser = await User.findOne({ where: { username }});

      compareFoundWithResponse(getNonSensitiveUser(foundUser), responseUser);
    });

    test('can not access disabled user', async () => {
      const username = disabledExistingUserValues.username;
      const responseBody = await getOne(username, 400);

      expect(responseBody.message).toBe('User is disabled');
    });

    test('can not access nonexisting user', async () => {
      const username = nonExistingUserValues.username;
      const responseBody = await getOne(username, 404);

      expect(responseBody.message).toBe('User does not exist');
    });

    test('password hashes are not returned', async () => {
      const username = existingUserValues.username;
      const responseUser = await getOne(username);
  
      expect(responseUser).not.toHaveProperty('passwordHash');
    });
  });
});