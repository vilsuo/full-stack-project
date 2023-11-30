const omit = require('lodash.omit');
const supertest = require('supertest');
const app = require('../../src/app');

const { User } = require('../../src/models');
const { get_SetCookie, cookieHeader, login, compareFoundWithResponse } = require('../helpers');
const {
  existingUserValues,
  existingDisabledUserValues,
  nonExistingUserValues
} = require('../helpers/constants');
const { getNonSensitiveUser } = require('../../src/util/dto');

const api = supertest(app);

const register = async (details, statusCode = 201) => {
  const response = await api
    .post('/api/auth/register')
    .send(details)
    .expect(statusCode)
    .expect('Content-Type', /application\/json/);

  return response.body;
};

const nonExistinguserValue = nonExistingUserValues[0];
const existingUserValue = existingUserValues[0];
const disabledUserValue = existingDisabledUserValues[0];

const credentials = omit(existingUserValue, ['name']);
const { name, username } = existingUserValue;

describe('registering', () => {
  test('can register', async () => {
    const responseBody = await register(nonExistinguserValue);
  
    expect(responseBody.id).toBeDefined();
  
    // name and username are set from the request values
    expect(responseBody.name).toBe(nonExistinguserValue.name);
    expect(responseBody.username).toBe(nonExistinguserValue.username);
  });

  test('user can be found after registering', async () => {
    const responseUser = await register(nonExistinguserValue);
    const foundUser = await User.findByPk(responseUser.id);

    compareFoundWithResponse(getNonSensitiveUser(foundUser), responseUser);
  });

  test('registering increments the user count', async () => {
    const userCountBefore = await User.count();

    await register(nonExistinguserValue);

    const userCountAfter = await User.count();
    expect(userCountAfter).toBe(userCountBefore + 1);
  });

  test('hashed password is not returned', async () => {
    const responseBody = await register(nonExistinguserValue);
  
    expect(responseBody).not.toHaveProperty('passwordHash');
  });

  describe('fails with', () => {
    const takenUsername = existingUserValue.username;
    const disabledUsersUsername = disabledUserValue.username;

    test('missing/empty name', async () => {
      // missing name
      const responseBody1 = await register(omit(nonExistinguserValue, ['name']), 400);

      const errorMessages1 = responseBody1.message;
      expect(errorMessages1).toContain('user.name cannot be null');

      // empty name
      const responseBody2 = await register({ ...nonExistinguserValue, name: '' }, 400);

      const errorMessages2 = responseBody2.message;
      expect(errorMessages2).toContain('name can not be empty');
    });

    test('missing/empty username', async () => {
      // missing username
      const responseBody1 = await register(omit(nonExistinguserValue, ['username']), 400);

      const errorMessages1 = responseBody1.message;
      expect(errorMessages1).toContain('user.username cannot be null');

      // empty username
      const responseBody2 = await register({ ...nonExistinguserValue, username: '' }, 400);

      const errorMessages2 = responseBody2.message;
      expect(errorMessages2).toContain('username can not be empty');
    });

    test('missing/empty password', async () => {
      // missing username
      const responseBody1 = await register(omit(nonExistinguserValue, ['password']), 400);

      const errorMessages1 = responseBody1.message;
      expect(errorMessages1).toContain('password is missing');

      // empty username
      const responseBody2 = await register({ ...nonExistinguserValue, password: '' }, 400);

      const errorMessages2 = responseBody2.message;
      expect(errorMessages2).toContain('password is missing');
    });

    test('taken username', async () => {
      const withTakenUsernameValue = {
        ...nonExistinguserValue, 
        username: takenUsername,
      };
  
      const responseBody = await register(withTakenUsernameValue, 400);
      
      const errorMessages = responseBody.message;
      expect(errorMessages).toContain('username has already been taken');
    });
  
    test('disabled users username', async () => {
      const withDisabledUsernameValue = {
        ...nonExistinguserValue, 
        username: disabledUsersUsername,
      };
  
      const responseBody = await register(withDisabledUsernameValue, 400);
      
      const errorMessages = responseBody.message;
      expect(errorMessages).toContain('username has already been taken');
    });
  });
});

describe('loggin in', () => {
  test('can log in with a registered user', async () => {
    await login(api, credentials);
  });

  test('login fails with wrong password', async () => {
    const wrongPassword = 'wrongpswd';
    const wrongCredentials = { ...credentials, password: wrongPassword };

    const response = await login(api, wrongCredentials, 401)

    expect(response.body.message).toBe('invalid username or password');
  });

  test('disabled user can not login', async () => {
    const disabledCredentials = omit(disabledUserValue, ['name']);

    const response = await login(api, disabledCredentials, 401);

    expect(response.body.message).toBe('user has been disabled');
  });

  test('can not log in with user that does not exist', async () => {
    const nonexistingCredentials = omit(nonExistinguserValue, ['name']);

    const response = await login(api, nonexistingCredentials, 401);

    expect(response.body.message).toBe('invalid username or password');
  });

  describe('after successfull login', () => {
    test('authentication cookie is set', async () => {
      const response = await login(api, credentials);

      const cookie = get_SetCookie(response);

      expect(cookie).toBeDefined();
      expect(cookie).not.toBe('');
    });

    test('the id, name and username of the logged in user are returned', async () => {
      const response = await login(api, credentials);

      const foundUser = await User.findOne({ where: { name, username } });

      // response contains the logged in users id
      const body = response.body;
      expect(body.id).toBe(foundUser.id);

      // response contains the logged in users name and username
      expect(body.name).toBe(name);
      expect(body.username).toBe(username);
      
      // hashed password is not included in the response
      expect(body).not.toHaveProperty('passwordHash');
    });
  });
});

const logout = async (headers = {}, statusCode = 200) => {
  return await api 
    .post('/api/auth/logout')
    .set(headers)
    .expect(statusCode)
    .expect('Content-Type', /application\/json/);
};

describe('loggin out', () => {
  let authHeader;
  // log in and save cookie
  beforeEach(async () => {
    const response = await login(api, credentials, 200);

    const cookie = get_SetCookie(response);
    authHeader = cookieHeader(cookie);
    //console.log('authHeader', authHeader);
  });
  
  test('can logout with cookie set (logged in)', async () => {
    const response = await logout(authHeader);
    
    //console.log('cookie set in request', response.request.getHeader('Cookie'));

    // cookie is cleared
    expect(get_SetCookie(response)).toBe('');
  });

  test('can logout without cookie set (not logged in)', async () => {
    const response = await logout();

    // cookie is cleared
    expect(get_SetCookie(response)).toBe('');
  });
});