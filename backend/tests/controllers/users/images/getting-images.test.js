const supertest = require('supertest');
const omit = require('lodash.omit');
const path = require('path');
const app = require('../../../../src/app');

const { User, Image } = require('../../../../src/models');
const imageStorage = require('../../../../src/util/image-storage');
const {
  existingUserValues, otherExistingUserValues,
  disabledExistingUserValues, nonExistingUserValues,
  existingUserImageValues, otherExistingUserImageValues, nonExistingImageValues
} = require('../../../helpers/constants');
const {
  login, createImage,
  compareFoundWithResponse, compareFoundArrayWithResponseArray, 
  findPublicAndPrivateImage,
  createUser
} = require('../../../helpers');
const { getNonSensitiveImage } = require('../../../../src/util/dto');

const api = supertest(app);
const baseUrl = '/api/users';

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

  test('can not view non-existing users images', async () => {
    const username = nonExistingUserValues.username;
    const responseBody = await getImages(username, 404)

    expect(responseBody.message).toBe('user does not exist');
  });

  test('can not view disabled users images', async () => {
    const username = disabledExistingUserValues.username;
    const responseBody = await getImages(username, 400)

    expect(responseBody.message).toBe('user is disabled');
  });

  test('if user does not have any images an empty array is returned', async () => {
    // create a new user that does not have any images
    const newUser = await createUser(nonExistingUserValues);

    const returnedImages = await getImages(newUser.username);
  
    expect(returnedImages).toHaveLength(0);
  });

  test('can not view an image that does not exist', async () => {
    const randomImageId = 1234;
    const username = existingUserValues.username;

    const responseBody = await getImage(username, randomImageId, 404);

    expect(responseBody.message).toBe('image does not exist');
  });

  describe('when images have been created', () => {
    const credentials = omit(existingUserValues, ['name']);
    const username = existingUserValues.username;
    let publicImage;
    let privateImage;

    // find a private and a nonprivate image
    beforeEach(async () => {
      ({ publicImage, privateImage } = await findPublicAndPrivateImage(username));
    });

    describe('without authentication', () => {
      test('only public images are found', async () => {
        const returnedImages = await getImages(username);
    
        expect(returnedImages).toHaveLength(1);
        const returnedImage = returnedImages[0];

        compareFoundWithResponse(
          getNonSensitiveImage(publicImage),
          returnedImage
        );
      });

      test('can access public image', async () => {
        const returnedImage = await getImage(username, publicImage.id);
  
        compareFoundWithResponse(
          getNonSensitiveImage(publicImage),
          returnedImage
        );
      });

      test('can view public image content', async () => {
        getImageFilePathSpy.mockImplementationOnce(filepath => {
          return path.join(path.resolve(), publicImage.filepath);
        });

        const response = await getImageContent(username, publicImage.id);

        expect(getImageFilePathSpy).toHaveBeenCalledWith(publicImage.filepath);

        // returned image has the correct mimetype
        expect(response.get('content-type')).toBe(publicImage.mimetype);
      });

      test('can not view disabled users public image', async () => {
        const { id: disabledUserId, username: disabledUsername } = await User
          .findOne({ where: { disabled: true } });
    
        // create image to disabled user
        const disabledImageId = (await createImage({
          userId: disabledUserId, privacy: 'public', ...nonExistingImageValues
        })).id;
    
        const responseBody = await getImage(
          disabledUsername, disabledImageId, 400
        );
      
        expect(responseBody.message).toBe('user is disabled');
      });

      test('can not access private image', async () => {
        const responseBody = await getImage(username, privateImage.id, 401);

        expect(responseBody.message).toBe('authentication required');
      });

      test('can not view private image content', async () => {
        const response = await getImageContent(username, privateImage.id, 401);

        expect(response.body.message).toBe('authentication required');

        expect(getImageFilePathSpy).not.toHaveBeenCalled();
      });
    });
  
    describe('with authentication', () => {
      let authHeader = {};

      beforeEach(async () => {
        // log in and save cookie
        authHeader = await login(api, credentials);
      });

      describe('accessing own images', () => {
        test('can access all images', async () => {
          const returnedImages = await getImages(username, 200, authHeader);

          const user = await User.findOne({ where: { username }});
          const foundImages = await Image.findAll({ where: { userId: user.id } });

          compareFoundArrayWithResponseArray(
            foundImages.map(image => getNonSensitiveImage(image)),
            returnedImages
          );
        });

        test('can access private image', async () => {
          const returnedImage = await getImage(username, privateImage.id, 200, authHeader);

          compareFoundWithResponse(
            getNonSensitiveImage(privateImage),
            returnedImage
          );
        });

        test('can view private image content', async () => {
          getImageFilePathSpy.mockImplementationOnce(filepath => {
            return path.join(path.resolve(), privateImage.filepath);
          });
  
          const response = await getImageContent(username, privateImage.id, 200, authHeader);
  
          expect(getImageFilePathSpy).toHaveBeenCalledWith(privateImage.filepath);
  
          // returned image has the correct mimetype
          expect(response.get('content-type')).toBe(privateImage.mimetype);
        });
      });

      describe('accessing other users images', () => {
        const otherUsername = otherExistingUserValues.username;
        let otherPublicImage;
        let otherPrivateImage;
        
        beforeEach(async () => {
          ({ publicImage : otherPublicImage, privateImage: otherPrivateImage } =
            await findPublicAndPrivateImage(otherUsername)
          );
        });

        test('only public images are returned', async () => {
          const returnedImages = await getImages(otherUsername, 200, authHeader);
        
          expect(returnedImages).toHaveLength(1);
          const returnedImage = returnedImages[0];

          compareFoundWithResponse(
            getNonSensitiveImage(otherPublicImage),
            returnedImage
          );
        });

        test('can access public image', async () => {
          const returnedImage = await getImage(
            otherUsername, otherPublicImage.id, 200, authHeader
          );

          compareFoundWithResponse(
            getNonSensitiveImage(otherPublicImage),
            returnedImage
          );
        });

        test('can view public image content', async () => {
          getImageFilePathSpy.mockImplementationOnce(filepath => {
            return path.join(path.resolve(), otherPublicImage.filepath);
          });
  
          const response = await getImageContent(
            otherUsername, otherPublicImage.id, 200, authHeader
          );
  
          expect(getImageFilePathSpy).toHaveBeenCalledWith(otherPublicImage.filepath);
  
          // returned image has the correct mimetype
          expect(response.get('content-type')).toBe(otherPublicImage.mimetype);
        });

        test('can not access private images', async () => {
          const responseBody = await getImage(
            otherUsername, otherPrivateImage.id, 401, authHeader
          );

          expect(responseBody.message).toBe('image is private');
        });

        test('can not view private image content', async () => {
          const response = await getImageContent(
            otherUsername, otherPrivateImage.id, 401, authHeader
          );
  
          expect(response.body.message).toBe('image is private');

          expect(getImageFilePathSpy).not.toHaveBeenCalled();
        });
      });
    });
  });
});