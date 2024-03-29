const omit = require('lodash.omit');
const supertest = require('supertest');
const app = require('../../src/app');
const {
  User, Potrait, Relation, Image,
} = require('../../src/models');
const {
  getSetCookie, compareFoundWithResponse, login,
} = require('../helpers');
const {
  existingUserValues,
  disabledExistingUserValues,
  nonExistingUserValues,
  getCredentials,
} = require('../helpers/constants');
const { getNonSensitiveUser } = require('../../src/util/dto');

const api = supertest(app);

const register = async (details, statusCode) => {
  const response = await api
    .post('/api/auth/register')
    .send(details)
    .expect(statusCode)
    .expect('Content-Type', /application\/json/);

  return response.body;
};

const loginWithResponse = async (credentials, statusCode) => api
  .post('/api/auth/login')
  .send(credentials)
  .expect(statusCode)
  .expect('Content-Type', /application\/json/);

const logout = async (headers, statusCode) => api
  .post('/api/auth/logout')
  .set(headers)
  .expect(statusCode)
  .expect('Content-Type', /application\/json/);

const credentials = getCredentials(existingUserValues);

describe('registering', () => {
  test('can register', async () => {
    const responseBody = await register(nonExistingUserValues, 201);

    expect(responseBody.id).toBeDefined();

    // name and username are set from the request values
    expect(responseBody.name).toBe(nonExistingUserValues.name);
    expect(responseBody.username).toBe(nonExistingUserValues.username);
  });

  test('user can be found after registering', async () => {
    const responseUser = await register(nonExistingUserValues, 201);
    const foundUser = await User.findByPk(responseUser.id);

    compareFoundWithResponse(getNonSensitiveUser(foundUser), responseUser);
  });

  test('registering increments the user count', async () => {
    const userCountBefore = await User.count();

    await register(nonExistingUserValues, 201);

    const userCountAfter = await User.count();
    expect(userCountAfter).toBe(userCountBefore + 1);
  });

  test('registered user is not an admin', async () => {
    const responseBody = await register(nonExistingUserValues, 201);

    expect(responseBody.admin).toBe(false);
  });

  test('can not register an admin user', async () => {
    const responseBody = await register({ ...nonExistingUserValues, admin: true }, 201);

    expect(responseBody.admin).toBe(false);
  });

  test('hashed password is not returned', async () => {
    const responseBody = await register(nonExistingUserValues, 201);

    expect(responseBody).not.toHaveProperty('passwordHash');
  });

  test('new user does not have any images', async () => {
    // create a new user that does not have any images
    const newUser = await register(nonExistingUserValues, 201);

    const imageCount = await Image.count({ where: { userId: newUser.id } });

    expect(imageCount).toBe(0);
  });

  test('new user does not have a potrait', async () => {
    // create a new user that does not have any images
    const newUser = await register(nonExistingUserValues, 201);

    const potrait = await Potrait.findOne({ where: { userId: newUser.id } });
    expect(potrait).toBeFalsy();
  });

  test('new user does not have any relations', async () => {
    const newUser = await register(nonExistingUserValues, 201);

    const asRelationSource = await Relation.findAll({ where: { sourceUserId: newUser.id } });
    const asRelationTarget = await Relation.findAll({ where: { targetUserId: newUser.id } });

    expect(asRelationSource).toHaveLength(0);
    expect(asRelationTarget).toHaveLength(0);
  });

  describe('fails with', () => {
    const takenUsername = existingUserValues.username;
    const disabledUsersUsername = disabledExistingUserValues.username;

    test('missing/empty name', async () => {
      // missing name
      const responseBody1 = await register(omit(nonExistingUserValues, ['name']), 400);

      const errorMessages1 = responseBody1.message;
      expect(errorMessages1).toContain('Parameter name is required');

      // empty name
      const responseBody2 = await register({ ...nonExistingUserValues, name: '' }, 400);

      const errorMessages2 = responseBody2.message;
      expect(errorMessages2).toContain('Name must be 2-30 characters long');
    });

    test('missing/empty username', async () => {
      // missing username
      const responseBody1 = await register(omit(nonExistingUserValues, ['username']), 400);

      const errorMessages1 = responseBody1.message;
      expect(errorMessages1).toContain('Parameter username is required');

      // empty username
      const responseBody2 = await register({ ...nonExistingUserValues, username: '' }, 400);

      const errorMessages2 = responseBody2.message;
      expect(errorMessages2).toContain('Username must be 2-30 characters long');
    });

    test('missing/empty password', async () => {
      // missing password
      const responseBody1 = await register(omit(nonExistingUserValues, ['password']), 400);

      const errorMessages1 = responseBody1.message;
      expect(errorMessages1).toContain('Parameter password is required');

      // empty password
      const responseBody2 = await register({ ...nonExistingUserValues, password: '' }, 400);

      const errorMessages2 = responseBody2.message;
      expect(errorMessages2).toContain('Password must be 8-30 characters long');
    });

    test('taken username', async () => {
      const withTakenUsernameValue = {
        ...nonExistingUserValues,
        username: takenUsername,
      };

      const responseBody = await register(withTakenUsernameValue, 400);

      const errorMessages = responseBody.message;
      expect(errorMessages).toContain('Username has already been taken');
    });

    test('disabled users username', async () => {
      const withDisabledUsernameValue = {
        ...nonExistingUserValues,
        username: disabledUsersUsername,
      };

      const responseBody = await register(withDisabledUsernameValue, 400);

      const errorMessages = responseBody.message;
      expect(errorMessages).toContain('Username has already been taken');
    });
  });
});

describe('loggin in', () => {
  describe('successfull login', () => {
    test('can log in with a registered user', async () => {
      await loginWithResponse(credentials, 200);
    });

    test('authentication cookie is set', async () => {
      const response = await loginWithResponse(credentials, 200);

      const setCookie = getSetCookie(response);

      expect(setCookie).toBeDefined();
      expect(setCookie).not.toBe('');
    });

    test('the id, name and username of the logged in user are returned', async () => {
      const response = await loginWithResponse(credentials, 200);
      const returnedUser = response.body;

      // response contains the logged in users id, name and username
      const foundUser = await User.findByUsername(credentials.username);

      compareFoundWithResponse(
        getNonSensitiveUser(foundUser),
        returnedUser,
      );

      // hashed password is not included in the response
      expect(returnedUser).not.toHaveProperty('passwordHash');
    });
  });

  describe('failed login', () => {
    test('login fails with wrong password', async () => {
      const wrongPassword = 'wrongpswd';
      const wrongCredentials = { ...credentials, password: wrongPassword };

      const response = await loginWithResponse(wrongCredentials, 401);

      expect(response.body.message).toBe('Invalid username or password');

      // authentication cookie is not set
      expect(() => getSetCookie(response)).toThrow();
    });

    test('disabled user can not login', async () => {
      const disabledCredentials = getCredentials(disabledExistingUserValues);

      const response = await loginWithResponse(disabledCredentials, 401);
      expect(response.body.message).toBe('User has been disabled');
    });

    test('can not log in with user that does not exist', async () => {
      const nonExistingCredentials = getCredentials(nonExistingUserValues);

      const response = await loginWithResponse(nonExistingCredentials, 401);
      expect(response.body.message).toBe('Invalid username or password');
    });
  });
});

describe('loggin out', () => {
  let authHeader;

  beforeEach(async () => {
    authHeader = await login(api, credentials);
  });

  test('can logout with cookie set (logged in)', async () => {
    const response = await logout(authHeader, 200);

    // cookie is cleared
    expect(getSetCookie(response)).toBe('');
  });

  test('can logout without cookie set (not logged in)', async () => {
    const response = await logout({}, 200);

    // cookie is cleared
    expect(getSetCookie(response)).toBe('');
  });
});
