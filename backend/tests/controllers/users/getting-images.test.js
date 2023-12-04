const supertest = require('supertest');
const omit = require('lodash.omit');
const path = require('path');
const app = require('../../../src/app');

const { User, Image } = require('../../../src/models');
const imageStorage = require('../../../src/util/image-storage');
const {
  existingUserValues,
  existingDisabledUserValues,
  nonExistingUserValues,
  testImages,
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
const { jpg: [ jpg1, jpg2 ], png: [ png1 ] } = testImages;

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

const getImageContent = async (username, imageId, statusCode = 200, headers = {}) => {
  return await api
    .get(`${baseUrl}/${username}/images/${imageId}/content`)
    .set(headers)
    .expect(statusCode);
};

describe('find users images', () => {
  const getImageFilePathSpy = jest.spyOn(imageStorage, 'getImageFilePath');

  afterEach(() => {    
    getImageFilePathSpy.mockClear();
  });

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

      test('can view public image content', async () => {
        const imageToView = userPublicImage;

        getImageFilePathSpy.mockImplementationOnce(filepath => {
          return path.join(path.resolve(), png1.filepath);
        });

        const response = await getImageContent(username, imageToView.id);

        expect(getImageFilePathSpy).toHaveBeenCalled();

        // returned image has the correct mimetype
        expect(response.get('content-type')).toBe(imageToView.mimetype);
      });

      test('can not view disabled users public image', async () => {
        const disabledUsersUsername = disabledUserValue.username;
        const disabledUser = await User.findOne({
          where: { username: disabledUsersUsername }
        });
    
        const disabledUsersImage = await createImage({
          userId: disabledUser.id, privacy: 'public'
        });
    
        const responseBody = await getImage(
          disabledUsersUsername, disabledUsersImage.id, 400
        );
      
        expect(responseBody.message).toBe('user is disabled');
      });

      test('can not access private image', async () => {
        const responseBody = await getImage(username, userPrivateImage.id, 401);

        expect(responseBody.message).toBe('image is private');
      });

      test('can not view private image content', async () => {
        const response = await getImageContent(username, userPrivateImage.id, 401);

        expect(response.body.message).toBe('image is private');
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

        test('can view private image content', async () => {
          const imageToView = userPrivateImage;
  
          getImageFilePathSpy.mockImplementationOnce(filepath => {
            return path.join(path.resolve(), jpg1.filepath);
          });
  
          const response = await getImageContent(username, imageToView.id, 200, authHeader);
  
          expect(getImageFilePathSpy).toHaveBeenCalled();
  
          // returned image has the correct mimetype
          expect(response.get('content-type')).toBe(imageToView.mimetype);
        });
      });

      describe('accessing other users images', () => {
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

        test('can view public image content', async () => {
          const imageToView = otherUserPublicImage;

          getImageFilePathSpy.mockImplementationOnce(filepath => {
            return path.join(path.resolve(), jpg2.filepath);
          });
  
          const response = await getImageContent(
            otherUsername, imageToView.id, 200, authHeader
          );
  
          expect(getImageFilePathSpy).toHaveBeenCalled();
  
          // returned image has the correct mimetype
          expect(response.get('content-type')).toBe(imageToView.mimetype);
        });

        test('can not access private images', async () => {
          const responseBody = await getImage(
            otherUsername, otherUserPrivateImage.id, 401, authHeader
          );

          expect(responseBody.message).toBe('image is private');
        });

        test('can not view private image content', async () => {
          const response = await getImageContent(
            otherUsername, otherUserPrivateImage.id, 401, authHeader
          );
  
          expect(response.body.message).toBe('image is private');
        });
      });
    });
  });
});