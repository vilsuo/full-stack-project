const { User, Image, Potrait, Relation } = require('../../src/models');
const { SESSION_ID, IMAGE_PUBLIC, IMAGE_PRIVATE, RELATION_TYPES } = require('../../src/constants');

const cookieHeader = cookie => {
  return { 'Cookie': `${SESSION_ID}=${cookie}` };
};

const get_SetCookie = response => {
  const cookie = response
    .get('set-cookie')
    .find(value => value.startsWith(SESSION_ID));
  
  if (cookie) {
    // remove `${SESSION_ID}=` from the start:
    return cookie.split(';')[0].substring(SESSION_ID.length + 1);
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
    passwordHash: password,
    disabled,
  });
};

// IMAGES

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
    userId, privacy: IMAGE_PUBLIC,
    ...publicImageValues,
  });

  const privateImage = await createImage({
    userId, privacy: IMAGE_PRIVATE,
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
    where: { userId, privacy: IMAGE_PUBLIC }
  });

  privateImage = await Image.findOne({
    where: { userId, privacy: IMAGE_PRIVATE }
  });

  return { publicImage, privateImage };
};

// POTRAITS

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

// RELATIONS

const createRelationsOfAllTypes = async (sourceUserId, targetUserId) => {
  return await Promise.all(RELATION_TYPES.map(async type => 
    await Relation.create({ sourceUserId, targetUserId, type })
  ));
};

// COMPARISONS

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
  createRelationsOfAllTypes,
  compareFoundArrayWithResponseArray,
  compareFoundWithResponse,
};