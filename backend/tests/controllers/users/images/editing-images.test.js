const supertest = require('supertest');

const app = require('../../../../src/app');
const { Image } = require('../../../../src/models');
const { existingUserValues, otherExistingUserValues, getCredentials, } = require('../../../helpers/constants');
const { login, compareFoundWithResponse, findPublicAndPrivateImage } = require('../../../helpers');
const { getNonSensitiveImage } = require('../../../../src/util/dto');
const parser = require('../../../../src/util/parser');

const api = supertest(app);
const baseUrl = '/api/users';

const IMAGE_PRIVACIES = Image.getAttributes().privacy.values;

const parseTextTypeSpy = jest.spyOn(parser, 'parseTextType');
const parseStringTypeSpy = jest.spyOn(parser, 'parseStringType');
const parseImagePrivacySpy = jest.spyOn(parser, 'parseImagePrivacy');

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
  const credentials = getCredentials(existingUserValues);
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

        // new title has been parsed
        expect(parseStringTypeSpy).toHaveBeenCalledWith(title, expect.anything());

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

        // new caption has been parsed
        expect(parseTextTypeSpy).toHaveBeenCalledWith(caption, expect.anything());

        // new caption is in the response
        expect(responseImage.caption).toBe(caption);

        // other old values are the same
        expect(responseImage.title).toBe(imageToEdit.title);
        expect(responseImage.private).toBe(imageToEdit.private);
      });

      test.each(IMAGE_PRIVACIES)('can set new privacy %s', async (privacy) => {
        const imageToEdit = publicImage;

        const responseImage = await editImage(
          username, imageToEdit.id, { privacy }, authHeader, 200
        );

        // new privacy has been parsed
        expect(parseImagePrivacySpy).toHaveBeenCalledWith(privacy);
        
        expect(responseImage.privacy).toBe(privacy);
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

    describe.only('editing other users images', () => {
      const otherUsername = otherExistingUserValues.username;
      let otherPublicImage;
      let otherPrivateImage;
      
      beforeEach(async () => {
        ({ publicImage : otherPublicImage, privateImage: otherPrivateImage } =
          await findPublicAndPrivateImage(otherUsername)
        );
      });
      
      test.each(IMAGE_PRIVACIES)('can not edit a %s image', async (privacy) => {
        const responseBody = await editImage(
          otherUsername, otherPublicImage.id, { ...newImageValues, privacy }, authHeader, 401
        );

        expect(responseBody.message).toBe('session user is not the owner')
      });
    });
  });
});