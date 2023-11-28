const { User, Image } = require('../../../src/models');

const { cookieHeader, get_SetCookie, createUser, compareFoundAndResponseImage } = require('../../helpers');
const supertest = require('supertest');
const app = require('../../../src/app');

const api = supertest(app);
const baseUrl = '/api/users';

const editImage = async (username, imageId, statusCode, imageValues, headers = {}) => {
  return await api
    .put(`${baseUrl}/${username}/images/${imageId}`)
    .set(headers)
    .send(imageValues)
    .expect(statusCode)
    .expect('Content-Type', /application\/json/);
};

const credentials1 = { username: 'viltsu', password: 'salainen' };
const credentials2 = { username: 'matsu', password: 'salainen' };

beforeEach(async () => {
  await createUser('vili', credentials1);
  await createUser('matias', credentials2);
});

describe('editing images', () => {
  const username = credentials1.username;
  let userPublicImage;
  let userPrivateImage;

  const newImageValues = {
    title: 'this is edited title',
    caption: 'this is edited caption',
    private: false
  };

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
    test('can not edit public image', async () => {
      const response = await editImage(username, userPublicImage.id, 401);
      expect(response.body.message).toBe('authentication required');
    });

    test('can not edit private image', async () => {
      const response = await editImage(username, userPrivateImage.id, 401, newImageValues);
      expect(response.body.message).toBe('authentication required')
    });
  });

  describe('with authentication', () => {
    let authHeader = {};

    beforeEach(async () => {
      // log in and save cookie
      const response = await api 
        .post('/api/auth/login')
        .send(credentials1);

      const cookie = get_SetCookie(response);
      authHeader = cookieHeader(cookie);
    });

    describe('editing own images', () => {
      test('can set new title', async () => {
        const newTitle = 'new title';
        const response = await editImage(
          username, userPublicImage.id, 200, { title: newTitle }, authHeader
        );

        // new title is in the response
        expect(response.body.title).toBe(newTitle);

        // other old values are the same
        expect(response.body.caption).toBe(userPublicImage.caption);
        expect(response.body.private).toBe(userPublicImage.private);
      });

      test('can set new caption', async () => {
        const newCaption = 'new caption';
        const response = await editImage(
          username, userPublicImage.id, 200, { caption: newCaption }, authHeader
        );

        // new caption is in the response
        expect(response.body.caption).toBe(newCaption);

        // other old values are the same
        expect(response.body.title).toBe(userPublicImage.title);
        expect(response.body.private).toBe(userPublicImage.private);
      });

      test('can toggle privacy', async () => {
        const newPrivacyOption = !userPublicImage.private;

        const response1 = await editImage(
          username, userPublicImage.id, 200, { private: newPrivacyOption }, authHeader
        );
        expect(response1.body.private).toBe(newPrivacyOption);

        const response2 = await editImage(
          username, userPublicImage.id, 200, { private: !newPrivacyOption }, authHeader
        );
        expect(response2.body.private).toBe(!newPrivacyOption);
      });

      test.only('can edit private image', async () => {
        const response = await editImage(
          username, userPrivateImage.id, 200, newImageValues, authHeader
        );

        const { title, caption, private: privateOption } = newImageValues;

        // all new values are set
        expect(response.body.title).toBe(title);
        expect(response.body.caption).toBe(caption);
        expect(response.body.private).toBe(privateOption);
      });

      test('can not edit image that does not exist', async () => {
        const nonExistingImageId = 91727149;
        const response = await editImage(
          username, nonExistingImageId, 404, newImageValues, authHeader
        );

        expect(response.body.message).toBe('image does not exist');
      });

      test('edited image can be found after editing with the new values', async () => {
        const imageToEditId = userPublicImage.id;
        const response = await editImage(
          username, imageToEditId, 200, newImageValues, authHeader
        );

        const editedImage = response.body;
        const foundImage = await Image.findByPk(imageToEditId);
        compareFoundAndResponseImage(foundImage, editedImage);
      });

      test('editing updates the field "updatedAt"', async () => {
        const oldDate = userPublicImage.updatedAt;

        await editImage(
          username, userPublicImage.id, 200, newImageValues, authHeader
        );

        const newDate = (await Image.findByPk(userPublicImage.id)).updatedAt;

        // new date is after the old date
        expect(newDate.getTime()).toBeGreaterThan(oldDate.getTime());
      });
    });

    // TODO
    /*
    describe('deleting others images', () => {
      const otherUsername = credentials2.username;

      let otherUserPublicImage;
      let otherUserPrivateImage;

      // create private & nonprivate images to other user
      beforeEach(async () => {
        const otherUserId = (await User.findOne({
          where: { username: otherUsername }
        })).id;
        
        otherUserPublicImage = await Image.create({
          originalname: 'image2-pub.jpeg', 
          mimetype: 'image/jpeg',
          title: 'someones public image',
          caption: 'public access',
          private: false,
          userId: otherUserId,
        });
  
        otherUserPrivateImage = await Image.create({
          originalname: 'image2-priv.jpeg', 
          mimetype: 'image/jpeg', 
          title: 'someones private image',
          caption: 'private access',
          private: true,
          userId: otherUserId,
        });
      });
      
      test('can not delete public image', async () => {
        const response = await expectEditImageFailure(
          otherUsername, otherUserPublicImage.id, 401, authHeader
        );

        expect(response.body.message).toBe('can not modify other users images')
      });

      test('can not delete private image', async () => {
        const response = await expectEditImageFailure(
          otherUsername, otherUserPrivateImage.id, 401, authHeader
        );

        expect(response.body.message).toBe('can not modify other users images')
      });
    });
    */
  });
});