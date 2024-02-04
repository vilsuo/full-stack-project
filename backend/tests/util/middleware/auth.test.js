const { User } = require('../../../src/models');
const sessionObj = require('../../../src/util/middleware/session');
const { adminExtractor, privateExtractor } = require('../../../src/util/middleware/auth');
const { createUser } = require('../../helpers');
const {
  existingUserValues,
  otherExistingUserValues,
  nonExistingUserValues,
} = require('../../helpers/constants');
const {
  callMiddleware,
  createRequest,
  getMessage,
  getStatus,
  createSession,
} = require('../../helpers/middleware');

const userFinderProperty = 'foundUser';

const next = jest.fn();

const sessionExtractorMock = jest.spyOn(sessionObj, 'sessionExtractor')
  .mockImplementation(async (req, res, fn) => {
    // find the user in the 'session'
    const { id } = req.session.user;
    const user = await User.findByPk(id);
    req.user = user;

    // call next middleware
    return fn();
  });

describe('private extractor', () => {
  const createPrivateExtractorRequest = (foundUser, sessionUser) => {
    const session = sessionUser ? createSession(sessionUser) : {};
    return createRequest({ session, [userFinderProperty]: foundUser });
  };

  const callPrivateExtractor = async (request) => callMiddleware(privateExtractor, request, next);

  describe('when session user is the user', () => {
    let request;

    beforeEach(async () => {
      const user = await User.findByUsername(existingUserValues.username);
      request = createPrivateExtractorRequest(user, user);

      await callPrivateExtractor(request);
    });

    it('next middleware is called', async () => {
      expect(sessionExtractorMock).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });
  });

  describe('when session user is not the user', () => {
    let request;
    let response;

    beforeEach(async () => {
      const foundUser = await User.findByUsername(existingUserValues.username);
      const sessionUser = await User.findByUsername(otherExistingUserValues.username);

      request = createPrivateExtractorRequest(foundUser, sessionUser);
      response = await callPrivateExtractor(request);
    });

    it('next middleware is not called', async () => {
      expect(sessionExtractorMock).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    test('error message is returned', async () => {
      expect(getStatus(response)).toBe(401);
      expect(getMessage(response)).toBe('Private access');
    });
  });
});

describe('admin extractor', () => {
  const createAdminExtractorRequest = (user) => {
    const session = user ? createSession(user) : {};
    return createRequest({ session });
  };

  const callAdminExtractor = async (request) => callMiddleware(adminExtractor, request, next);

  describe('when user is an admin', () => {
    beforeEach(async () => {
      const user = await createUser({ ...nonExistingUserValues, admin: true });
      expect(user.admin).toBe(true);

      const request = createAdminExtractorRequest(user);
      await callAdminExtractor(request);
    });

    test('next middleware is called', async () => {
      expect(sessionExtractorMock).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });
  });

  describe('when user is not an admin', () => {
    let response;

    beforeEach(async () => {
      const user = await User.findByUsername(existingUserValues.username);
      expect(user.admin).toBe(false);

      const request = createAdminExtractorRequest(user);
      response = await callAdminExtractor(request);
    });

    test('next middleware is not called', async () => {
      expect(sessionExtractorMock).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    test('error message is returned', async () => {
      expect(getStatus(response)).toBe(401);
      expect(getMessage(response)).toBe('Admin privilege required');
    });
  });
});
