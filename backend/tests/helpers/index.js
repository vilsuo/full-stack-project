const { User, Image } = require('../../src/models');
const { encodePassword } = require('../../src/util/auth');
const omit = require('lodash.omit');

const cookieKey = 'connect.sid';

const cookieHeader = cookie => {
  return { 'Cookie': `${cookieKey}=${cookie}` };
};

const get_SetCookie = response => {
  const cookie = response
    .get('set-cookie')
    .find(value => value.startsWith(cookieKey));
  
  if (cookie) {
    return cookie.split(';')[0].substring(cookieKey.length + 1);
  }

  return null;
};

const createUser = async (name, { username, password }, disabled = false) => {
  const user = await User.create({
    name,
    username,
    passwordHash: await encodePassword(password),
    disabled
  });

  return user;
};

const getUsersImageCount = async username => {
  const usersImageCount = await Image.count({
    include: {
      model: User,
      where: { username },
    },
  });
  return usersImageCount;
}

const compareFoundAndResponseImage = (foundImage, responseImage) => {

  compareFoundWithResponse(foundImage, responseImage, ['filepath']);
};

const compareFoundWithResponse = (found, response, exclude) => {
  exclude.forEach(property => {
    expect(response).not.toHaveProperty(property);
  });

  const foundValues = omit(found.toJSON(), exclude);
  foundValues.createdAt = foundValues.createdAt.toJSON();
  foundValues.updatedAt = foundValues.updatedAt.toJSON();

  // compare all values that are not excluded

  // from documentation: 'toEqual ignores object keys with undefined properties, 
  // undefined array items, array sparseness, or object type mismatch. To take these 
  // into account use .toStrictEqual instead
  expect(foundValues).toStrictEqual(response);
};

const compareFoundAndResponseUser = (foundUser, responseUser) => {
  compareFoundWithResponse(foundUser, responseUser, ['passwordHash']);
};

module.exports = {
  cookieKey,
  cookieHeader,
  get_SetCookie,
  createUser,
  getUsersImageCount,
  compareFoundAndResponseImage,
  compareFoundAndResponseUser,
};