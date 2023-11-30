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

// missing 'filepath'
const createImage = async (userId, title, caption, privateOption = false) => {
  return await Image.create({
    originalname: 'test.jpeg', 
    mimetype: 'image/jpeg',
    size: 1000,
    title,
    caption,
    private: privateOption,
    userId,
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