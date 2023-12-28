const omit = require('lodash.omit');
const supertest = require('supertest');
const app = require('../../src/app');

const { User, Potrait, Relation } = require('../../src/models');
const { 
  get_SetCookie, compareFoundWithResponse, login, getUsersImageCount
} = require('../helpers');
const {
  existingUserValues,
  disabledExistingUserValues,
  nonExistingUserValues,
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

const credentials = omit(existingUserValues, ['name']);

describe('registering', () => {
  test('can register', async () => {
    const responseBody = await register(nonExistingUserValues);
  
    expect(responseBody.id).toBeDefined();
  
    // name and username are set from the request values
    expect(responseBody.name).toBe(nonExistingUserValues.name);
    expect(responseBody.username).toBe(nonExistingUserValues.username);
  });

  test('user can be found after registering', async () => {
    const responseUser = await register(nonExistingUserValues);
    const foundUser = await User.findByPk(responseUser.id);

    compareFoundWithResponse(getNonSensitiveUser(foundUser), responseUser);
  });

  test('registering increments the user count', async () => {
    const userCountBefore = await User.count();

    await register(nonExistingUserValues);

    const userCountAfter = await User.count();
    expect(userCountAfter).toBe(userCountBefore + 1);
  });

  test('hashed password is not returned', async () => {
    const responseBody = await register(nonExistingUserValues);
  
    expect(responseBody).not.toHaveProperty('passwordHash');
  });

  test('new user does not have any images', async () => {
    // create a new user that does not have any images
    const newUser = await register(nonExistingUserValues);

    const imageCount = await getUsersImageCount(newUser.username);
  
    expect(imageCount).toBe(0);
  });

  test('new user does not have a potrait', async () => {
    // create a new user that does not have any images
    const newUser = await register(nonExistingUserValues);
  
    const potrait = await Potrait.findOne({ where: { userId: newUser.id }});
    expect(potrait).toBeFalsy();
  });

  test('new user does not have any relations', async () => {
    const newUser = await register(nonExistingUserValues);

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
      expect(errorMessages1).toContain('name can not be null');

      // empty name
      const responseBody2 = await register({ ...nonExistingUserValues, name: '' }, 400);

      const errorMessages2 = responseBody2.message;
      expect(errorMessages2).toContain('name can not be empty');
    });

    test('missing/empty username', async () => {
      // missing username
      const responseBody1 = await register(omit(nonExistingUserValues, ['username']), 400);

      const errorMessages1 = responseBody1.message;
      expect(errorMessages1).toContain('username can not be null');

      // empty username
      const responseBody2 = await register({ ...nonExistingUserValues, username: '' }, 400);

      const errorMessages2 = responseBody2.message;
      expect(errorMessages2).toContain('username can not be empty');
    });

    // validated manually in route
    test('missing/empty password', async () => {
      // missing username
      const responseBody1 = await register(omit(nonExistingUserValues, ['password']), 400);

      const errorMessages1 = responseBody1.message;
      expect(errorMessages1).toContain('password is missing');

      // empty username
      const responseBody2 = await register({ ...nonExistingUserValues, password: '' }, 400);

      const errorMessages2 = responseBody2.message;
      expect(errorMessages2).toContain('password is missing');
    });

    test('taken username', async () => {
      const withTakenUsernameValue = {
        ...nonExistingUserValues, 
        username: takenUsername,
      };
  
      const responseBody = await register(withTakenUsernameValue, 400);
      
      const errorMessages = responseBody.message;
      expect(errorMessages).toContain('username has already been taken');
    });
  
    test('disabled users username', async () => {
      const withDisabledUsernameValue = {
        ...nonExistingUserValues, 
        username: disabledUsersUsername,
      };
  
      const responseBody = await register(withDisabledUsernameValue, 400);
      
      const errorMessages = responseBody.message;
      expect(errorMessages).toContain('username has already been taken');
    });
  });
});

const loginWithResponse = async (credentials, statusCode = 200) => {
  return await api
    .post('/api/auth/login')
    .send(credentials)
    .expect(statusCode)
    .expect('Content-Type', /application\/json/);
};

describe('loggin in', () => {
  describe('successfull login', () => {
    test('can log in with a registered user', async () => {
      await loginWithResponse(credentials);
    });

    test('authentication cookie is set', async () => {
      const response = await loginWithResponse(credentials);

      const setCookie = get_SetCookie(response);

      expect(setCookie).toBeDefined();
      expect(setCookie).not.toBe('');
    });

    test('the id, name and username of the logged in user are returned', async () => {
      const response = await loginWithResponse(credentials);
      const returnedUser = response.body;

      // response contains the logged in users id, name and username
      const foundUser = await User.findOne({ where: { username: credentials.username } });

      compareFoundWithResponse(
        getNonSensitiveUser(foundUser), 
        returnedUser
      );
      
      // hashed password is not included in the response
      expect(returnedUser).not.toHaveProperty('passwordHash');
    });
  });

  describe('failed login', () => {
    const wrongPassword = 'wrongpswd';
    const wrongCredentials = { ...credentials, password: wrongPassword };

    test('login fails with wrong password', async () => {
      const response = await loginWithResponse(wrongCredentials, 401);
  
      expect(response.body.message).toBe('invalid username or password');

      // authentication cookie is not set
      expect(() => { get_SetCookie(response) }).toThrow();
    });
  
    test('disabled user can not login', async () => {
      const disabledCredentials = omit(disabledExistingUserValues, ['name']);
  
      const response = await loginWithResponse(disabledCredentials, 401);
      expect(response.body.message).toBe('user has been disabled');

      // authentication cookie is not set
      expect(() => { get_SetCookie(response) }).toThrow();
    });
  
    test('can not log in with user that does not exist', async () => {
      const nonExistingCredentials = omit(nonExistingUserValues, ['name']);
  
      const response = await loginWithResponse(nonExistingCredentials, 401);
      expect(response.body.message).toBe('invalid username or password');

      // authentication cookie is not set
      expect(() => { get_SetCookie(response) }).toThrow();
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

  beforeEach(async () => {
    authHeader = await login(api, credentials);
  });
  
  test('can logout with cookie set (logged in)', async () => {
    const response = await logout(authHeader);
    
    // cookie is cleared
    expect(get_SetCookie(response)).toBe('');
  });

  test('can logout without cookie set (not logged in)', async () => {
    const response = await logout();

    // cookie is cleared
    expect(get_SetCookie(response)).toBe('');
  });
});