const supertest = require('supertest');
const omit = require('lodash.omit');

const app = require('../../../src/app');
const { Image } = require('../../../src/models');
const { existingUserValues, otherExistingUserValues, } = require('../../helpers/constants');
const { login, compareFoundWithResponse, findPublicAndPrivateImage } = require('../../helpers');
const { getNonSensitiveImage } = require('../../../src/util/dto');

const api = supertest(app);
const baseUrl = '/api/users';

const editImage = async (username, imageId, imageValues, headers = {}, statusCode = 401) => {
  const response = await api
    .put(`${baseUrl}/${username}/images/${imageId}`)
    .set(headers)
    .send(imageValues)
    .expect(statusCode)
    .expect('Content-Type', /application\/json/);

  return response.body;
};

const newImageValues = {
  title: 'this is edited title',
  caption: 'this is edited caption',
  privacy: 'public',
};

const { title, caption, privacy } = newImageValues;

describe('editing images', () => {
  const credentials = omit(existingUserValues, ['name']);
  const username = existingUserValues.username;
  let publicImage;
  let privateImage;

  // find a private and a nonprivate image
  beforeEach(async () => {
    ({ publicImage, privateImage } = await findPublicAndPrivateImage(username));
  });

  describe('without authentication', () => {
    test('can not edit public image', async () => {
      const responseBody = await editImage(username, publicImage.id);
      expect(responseBody.message).toBe('authentication required');
    });

    test('can not edit private image', async () => {
      const responseBody = await editImage(username, privateImage.id, newImageValues);
      expect(responseBody.message).toBe('authentication required');
    });
  });

  describe('with authentication', () => {
    let authHeader = {};

    beforeEach(async () => {
      authHeader = await login(api, credentials);
    });

    describe('editing own images', () => {
      test('can set new title', async () => {
        const imageToEdit = publicImage;
        const responseImage = await editImage(
          username, imageToEdit.id, { title }, authHeader, 200
        );

        // new title is in the response
        expect(responseImage.title).toBe(title);

        // other old values are the same
        expect(responseImage.caption).toBe(imageToEdit.caption);
        expect(responseImage.private).toBe(imageToEdit.private);
      });

      test('can set new caption', async () => {
        const imageToEdit = publicImage;
        const responseImage = await editImage(
          username, imageToEdit.id, { caption }, authHeader, 200
        );

        // new caption is in the response
        expect(responseImage.caption).toBe(caption);

        // other old values are the same
        expect(responseImage.title).toBe(imageToEdit.title);
        expect(responseImage.private).toBe(imageToEdit.private);
      });

      test('can set new privacy option', async () => {
        const privacyOptions = ['public', 'private'];
        const imageToEdit = publicImage;

        const responseImages = await Promise.all(privacyOptions.map(async option => {
          return await editImage(
            username, imageToEdit.id, { privacy: option }, authHeader, 200
          );
        }));

        responseImages.forEach((responseImage, index) => {
          expect(responseImage.privacy).toBe(privacyOptions[index]);
        });
      });

      test('can edit private image', async () => {
        const imageToEdit = privateImage;
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
        const imageToEditId = publicImage.id;
        const editedImage = await editImage(
          username, imageToEditId, newImageValues, authHeader, 200
        );

        const foundImage = await Image.findByPk(imageToEditId);
        compareFoundWithResponse(getNonSensitiveImage(foundImage), editedImage);
      });

      test('editing updates the field "updatedAt"', async () => {
        const oldDate = publicImage.updatedAt;

        await editImage(
          username, publicImage.id, newImageValues, authHeader, 200
        );

        const newDate = (await Image.findByPk(publicImage.id)).updatedAt;

        // new date is after the old date
        expect(newDate.getTime()).toBeGreaterThan(oldDate.getTime());
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
      
      test('can not edit public image', async () => {
        const responseBody = await editImage(
          otherUsername, otherPublicImage.id, newImageValues, authHeader, 401
        );

        expect(responseBody.message).toBe('can not modify other users images')
      });

      test('can not edit private image', async () => {
        const responseBody = await editImage(
          otherUsername, otherPrivateImage.id, newImageValues, authHeader, 401
        );

        expect(responseBody.message).toBe('can not modify other users images')
      });
    });
  });
});