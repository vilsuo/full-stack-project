const { User, Image } = require('../../../src/models');

const { cookieHeader, get_SetCookie, createUser, getUsersImageCount, compareFoundAndResponseImage } = require('../../helpers');
const supertest = require('supertest');
const app = require('../../../src/app');

const api = supertest(app);
const baseUrl = '/api/users';

/*
TODO
- test more file types
*/

const testImageInfo1 = { title: 'Git', caption: 'workflow graph', imagePath: 'tests/test-files/git.png' };
const testImageInfo2 = { title: 'Test', caption: 'test results', imagePath: 'tests/test-files/test.PNG' };

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

const credentials1 = { username: 'viltsu', password: 'salainen' };
const credentials2 = { username: 'matsu', password: 'salainen' };
const disabledCredentials = { username: 'samtsu', password: 'salainen' };

beforeEach(async () => {
  // NON DISABLED USERS:
  await createUser('vili', credentials1);
  await createUser('matias', credentials2);

  // DISABLED USER:
  await createUser('samuli', disabledCredentials, true);
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

        const createdImage = response.body;

        // form values are returned
        expect(createdImage.title).toBe(title);
        expect(createdImage.caption).toBe(caption);
        expect(createdImage.private).toBe(privacyOption);

        // filepath is not returned
        expect(createdImage).not.toHaveProperty('filepath');

        // original filename is set
        expect(createdImage.originalname).toBe(imagePath.split('/')[2]);

        // image is saved to correct user
        const userId = (await User.findOne({ 
          where: { username: postingUsersUsername }
        })).id;

        expect(createdImage.id).toBeDefined();
        expect(createdImage.userId).toBe(userId);
      });

      test('users image count is increased by one', async () => {
        const imageCountBefore = await getUsersImageCount(postingUsersUsername);
        
        await postImage(
          postingUsersUsername, authHeader, formValues, 201
        );

        const imageCountAfter = await getUsersImageCount(postingUsersUsername);
        expect(imageCountAfter).toBe(imageCountBefore + 1);
      });

      test('image details can be found after posting', async () => {
        const response = await postImage(
          postingUsersUsername, authHeader, formValues, 201
        );

        const createdImage = response.body;
        const foundImage = await Image.findByPk(createdImage.id);

        compareFoundAndResponseImage(foundImage, createdImage);
      });

      test('can post without title, caption and privacy option', async () => {
        const response = await postImage(
          postingUsersUsername, authHeader, { imagePath }, 201
        );

        const createdImage = response.body;

        // there are six falsy values: false, 0, '', null, undefined, and NaN
        expect(createdImage.title).toBeFalsy();
        expect(createdImage.caption).toBeFalsy();

        // default privacy option is false
        expect(createdImage.private).toBe(false);
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

      test('can not post text file', async () => {
        const textInfo = {
          title: 'Text', caption: 'textfile', imagePath: 'tests/test-files/text.txt'
        };
        
        const response = await postImage(
          postingUsersUsername, authHeader, { ...textInfo, private: false }, 400
        );

        const message = response.body.message;
        expect(message).toMatch(/^File upload only supports the following filetypes/);
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