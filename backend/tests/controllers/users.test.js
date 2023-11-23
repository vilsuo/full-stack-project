const { User, Image } = require('../../src/models');
const { encodePassword } = require('../../src/util/auth');

const { cookieKey, get_SetCookie } = require('../helpers');
const supertest = require('supertest');
const app = require('../../src/app');

const api = supertest(app);
const baseUrl = '/api/users';

/*
TODO
- add tests for single image routes
*/
const credentials1 = { username: 'viltsu', password: 'salainen' };
const credentials2 = { username: 'matsu', password: 'salainen' };
const disabledCredentials = { username: 'samtsu', password: 'salainen' };
const nonExistingUsername = 'jilmari';

const getUsersImageCount = async username => {
  const usersImageCount = await Image.count({
    include: {
      model: User,
      where: { username },
    },
  });
  return usersImageCount;
}

const testImageInfo1 = { title: 'My title', caption: 'Some caption', imagePath: 'tests/test-images/git.png' };
const { title, caption, imagePath } = testImageInfo1;

const postImage = async (username, cookie, privacyOption) => {
  return await api
    .post(`${baseUrl}/${username}/images`)
    .set('Cookie', `${cookieKey}=${cookie}`)
    .set('Content-Type', 'multipart/form-data')
    .field('title', title)
    .field('caption', caption)
    .field('private', privacyOption)
    .attach('image', imagePath)
    .expect(201)
    .expect('Content-Type', /application\/json/);
};

beforeEach(async () => {
  // NON DISABLED USERS:
  let { username, password } = credentials1;
  await User.create({
    name: 'vili',
    username,
    passwordHash: await encodePassword(password),
  });

  ({ username, password } = credentials2);
  await User.create({
    name: 'matias',
    username,
    passwordHash: await encodePassword(password),
  });

  // DISABLED USER:
  ({ username, password } = disabledCredentials);
  await User.create({
    name: 'samuli',
    username,
    passwordHash: await encodePassword(password),
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
    expect(usernames).toContain(credentials1.username);
    expect(usernames).toContain(credentials2.username);
    // disabled user is not returned
    expect(usernames).not.toContain(disabledCredentials.username);
  });

  test('with query, a subset of users is returned', async () => {
    const searchParam = 'vil';
    const response = await api
      .get(`${baseUrl}/?search=${searchParam}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.body).toHaveLength(1);

    const usernames = response.body.map(user => user.username);
    expect(usernames).toContain(credentials1.username);
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

// TODO: add cases for single images
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
      .get(`${baseUrl}/${disabledCredentials.username}/images`)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(response.body.message).toBe('user is disabled');
  });

  describe('when no images have been created', () => {
    test('empty array is returned', async () => {
      const response = await api
        .get(`${baseUrl}/${credentials1.username}/images`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
  
      expect(response.body).toHaveLength(0);
    });
  });

  describe('when images have been created', () => {
    let cookie1;
    let cookie2;

    // post private & nonprivate image to user1 & user2;
    beforeEach(async () => {
      // log in...
      const response1 = await api 
        .post('/api/auth/login')
        .send(credentials1)
        .expect(200)
        .expect('Content-Type', /application\/json/);
      cookie1 = get_SetCookie(response1);

      const response2 = await api 
        .post('/api/auth/login')
        .send(credentials2)
        .expect(200)
        .expect('Content-Type', /application\/json/);
      cookie2 = get_SetCookie(response2);

      // ...and post images
      await postImage(credentials1.username, cookie1, false); // non private image
      await postImage(credentials1.username, cookie1, true);  // private image

      await postImage(credentials2.username, cookie2, false);
      await postImage(credentials2.username, cookie2, true);
    });

    describe('without authentication', () => {
      test('private images are not returned', async () => {
        const response = await api
          .get(`${baseUrl}/${credentials1.username}/images`)
          .expect(200)
          .expect('Content-Type', /application\/json/);
    
        expect(response.body).toHaveLength(1);
        expect(response.body[0].private).toBe(false);
      });
    });
  
    describe('with authentication', () => {
      describe('accessing own images', () => {
        test('can access all images', async () => {
          const userImageCount = await getUsersImageCount(credentials1.username);

          const response = await api
            .get(`${baseUrl}/${credentials1.username}/images`)
            .set('Cookie', `${cookieKey}=${cookie1}`)
            .expect(200)
            .expect('Content-Type', /application\/json/);
      
          expect(response.body).toHaveLength(userImageCount);
        });
      });

      describe('accessing others images', () => {
        test('can not access other private images', async () => {
          const response = await api
            .get(`${baseUrl}/${credentials2.username}/images`)
            .set('Cookie', `${cookieKey}=${cookie1}`)
            .expect(200)
            .expect('Content-Type', /application\/json/);
      
          expect(response.body).toHaveLength(1);
          expect(response.body[0].private).toBe(false);
        });
      });
    });
  });
});

describe('posting images', () => {
  const privacyOption = false;

  describe('without authentication', () => {
    /*
    fails sometimes, see links:
    https://stackoverflow.com/questions/54936185/express-mongoose-jest-error-econnaborted
    https://github.com/ladjs/supertest/issues/230
    */
    test('is unauthorized', async () => {
      const response = await api
        .post(`${baseUrl}/${credentials1.username}/images`)
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

    // log in and save cookie
    beforeEach(async () => {
      const response = await api 
        .post('/api/auth/login')
        .send(credentials1);

      cookie = get_SetCookie(response);
      console.log('beforeEach cookie', cookie);
    });

    describe('posting to self', () => {
      const postingUsersUsername = credentials1.username;

      test('can post image to self', async () => {
        const response = await postImage(
          postingUsersUsername, cookie, privacyOption
        );

        expect(response.body.title).toBe(title);
        expect(response.body.caption).toBe(caption);
        expect(response.body.private).toBe(privacyOption);
      });

      test('users image count is increased', async () => {
        const imageCountBefore = await getUsersImageCount(postingUsersUsername);
        
        await postImage(postingUsersUsername, cookie, privacyOption);

        const imageCountAfter = await getUsersImageCount(postingUsersUsername);
        expect(imageCountAfter).toBe(imageCountBefore + 1);
      });

      test('can post without title, caption and privacy option', async () => {
        const response = await api
          .post(`${baseUrl}/${postingUsersUsername}/images`)
          .set('Cookie', `${cookieKey}=${cookie}`)
          .set('Content-Type', 'multipart/form-data')
          .attach('image', imagePath)
          .expect(201)
          .expect('Content-Type', /application\/json/);

          // there are six falsy values: false, 0, '', null, undefined, and NaN
          expect(response.body.title).toBeFalsy();
          expect(response.body.caption).toBeFalsy();

          // default privacy option is false
          expect(response.body.private).toBe(false);
      });

      test('image must be present in the request', async () => {
        const response = await api
          .post(`${baseUrl}/${postingUsersUsername}/images`)
          .set('Cookie', `${cookieKey}=${cookie}`)
          .set('Content-Type', 'multipart/form-data')
          .field('title', title)
          .field('caption', caption)
          .field('private', privacyOption)
          .expect(400)
          .expect('Content-Type', /application\/json/);

        expect(response.body.message).toBe('file is missing');
      });
    });
    
    describe('posting to others', () => {
      test('can not post image to other user', async () => {
        const response = await api
          .post(`${baseUrl}/${credentials2.username}/images`)
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
});