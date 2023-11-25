const { User, Image } = require('../../src/models');
const { encodePassword } = require('../../src/util/auth');

const { cookieHeader, get_SetCookie } = require('../helpers');
const supertest = require('supertest');
const app = require('../../src/app');

const api = supertest(app);
const baseUrl = '/api/users';

/*
TODO
- add test that check that only images are allowed

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

const testImageInfo1 = { title: 'Git', caption: 'workflow graph', imagePath: 'tests/test-images/git.png' };
const testImageInfo2 = { title: 'Test', caption: 'test results', imagePath: 'tests/test-images/test.PNG' };

const postImage = async (username, extraHeaders, formValues, statusCode) => {
  const { title, caption, private: privacyOption, imagePath } = formValues;

  const headers = { ...extraHeaders };
  if (imagePath) { headers['Content-Type'] = 'multipart/form-data'; }

  const fieldValues = {};
  if (title !== undefined)          { fieldValues.title = title };
  if (caption !== undefined)        { fieldValues.caption = caption };
  if (privacyOption !== undefined)  { fieldValues.private = privacyOption };

  const response = await api
    .post(`${baseUrl}/${username}/images`)
    .set(headers)
    .field(fieldValues)
    .attach('image', imagePath)
    .expect(statusCode)
    .expect('Content-Type', /application\/json/);

  return response;
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
      expect(returnedUser.passwordHash).toBeUndefined();
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
  
      expect(response.body.passwordHash).toBeUndefined();
    });
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
    const username = credentials1.username;
    let image11;
    let image12;

    // create private & nonprivate images
    beforeEach(async () => {
      const userId = (await User.findOne({ where: { username } })).id;
      
      image11 = await Image.create({
        originalname: 'image1-pub.jpeg', 
        mimetype: 'image/jpeg', 
        private: false,
        userId,
      });

      image12 = await Image.create({
        originalname: 'image1-priv.jpeg', 
        mimetype: 'image/jpeg', 
        private: true,
        userId,
      });
    });

    describe('without authentication', () => {
      test('only public images are found', async () => {
        const response = await api
          .get(`${baseUrl}/${username}/images`)
          .expect(200)
          .expect('Content-Type', /application\/json/);
    
        expect(response.body).toHaveLength(1);
        expect(response.body[0].private).toBe(false);
      });

      test('can not view disabled users public images', async () => {
        const disabledUsersUsername = disabledCredentials.username;
        const disabledUsersId = (await User.findOne({
          where: { username: disabledUsersUsername }
        })).id;

        await Image.create({
          originalname: 'image-disabled-pub.jpeg', 
          mimetype: 'image/jpeg', 
          private: false,
          userId: disabledUsersId,
        });

        const response = await api
          .get(`${baseUrl}/${disabledUsersUsername}/images`)
          .expect(400)
          .expect('Content-Type', /application\/json/);
    
        expect(response.body.message).toBe('user is disabled');
      });
    });
  
    describe('with authentication', () => {
      let authHeader = {};

      beforeEach(async () => {
        // log in and save cookie
        const response = await api 
          .post('/api/auth/login')
          .send(credentials1);

        const cookie = get_SetCookie(response);
        authHeader = cookieHeader(cookie);
      });

      describe('accessing own images', () => {
        test('can access all images', async () => {
          const userImageCount = await getUsersImageCount(username);

          const response = await api
            .get(`${baseUrl}/${username}/images`)
            .set(authHeader)
            .expect(200)
            .expect('Content-Type', /application\/json/);
        
          expect(response.body).toHaveLength(userImageCount);
        });
      });

      describe('accessing other users images', () => {
        const otherUsername = credentials2.username;
        let image21;
        let image22;

        // create image to other user
        beforeEach(async () => {
          const otherUserId = (await User.findOne({
            where: { username: otherUsername }
          })).id;
          
          image21 = await Image.create({
            originalname: 'image2-pub.jpeg', 
            mimetype: 'image/jpeg', 
            private: false,
            userId: otherUserId,
          });
    
          image22 = await Image.create({
            originalname: 'image2-priv.jpeg', 
            mimetype: 'image/jpeg', 
            private: true,
            userId: otherUserId,
          });
        });

        test('can not access private images', async () => {
          const response = await api
            .get(`${baseUrl}/${otherUsername}/images`)
            .set(authHeader)
            .expect(200)
            .expect('Content-Type', /application\/json/);
        
          expect(response.body).toHaveLength(1);
          expect(response.body[0].private).toBe(false);
        });
      });
    });
  });

  //describe('single', () => {
  //
  //});
});

describe('posting images', () => {
  const privacyOption = false;
  const formValues = { ...testImageInfo1, private: privacyOption };
  const { title, caption, imagePath } = formValues;

  describe('without authentication', () => {
    test('is unauthorized', async () => {
      const headers = {
        // there is a bug in supertest, this seems to fix it
        // https://stackoverflow.com/questions/54936185/express-mongoose-jest-error-econnaborted
        // https://github.com/ladjs/supertest/issues/230
        'Connection': 'keep-alive',
      };

      const response = await postImage(
        credentials1.username, headers, formValues, 401
      );

      expect(response.body.message).toBe('authentication required');
    });
  });

  describe('with authentication', () => {
    const postingUsersUsername = credentials1.username;

    let authHeader = {};

    beforeEach(async () => {
      // log in and save cookie
      const response = await api 
        .post('/api/auth/login')
        .send(credentials1);

      const cookie = get_SetCookie(response);
      authHeader = cookieHeader(cookie);
    });

    describe('posting to self', () => {
      test('can post image to self', async () => {
        const response = await postImage(
          postingUsersUsername, authHeader, formValues, 201
        );

        // original filename is saved
        expect(response.body.originalname).toBe(imagePath.split('/')[2]);

        // form values are saved
        expect(response.body.title).toBe(title);
        expect(response.body.caption).toBe(caption);
        expect(response.body.private).toBe(privacyOption);
      });

      test('users image count is increased', async () => {
        const imageCountBefore = await getUsersImageCount(postingUsersUsername);
        
        await postImage(
          postingUsersUsername, authHeader, formValues, 201
        );

        const imageCountAfter = await getUsersImageCount(postingUsersUsername);
        expect(imageCountAfter).toBe(imageCountBefore + 1);
      });

      test('can post without title, caption and privacy option', async () => {
        const response = await postImage(
          postingUsersUsername, authHeader, { imagePath }, 201
        );

        // there are six falsy values: false, 0, '', null, undefined, and NaN
        expect(response.body.title).toBeFalsy();
        expect(response.body.caption).toBeFalsy();

        // default privacy option is false
        expect(response.body.private).toBe(false);
      });

      test('image must be present in the request', async () => {
        const response = await postImage(
          postingUsersUsername,
          authHeader,
          { title, caption, private: privacyOption },
          400
        );

        expect(response.body.message).toBe('file is missing');
      });
    });
    
    describe('posting to others', () => {
      test('can not post image to other user', async () => {
        const response = await postImage(
          credentials2.username, authHeader, formValues, 401
        );

        expect(response.body.message).toBe('can not add images to other users');
      });
    });
  });
});