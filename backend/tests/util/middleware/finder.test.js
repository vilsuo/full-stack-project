const { User, Image, Potrait } = require('../../../src/models');
const { IllegalStateError, ParseError } = require('../../../src/util/error');
const { IMAGE_PRIVACIES } = require('../../../src/constants');
const { userFinder, imageFinder, potraitFinder } = require('../../../src/util/middleware/finder');
const parser = require('../../../src/util/parser');
const { createUser } = require('../../helpers');

const {
  callMiddleware,
  getStatus,
  getMessage,
  createRequest,
} = require('../../helpers/middleware');

const {
  // user values
  existingUserValues, otherExistingUserValues,
  disabledExistingUserValues, nonExistingUserValues,
} = require('../../helpers/constants');

const next = jest.fn();

const parseIdSpy = jest.spyOn(parser, 'parseId');

const userFinderProperty = 'foundUser';
const imageFinderProperty = 'image';
const potraitFinderProperty = 'potrait';

describe('user finder', () => {
  const createUserFinderRequest = (username) => createRequest({ params: { username } });

  const callUserFinder = async (request) => callMiddleware(userFinder, request, next);

  describe('existing users username', () => {
    const { username } = existingUserValues;
    let request;

    beforeEach(async () => {
      request = createUserFinderRequest(username);
      await callUserFinder(request);
    });

    test('next middleware is called', async () => {
      expect(next).toHaveBeenCalled();
    });

    test('user is attached to the request', async () => {
      const user = await User.findByUsername(username);

      expect(request).toHaveProperty(userFinderProperty);
      expect(request[userFinderProperty]).toStrictEqual(user);
    });
  });

  describe('disabled users username', () => {
    const { username } = disabledExistingUserValues;
    let request;
    let response;

    beforeEach(async () => {
      request = createUserFinderRequest(username);
      response = await callUserFinder(request);
    });

    test('next middleware is not called', async () => {
      expect(next).not.toHaveBeenCalled();
    });

    test('user is not attached to request', async () => {
      expect(request).not.toHaveProperty(userFinderProperty);
    });

    test('error message is returned', async () => {
      expect(getStatus(response)).toBe(400);
      expect(getMessage(response)).toMatch(/user is disabled/i);
    });
  });

  describe('non-existing users username', () => {
    const { username } = nonExistingUserValues;
    let request;
    let response;

    beforeEach(async () => {
      request = createUserFinderRequest(username);
      response = await callUserFinder(request);
    });

    test('next middleware is not called', async () => {
      expect(next).not.toHaveBeenCalled();
    });

    test('user is not attached to request', async () => {
      expect(request).not.toHaveProperty(userFinderProperty);
    });

    test('error message is returned', async () => {
      expect(getStatus(response)).toBe(404);
      expect(getMessage(response)).toMatch(/user does not exist/i);
    });
  });

  describe('empty username', () => {
    let request;
    let response;

    beforeEach(async () => {
      request = createUserFinderRequest('');
      response = await callUserFinder(request);
    });

    test('next middleware is not called', async () => {
      expect(next).not.toHaveBeenCalled();
    });

    test('user is not attached to request', async () => {
      expect(request).not.toHaveProperty(userFinderProperty);
    });

    test('error message is returned', async () => {
      expect(getStatus(response)).toBe(404);
      expect(getMessage(response)).toMatch(/user does not exist/i);
    });
  });

  test('missing username will throw an error', async () => {
    const request = createUserFinderRequest();

    const callWithoutUsername = async () => callUserFinder(request);
    await expect(callWithoutUsername).rejects.toThrow(IllegalStateError);
  });

  test('username of type integer will throw an error', async () => {
    const request = createUserFinderRequest(123);

    const callWithoutUsername = async () => callUserFinder(request);
    await expect(callWithoutUsername).rejects.toThrow(IllegalStateError);
  });
});

describe('image finder', () => {
  const createImageFinderRequest = (user, imageId) => {
    let id = imageId;
    if (typeof imageId === 'number') {
      id = imageId.toString();
    }

    return createRequest({
      [userFinderProperty]: user,
      params: { imageId: id },
    });
  };

  const callImageFinder = async (request) => callMiddleware(imageFinder, request, next);

  let user;

  beforeEach(async () => {
    const { username } = existingUserValues;
    user = await User.findByUsername(username);
  });

  test('when user of the image to be found is not set, an error is thrown', async () => {
    const request = createImageFinderRequest();
    expect(request[userFinderProperty]).toBeFalsy();

    const callWithoutUserFinder = async () => callImageFinder(request);
    await expect(callWithoutUserFinder).rejects.toThrow(IllegalStateError);
  });

  describe('when user is set', () => {
    describe.each(IMAGE_PRIVACIES)('when "%s" image belongs to the user', (privacy) => {
      let image;

      let request;

      beforeEach(async () => {
        // find users image
        image = await Image.findOne({ where: { userId: user.id, privacy } });

        // create request with parameters
        request = createImageFinderRequest(user, image.id);
        await callImageFinder(request);
      });

      test('image id has been parsed', () => {
        expect(parseIdSpy).toHaveBeenCalledWith(image.id.toString());
      });

      test('next middleware is called', () => {
        expect(next).toHaveBeenCalled();
      });

      test('image is attached to the request', () => {
        expect(request).toHaveProperty(imageFinderProperty);
        expect(request[imageFinderProperty]).toStrictEqual(image);
      });
    });

    describe.each(IMAGE_PRIVACIES)('when "%s" image does not belong to the found user', (privacy) => {
      let image;

      let request;
      let response;

      beforeEach(async () => {
        // find other user
        const otherUser = await User.findByUsername(otherExistingUserValues.username);

        // find other users image
        image = await Image.findOne({ where: { userId: otherUser.id, privacy } });

        // create request with parameters
        request = createImageFinderRequest(user, image.id);
        response = await callImageFinder(request);
      });

      test('image id has been parsed', () => {
        expect(parseIdSpy).toHaveBeenCalledWith(image.id.toString());
      });

      test('next middleware is not called', () => {
        expect(next).not.toHaveBeenCalled();
      });

      test('image is not attached to the request', () => {
        expect(request).not.toHaveProperty(imageFinderProperty);
      });

      test('error message is returned', () => {
        expect(getStatus(response)).toBe(404);
        expect(getMessage(response)).toMatch(/image does not exist/i);
      });
    });

    describe('non-exising image', () => {
      const nonExistingImageId = '99999';

      let request;
      let response;

      beforeEach(async () => {
        // create request with parameters
        request = createImageFinderRequest(user, nonExistingImageId);
        response = await callImageFinder(request);
      });

      test('image id has been parsed', () => {
        expect(parseIdSpy).toHaveBeenCalledWith(nonExistingImageId);
      });

      test('next middleware is not called', () => {
        expect(next).not.toHaveBeenCalled();
      });

      test('image is not attached to the request', () => {
        expect(request).not.toHaveProperty(imageFinderProperty);
      });

      test('error message is returned', () => {
        expect(getStatus(response)).toBe(404);
        expect(getMessage(response)).toMatch(/image does not exist/i);
      });
    });

    test('missing image id will throw an error', async () => {
      const request = createImageFinderRequest(user);

      const callWithoutImageId = async () => callImageFinder(request);
      await expect(callWithoutImageId).rejects.toThrow(ParseError);
    });
  });
});

describe('potrait finder', () => {
  const createPotraitFinderRequest = (user) => createRequest({ [userFinderProperty]: user });

  const callPotraitFinder = async (request) => callMiddleware(potraitFinder, request, next);

  test('calling without finding user first will throw an error', async () => {
    const request = createPotraitFinderRequest();
    expect(request.userFinderProperty).toBeFalsy();

    const callWithoutUserFinder = async () => callPotraitFinder(request);
    await expect(callWithoutUserFinder).rejects.toThrow(IllegalStateError);
  });

  describe('after user finder has been successfull handled', () => {
    describe('when the user has a potrait', () => {
      let request;

      beforeEach(async () => {
        const user = await User.findByUsername(existingUserValues.username);
        request = createPotraitFinderRequest(user);

        await callPotraitFinder(request);
      });

      test('next middleware is called', () => {
        expect(next).toHaveBeenCalled();
      });

      test('potrait is attached to the request', async () => {
        const foundPotrait = await Potrait.findOne({
          where: { userId: request.foundUser.id },
        });

        expect(request).toHaveProperty(potraitFinderProperty);
        expect(request[potraitFinderProperty]).toStrictEqual(foundPotrait);
      });
    });

    describe('when the user does not have a potrait', () => {
      let request;
      let response;

      beforeEach(async () => {
        // create a new user
        const user = await createUser(nonExistingUserValues);

        request = createPotraitFinderRequest(user);
        response = await callPotraitFinder(request);
      });

      test('next middleware is not called', () => {
        expect(next).not.toHaveBeenCalled();
      });

      test('potrait is not attached to the request', () => {
        expect(request).not.toHaveProperty(potraitFinderProperty);
      });

      test('error message is returned', () => {
        expect(getStatus(response)).toBe(404);
        expect(getMessage(response)).toMatch(/user does not have a potrait/i);
      });
    });
  });
});
