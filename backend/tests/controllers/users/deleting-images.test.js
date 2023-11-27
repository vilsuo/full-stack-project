const { User, Image } = require('../../../src/models');

const { cookieHeader, get_SetCookie, createUser, getUsersImageCount } = require('../../helpers');
const supertest = require('supertest');
const app = require('../../../src/app');

const api = supertest(app);
const baseUrl = '/api/users';

// mock 'removeFile' to do NOTHING
jest.mock('../../../src/util/image-storage');

/*
TODO
- test deleting others images
*/

const expectDeleteImageFailure = async (username, imageId, statusCode, headers = {}) => {
  return await api
    .delete(`${baseUrl}/${username}/images/${imageId}`)
    .set(headers)
    .expect(statusCode)
    .expect('Content-Type', /application\/json/);
};

const expectDeleteImageSuccess = async (username, imageId, headers) => {
  return await api
    .delete(`${baseUrl}/${username}/images/${imageId}`)
    .set(headers)
    .expect(204)
};

const credentials = { username: 'viltsu', password: 'salainen' };

beforeEach(async () => {
  await createUser('vili', credentials);
});

describe('deleting images', () => {
  const username = credentials.username;
  let userPublicImage;
  let userPrivateImage;

  // create private & nonprivate images
  beforeEach(async () => {
    const userId = (await User.findOne({ where: { username } })).id;
    
    userPublicImage = await Image.create({
      originalname: 'image1-pub.jpeg', 
      mimetype: 'image/jpeg', 
      title: 'public image',
      caption: 'this image is public',
      private: false,
      userId,
    });

    userPrivateImage = await Image.create({
      originalname: 'image1-priv.jpeg', 
      mimetype: 'image/jpeg',
      title: 'private image',
      caption: 'this image is private!',
      private: true,
      userId,
    });
  });

  describe('without authentication', () => {
    test('can not delete images', async () => {
      const response1 = await expectDeleteImageFailure(username, userPublicImage.id, 401);
      expect(response1.body.message).toBe('authentication required');

      const response2 = await expectDeleteImageFailure(username, userPrivateImage.id, 401);
      expect(response2.body.message).toBe('authentication required')
    });
  });

  describe('with authentication', () => {
    let authHeader = {};

    beforeEach(async () => {
      // log in and save cookie
      const response = await api 
        .post('/api/auth/login')
        .send(credentials);

      const cookie = get_SetCookie(response);
      authHeader = cookieHeader(cookie);
    });

    describe('deleting own images', () => {
      test('can delete public image', async () => {
        await expectDeleteImageSuccess(username, userPublicImage.id, authHeader);
      });

      test('can delete private image', async () => {
        await expectDeleteImageSuccess(username, userPrivateImage.id, authHeader);
      });

      test('can not delete image that does not exist', async () => {
        const nonExistingImageId = 91727149;
        const response = await expectDeleteImageFailure(username, nonExistingImageId, 404, authHeader);

        expect(response.body.message).toBe('image does not exist');
      });

      test('image can not be found after deleting', async () => {
        const imageCountBefore = await getUsersImageCount(username);

        const imageToDeleteId = userPublicImage.id;
        await expectDeleteImageSuccess(username, imageToDeleteId, authHeader);

        // users image count is decreased by one
        const imageCountAfter = await getUsersImageCount(username);
        expect(imageCountAfter).toBe(imageCountBefore - 1);

        // image is no longer found
        const result = await Image.findOne({ where: { id: imageToDeleteId } });
        expect(result).toBeFalsy();
      });
    });

    describe('deleting others images', () => {
      // create 2 images to 'other' (public and private)
      beforeEach(async () => {

      });
      
      test('can delete public image', async () => {

      });

      test('can delete private image', async () => {

      });
    });
  })
});