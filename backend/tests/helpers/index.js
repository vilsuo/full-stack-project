const { User, Image } = require('../../src/models');
const { encodePassword } = require('../../src/util/auth');
const { cookieKey } = require('../../src/constants');

const cookieHeader = cookie => {
  return { 'Cookie': `${cookieKey}=${cookie}` };
};

const get_SetCookie = response => {
  const cookie = response
    .get('set-cookie')
    .find(value => value.startsWith(cookieKey));
  
  if (cookie) {
    // remove `${cookieKey}=` from the start:
    return cookie.split(';')[0].substring(cookieKey.length + 1);
  }

  throw new Error('"Set-Cookie" is not found');
};

const login = async (api, credentials, statusCode = 200) => {
  return await api
    .post('/api/auth/login')
    .send(credentials)
    .expect(statusCode)
    .expect('Content-Type', /application\/json/);
};

const createUser = async ({ name, username, password, disabled = false }) => {
  return await User.create({
    name,
    username,
    passwordHash: await encodePassword(password),
    disabled,
  });
};

/**
 * Creates a new {@link Image} from the parameters. The resulting image will
 *  have undefined 'filepath'.
 * 
 * @param {*} userId 
 * @param {*} title 
 * @param {*} caption 
 * @param {*} privacy
 * @param {*} mimetype      default 'image/jpeg'
 * @param {*} originalname  default 'test.jpeg'
 * @param {*} size          default 1000
 * 
 * @returns the created image
 */
const createImage = async ({
    userId,
    title,
    caption,
    privacy, 
    mimetype = 'image/jpeg',
    originalname = 'test.jpeg',
    size = 1000
  }) => {

  return await Image.create({
    originalname, mimetype, size,
    title, caption, privacy, userId,
  });
};

const getUsersImageCount = async username => {
  const usersImageCount = await Image.count({
    include: {
      model: User,
      where: { username },
    },
  });
  return usersImageCount;
};

const compareFoundArrayWithResponseArray = (foundNonSensitiveValuesArray, responseArray) => {
  expect(responseArray).toHaveLength(foundNonSensitiveValuesArray.length);

  foundNonSensitiveValuesArray.forEach(nonSensitiveValue => {
    expect(responseArray).toEqual(
      expect.arrayContaining([ nonSensitiveValue ])
    );
  });
};

const compareFoundWithResponse = (foundNonSensitiveValues, response) => {
  // 'toEqual' ignores object keys with undefined properties, undefined array
  // items, array sparseness, or object type mismatch. To take these into
  // account use '.toStrictEqual' instead
  expect(foundNonSensitiveValues).toStrictEqual(response);
};

module.exports = {
  cookieHeader,
  get_SetCookie,
  login,
  createUser,
  createImage,
  getUsersImageCount,
  compareFoundArrayWithResponseArray,
  compareFoundWithResponse,
};