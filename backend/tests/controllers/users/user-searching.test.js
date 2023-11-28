const supertest = require('supertest');
const app = require('../../../src/app');
const { createUser, compareFoundAndResponseUser } = require('../../helpers');
const { User } = require('../../../src/models');

const api = supertest(app);
const baseUrl = '/api/users';

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
      const targetUsername = credentials1.username;
      const searchParam = targetUsername.substring(0, 3);

      const response = await api
        .get(baseUrl)
        .query({ search: searchParam })
        .expect(200)
        .expect('Content-Type', /application\/json/);
  
      expect(response.body).toHaveLength(1);
  
      const foundUser = await User.findOne({ where: { username: targetUsername }});
      const responseUser = response.body[0];

      compareFoundAndResponseUser(foundUser, responseUser);
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
      const username = credentials1.username;
      const response = await api
        .get(`${baseUrl}/${username}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      const foundUser = await User.findOne({ where: { username }});
      const responseUser = response.body;

      compareFoundAndResponseUser(foundUser, responseUser);
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