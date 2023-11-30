const supertest = require('supertest');
const app = require('../../../src/app');

const { User, Image } = require('../../../src/models');
const { existingUserValues } = require('../../helpers/constants');
const {
  login, get_SetCookie, cookieHeader, 
  compareFoundWithResponse, getUsersImageCount
} = require('../../helpers');
const { getNonSensitiveImage } = require('../../../src/util/dto');
const omit = require('lodash.omit');

const api = supertest(app);
const baseUrl = '/api/users';

/*
TODO
- test more file types
*/

// filetypes are allowed
const testImageInfo1 = { title: 'Git', caption: 'workflow graph', imagePath: 'tests/test-files/git.png' };
const testImageInfo2 = { title: 'Test', caption: 'test results', imagePath: 'tests/test-files/test.PNG' };

// filetype not allowed:
const testTextInfo = { title: 'Text', caption: 'textfile', imagePath: 'tests/test-files/text.txt' };

const postImage = async (username, extraHeaders, formValues, statusCode = 201) => {
  const fieldValues = omit(formValues, ['imagePath']);
  const { imagePath } = formValues;

  const headers = {
    'Content-Type': 'multipart/form-data',
    ...extraHeaders
  };

  const response = await api
    .post(`${baseUrl}/${username}/images`)
    .set(headers)
    .field(fieldValues)
    .attach('image', imagePath)
    .expect(statusCode)
    .expect('Content-Type', /application\/json/);

  return response.body;
};

const existingUserValue = existingUserValues[0];
const otherExistingUserValue = existingUserValues[1];

describe('posting images', () => {
  const formValues = { ...testImageInfo1, privacy: 'public' };

  test('can not post without authentication', async () => {
    const username = existingUserValue.username;

    const headers = {
      // there is a bug in supertest, this seems to fix it
      // https://stackoverflow.com/questions/54936185/express-mongoose-jest-error-econnaborted
      // https://github.com/ladjs/supertest/issues/230
      'Connection': 'keep-alive',
    };

    const responseBody = await postImage(
      username, headers, formValues, 401
    );

    expect(responseBody.message).toBe('authentication required');
  });

  describe('with authentication', () => {
    const credentials = omit(existingUserValue, ['name']);
    const postingUsersUsername = credentials.username;

    let authHeader = {};

    beforeEach(async () => {
      // log in and save cookie
      const response = await login(api, credentials);

      const cookie = get_SetCookie(response);
      authHeader = cookieHeader(cookie);
    });

    describe('posting to self', () => {
      test('can post image to self', async () => {
        await postImage(postingUsersUsername, authHeader, formValues);
      });

      test('response contains set values', async () => {
        const responseImage = await postImage(
          postingUsersUsername, authHeader, formValues
        );

        const { title, caption, imagePath, privacy } = formValues;

        // response contains original filename
        expect(responseImage.originalname).toBe(imagePath.split('/')[2]);

        // response contains posted values
        expect(responseImage.title).toBe(title);
        expect(responseImage.caption).toBe(caption);
        expect(responseImage.privacy).toBe(privacy);

        // response contains users id
        const userId = (await User.findOne({ 
          where: { username: postingUsersUsername }
        })).id;

        expect(responseImage.id).toBeDefined();
        expect(responseImage.userId).toBe(userId);
      });

      test('users image count is increased by one', async () => {
        const imageCountBefore = await getUsersImageCount(postingUsersUsername);
        
        await postImage(
          postingUsersUsername, authHeader, formValues
        );

        const imageCountAfter = await getUsersImageCount(postingUsersUsername);
        expect(imageCountAfter).toBe(imageCountBefore + 1);
      });

      test('image details can be found after posting', async () => {
        const responseImage = await postImage(
          postingUsersUsername, authHeader, formValues
        );

        const foundImage = await Image.findByPk(responseImage.id);

        compareFoundWithResponse(getNonSensitiveImage(foundImage), responseImage);
      });

      test('image filepath is not returned', async () => {
        const responseImage = await postImage(
          postingUsersUsername, authHeader, formValues
        );

        expect(responseImage).not.toHaveProperty('filepath');
      });

      test('default privacy is public', async () => {
        const noPrivacyValue = omit(formValues, ['privacy']);
        expect(noPrivacyValue).not.toHaveProperty('privacy');

        const responseImage = await postImage(
          postingUsersUsername, authHeader, noPrivacyValue
        );

        expect(responseImage.privacy).toBe('public');
      });

      test('title and caption are empty by default', async () => {
        const responseImage = await postImage(
          postingUsersUsername, authHeader, omit(formValues, ['title', 'caption'])
        );

        expect(responseImage.title).toBe('');
        expect(responseImage.caption).toBe('');
      });

      test('image must be present in the request', async () => {
        const responseBody = await postImage(
          postingUsersUsername,
          authHeader,
          omit(formValues, ['imagePath']),
          400
        );

        expect(responseBody.message).toBe('file is missing');
      });

      describe('invalid filetypes', () => {
        test('text files are not allowed', async () => {
          const responseBody = await postImage(
            postingUsersUsername, authHeader, testTextInfo, 400
          );
  
          expect(responseBody.message).toMatch(/^File upload only supports the following filetypes/);
        });
      });
    });

    test('can not post image to other user', async () => {
      const otherUsername = otherExistingUserValue.username;
      const responseBody = await postImage(
        otherUsername, authHeader, formValues, 401
      );

      expect(responseBody.message).toBe('can not add images to other users');
    });
  });
});