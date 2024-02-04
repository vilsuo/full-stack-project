const supertest = require('supertest');
const path = require('path');
const app = require('../../../../src/app');
const { User, Image } = require('../../../../src/models');
const fileStorage = require('../../../../src/util/file-storage');
const {
  getCredentials,
  // users
  existingUserValues, otherExistingUserValues,
  disabledExistingUserValues, nonExistingUserValues,
  // images
  nonExistingImageValues,
} = require('../../../helpers/constants');
const {
  login, createImage,
  compareFoundWithResponse, compareFoundArrayWithResponseArray,
  findPublicAndPrivateImage,
  createUser,
} = require('../../../helpers');
const { getNonSensitiveImage } = require('../../../../src/util/dto');
const { IMAGE_PUBLIC, IMAGE_PRIVATE, IMAGE_PRIVACIES } = require('../../../../src/constants');

const api = supertest(app);
const baseUrl = '/api/users';

const getImageFilePathSpy = jest.spyOn(fileStorage, 'getImageFilePath');

const getImages = async (username, headers, statusCode) => {
  const response = await api
    .get(`${baseUrl}/${username}/images`)
    .set(headers)
    .expect(statusCode)
    .expect('Content-Type', /application\/json/);

  return response.body;
};

const getImage = async (username, imageId, headers, statusCode) => {
  const response = await api
    .get(`${baseUrl}/${username}/images/${imageId}`)
    .set(headers)
    .expect(statusCode)
    .expect('Content-Type', /application\/json/);

  return response.body;
};

const getImageContent = async (username, imageId, headers, statusCode) => api
  .get(`${baseUrl}/${username}/images/${imageId}/content`)
  .set(headers)
  .expect(statusCode);

const getWithIncrementedViews = (image) => ({ ...image, views: image.views + 1 });

describe('find users images', () => {
  test('can not view non-existing users images', async () => {
    const { username } = nonExistingUserValues;

    const responseBody = await getImages(username, {}, 404);
    expect(responseBody.message).toBe('User does not exist');
  });

  test('can not view disabled users images', async () => {
    const { username } = disabledExistingUserValues;

    const responseBody = await getImages(username, {}, 400);
    expect(responseBody.message).toBe('User is disabled');
  });

  test('if user does not have any images an empty array is returned', async () => {
    // create a new user that does not have any images
    const newUser = await createUser(nonExistingUserValues);

    const returnedImages = await getImages(newUser.username, {}, 200);
    expect(returnedImages).toHaveLength(0);
  });

  test('can not view an image that does not exist', async () => {
    const nonExistingImageId = 1234;
    const { username } = existingUserValues;

    const responseBody = await getImage(username, nonExistingImageId, {}, 404);

    expect(responseBody.message).toBe('Image does not exist');
  });

  describe('when images have been created', () => {
    const credentials = getCredentials(existingUserValues);
    const { username } = credentials;
    const userImages = {};

    // find a private and a nonprivate image
    beforeEach(async () => {
      const { publicImage, privateImage } = await findPublicAndPrivateImage(username);
      userImages[IMAGE_PUBLIC] = publicImage;
      userImages[IMAGE_PRIVATE] = privateImage;
    });

    describe('without authentication', () => {
      test(`only ${IMAGE_PUBLIC} images are found`, async () => {
        const returnedImages = await getImages(username, {}, 200);

        expect(returnedImages).toHaveLength(1);
        const returnedImage = returnedImages[0];

        compareFoundWithResponse(
          getNonSensitiveImage(userImages[IMAGE_PUBLIC]),
          returnedImage,
        );
      });

      test(`can access a ${IMAGE_PUBLIC} image`, async () => {
        const returnedImage = await getImage(username, userImages[IMAGE_PUBLIC].id, {}, 200);

        compareFoundWithResponse(
          getWithIncrementedViews(getNonSensitiveImage(userImages[IMAGE_PUBLIC])),
          returnedImage,
        );
      });

      test(`accessing a ${IMAGE_PUBLIC} image increments the view count`, async () => {
        const oldViewCount = userImages[IMAGE_PUBLIC].views;

        const newViewCount = (await getImage(
          username,
          userImages[IMAGE_PUBLIC].id,
          {},
          200,
        )).views;

        expect(newViewCount).toBe(oldViewCount + 1);
      });

      test(`can view ${IMAGE_PUBLIC} image content`, async () => {
        const publicImage = userImages[IMAGE_PUBLIC];

        getImageFilePathSpy.mockImplementationOnce(
          () => path.join(path.resolve(), publicImage.filepath),
        );

        const response = await getImageContent(username, publicImage.id, {}, 200);

        expect(getImageFilePathSpy).toHaveBeenCalledWith(publicImage.filepath);

        // returned image has the correct mimetype
        expect(response.get('content-type')).toBe(publicImage.mimetype);
      });

      test(`can not view disabled users ${IMAGE_PUBLIC} image`, async () => {
        const { id: disabledUserId, username: disabledUsername } = await User
          .findOne({ where: { disabled: true } });

        // create image to disabled user
        const disabledImage = await createImage({
          ...nonExistingImageValues, userId: disabledUserId, privacy: IMAGE_PUBLIC,
        });

        const responseBody = await getImage(disabledUsername, disabledImage.id, {}, 400);

        expect(responseBody.message).toBe('User is disabled');
      });

      test(`can not access a ${IMAGE_PRIVATE} image`, async () => {
        const responseBody = await getImage(username, userImages[IMAGE_PRIVATE].id, {}, 401);

        expect(responseBody.message).toBe(`Image is ${IMAGE_PRIVATE}`);
      });

      test(`accessing a ${IMAGE_PRIVATE} image does not increments the view count`, async () => {
        const imageToAccess = userImages[IMAGE_PRIVATE];
        const oldViewCount = imageToAccess.views;

        await getImage(username, imageToAccess.id, {}, 401);

        const newViewCount = (await Image.findByPk(imageToAccess.id)).views;

        expect(newViewCount).toBe(oldViewCount);
      });

      test(`can not view ${IMAGE_PRIVATE} image content`, async () => {
        const response = await getImageContent(username, userImages[IMAGE_PRIVATE].id, {}, 401);

        expect(response.body.message).toBe(`Image is ${IMAGE_PRIVATE}`);

        expect(getImageFilePathSpy).not.toHaveBeenCalled();
      });
    });

    describe('with authentication', () => {
      let authHeader = {};

      beforeEach(async () => {
        authHeader = await login(api, credentials);
      });

      describe('accessing own images', () => {
        describe('accessing multiple images', () => {
          test('all images are returned', async () => {
            const returnedImages = await getImages(username, authHeader, 200);

            const user = await User.findOne({ where: { username } });
            const foundImages = await Image.findAll({ where: { userId: user.id } });

            compareFoundArrayWithResponseArray(
              foundImages.map((image) => getNonSensitiveImage(image)),
              returnedImages,
            );
          });
        });

        describe.each(IMAGE_PRIVACIES)('accessing a single %s image', (privacy) => {
          let imageToAccess;

          beforeEach(() => {
            imageToAccess = userImages[privacy];
          });

          test(`can access a ${privacy} image`, async () => {
            const returnedImage = await getImage(username, imageToAccess.id, authHeader, 200);

            compareFoundWithResponse(
              getWithIncrementedViews(getNonSensitiveImage(imageToAccess)),
              returnedImage,
            );
          });

          test(`can view a ${privacy} image content`, async () => {
            getImageFilePathSpy.mockImplementationOnce(
              () => path.join(path.resolve(), imageToAccess.filepath),
            );

            const response = await getImageContent(username, imageToAccess.id, authHeader, 200);

            expect(getImageFilePathSpy).toHaveBeenCalledWith(imageToAccess.filepath);

            // returned image has the correct mimetype
            expect(response.get('content-type')).toBe(imageToAccess.mimetype);
          });
        });
      });

      describe('accessing other users images', () => {
        const otherUsername = otherExistingUserValues.username;
        const otherUserImages = {};

        beforeEach(async () => {
          const { publicImage, privateImage } = await findPublicAndPrivateImage(otherUsername);

          otherUserImages[IMAGE_PUBLIC] = publicImage;
          otherUserImages[IMAGE_PRIVATE] = privateImage;
        });

        describe('accessing multiple images', () => {
          test(`only ${IMAGE_PUBLIC} images are returned`, async () => {
            const returnedImages = await getImages(otherUsername, authHeader, 200);

            expect(returnedImages).toHaveLength(1);
            const returnedImage = returnedImages[0];

            compareFoundWithResponse(
              getNonSensitiveImage(otherUserImages[IMAGE_PUBLIC]),
              returnedImage,
            );
          });
        });

        describe('accessing a single image', () => {
          test(`can access a ${IMAGE_PUBLIC} image`, async () => {
            const returnedImage = await getImage(
              otherUsername,
              otherUserImages[IMAGE_PUBLIC].id,
              authHeader,
              200,
            );

            compareFoundWithResponse(
              getWithIncrementedViews(getNonSensitiveImage(otherUserImages[IMAGE_PUBLIC])),
              returnedImage,
            );
          });

          test(`can view a ${IMAGE_PUBLIC} image content`, async () => {
            getImageFilePathSpy.mockImplementationOnce(
              () => path.join(path.resolve(), otherUserImages[IMAGE_PUBLIC].filepath),
            );

            const response = await getImageContent(
              otherUsername,
              otherUserImages[IMAGE_PUBLIC].id,
              authHeader,
              200,
            );

            expect(getImageFilePathSpy).toHaveBeenCalledWith(
              otherUserImages[IMAGE_PUBLIC].filepath,
            );

            // returned image has the correct mimetype
            expect(response.get('content-type')).toBe(otherUserImages[IMAGE_PUBLIC].mimetype);
          });

          test(`can not access a ${IMAGE_PRIVATE} image`, async () => {
            const responseBody = await getImage(
              otherUsername,
              otherUserImages[IMAGE_PRIVATE].id,
              authHeader,
              401,
            );

            expect(responseBody.message).toBe('Image is private');
          });

          test(`can not view a ${IMAGE_PRIVATE} image content`, async () => {
            const response = await getImageContent(
              otherUsername,
              otherUserImages[IMAGE_PRIVATE].id,
              authHeader,
              401,
            );

            expect(response.body.message).toBe('Image is private');

            expect(getImageFilePathSpy).not.toHaveBeenCalled();
          });
        });
      });
    });
  });
});
