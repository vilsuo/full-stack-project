const supertest = require('supertest');
const omit = require('lodash.omit');

const app = require('../../../src/app');
const { User, Image } = require('../../../src/models');
const imageStorage = require('../../../src/util/image-storage');
const { existingUserValues, testImages } = require('../../helpers/constants');
const {
  login, get_SetCookie, cookieHeader, 
  getUsersImageCount,
  createImage
} = require('../../helpers');

const api = supertest(app);
const baseUrl = '/api/users';

/*
TODO
- implement with 'testImage' values from constants.js
- reset mock adter each test
*/

const existingUserValue = existingUserValues[0];
const otherExistingUserValue = existingUserValues[1];
const { jpg: [ jpg1, jpg2 ], png: [ png1 ] } = testImages;

const deleteImage = async (username, imageId, headers = {}, statusCode = 401) => {
  const response = await api
    .delete(`${baseUrl}/${username}/images/${imageId}`)
    .set(headers)
    .expect(statusCode);

  return response.body;
};

describe('deleting images', () => {
  const credentials = omit(existingUserValue, ['name']);
  const username = existingUserValue.username;
  let userPublicImage;
  let userPrivateImage;

  const removeFileSpy = jest
    .spyOn(imageStorage, 'removeFile')
    .mockImplementation((filepath) => console.log(`spy called with ${filepath}`));

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
    test('can not delete public image', async () => {
      const responseBody = await deleteImage(username, userPublicImage.id);
      expect(responseBody.message).toBe('authentication required');
    });

    test('can not delete private image', async () => {
      const responseBody = await deleteImage(username, userPrivateImage.id);
      expect(responseBody.message).toBe('authentication required')
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

    describe('deleting own images', () => {
      test('can delete public image', async () => {
        await deleteImage(username, userPublicImage.id, authHeader, 204);
      });

      test('can delete private image', async () => {
        await deleteImage(username, userPrivateImage.id, authHeader, 204);
      });

      test('can not delete image that does not exist', async () => {
        const nonExistingImageId = 91727149;
        const responseBody = await deleteImage(username, nonExistingImageId, authHeader, 404);

        expect(responseBody.message).toBe('image does not exist');
      });

      describe('after deleting an image', () => {
        test('users image count is decreased by one', async () => {
          const imageCountBefore = await getUsersImageCount(username);
  
          await deleteImage(username, userPublicImage.id, authHeader, 204);
  
          // users image count is decreased by one
          const imageCountAfter = await getUsersImageCount(username);
          expect(imageCountAfter).toBe(imageCountBefore - 1);
        });
  
        test('image can not be found', async () => {
          const imageToDeleteId = userPublicImage.id;
          await deleteImage(username, imageToDeleteId, authHeader, 204);
  
          // image is no longer found
          const result = await Image.findOne({ where: { id: imageToDeleteId } });
          expect(result).toBeFalsy();
        });
  
        test('attempt is made to remove file from the filesystem', async () => {
          await deleteImage(username, userPublicImage.id, authHeader, 204);
  
          expect(removeFileSpy).toHaveBeenCalled();
        });
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
      
      test('can not delete public image', async () => {
        const responseBody = await deleteImage(
          otherUsername, otherUserPublicImage.id, authHeader
        );

        expect(responseBody.message).toBe('can not modify other users images')
      });

      test('can not delete private image', async () => {
        const responseBody = await deleteImage(
          otherUsername, otherUserPrivateImage.id, authHeader
        );

        expect(responseBody.message).toBe('can not modify other users images')
      });
    });
  })
});