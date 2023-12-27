const omit = require('lodash.omit');

const { User, Image, Potrait } = require('../../src/models');
const { encodePassword } = require('../../src/util/password');
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

/**
 * 
 * @param {*} api 
 * @param {*} credentials login credentials: username and password
 * @returns an authentication header to be set in authenticated requests
 */
const login = async (api, credentials) => {
  const response = await api
    .post('/api/auth/login')
    .send(credentials)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  // login was successfull, return the authentication header
  const cookie = get_SetCookie(response);
  return cookieHeader(cookie);
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
const createImage = async (values) => {
  return await Image.create(values);
};

const createPublicAndPrivateImage = async (userId, { publicImageValues, privateImageValues }) => {
  const publicImage = await createImage({
    userId, privacy: 'public',
    ...publicImageValues,
  });

  const privateImage = await createImage({
    userId, privacy: 'private',
    ...privateImageValues,
  });

  return { publicImage, privateImage };
};

const findPublicAndPrivateImage = async (username) => {
  const userId = (await User.findOne({ where: { username }})).id;

  if (!userId) {
    throw new Error(`user with username ${username} does not exist`);
  }

  publicImage = await Image.findOne({
    where: { userId, privacy: 'public' }
  });

  privateImage = await Image.findOne({
    where: { userId, privacy: 'private' }
  });

  return { publicImage, privateImage };
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

// missing 'filepath'
const createPotrait = async (userId, potraitValues) => {
  return await Potrait.create({ userId, ...potraitValues });
};

const findPotrait = async (username) => {
  const userId = (await User.findOne({ where: { username }})).id;

  if (!userId) {
    throw new Error(`user with username ${username} does not exist`);
  }
  
  return await Potrait.findOne({ where: { userId } });
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
  createPublicAndPrivateImage,
  findPublicAndPrivateImage,
  createPotrait,
  findPotrait,
  getUsersImageCount,
  compareFoundArrayWithResponseArray,
  compareFoundWithResponse,
};