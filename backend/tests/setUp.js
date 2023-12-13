const omit = require('lodash.omit');
const { User } = require('../src/models');
const { encodePassword } = require('../src/util/auth');
const { sequelize, connectToDatabases } = require('../src/util/db');

const { 
  existingUserValues, otherExistingUserValues, disabledExistingUserValues,
  existingUserImageValues, otherExistingUserImageValues,
  existingUserPotraitValues, otherExistingUserPotraitValues,
} = require('./helpers/constants');
const { createPublicAndPrivateImage, createPotrait } = require('./helpers');

const userValues = [ existingUserValues, otherExistingUserValues, disabledExistingUserValues ];

const hashedPasswords = {};

beforeAll(async () => {
  await connectToDatabases();
  console.log('Connected to Databases.');

  // encode user passwords
  userValues.forEach(async user => {
    hashedPasswords[user.username] = await encodePassword(user.password);
  });
});

beforeEach(async () => {
  // create the tables, dropping them first if they already existed
  await sequelize.sync({ force: true });

  // create users and save user ids
  const userIds = await Promise.all(userValues.map(async user => {
    const creationValues = omit(user, ['password']);
    const passwordHash = hashedPasswords[user.username];

    const createdUser = await User.create({ ...creationValues, passwordHash });
    return createdUser.id;
  }));

  // create public & private images to 2 first users
  const [ id, otherId ] = userIds;

  await createPublicAndPrivateImage(id, existingUserImageValues);
  await createPublicAndPrivateImage(otherId, otherExistingUserImageValues);

  // create potrait to 2 first users
  await createPotrait(id, existingUserPotraitValues);
  await createPotrait(otherId, otherExistingUserPotraitValues);
});

// reset redis db with redisClient.flushAll?
afterAll(async () => {
  await sequelize.drop({});

  //console.log('All tables dropped!');
});