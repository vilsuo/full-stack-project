const supertest = require('supertest');
const omit = require('lodash.omit');

const app = require('../../../../src/app');
const { Image, User } = require('../../../../src/models');
const fileStorage = require('../../../../src/util/file-storage');
const { existingUserValues, otherExistingUserValues, getCredentials } = require('../../../helpers/constants');
const { login, getUsersImageCount, findPublicAndPrivateImage, } = require('../../../helpers');

const api = supertest(app);
const baseUrl = '/api/users';

const deleteImage = async (username, imageId, headers = {}, statusCode = 401) => {
  const response = await api
    .delete(`${baseUrl}/${username}/images/${imageId}`)
    .set(headers)
    .expect(statusCode);

  return response.body;
};

describe('deleting images', () => {
  const removeFileSpy = jest.spyOn(fileStorage, 'removeFile')
    .mockImplementation((filepath) => undefined);

  const credentials = getCredentials(existingUserValues);
  const username = existingUserValues.username;
  let publicImage;
  let privateImage;

  // find a private and a nonprivate image
  beforeEach(async () => {
    ({ publicImage, privateImage } = await findPublicAndPrivateImage(username));
  });

  describe('without authentication', () => {
    test('can not delete public image', async () => {
      const responseBody = await deleteImage(username, publicImage.id);
      expect(responseBody.message).toBe('authentication required');
    });

    test('can not delete private image', async () => {
      const responseBody = await deleteImage(username, privateImage.id);
      expect(responseBody.message).toBe('authentication required')
    });
  });

  describe('with authentication', () => {
    let authHeader = {};

    beforeEach(async () => {
      authHeader = await login(api, credentials);
    });

    describe('deleting own images', () => {
      test('can delete public image', async () => {
        await deleteImage(username, publicImage.id, authHeader, 204);
      });

      test('can delete private image', async () => {
        await deleteImage(username, privateImage.id, authHeader, 204);
      });

      test('can not delete image that does not exist', async () => {
        const nonExistingImageId = 91727149;
        const responseBody = await deleteImage(username, nonExistingImageId, authHeader, 404);

        expect(responseBody.message).toBe('image does not exist');
      });

      describe('after deleting an image', () => {
        test('users image count is decreased by one', async () => {
          const imageCountBefore = await getUsersImageCount(username);
  
          await deleteImage(username, publicImage.id, authHeader, 204);
  
          // users image count is decreased by one
          const imageCountAfter = await getUsersImageCount(username);
          expect(imageCountAfter).toBe(imageCountBefore - 1);
        });
  
        test('image can not be found', async () => {
          const imageToDeleteId = publicImage.id;
          await deleteImage(username, imageToDeleteId, authHeader, 204);
  
          // image is no longer found
          const result = await Image.findOne({ where: { id: imageToDeleteId } });
          expect(result).toBeFalsy();
        });
  
        test('attempt is made to remove file from the filesystem', async () => {
          await deleteImage(username, publicImage.id, authHeader, 204);
  
          expect(removeFileSpy).toHaveBeenCalledWith(publicImage.filepath);
        });

        test('user is not deleted', async () => {
          const foundUser = await User.findOne({ where: { username }});
          expect(foundUser).not.toBeFalsy();
          expect(foundUser.id).not.toBeFalsy();
        });
      });
    });

    describe('deleting other users images', () => {
      const otherUsername = otherExistingUserValues.username;
      let otherPublicImage;
      let otherPrivateImage;
      
      beforeEach(async () => {
        ({ publicImage : otherPublicImage, privateImage: otherPrivateImage } =
          await findPublicAndPrivateImage(otherUsername)
        );
      });
      
      test('can not delete public image', async () => {
        const responseBody = await deleteImage(
          otherUsername, otherPublicImage.id, authHeader
        );

        expect(responseBody.message).toBe('session user is not the owner')
      });

      test('can not delete private image', async () => {
        const responseBody = await deleteImage(
          otherUsername, otherPrivateImage.id, authHeader
        );

        expect(responseBody.message).toBe('session user is not the owner')
      });
    });
  })
});