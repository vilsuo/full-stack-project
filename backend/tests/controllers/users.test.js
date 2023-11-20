const { User, Image } = require('../../src/models');
const { encodePassword } = require('../../src/util/auth');

const supertest = require('supertest');
const app = require('../../src/app');

const api = supertest(app);
const baseUrl = '/api/users';

beforeEach(async () => {
  const rawPassword = 'password';

  const encodedPassword1 = await encodePassword(rawPassword);
  await User.create({ name: 'ville', username: 'viltsu', passwordHash: encodedPassword1 });

  const encodedPassword2 = await encodePassword(rawPassword);
  await User.create({ name: 'matti', username: 'matsu', passwordHash: encodedPassword2 });

  const encodedPassword3 = await encodePassword(rawPassword);
  await User.create({
    name: 'samuel', username: 'samtsu', passwordHash: encodedPassword3, disabled: true
  });
});

describe('find users', () => {
  test('without query, all non disabled users are returned', async () => {
    const response = await api
      .get(`${baseUrl}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.body).toHaveLength(2);

    const usernames = response.body.map(user => user.username);
    expect(usernames).toContain('viltsu');
    expect(usernames).toContain('matsu');
    // disabled user is not returned
    expect(usernames).not.toContain('samtsu');
  });

  test('with query, a subset of users is returned', async () => {
    const searchParam = 'vil';
    const response = await api
      .get(`${baseUrl}/?search=${searchParam}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.body).toHaveLength(1);

    const usernames = response.body.map(user => user.username);
    expect(usernames).toContain('viltsu');
  });

  test('password hashes are not returned', async () => {
    const response = await api
      .get(`${baseUrl}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const returnedUser = response.body[0];
    expect(returnedUser.passwordHash).toBeUndefined();
  });
});