const supertest = require('supertest');
const pick = require('lodash.pick');

const app = require('../../../../src/app');
const { User, Image } = require('../../../../src/models');
const {
  existingUserValues, otherExistingUserValues,
  nonExistingImageValues, invalidImageTypes, getCredentials,
} = require('../../../helpers/constants');

const {
  login, compareFoundWithResponse
} = require('../../../helpers');

const { getNonSensitiveImage } = require('../../../../src/util/dto');
const fileStorage = require('../../../../src/util/file-storage');
const parser = require('../../../../src/util/parser');
const { IMAGE_PRIVACIES, IMAGE_PUBLIC } = require('../../../../src/constants');

const api = supertest(app);
const baseUrl = '/api/users';

/*
TODO
- test more file types
- how to test that file was (/was) not saved to the filesystem?
*/

const parseTextTypeSpy = jest.spyOn(parser, 'parseTextType');
const parseStringTypeSpy = jest.spyOn(parser, 'parseStringType');
const parseImagePrivacySpy = jest.spyOn(parser, 'parseImagePrivacy');

const removeFileSpy = jest.spyOn(fileStorage, 'removeFile')
  .mockImplementation(filepath => undefined);

const postImage = async (username, fields, filepath, extraHeaders, statusCode) => {
  const headers = {
    'Content-Type': 'multipart/form-data',
    ...extraHeaders
  };

  const response = await api
    .post(`${baseUrl}/${username}/images`)
    .set(headers)
    .field(fields)
    .attach('image', filepath)
    .expect(statusCode)
    .expect('Content-Type', /application\/json/);

  return response.body;
};

const textFields = pick(nonExistingImageValues, ['title', 'caption']);
const { title, caption } = textFields;
const { filepath, originalname } = nonExistingImageValues;

describe('posting images', () => {
  const username = existingUserValues.username;

  test.each(IMAGE_PRIVACIES)('can not post a %s image without authentication', async (privacy) => {
    const headers = {
      // there is a bug in supertest, this seems to fix it
      // https://stackoverflow.com/questions/54936185/express-mongoose-jest-error-econnaborted
      // https://github.com/ladjs/supertest/issues/230
      'Connection': 'keep-alive',
    };

    const responseBody = await postImage(
      username, { ...textFields, privacy }, filepath, headers, 401
    );

    expect(responseBody.message).toBe('authentication required');
  });

  describe('with authentication', () => {
    const credentials = getCredentials(existingUserValues);
    let authHeader = {};

    beforeEach(async () => {
      authHeader = await login(api, credentials);
    });

    describe('posting to self', () => {
      
      describe.each(IMAGE_PRIVACIES)('posting a %s image', privacy => {
        test('can post a image', async () => {
          await postImage(username, { ...textFields, privacy }, filepath, authHeader, 201);
        });

        describe(`after posting a ${privacy} image`, () => {
          let responseImage;

          beforeEach(async () => {
            responseImage = await postImage(
              username, { ...textFields, privacy }, filepath, authHeader, 201
            );
          });

          test('response contains set values', async () => {
            expect(responseImage).toHaveProperty('id');

            // response contains original filename
            expect(responseImage.originalname).toBe(originalname);
    
            // response contains posted values
            expect(responseImage.title).toBe(title);
            expect(responseImage.caption).toBe(caption);
            expect(responseImage.privacy).toBe(privacy);
    
            // response contains users id
            const user = await User.findOne({ where: { username: username } });
            expect(responseImage.userId).toBe(user.id);
          });

          test('image details can be found after posting', async () => {
            const foundImage = await Image.findByPk(responseImage.id);
    
            compareFoundWithResponse(getNonSensitiveImage(foundImage), responseImage);
          });
    
          test('image filepath is not returned', async () => {
            expect(responseImage).not.toHaveProperty('filepath');
          });

          test('there is no attempt to remove an image', async () => {
            expect(removeFileSpy).not.toHaveBeenCalled();
          });
        });
      });

      describe('default values', () => {
        test(`default privacy is ${IMAGE_PUBLIC}`, async () => {
          const fieldsNoPrivacy = textFields;
          expect(fieldsNoPrivacy).not.toHaveProperty('privacy');
  
          const responseImage = await postImage(
            username, fieldsNoPrivacy, filepath, authHeader, 201
          );
  
          expect(responseImage.privacy).toBe(IMAGE_PUBLIC);
        });
  
        test('title and caption are empty by default', async () => {
          const fieldsNoTitleAndCaption = { privacy: IMAGE_PUBLIC };
          const responseImage = await postImage(
            username, fieldsNoTitleAndCaption, filepath, authHeader, 201
          );
  
          expect(responseImage.title).toBe('');
          expect(responseImage.caption).toBe('');
        });
      });

      describe('parsing field values', () => {
        describe('valid field values', () => {
          test('title is parsed', async () => {
            await postImage(username, { title }, filepath, authHeader, 201);

            expect(parseStringTypeSpy).toHaveBeenCalledWith(title, expect.anything());
          });

          test('caption is parsed', async () => {
            await postImage(username, { caption }, filepath, authHeader, 201);

            expect(parseTextTypeSpy).toHaveBeenCalledWith(caption, expect.anything());
          });

          test('privacy is parsed', async () => {
            const privacy = IMAGE_PUBLIC;
            await postImage(username, { privacy }, filepath, authHeader, 201);

            expect(parseImagePrivacySpy).toHaveBeenCalledWith(privacy);
          });
        });

        describe('invalid field values', () => {
          const invalidTitle = 'x'.repeat(1000);
          const invalidPrivacy = 'hi';

          test('invalid title is bad request', async () => {
            const responseBody = await postImage(
              username, { title: invalidTitle }, filepath, authHeader, 400
            );

            expect(responseBody).toHaveProperty('message');
          });

          test('invalid privacy is bad request', async () => {
            const responseBody = await postImage(
              username, { privacy: invalidPrivacy }, filepath, authHeader, 400
            );

            expect(responseBody).toHaveProperty('message');
          });

          // after field value parsing error an attempt is made to remove the uploaded
          // image from filesystem
          afterEach(async () => {
            expect(removeFileSpy).toHaveBeenCalled();
          });
        });
      });

      describe('invalid files', () => {
        const txtFile = invalidImageTypes[0];
        const privacy = IMAGE_PUBLIC;

        test('text files are not allowed', async () => {
          const responseBody = await postImage(
            username, { ...textFields, privacy }, txtFile.filepath, authHeader, 415
          );
  
          expect(responseBody.message).toMatch(
            /^file upload only supports the following filetypes/
          );
        });

        test('file must be present in the request', async () => {
          const responseBody = await postImage(
            username, { ...textFields, privacy }, undefined, authHeader, 400
          );
  
          expect(responseBody.message).toBe('file is missing');
        });
      });
    });

    describe('posting to other user', () => {
      const otherUsername = otherExistingUserValues.username;

      test.each(IMAGE_PRIVACIES)('can not post a %s image to other user', async (privacy) => {
        const responseBody = await postImage(
          otherUsername, { ...textFields, privacy }, filepath, authHeader, 401
        );

        expect(responseBody.message).toBe('session user is not the owner');
      });
    });
  });
});