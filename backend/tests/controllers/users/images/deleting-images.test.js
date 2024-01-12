const supertest = require('supertest');

const app = require('../../../../src/app');
const { Image, User } = require('../../../../src/models');
const { IMAGE_PRIVACIES, IMAGE_PUBLIC } = require('../../../../src/constants');
const fileStorage = require('../../../../src/util/file-storage');

const { existingUserValues, otherExistingUserValues, getCredentials } = require('../../../helpers/constants');
const { login, getUsersImageCount, findPublicAndPrivateImage, } = require('../../../helpers');

const api = supertest(app);
const baseUrl = '/api/users';

const removeFileSpy = jest.spyOn(fileStorage, 'removeFile')
  .mockImplementation(filepath => undefined);

const deleteImage = async (username, imageId, headers, statusCode) => {
  const response = await api
    .delete(`${baseUrl}/${username}/images/${imageId}`)
    .set(headers)
    .expect(statusCode);

  return response.body;
};

describe('deleting images', () => {
  const credentials = getCredentials(existingUserValues);
  const username = existingUserValues.username;
  const userImages = {};

  // find a private and a public image
  beforeEach(async () => {
    const { publicImage, privateImage } = await findPublicAndPrivateImage(username);

    userImages.public = publicImage;
    userImages.private = privateImage;
  });

  describe('without authentication', () => {
    const headers = {};

    test.each(IMAGE_PRIVACIES)('can not delete a %s image', async (privacy) => {
      const responseBody = await deleteImage(username, userImages[privacy].id, headers, 401);
      expect(responseBody.message).toBe('authentication required');
    });
  });

  describe('with authentication', () => {
    let authHeader = {};

    beforeEach(async () => {
      authHeader = await login(api, credentials);
    });

    describe('deleting own images', () => {
      test.each(IMAGE_PRIVACIES)('can delete a %s image', async (privacy) => {
        await deleteImage(username, userImages[privacy].id, authHeader, 204);
      });

      test('can not delete image that does not exist', async () => {
        const nonExistingImageId = 91727149;
        const responseBody = await deleteImage(username, nonExistingImageId, authHeader, 404);

        expect(responseBody.message).toBe('image does not exist');
      });

      describe('after deleting an image', () => {
        let imageToDelete;

        beforeEach(async () => { 
          imageToDelete = userImages[IMAGE_PUBLIC];
          await deleteImage(username, imageToDelete.id, authHeader, 204);
        });

        test('users image count is decreased by one', async () => {
          const imageCountBefore = Object.keys(userImages).length;
          const imageCountAfter = await Image.count({ where: { userId: imageToDelete.userId } });

          expect(imageCountAfter).toBe(imageCountBefore - 1);
        });
  
        test('image can not be found', async () => {
          const result = await Image.findByPk(imageToDelete.id);
          expect(result).toBeFalsy();
        });
  
        test('attempt is made to remove file from the filesystem', async () => {
          expect(removeFileSpy).toHaveBeenCalledWith(imageToDelete.filepath);
        });

        test('user is not deleted', async () => {
          const foundUser = await User.findByPk(imageToDelete.userId);
          expect(foundUser).not.toBeFalsy();
        });
      });
    });

    describe('deleting other users images', () => {
      const otherUsername = otherExistingUserValues.username;
      const otherUsersImages = {};
      
      beforeEach(async () => {
        const { publicImage, privateImage }
          = await findPublicAndPrivateImage(otherUsername);

        otherUsersImages.public = publicImage;
        otherUsersImages.private = privateImage;
      });
      
      test.each(IMAGE_PRIVACIES)('can not delete a %s image', async (privacy) => {
        const responseBody = await deleteImage(
          otherUsername, otherUsersImages[privacy].id, authHeader, 401
        );

        expect(responseBody.message).toBe('session user is not the owner');
      });
    });
  })
});