// setup
// (
  // 1. $ npm run test-pg:down
  // 2. $ npm run test-pg:up
// )
// 3. $ npm run test

/*
TODO
- make global jest file for setup/teardown if possible?
- test logout with/without logged in/cookie being set

- test cookies better
*/

const { sequelize ,connectToDatabases } = require('../../src/util/db');
const { User } = require('../../src/models');
const { encodePassword } = require('../../src/util/auth');

const supertest = require('supertest');
const app = require('../../src/app');

const api = supertest(app);

beforeAll(async () => {
  await connectToDatabases();
});

// afterAll(async () => {})

// This creates the tables, dropping them first if they already existed
beforeEach(async () => {
  await sequelize.sync({ force: true });
});

describe('registering', () => {
  test('succeeds with valid inputs', async () => {
    const user = {
      name: 'ville',
      username: 'viltsu',
      password: 'secret'
    }

    const response = await api
      .post('/api/auth/register')
      .send(user)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const returnedUser = response.body;
    expect(returnedUser.id).toBeDefined();

    expect(returnedUser.name).toBe(user.name);
    expect(returnedUser.username).toBe(user.username);
    
    // plaintext password is not included in the response
    expect(returnedUser.password).toBeUndefined()
  });

  describe('fails with', () => {
    test('missing/empty name', async () => {
      // missing name
      const user1 = { username: 'matsu', password: 'salainen' };
      const response1 = await api
        .post('/api/auth/register')
        .send(user1)
        .expect(400)
        .expect('Content-Type', /application\/json/);
      const errorMessages1 = response1.body.message;
      expect(errorMessages1).toContain('user.name cannot be null');

      // empty name
      const user2 = { name: '', username: 'matsu', password: 'salainen' };
      const response2 = await api
        .post('/api/auth/register')
        .send(user2)
        .expect(400)
        .expect('Content-Type', /application\/json/);
      const errorMessages2 = response2.body.message;
      expect(errorMessages2).toContain('name can not be empty');
    });

    test('missing/empty username', async () => {
      // missing name
      const user1 = { name: 'matti', password: 'salainen' };
      const response1 = await api
        .post('/api/auth/register')
        .send(user1)
        .expect(400)
        .expect('Content-Type', /application\/json/);
      const errorMessages1 = response1.body.message;
      expect(errorMessages1).toContain('user.username cannot be null');

      // empty name
      const user2 = { name: 'matti', username: '', password: 'salainen' };
      const response2 = await api
        .post('/api/auth/register')
        .send(user2)
        .expect(400)
        .expect('Content-Type', /application\/json/);
      const errorMessages2 = response2.body.message;
      expect(errorMessages2).toContain('username can not be empty');
    });

    test('missing/empty password', async () => {
      // missing password
      const user1 = { name: 'matti', username: 'matsu' };
      const response1 = await api
        .post('/api/auth/register')
        .send(user1)
        .expect(400)
        .expect('Content-Type', /application\/json/);
      const errorMessage1 = response1.body.message;
      expect(errorMessage1).toMatch('password is missing');

      // empty password
      const user2 = { name: 'matti', username: 'matsu', password: '' };
      const response2 = await api
        .post('/api/auth/register')
        .send(user2)
        .expect(400)
        .expect('Content-Type', /application\/json/);
      const errorMessage2 = response2.body.message;
      expect(errorMessage2).toMatch('password is missing');
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
    expect(errorMessages).toContain('username is already taken');
  });

  describe('when loggin in', () => {
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
        expect(response.get('Set-Cookie')).toBeDefined();
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
  });

  /*
  describe('when loggin out', () => {

  });
  */
});