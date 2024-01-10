const supertest = require('supertest');
const omit = require('lodash.omit');

const app = require('../../../../src/app');
const { User, Image } = require('../../../../src/models');
const {
  existingUserValues, otherExistingUserValues,
  nonExistingImageValues, invalidImageTypes, getCredentials,
} = require('../../../helpers/constants');

const {
  login, compareFoundWithResponse, getUsersImageCount
} = require('../../../helpers');

const { getNonSensitiveImage } = require('../../../../src/util/dto');
const fileStorage = require('../../../../src/util/file-storage');

const api = supertest(app);
const baseUrl = '/api/users';

/*
TODO
- reset mock after each test
- test more file types
- how to test that file was (/was) not saved to the filesystem?
*/

const postImage = async (username, extraHeaders, formValues, statusCode = 201) => {
  const { filepath, ...fieldValues } = formValues;

  const headers = {
    'Content-Type': 'multipart/form-data',
    ...extraHeaders
  };

  const response = await api
    .post(`${baseUrl}/${username}/images`)
    .set(headers)
    .field(fieldValues)
    .attach('image', filepath)
    .expect(statusCode)
    .expect('Content-Type', /application\/json/);

  return response.body;
};

describe('posting images', () => {
  const formValues = {
    ...omit(nonExistingImageValues, ['mimetype', 'originalname']),
    privacy: 'public'
  };
  const { title, caption, privacy } = formValues;
  const originalname = nonExistingImageValues.originalname;

  const removeFileSpy = jest.spyOn(fileStorage, 'removeFile')
    .mockImplementation((filepath) => undefined);

  test('can not post without authentication', async () => {
    const username = existingUserValues.username;

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
    const credentials = getCredentials(existingUserValues);
    const postingUsersUsername = credentials.username;

    let authHeader = {};

    beforeEach(async () => {
      authHeader = await login(api, credentials);
    });

    describe('posting to self', () => {
      test('can post a public image', async () => {
        const returnedImage = await postImage(postingUsersUsername, authHeader, formValues);

        expect(returnedImage.privacy).toBe('public');
      });

      test('can post a private image', async () => {
        const returnedImage = await postImage(
          postingUsersUsername, authHeader, { ...formValues, privacy: 'private' }
        );

        expect(returnedImage.privacy).toBe('private');
      });

      test('response contains set values', async () => {
        const responseImage = await postImage(
          postingUsersUsername, authHeader, formValues
        );

        // response contains original filename
        expect(responseImage.originalname).toBe(originalname);

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
          omit(formValues, ['filepath']),
          400
        );

        expect(responseBody.message).toBe('file is missing');
      });

      test('there is no attempt to remove an image from filesystem after successfull upload', async () => {
        await postImage(postingUsersUsername, authHeader, formValues);

        expect(removeFileSpy).not.toHaveBeenCalled();
      });

      describe('invalid field values', () => {
        const invalidPrivacy = 'friends';
        const invalidFormValues = { ...formValues, privacy: invalidPrivacy };

        test('can not post an image with invalid privacy option', async () => {
          const responseBody = await postImage(
            postingUsersUsername, authHeader, invalidFormValues, 400
          );
  
          expect(responseBody.message).toContain('invalid image privacy');
        });

        test('attempt is made to remove the failed upload image from filesystem', async () => {
          await postImage(postingUsersUsername, authHeader, invalidFormValues, 400);
          
          expect(removeFileSpy).toHaveBeenCalled();
        });
      });

      describe('invalid files', () => {
        const txtFile = invalidImageTypes[0];

        test('text files are not allowed', async () => {
          const responseBody = await postImage(
            postingUsersUsername, authHeader, txtFile, 415
          );
  
          expect(responseBody.message).toMatch(
            /^file upload only supports the following filetypes/
          );
        });
      });
    });

    test('can not post image to other user', async () => {
      const otherUsername = otherExistingUserValues.username;
      const responseBody = await postImage(
        otherUsername, authHeader, formValues, 401
      );

      expect(responseBody.message).toBe('session user is not the owner');
    });
  });
});