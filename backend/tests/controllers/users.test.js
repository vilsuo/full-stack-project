const { User, Image } = require('../../src/models');
const { encodePassword } = require('../../src/util/auth');

const { cookieKey, get_SetCookie } = require('../helpers/cookie');
const supertest = require('supertest');
const app = require('../../src/app');

const api = supertest(app);
const baseUrl = '/api/users';

const username1 = 'viltsu';
const username2 = 'matsu';
const disabledUsername = 'samtsu';
const nonExistingUsername = 'jilmari';
const rawPassword = 'password';

beforeEach(async () => {
  // NON DISABLED USERS:
  const encodedPassword1 = await encodePassword(rawPassword);
  await User.create({
    name: 'ville',
    username: username1,
    passwordHash: encodedPassword1
  });

  const encodedPassword2 = await encodePassword(rawPassword);
  await User.create({
    name: 'matti',
    username: username2,
    passwordHash:
    encodedPassword2
  });

  // DISABLED USER:
  const encodedPassword3 = await encodePassword(rawPassword);
  await User.create({
    name: 'samuel',
    username: disabledUsername,
    passwordHash: encodedPassword3,
    disabled: true
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
    expect(usernames).toContain(username1);
    expect(usernames).toContain(username2);
    // disabled user is not returned
    expect(usernames).not.toContain(disabledUsername);
  });

  test('with query, a subset of users is returned', async () => {
    const searchParam = 'vil';
    const response = await api
      .get(`${baseUrl}/?search=${searchParam}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.body).toHaveLength(1);

    const usernames = response.body.map(user => user.username);
    expect(usernames).toContain(username1);
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

describe('find users images', () => {
  test('non existing user is bad request', async () => {
    const response = await api
      .get(`${baseUrl}/${nonExistingUsername}/images`)
      .expect(404)
      .expect('Content-Type', /application\/json/);

    expect(response.body.message).toBe('user does not exist');
  });

  test('can not view disabled users images', async () => {
    const response = await api
      .get(`${baseUrl}/${disabledUsername}/images`)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(response.body.message).toBe('user is disabled');
  });

  test('when user has no images, an empty array is returned', async () => {
    const response = await api
      .get(`${baseUrl}/${username1}/images`)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.body).toHaveLength(0);
  });

  /*
  describe('when user has images', () => {


    describe('without authentication', () => {

    });
  
    describe('with authentication', () => {
  
    });
  });
  */
});

describe('posting images', () => {
  const title = 'My title';
  const caption = 'Some caption';
  const privacyOption = false;
  const imagePath = 'tests/test-images/git.png';

  describe('without authentication', () => {
    /*
    fails sometimes, see links:
    https://stackoverflow.com/questions/54936185/express-mongoose-jest-error-econnaborted
    https://github.com/ladjs/supertest/issues/230
    */
    test('is unauthorized', async () => {
      const response = await api
        .post(`${baseUrl}/${username1}/images`)
        .set('Content-Type', 'multipart/form-data')
        .set('Connection', 'keep-alive')  // there is a bug in supertest, this seems to fix it
        .field('title', title)
        .field('caption', caption)
        .field('private', privacyOption)
        .attach('image', imagePath)
        .expect(401)
        .expect('Content-Type', /application\/json/);

      expect(response.body.message).toBe('authentication required');
    });
  });

  describe('with authentication', () => {
    let cookie;
    const credentials = { username: username1, password: rawPassword };

    // log in and save cookie
    beforeEach(async () => {
      const response = await api 
        .post('/api/auth/login')
        .send(credentials);

      cookie = get_SetCookie(response);
      console.log('beforeEach cookie', cookie);
    });

    test('can post image to self', async () => {
      const response = await api
        .post(`${baseUrl}/${credentials.username}/images`)
        .set('Cookie', `${cookieKey}=${cookie}`)
        .set('Content-Type', 'multipart/form-data')
        .field('title', title)
        .field('caption', caption)
        .field('private', privacyOption)
        .attach('image', imagePath)
        .expect(201)
        .expect('Content-Type', /application\/json/);

      expect(response.body.title).toBe(title);
      expect(response.body.caption).toBe(caption);
      expect(response.body.private).toBe(privacyOption);
    });

    test('can not post image to other user', async () => {
      const response = await api
        .post(`${baseUrl}/${username2}/images`)
        .set('Cookie', `${cookieKey}=${cookie}`)
        .set('Content-Type', 'multipart/form-data')
        .field('title', title)
        .field('caption', caption)
        .field('private', privacyOption)
        .attach('image', imagePath)
        .expect(401)
        .expect('Content-Type', /application\/json/);

      expect(response.body.message).toBe('can not add images to other users');
    });
  });
});