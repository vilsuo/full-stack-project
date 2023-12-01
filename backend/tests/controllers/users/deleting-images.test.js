const supertest = require('supertest');
const app = require('../../../src/app');

const { User, Image } = require('../../../src/models');
const { existingUserValues } = require('../../helpers/constants');
const {
  login, get_SetCookie, cookieHeader, 
  getUsersImageCount,
  createImage
} = require('../../helpers');
const omit = require('lodash.omit');

const api = supertest(app);
const baseUrl = '/api/users';

// mock 'removeFile' to do NOTHING
jest.mock('../../../src/util/image-storage');
const { removeFile } = require('../../../src/util/image-storage');

const existingUserValue = existingUserValues[0];
const otherExistingUserValue = existingUserValues[1];

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

  // create private & nonprivate images
  beforeEach(async () => {
    const userId = (await User.findOne({ where: { username } })).id;
      
    userPublicImage = await createImage(userId, 'public image', 'this image is public');
    userPrivateImage = await createImage(userId, 'private image', 'this image is private!', 'private');
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
  
          // The mock function was called at least once
          expect(removeFile).toHaveBeenCalled();
        });
      });
    });

    describe('deleting other users images', () => {
      const otherUsername = otherExistingUserValue.username;
      let otherUserPublicImage;
      let otherUserPrivateImage;

      // create images to other user
      beforeEach(async () => {
        const otherUserId = (await User.findOne({ where: { username: otherUsername } })).id;
    
        otherUserPublicImage = await createImage(
          otherUserId, 'others public image', 'this is public access'
        );
        otherUserPrivateImage = await createImage(
          otherUserId, 'others private image', 'this is private access only!', 'private'
        );
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