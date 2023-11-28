/*
TODO
- test logout with/without logged in/cookie being set

- test cookies better
*/

const { User } = require('../../src/models');
const { encodePassword } = require('../../src/util/auth');
const { cookieKey, get_SetCookie, compareFoundAndResponseUser } = require('../helpers');

const omit = require('lodash.omit');

const supertest = require('supertest');
const app = require('../../src/app');

const api = supertest(app);

/*
TODO
// - redo 'when user exists'
*/

const userValues = {
  name: 'ville',
  username: 'ellivil',
  password: 'password123'
};

const register = async (details, statusCode) => {
  const response = await api
    .post('/api/auth/register')
    .send(details)
    .expect(statusCode)
    .expect('Content-Type', /application\/json/);

  return response;
};

describe('registering', () => {
  test('can register with valid inputs', async () => {
      const response = await register(userValues, 201);
  
      const returnedUser = response.body;
      expect(returnedUser.id).toBeDefined();
  
      // name and username are set from the request values
      expect(returnedUser.name).toBe(userValues.name);
      expect(returnedUser.username).toBe(userValues.username);
      
      // plaintext password is not included in the response
      expect(returnedUser).not.toHaveProperty('password');
  });

  test('user can be found after registering', async () => {
    const response = await register(userValues, 201);

    const responseUser = response.body;
    const foundUser = await User.findByPk(responseUser.id);

    compareFoundAndResponseUser(foundUser, responseUser);
  });

  test('passwordHash is not returned', async () => {
      const response = await register(userValues, 201);
  
      const returnedUser = response.body;
      expect(returnedUser).not.toHaveProperty('passwordHash');
  });

  describe('fails with', () => {
    test('missing/empty name', async () => {
      // missing name
      const response1 = await register(omit(userValues, ['name']), 400);

      const errorMessages1 = response1.body.message;
      expect(errorMessages1).toContain('user.name cannot be null');

      // empty name
      const response2 = await register({ ...userValues, name: '' }, 400);

      const errorMessages2 = response2.body.message;
      expect(errorMessages2).toContain('name can not be empty');
    });

    test('missing/empty username', async () => {
      // missing username
      const response1 = await register(omit(userValues, ['username']), 400);

      const errorMessages1 = response1.body.message;
      expect(errorMessages1).toContain('user.username cannot be null');

      // empty username
      const response2 = await register({ ...userValues, username: '' }, 400);

      const errorMessages2 = response2.body.message;
      expect(errorMessages2).toContain('username can not be empty');
    });

    test('missing/empty password', async () => {
      // missing username
      const response1 = await register(omit(userValues, ['password']), 400);

      const errorMessages1 = response1.body.message;
      expect(errorMessages1).toContain('password is missing');

      // empty username
      const response2 = await register({ ...userValues, password: '' }, 400);

      const errorMessages2 = response2.body.message;
      expect(errorMessages2).toContain('password is missing');
    });
  });
});

describe('when user exists', () => {
  const existingUser = { name: 'vili', username: 'viltsu', };

  const existingUsersCredentials = {
    username: existingUser.username, 
    password: 'topSecretPass1',
  };

  beforeEach(async () => {
    const encodedPassword = await encodePassword(existingUsersCredentials.password);
    await User.create({ ...existingUser, passwordHash: encodedPassword });
  });

  test('can not register with taken username', async () => {
    const newUser = {
      name: 'ville',
      username: existingUser.username,
      password: 'superSecret'
    };
    
    const response = await api
      .post('/api/auth/register')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);
    const errorMessages = response.body.message;
    expect(errorMessages.length).toBeGreaterThan(0);
    expect(errorMessages).toContain('username has already been taken');
  });

  describe('loggin in', () => {
    describe('with valid credentials', () => {
      let response;

      test('login is successfull', async () => {
        response = await api 
          .post('/api/auth/login')
          .send(existingUsersCredentials)
          .expect(200)
          .expect('Content-Type', /application\/json/);
      });

      test('cookie is set', async () => {
        const cookie = get_SetCookie(response);
        console.log('cookie', cookie)

        expect(cookie).toBeDefined();
        expect(cookie).not.toBe('');
      });

      test('id, name and username are returned', async () => {
        const body = response.body;
        expect(body.id).toBeDefined();
    
        expect(body.name).toBe(existingUser.name);
        expect(body.username).toBe(existingUser.username);
        
        // hashed password is not included in the response
        expect(body.passwordHash).toBeUndefined()
      });
    });

    describe('with invalid credentials', () => {
      test('login fails with wrong password', async () => {
        const response = await api 
          .post('/api/auth/login')
          .send({
            username: existingUsersCredentials.username,
            password: 'thisIsWronPwd2'
          })
          .expect(401)
          .expect('Content-Type', /application\/json/);

        expect(response.body.message).toBe('invalid username or password');
      });
    });

    test('disabled user can not login', async () => {
      await User.update({ disabled: true }, {
        where: { username: existingUser.username }
      });

      const response = await api 
        .post('/api/auth/login')
        .send(existingUsersCredentials)
        .expect(401)
        .expect('Content-Type', /application\/json/);

      expect(response.body.message).toBe('user has been disabled');
    });
  });

  describe('can log out', () => {
    let cookie;

    // log in and save cookie
    beforeEach(async () => {
      const response = await api 
        .post('/api/auth/login')
        .send(existingUsersCredentials);

      cookie = get_SetCookie(response);
      console.log('beforeEach cookie', cookie)
    });
    
    test('can logout with cookie set (logged in)', async () => {
      const response = await api 
        .post('/api/auth/logout')
        .set('Cookie', `${cookieKey}=${cookie}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
      
      console.log('cookie set in request', response.request.getHeader('Cookie'));

      // cookie is cleared
      expect(get_SetCookie(response)).toBe('');
    });

    test('can logout without cookie (not logged in)', async () => {
      const response = await api 
        .post('/api/auth/logout')
        .expect(200)
        .expect('Content-Type', /application\/json/);

      // cookie is cleared
      expect(get_SetCookie(response)).toBe('');
    });
  });

});