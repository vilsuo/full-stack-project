const supertest = require('supertest');
const omit = require('lodash.omit');

const app = require('../../../src/app');
const { User, Image } = require('../../../src/models');
const { existingUserValues, testImages, } = require('../../helpers/constants');
const {
  login, get_SetCookie, cookieHeader,
  createImage,
  compareFoundWithResponse
} = require('../../helpers');
const { getNonSensitiveImage } = require('../../../src/util/dto');

const api = supertest(app);
const baseUrl = '/api/users';

const existingUserValue = existingUserValues[0];
const otherExistingUserValue = existingUserValues[1];
const { jpg: [ jpg1, jpg2 ], png: [ png1 ] } = testImages;

const editImage = async (username, imageId, imageValues, headers = {}, statusCode = 401) => {
  const response = await api
    .put(`${baseUrl}/${username}/images/${imageId}`)
    .set(headers)
    .send(imageValues)
    .expect(statusCode)
    .expect('Content-Type', /application\/json/);

  return response.body;
};

describe('editing images', () => {
  const credentials = omit(existingUserValue, ['name']);
  const username = existingUserValue.username;
  let userPublicImage;
  let userPrivateImage;

  const newImageValues = {
    title: 'this is edited title',
    caption: 'this is edited caption',
    privacy: 'public',
  };
  const { title, caption, privacy } = newImageValues;

  // create private & nonprivate images
  beforeEach(async () => {
    const userId = (await User.findOne({ where: { username } })).id;
      
    userPublicImage = await createImage({
      userId, privacy: 'public',
      ...omit(png1, ['imagePath']),
    });

    userPrivateImage = await createImage({
      userId, privacy: 'private',
      ...omit(jpg1, ['imagePath']),
    });
  });

  describe('without authentication', () => {
    test('can not edit public image', async () => {
      const responseBody = await editImage(username, userPublicImage.id);
      expect(responseBody.message).toBe('authentication required');
    });

    test('can not edit private image', async () => {
      const responseBody = await editImage(username, userPrivateImage.id, newImageValues);
      expect(responseBody.message).toBe('authentication required');
    });
  });

  describe('with authentication', () => {
    let authHeader = {};

    beforeEach(async () => {
      // log in and save cookie
      const response = await login(api, credentials);

      const cookie = get_SetCookie(response);
      authHeader = cookieHeader(cookie);
    });

    describe('editing own images', () => {
      test('can set only a new title', async () => {
        const responseImage = await editImage(
          username, userPublicImage.id, { title }, authHeader, 200
        );

        // new title is in the response
        expect(responseImage.title).toBe(title);

        // other old values are the same
        expect(responseImage.caption).toBe(userPublicImage.caption);
        expect(responseImage.private).toBe(userPublicImage.private);
      });

      test('can set only a new caption', async () => {
        const responseImage = await editImage(
          username, userPublicImage.id, { caption }, authHeader, 200
        );

        // new caption is in the response
        expect(responseImage.caption).toBe(caption);

        // other old values are the same
        expect(responseImage.title).toBe(userPublicImage.title);
        expect(responseImage.private).toBe(userPublicImage.private);
      });

      test('can set new privacy options', async () => {
        const privacyOptions = ['public', 'private'];

        const responseImages = await Promise.all(privacyOptions.map(async option => {
          return await editImage(
            username, userPublicImage.id, { privacy: option }, authHeader, 200
          );
        }));

        responseImages.forEach((responseImage, index) => {
          expect(responseImage.privacy).toBe(privacyOptions[index]);
        });
      });

      test('can edit private image', async () => {
        const imageToEdit = userPrivateImage;
        const returnedImage = await editImage(
          username, imageToEdit.id, newImageValues, authHeader, 200
        );

        // all new values are set
        expect(returnedImage.title).toBe(title);
        expect(returnedImage.caption).toBe(caption);

        // privacy was truly changed
        expect(imageToEdit.privacy).not.toBe(privacy);
        expect(returnedImage.privacy).toBe(privacy);
      });

      test('can not edit image that does not exist', async () => {
        const nonExistingImageId = 91727149;
        const responseBody = await editImage(
          username, nonExistingImageId, newImageValues, authHeader, 404
        );

        expect(responseBody.message).toBe('image does not exist');
      });

      test('edited image can be found after editing with the new values', async () => {
        const imageToEditId = userPublicImage.id;
        const editedImage = await editImage(
          username, imageToEditId, newImageValues, authHeader, 200
        );

        const foundImage = await Image.findByPk(imageToEditId);
        compareFoundWithResponse(getNonSensitiveImage(foundImage), editedImage);
      });

      test('editing updates the field "updatedAt"', async () => {
        const oldDate = userPublicImage.updatedAt;

        await editImage(
          username, userPublicImage.id, newImageValues, authHeader, 200
        );

        const newDate = (await Image.findByPk(userPublicImage.id)).updatedAt;

        // new date is after the old date
        expect(newDate.getTime()).toBeGreaterThan(oldDate.getTime());
      });
    });

    describe('deleting other users images', () => {
      const otherUsername = otherExistingUserValue.username;
      let otherUserPublicImage;
      let otherUserPrivateImage;

      // create images to other user
      beforeEach(async () => {
        const otherUserId = (await User.findOne({
          where: { username: otherUsername }
        })).id;
    
        otherUserPublicImage = await createImage({
          userId: otherUserId, privacy: 'public',
          ...omit(jpg2, ['imagePath']),
        });
        otherUserPrivateImage = await createImage({
          userId: otherUserId, privacy: 'private'
        });
      });
      
      test('can not edit public image', async () => {
        const responseBody = await editImage(
          otherUsername, otherUserPublicImage.id, newImageValues, authHeader, 401
        );

        expect(responseBody.message).toBe('can not modify other users images')
      });

      test('can not edit private image', async () => {
        const responseBody = await editImage(
          otherUsername, otherUserPrivateImage.id, newImageValues, authHeader, 401
        );

        expect(responseBody.message).toBe('can not modify other users images')
      });
    });
  });
});