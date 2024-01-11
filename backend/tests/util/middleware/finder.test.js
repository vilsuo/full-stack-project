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
  addParamsToRequest,
} = require('../../helpers/middleware');

const  {
  // user values
  existingUserValues, otherExistingUserValues, 
  disabledExistingUserValues, nonExistingUserValues,
} = require('../../helpers/constants');

const next = jest.fn();

const parseIdSpy = jest.spyOn(parser, 'parseId');

const userProperty = 'foundUser';

describe('user finder', () => {

  const callUserFinder = async (request) => {
    return callMiddleware(userFinder, request, next);
  };

  describe('existing users username', () => {
    const { username } = existingUserValues;
    let request;

    beforeEach(async () => {
      request = createRequest({ username });
      await callUserFinder(request);
    });

    test('next middleware is called', async () => {
      expect(next).toHaveBeenCalled();
    });

    test('user is attached to the request', async () => {
      const user = await User.findOne({ where: { username } });

      expect(request).toHaveProperty(userProperty);
      expect(request[userProperty]).toStrictEqual(user);
    });
  });

  describe('disabled users username', () => {
    const { username } = disabledExistingUserValues;
    let request;
    let response;

    beforeEach(async () => {
      request = createRequest({ username });
      response = await callUserFinder(request);
    });

    test('next middleware is not called', async () => {
      expect(next).not.toHaveBeenCalled();
    });

    test('user is not attached to request', async () => {
      expect(request).not.toHaveProperty(userProperty);
    });

    test('error message is returned', async () => {
      expect(getStatus(response)).toBe(400);
      expect(getMessage(response)).toBe('user is disabled');
    });
  });

  describe('non-existing users username', () => {
    const { username } = nonExistingUserValues;
    let request;
    let response;

    beforeEach(async () => {
      request = createRequest({ username });
      response = await callUserFinder(request);
    });

    test('next middleware is not called', async () => {
      expect(next).not.toHaveBeenCalled();
    });

    test('user is not attached to request', async () => {
      expect(request).not.toHaveProperty(userProperty);
    });

    test('error message is returned', async () => {
      expect(getStatus(response)).toBe(404);
      expect(getMessage(response)).toBe('user does not exist');
    });
  });

  describe('empty username', () => {
    const username = '';
    let request;
    let response;

    beforeEach(async () => {
      request = createRequest({ username });
      response = await callUserFinder(request);
    });

    test('next middleware is not called', async () => {
      expect(next).not.toHaveBeenCalled();
    });

    test('user is not attached to request', async () => {
      expect(request).not.toHaveProperty(userProperty);
    });

    test('error message is returned', async () => {
      expect(getStatus(response)).toBe(404);
      expect(getMessage(response)).toBe('user does not exist');
    });
  });

  test('missing username will throw an error', async () => {
    const request = createRequest();

    const callWithoutUsername = async () => await callUserFinder(request);
    await expect(callWithoutUsername).rejects.toThrow(ParseError);
  });

  test('username of type integer will throw an error', async () => {
    const request = createRequest({ username: 123 });

    const callWithoutUsername = async () => await callUserFinder(request);
    await expect(callWithoutUsername).rejects.toThrow(ParseError);
  });
});

describe('image finder', () => {
  const imageProperty = 'image';

  const callImageFinder = async (request) => {
    return callMiddleware(imageFinder, request, next);
  };

  test('calling without finding user first will throw an error', async () => {
    const request = createRequest();
    expect(request).not.toHaveProperty(userProperty);

    const callWithoutUserFinder = async () => await callImageFinder(request);
    await expect(callWithoutUserFinder).rejects.toThrow(IllegalStateError);
  });

  describe('after user finder has been successfully handled', () => {
    
    let request;

    beforeEach(async () => {
      const { username } = existingUserValues;

      // create request with parameters
      request = createRequest({ username });

      // attach found user without calling next
      request[userProperty] = await User.findOne({ where: { username } });
    });

    describe.each(IMAGE_PRIVACIES)('when "%s" image belongs to the found user', (privacy) => {

      let image;

      beforeEach(async () => {
        // find users image
        const userId = request[userProperty].id;
        image = await Image.findOne({ where: { userId, privacy } });

        // create request with parameters
        addParamsToRequest(request, { imageId: image.id.toString() });

        await callImageFinder(request);
      });

      test('image id has been parsed', () => {
        expect(parseIdSpy).toHaveBeenCalledWith(image.id.toString());
      });

      test('next middleware is called', () => {
        expect(next).toHaveBeenCalled();
      });

      test('image is attached to the request', () => {
        expect(request).toHaveProperty(imageProperty);
        expect(request[imageProperty]).toStrictEqual(image);
      });
    });
  
    describe.each(IMAGE_PRIVACIES)('when "%s" image does not belong to the found user', (privacy) => {
      let image;

      let response;

      beforeEach(async () => {
        // find other user
        const { username: otherUsername } = otherExistingUserValues;
        const otherUser = await User.findOne({ where: { username: otherUsername } });

        // find other users image
        image = await Image.findOne({ where: { userId: otherUser.id, privacy } });

        // create request with parameters
        addParamsToRequest(request, { imageId: image.id.toString() });

        response = await callImageFinder(request);
      });

      test('image id has been parsed', () => {
        expect(parseIdSpy).toHaveBeenCalledWith(image.id.toString());
      });

      test('next middleware is not called', () => {
        expect(next).not.toHaveBeenCalled();
      });

      test('image is not attached to the request', () => {
        expect(request).not.toHaveProperty(imageProperty);
      });

      test('error message is returned', () => {
        expect(getStatus(response)).toBe(404);
        expect(getMessage(response)).toBe('image does not exist');
      });
    });

    describe('non-exising image', () => {
      const nonExistingImageId = '99999';

      let response;

      beforeEach(async () => {
        // create request with parameters
        addParamsToRequest(request, { imageId: nonExistingImageId });

        response = await callImageFinder(request);
      });

      test('image id has been parsed', () => {
        expect(parseIdSpy).toHaveBeenCalledWith(nonExistingImageId);
      });

      test('next middleware is not called', () => {
        expect(next).not.toHaveBeenCalled();
      });

      test(`image is not attached to the request`, () => {
        expect(request).not.toHaveProperty(imageProperty);
      });

      test('error message is returned', () => {
        expect(getStatus(response)).toBe(404);
        expect(getMessage(response)).toBe('image does not exist');
      });
    });

    test('missing image id will throw an error', async () => {
      const callWithoutImageId = async () => await callImageFinder(request);
      await expect(callWithoutImageId).rejects.toThrow(ParseError);
    });
  });
});

describe('potrait finder', () => {
  const potraitProperty = 'potrait';

  const callPotraitFinder = async (request) => {
    return callMiddleware(potraitFinder, request, next);
  };

  test('calling without finding user first will throw an error', async () => {
    const request = createRequest();
    expect(request).not.toHaveProperty(userProperty);

    const callWithoutUserFinder = async () => await callPotraitFinder(request);
    await expect(callWithoutUserFinder).rejects.toThrow(IllegalStateError);
  });

  describe('after user finder has been successfull handled', () => {
    describe('when the user does have a potrait', () => {
      let request;

      beforeEach(async () => {
        const { username } = existingUserValues;

        // create request with parameters
        request = createRequest({ username });

        // attach found user without calling next
        request[userProperty] = await User.findOne({ where: { username } });

        await callPotraitFinder(request);
      });

      test('next middleware is called', () => {
        expect(next).toHaveBeenCalled();
      });

      test('potrait is attached to the request', async () => {
        const foundPotrait = await Potrait.findOne({ 
          where: { userId: request.foundUser.id } 
        });

        expect(request).toHaveProperty(potraitProperty);
        expect(request[potraitProperty]).toStrictEqual(foundPotrait);
      });
    });

    describe('when the user does not have a potrait', () => {
      let newUser;

      let request;
      let response;
  
      beforeEach(async () => {
        // create a new user
        newUser = await createUser(nonExistingUserValues);
        request = createRequest({ username: newUser.username });

        request[userProperty] = newUser;

        response = await callPotraitFinder(request);
      });

      test('next middleware is not called', () => {
        expect(next).not.toHaveBeenCalled();
      });

      test(`potrait is not attached to the request`, () => {
        expect(request).not.toHaveProperty(potraitProperty);
      });

      test('error message is returned', () => {
        expect(getStatus(response)).toBe(404);
        expect(getMessage(response)).toBe('user does not have a potrait');
      });
    });
  });
});