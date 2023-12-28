const { User, Image, Potrait } = require('../../../src/models');
const { IllegalStateError } = require('../../../src/util/error');
const { userFinder, imageFinder, potraitFinder } = require('../../../src/util/middleware/finder');
const { createUser } = require('../../helpers');

const  {
  // user values
  existingUserValues, otherExistingUserValues, 
  disabledExistingUserValues, nonExistingUserValues,
} = require('../../helpers/constants');

const privacyOptions = Image.getAttributes().privacy.values;

const next = jest.fn();

const callMiddleware = async (middleware, request) => {
  const response = {};

  response.status = (statusCode) => {
    response.code = statusCode;
    return response;
  };

  response.send = (obj) => {
    response.body = obj;
    return response;
  };

  return await middleware(request, response, next);
};

const getStatus = response => response.code;
const getMessage = response => response.body.message;

const createRequest = (params = {}, query = {}) => {
  const request = { params, query };
  return request;
};

const addParamsToRequest = (request, newParams = {}) => {
  const { params: oldParams } = request;

  request.params = { ...oldParams, ...newParams };
};

describe('user finder', () => {

  const callUserFinder = async (request) => {
    return callMiddleware(userFinder, request);
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

    test('found user is attached to request.foundUser', async () => {
      const user = await User.findOne({ where: { username } });

      expect(request).toHaveProperty('foundUser');
      expect(request.foundUser).toStrictEqual(user);
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

    test('disabled user is not attached to request.foundUser', async () => {
      expect(request).not.toHaveProperty('foundUser');
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

    test('non-existing user is not attached to request.foundUser', async () => {
      expect(request).not.toHaveProperty('foundUser');
    });

    test('error message is returned', async () => {
      expect(getStatus(response)).toBe(404);
      expect(getMessage(response)).toBe('user does not exist');
    });
  });

  test('without username, error is thrown', async () => {
    const request = createRequest();

    const callWithoutUsername = async () => await callUserFinder(request);
    await expect(callWithoutUsername).rejects.toThrow(IllegalStateError);
  });
});

describe('image finder', () => {

  const callImageFinder = async (request) => {
    return callMiddleware(imageFinder, request);
  };

  test('calling without property "foundUser" will throw error', async () => {
    const request = createRequest();
    expect(request).not.toHaveProperty('foundUser');

    const callWithoutUserFinder = async () => await callImageFinder(request);
    await expect(callWithoutUserFinder).rejects.toThrow(IllegalStateError);
  });

  describe('after user finder has been successfull handled', () => {
    
    let request;

    beforeEach(async () => {
      const { username } = existingUserValues;

      // create request with parameters
      request = createRequest({ username });

      // attach found user without calling next
      request.foundUser = await User.findOne({ where: { username } });
    });

    describe.each(privacyOptions)('when "%s" image belongs to the found user', (privacy) => {

      let image;
      let response;

      beforeEach(async () => {
        // find users image
        const userId = request.foundUser.id;
        image = await Image.findOne({ where: { userId, privacy } });

        // create request with parameters
        addParamsToRequest(request, { imageId: image.id });

        response = await callImageFinder(request);
      });

      test('next middleware is called', () => {
        expect(next).toHaveBeenCalled();
      });

      test(`${privacy} image is attached`, () => {
        expect(request).toHaveProperty('image');
        expect(request.image).toStrictEqual(image);
      });
    });
  
    describe.each(privacyOptions)('when "%s" image does not belong to the found user', (privacy) => {

      let response;

      beforeEach(async () => {
        // find other user
        const { username: otherUsername } = otherExistingUserValues;
        const otherUser = await User.findOne({ where: { username: otherUsername } });

        // find other users image
        const image = await Image.findOne({ where: { userId: otherUser.id, privacy } });

        // create request with parameters
        addParamsToRequest(request, { imageId: image.id });

        response = await callImageFinder(request);
      });

      test('next middleware is not called', () => {
        expect(next).not.toHaveBeenCalled();
      });

      test(`${privacy} image is not attached`, () => {
        expect(request).not.toHaveProperty('image');
      });

      test('error message is returned', () => {
        expect(getStatus(response)).toBe(404);
        expect(getMessage(response)).toBe('image does not exist');
      });
    });

    describe('non-exising image', () => {
      let response;

      beforeEach(async () => {
        // create request with parameters
        const nonExistingImageId = 99999;
        addParamsToRequest(request, { imageId: nonExistingImageId });

        response = await callImageFinder(request);
      });

      test('next middleware is not called', () => {
        expect(next).not.toHaveBeenCalled();
      });

      test(`image is not attached`, () => {
        expect(request).not.toHaveProperty('image');
      });

      test('error message is returned', () => {
        expect(getStatus(response)).toBe(404);
        expect(getMessage(response)).toBe('image does not exist');
      });
    });
  });
});

describe('potrait finder', () => {

  const callPotraitFinder = async (request) => {
    return callMiddleware(potraitFinder, request);
  };

  test('calling without property "foundUser" will throw error', async () => {
    const request = createRequest();
    expect(request).not.toHaveProperty('foundUser');

    const callWithoutUserFinder = async () => await callPotraitFinder(request);
    await expect(callWithoutUserFinder).rejects.toThrow(IllegalStateError);
  });

  describe('after user finder has been successfull handled', () => {
    describe('when foundUser does have a potrait', () => {
      let request;

      beforeEach(async () => {
        const { username } = existingUserValues;

        // create request with parameters
        request = createRequest({ username });

        // attach found user without calling next
        request.foundUser = await User.findOne({ where: { username } });

        await callPotraitFinder(request);
      });

      test('next middleware is called', () => {
        expect(next).toHaveBeenCalled();
      });

      test('potrait is attached', async () => {
        const foundPotrait = await Potrait.findOne({ 
          where: { userId: request.foundUser.id } 
        });

        expect(request).toHaveProperty('potrait');
        expect(request.potrait).toStrictEqual(foundPotrait);
      });
    });

    describe('when foundUser does not have a potrait', () => {
      let newUser;

      let request;
      let response;
  
      beforeEach(async () => {
        // create a new user
        newUser = await createUser(nonExistingUserValues);
        request = createRequest({ username: newUser.username });

        request.foundUser = newUser;

        response = await callPotraitFinder(request);
      });

      test('next middleware is not called', () => {
        expect(next).not.toHaveBeenCalled();
      });

      test(`potrait is not attached`, () => {
        expect(request).not.toHaveProperty('potrait');
      });

      test('error message is returned', () => {
        expect(getStatus(response)).toBe(404);
        expect(getMessage(response)).toBe('user does not have a potrait');
      });
    });
  });
});