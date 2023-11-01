// setup
// 1. $ npm run test-pg:down
// 2. $ npm run test-pg:up
// 3. $ npm run test

// NOTES
// - how to automate (wait when container is ready?)
// - dockest command 'npm run test', where 
//   "test": "cross-env NODE_ENV=test dockest ./dockest", 
//   does nothing

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
      name: "ville",
      username: "viltsu",
      password: "secret"
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

  test('can not register with taken username', async () => {
    const user = {
      name: "vili",
      username: "viltsu",
      password: "topSecret"
    }

    const response = await api
      .post('/api/auth/register')
      .send(user)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    const errorMessages = response.body.message;
    expect(errorMessages.length).toBeGreaterThan(0);
    expect(errorMessages.join()).toMatch('username');
  });

  test('missing name, username, or password is bad request', async () => {
    // missing name
    const user1 = { username: "matsu", password: "salainen" };
    const response1 = await api
      .post('/api/auth/register')
      .send(user1)
      .expect(400)
      .expect('Content-Type', /application\/json/);
    const errorMessages1 = response1.body.message;
    expect(errorMessages1.length).toBeGreaterThan(0);
    expect(errorMessages1.join()).toMatch('name');

    // missing username
    const user2 = { name: "matti", password: "salainen"};
    const response2 = await api
      .post('/api/auth/register')
      .send(user2)
      .expect(400)
      .expect('Content-Type', /application\/json/);
    const errorMessages2 = response2.body.message;
    expect(errorMessages2.length).toBeGreaterThan(0);
    expect(errorMessages2.join()).toMatch('username');

    // missing password
    const user3 = { name: "matti", username: "matsu" };
    const response3 = await api
      .post('/api/auth/register')
      .send(user3)
      .expect(400)
      .expect('Content-Type', /application\/json/);
    const errorMessages3 = response3.body.message;
    expect(errorMessages3).toMatch('password');
  });

});


// afterAll(async () => {})