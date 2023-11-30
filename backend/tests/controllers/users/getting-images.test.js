const supertest = require('supertest');
const omit = require('lodash.omit');
const app = require('../../../src/app');

const { User, Image } = require('../../../src/models');
const {
  existingUserValues,
  existingDisabledUserValues,
  nonExistingUserValues
} = require('../../helpers/constants');
const {
  login, get_SetCookie, cookieHeader, 
  createImage, getUsersImageCount, 
  compareFoundWithResponse, compareFoundArrayWithResponseArray,
} = require('../../helpers');
const { getNonSensitiveImage } = require('../../../src/util/dto');

const api = supertest(app);
const baseUrl = '/api/users';

const nonExistinguserValue = nonExistingUserValues[0];
const existingUserValue = existingUserValues[0];
const otherExistingUserValue = existingUserValues[1];
const disabledUserValue = existingDisabledUserValues[0];

const getImages = async (username, statusCode = 200, headers = {}) => {
  const response = await api
    .get(`${baseUrl}/${username}/images`)
    .set(headers)
    .expect(statusCode)
    .expect('Content-Type', /application\/json/);

  return response.body;
};

const getImage = async (username, imageId, statusCode = 200, headers = {}) => {
  const response = await api
    .get(`${baseUrl}/${username}/images/${imageId}`)
    .set(headers)
    .expect(statusCode)
    .expect('Content-Type', /application\/json/);

  return response.body;
};

describe('find users images', () => {
  test('can not view non-existing users images', async () => {
    const username = nonExistinguserValue.username;
    const responseBody = await getImages(username, 404)

    expect(responseBody.message).toBe('user does not exist');
  });

  test('can not view disabled users images', async () => {
    const username = disabledUserValue.username;
    const responseBody = await getImages(username, 400)

    expect(responseBody.message).toBe('user is disabled');
  });

  test('if user does not have any images, an empty array is returned', async () => {
    const username = existingUserValue.username;
    const returnedImages = await getImages(username);
  
    expect(returnedImages).toHaveLength(0);
  });

  test('can not view an image that does not exist', async () => {
    const randomImageId = 1234;
    const username = existingUserValue.username;

    const responseBody = await getImage(username, randomImageId, 404);

    expect(responseBody.message).toBe('image does not exist');
  });

  describe('when images have been created', () => {
    const credentials = omit(existingUserValue, ['name']);
    const username = existingUserValue.username;
    let userPublicImage;
    let userPrivateImage;

    // create private & nonprivate images
    beforeEach(async () => {
      const userId = (await User.findOne({ where: { username } })).id;
      
      userPublicImage = await createImage(userId, 'public image', 'this image is public');
      userPrivateImage = await createImage(userId, 'private image', 'this image is private!', true);
    });

    describe('without authentication', () => {
      test('only public images are found', async () => {
        const returnedImages = await getImages(username);
    
        expect(returnedImages).toHaveLength(1);

        const returnedImage = returnedImages[0];

        compareFoundWithResponse(
          getNonSensitiveImage(userPublicImage),
          returnedImage
        );
      });

      test('can access public image', async () => {
        const returnedImage = await getImage(username, userPublicImage.id);

        compareFoundWithResponse(
          getNonSensitiveImage(userPublicImage),
          returnedImage
        );
      });

      test('can not access private image', async () => {
        const responseBody = await getImage(username, userPrivateImage.id, 401);

        expect(responseBody.message).toBe('image is private');
      });

      test('can not view disabled users public image', async () => {
        const disabledUsersUsername = disabledUserValue.username;
        const disabledUser = await User.findOne({
          where: { username: disabledUsersUsername }
        });
  
        const disabledUsersImage = await createImage(
          disabledUser.id, 'disabled users public image', 'no access'
        );
  
        const responseBody = await getImage(
          disabledUsersUsername, disabledUsersImage.id, 400
        );
    
        expect(responseBody.message).toBe('user is disabled');
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

      describe('accessing own images', () => {
        test('can access all images', async () => {
          const userImageCount = await getUsersImageCount(username);

          const returnedImages = await getImages(username, 200, authHeader);

          const user = await User.findOne({ where: { username }});
          const foundImages = await Image.findAll({ where: { userId: user.id } });

          expect(returnedImages).toHaveLength(userImageCount);

          compareFoundArrayWithResponseArray(
            foundImages.map(image => getNonSensitiveImage(image)),
            returnedImages
          );
        });

        test('can access private image', async () => {
          const returnedImage = await getImage(username, userPrivateImage.id, 200, authHeader);

          compareFoundWithResponse(
            getNonSensitiveImage(userPrivateImage),
            returnedImage
          );
        });
      });

      describe('accessing other users images', () => {
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
            otherUserId, 'others private image', 'this is private access only!', true
          );
        });

        test('only public images are returned', async () => {
          const returnedImages = await getImages(otherUsername, 200, authHeader);
        
          expect(returnedImages).toHaveLength(1);

          const returnedImage = returnedImages[0];

          compareFoundWithResponse(
            getNonSensitiveImage(otherUserPublicImage),
            returnedImage
          );
        });

        test('can access public image', async () => {
          const returnedImage = await getImage(
            otherUsername, otherUserPublicImage.id, 200, authHeader
          );

          compareFoundWithResponse(
            getNonSensitiveImage(otherUserPublicImage),
            returnedImage
          );
        });

        test('can not access private images', async () => {
          const responseBody = await getImage(
            otherUsername, otherUserPrivateImage.id, 401, authHeader
          );

          expect(responseBody.message).toBe('image is private');
        });
      });
    });
  });
});