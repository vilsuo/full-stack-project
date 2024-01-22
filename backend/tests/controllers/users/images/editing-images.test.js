const supertest = require('supertest');
const pick = require('lodash.pick');
const app = require('../../../../src/app');
const { Image } = require('../../../../src/models');
const { 
  getCredentials, 
  existingUserValues, otherExistingUserValues, // users
  nonExistingImageValues, // images
} = require('../../../helpers/constants');
const { login, compareFoundWithResponse, findPublicAndPrivateImage } = require('../../../helpers');
const { getNonSensitiveImage } = require('../../../../src/util/dto');
const parser = require('../../../../src/util/parser');
const { IMAGE_PRIVACIES, IMAGE_PUBLIC, IMAGE_PRIVATE } = require('../../../../src/constants');

const api = supertest(app);
const baseUrl = '/api/users';

const parseTextTypeSpy = jest.spyOn(parser, 'parseTextType');
const parseStringTypeSpy = jest.spyOn(parser, 'parseStringType');
const parseImagePrivacySpy = jest.spyOn(parser, 'parseImagePrivacy');

const editImage = async (username, imageId, imageValues, headers, statusCode) => {
  const response = await api
    .put(`${baseUrl}/${username}/images/${imageId}`)
    .set(headers)
    .send(imageValues)
    .expect(statusCode)
    .expect('Content-Type', /application\/json/);

  return response.body;
};

const newImageValues = pick(nonExistingImageValues, ['title', 'caption']);

const { title, caption } = newImageValues;

describe('editing images', () => {
  const credentials = getCredentials(existingUserValues);
  const username = existingUserValues.username;
  const userImages = {};

  // find a private and a public image
  beforeEach(async () => {
    const { publicImage, privateImage } = await findPublicAndPrivateImage(username);

    userImages[IMAGE_PUBLIC] = publicImage;
    userImages[IMAGE_PRIVATE] = privateImage;
  });

  describe('without authentication', () => {
    const headers = {};

    test.each(IMAGE_PRIVACIES)('can not edit a %s image', async (privacy) => {
      const responseBody = await editImage(
        username, userImages[privacy].id, newImageValues, headers, 401
      );
      expect(responseBody.message).toBe('authentication required');
    });
  });

  describe('with authentication', () => {
    let authHeader = {};

    beforeEach(async () => {
      authHeader = await login(api, credentials);
    });

    describe('editing own images', () => {
      test('can not edit image that does not exist', async () => {
        const nonExistingImageId = 91727149;
        const responseBody = await editImage(
          username, nonExistingImageId, newImageValues, authHeader, 404
        );

        expect(responseBody.message).toBe('image does not exist');
      });

      describe.each(IMAGE_PRIVACIES)('editing a %s image', (privacy) => {
        let imageToEdit;

        beforeEach(() => {
          imageToEdit = userImages[privacy];
        });
        
        test('can set new title', async () => {
          const responseImage = await editImage(
            username, imageToEdit.id, { title }, authHeader, 200
          );

          // new title has been parsed
          expect(parseStringTypeSpy).toHaveBeenCalledWith(title, expect.anything());

          // new title is in the response
          expect(responseImage.title).toBe(title);

          // other old values are the same
          expect(responseImage.caption).toBe(imageToEdit.caption);
          expect(responseImage.privacy).toBe(imageToEdit.privacy);
        });

        test('can set new caption', async () => {
          const responseImage = await editImage(
            username, imageToEdit.id, { caption }, authHeader, 200
          );

          // new caption has been parsed
          expect(parseTextTypeSpy).toHaveBeenCalledWith(caption, expect.anything());

          // new caption is in the response
          expect(responseImage.caption).toBe(caption);

          // other old values are the same
          expect(responseImage.title).toBe(imageToEdit.title);
          expect(responseImage.privacy).toBe(imageToEdit.privacy);
        });

        test.each(IMAGE_PRIVACIES)('can set privacy as %s', async (newPrivacy) => {
          const responseImage = await editImage(
            username, userImages[privacy].id, { privacy: newPrivacy }, authHeader, 200
          );

          // new privacy has been parsed
          expect(parseImagePrivacySpy).toHaveBeenCalledWith(newPrivacy);
          
          expect(responseImage.privacy).toBe(newPrivacy);
        });

        describe(`after editing a ${privacy} image`, () => {
          let editedImage;

          beforeEach(async () => {
            editedImage = await editImage(
              username, imageToEdit.id, newImageValues, authHeader, 200
            );
          });

          test('edited image can be found after editing with the new values', async () => {
            const foundImage = await Image.findByPk(imageToEdit.id);
            compareFoundWithResponse(getNonSensitiveImage(foundImage), editedImage);
          });
    
          test('editing updates the field "editedAt"', async () => {
            const newDate = editedImage.editedAt;

            // edit again: the 'editedAt' field of original image is null
            const newerDate = (await editImage(
              username, imageToEdit.id, newImageValues, authHeader, 200
            )).editedAt;
            
            // new date is after the old date
            expect(newerDate > newDate).toBe(true);
          });
        });
      });
    });

    describe('editing other users images', () => {
      const otherUsername = otherExistingUserValues.username;
      const otherUsersImages = {};
      
      beforeEach(async () => {
        const { publicImage, privateImage } = await findPublicAndPrivateImage(otherUsername);

        otherUsersImages[IMAGE_PUBLIC] = publicImage;
        otherUsersImages[IMAGE_PRIVATE] = privateImage;
      });
      
      test.each(IMAGE_PRIVACIES)('can not edit a %s image', async (privacy) => {
        const responseBody = await editImage(
          otherUsername, otherUsersImages[privacy].id, newImageValues, authHeader, 401
        );

        expect(responseBody.message).toBe('session user is not the owner')
      });
    });
  });
});