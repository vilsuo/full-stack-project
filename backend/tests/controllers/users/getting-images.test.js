const { User, Image } = require('../../../src/models');

const { cookieHeader, get_SetCookie, createUser, getUsersImageCount, compareFoundAndResponseImage } = require('../../helpers');
const supertest = require('supertest');
const app = require('../../../src/app');

const api = supertest(app);
const baseUrl = '/api/users';

const credentials1 = { username: 'viltsu', password: 'salainen' };
const credentials2 = { username: 'matsu', password: 'salainen' };
const disabledCredentials = { username: 'samtsu', password: 'salainen' };
const nonExistingUsername = 'jilmari';

beforeEach(async () => {
  // NON DISABLED USERS:
  await createUser('vili', credentials1);
  await createUser('matias', credentials2);

  // DISABLED USER:
  await createUser('samuli', disabledCredentials, true);
});

describe('find users images', () => {
  test('non existing user is bad request', async () => {
    const response = await api
      .get(`${baseUrl}/${nonExistingUsername}/images`)
      .expect(404)
      .expect('Content-Type', /application\/json/);

    expect(response.body.message).toBe('user does not exist');
  });

  test('can not view disabled users images', async () => {
    const response = await api
      .get(`${baseUrl}/${disabledCredentials.username}/images`)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(response.body.message).toBe('user is disabled');
  });

  test('if user does not have any images, an empty array is returned', async () => {
    const response = await api
      .get(`${baseUrl}/${credentials1.username}/images`)
      .expect(200)
      .expect('Content-Type', /application\/json/);
  
    expect(response.body).toHaveLength(0);
  });

  test('can not access image that does not exist', async () => {
    const randomImageId = 1234;
    const response = await api
      .get(`${baseUrl}/${credentials1.username}/images/${randomImageId}`)
      .expect(404)
      .expect('Content-Type', /application\/json/);

    expect(response.body.message).toBe('image does not exist');
  });

  describe('when images have been created', () => {
    const username = credentials1.username;
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

    test('can not view disabled users public image', async () => {
      const disabledUsersUsername = disabledCredentials.username;
      const disabledUsersId = (await User.findOne({
        where: { username: disabledUsersUsername }
      })).id;

      await Image.create({
        originalname: 'image-disabled-pub.jpeg', 
        mimetype: 'image/jpeg', 
        private: false,
        userId: disabledUsersId,
      });

      const response = await api
        .get(`${baseUrl}/${disabledUsersUsername}/images`)
        .expect(400)
        .expect('Content-Type', /application\/json/);
  
      expect(response.body.message).toBe('user is disabled');
    });

    describe('without authentication', () => {
      test('only public images are found', async () => {
        const response = await api
          .get(`${baseUrl}/${username}/images`)
          .expect(200)
          .expect('Content-Type', /application\/json/);
    
        expect(response.body).toHaveLength(1);

        const returnedImage = response.body[0];
        compareFoundAndResponseImage(userPublicImage, returnedImage);
      });

      test('can access public image', async () => {
        const response = await api
          .get(`${baseUrl}/${username}/images/${userPublicImage.id}`)
          .expect(200)
          .expect('Content-Type', /application\/json/);

        const returnedImage = response.body;
        compareFoundAndResponseImage(userPublicImage, returnedImage);
      });

      test('can not access private image', async () => {
        const response = await api
          .get(`${baseUrl}/${username}/images/${userPrivateImage.id}`)
          .expect(401)
          .expect('Content-Type', /application\/json/);

        expect(response.body.message).toBe('image is private');
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

      describe('accessing own images', () => {
        test('can access all images', async () => {
          const userImageCount = await getUsersImageCount(username);

          const response = await api
            .get(`${baseUrl}/${username}/images`)
            .set(authHeader)
            .expect(200)
            .expect('Content-Type', /application\/json/);
        
          expect(response.body).toHaveLength(userImageCount);
        });

        test('can access private image', async () => {
          const response = await api
            .get(`${baseUrl}/${username}/images/${userPrivateImage.id}`)
            .set(authHeader)
            .expect(200)
            .expect('Content-Type', /application\/json/);

          const returnedImage = response.body;
          compareFoundAndResponseImage(userPrivateImage, returnedImage);
        });
      });

      describe('accessing other users images', () => {
        const otherUsername = credentials2.username;
        let otherUserPublicImage;
        let otherUserPrivateImage;

        // create image to other user
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

        test('only public images are returned', async () => {
          const response = await api
            .get(`${baseUrl}/${otherUsername}/images`)
            .set(authHeader)
            .expect(200)
            .expect('Content-Type', /application\/json/);
        
          expect(response.body).toHaveLength(1);

          const returnedImage = response.body[0];
          compareFoundAndResponseImage(otherUserPublicImage, returnedImage);
        });

        test('can access public image', async () => {
          const response = await api
            .get(`${baseUrl}/${otherUsername}/images/${otherUserPublicImage.id}`)
            .set(authHeader)
            .expect(200)
            .expect('Content-Type', /application\/json/);

          const returnedImage = response.body;
          compareFoundAndResponseImage(otherUserPublicImage, returnedImage);
        });

        test('can not access private images', async () => {
          const response = await api
            .get(`${baseUrl}/${otherUsername}/images/${otherUserPrivateImage.id}`)
            .set(authHeader)
            .expect(401)
            .expect('Content-Type', /application\/json/);

          expect(response.body.message).toBe('image is private');
        });
      });
    });
  });
});