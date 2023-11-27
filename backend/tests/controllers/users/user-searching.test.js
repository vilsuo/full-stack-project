const supertest = require('supertest');
const app = require('../../../src/app');
const { createUser } = require('../../helpers');

const api = supertest(app);
const baseUrl = '/api/users';

/*
TODO
  - add better user comparisons
*/

const credentials1 = { username: 'viltsu', password: 'salainen' };
const credentials2 = { username: 'matsu', password: 'salainen' };
const disabledCredentials = { username: 'samtsu', password: 'salainen' };
const nonExistingUsername = 'jilmari';

beforeEach(async () => {
  // NON DISABLED USERS:
  await createUser('vili', credentials1);
  await createUser('matias', credentials2);

  // DISABLED USER:
  await createUser('samuli', disabledCredentials, true);
});

describe('get users', () => {
  describe('all', () => {
    test('without query, all non disabled users are returned', async () => {
      const response = await api
        .get(`${baseUrl}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
  
      expect(response.body).toHaveLength(2);
  
      const usernames = response.body.map(user => user.username);
      expect(usernames).toContain(credentials1.username);
      expect(usernames).toContain(credentials2.username);

      // disabled user is not returned
      expect(usernames).not.toContain(disabledCredentials.username);
    });
  
    test('with query, a subset of users is returned', async () => {
      const searchParam = 'vil';
      const response = await api
        .get(baseUrl)
        .query({ search: searchParam })
        .expect(200)
        .expect('Content-Type', /application\/json/);
  
      expect(response.body).toHaveLength(1);
  
      const usernames = response.body.map(user => user.username);
      expect(usernames).toContain(credentials1.username);
    });
  
    test('password hashes are not returned', async () => {
      const response = await api
        .get(baseUrl)
        .expect(200)
        .expect('Content-Type', /application\/json/);
  
      const returnedUser = response.body[0];
      expect(returnedUser).not.toHaveProperty('passwordHash');
    });
  });

  describe('single', () => {
    test('can access existing user', async () => {
      const response = await api
        .get(`${baseUrl}/${credentials1.username}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body.username).toBe(credentials1.username);
    });
    test('can not access disabled user', async () => {
      const response = await api
        .get(`${baseUrl}/${disabledCredentials.username}`)
        .expect(400)
        .expect('Content-Type', /application\/json/);

      expect(response.body.message).toBe('user is disabled');
    });

    test('can not access nonexisting user', async () => {
      const response = await api
        .get(`${baseUrl}/${nonExistingUsername}`)
        .expect(404)
        .expect('Content-Type', /application\/json/);

      expect(response.body.message).toBe('user does not exist');
    });

    test('password hashes are not returned', async () => {
      const response = await api
        .get(`${baseUrl}/${credentials2.username}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
  
      expect(response.body).not.toHaveProperty('passwordHash');
    });
  });
});