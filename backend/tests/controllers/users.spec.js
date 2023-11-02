// setup
// 1. $ npm run test-pg:down
// 2. $ npm run test-pg:up
// 3. $ npm run test

// NOTES
// - how to automate 
//    - wait when container is ready?
//    - close containers after tests are done?
//    - does sequelize-cli help with this?
// - dockest command 'npm run test', where 
//   "test": "cross-env NODE_ENV=test dockest ./dockest", 
//   does nothing


// todo make common frame for posting invalid credentials and then
// extracting the error message from reponse

const { connectToDatabases } = require('../../src/util/db');

const supertest = require('supertest');
const app = require('../../src/app');

const api = supertest(app);

beforeAll(async () => {
 await connectToDatabases();
});

test('users are returned as json', async () => {
  const response = await api
    .get('/api/users')
    .expect(200)
    .expect('Content-Type', /application\/json/);

  expect(response.body).toHaveLength(0);
});

describe('registering', () => {
  test('can register', async () => {
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
    expect(returnedUser.passwordHash).not.toBe(user.password);
  });

  test('can not register', () => {
    test('can not register with taken username', async () => {
      const user = {
        name: 'vili',
        username: 'viltsu',
        password: 'topSecret'
      }

      const response = await api
        .post('/api/auth/register')
        .send(user)
        .expect(400)
        .expect('Content-Type', /application\/json/);

      const errorMessages = response.body.message;
      expect(errorMessages.length).toBeGreaterThan(0);
      expect(errorMessages).toContain('username is already taken');
    });

    test('missing/empty name is bad request', async () => {
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

    test('missing/empty username is bad request', async () => {
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

    test('missing/empty password is bad request', async () => {
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


// afterAll(async () => {})