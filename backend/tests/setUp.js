const { User } = require('../src/models');
const { sequelize, connectToDatabases } = require('../src/util/db');

const {
  existingUserValues, otherExistingUserValues, disabledExistingUserValues,
  existingUserImageValues, otherExistingUserImageValues,
  existingUserPotraitValues, otherExistingUserPotraitValues,
} = require('./helpers/constants');
const { createPublicAndPrivateImage, createPotrait } = require('./helpers');

const userValues = [existingUserValues, otherExistingUserValues, disabledExistingUserValues];

beforeAll(async () => {
  await connectToDatabases();
  console.log('Connected to Databases.');
});

beforeEach(async () => {
  // create the tables, dropping them first if they already existed
  await sequelize.sync({ force: true });

  const userIds = await Promise.all(userValues.map(async (user) => {
    const { password, ...rest } = user;
    const createdUser = await User.create({
      ...rest, passwordHash: password,
    });
    return createdUser.id;
  }));

  // create public & private images to 2 first users
  const [id, otherId] = userIds;

  await createPublicAndPrivateImage(id, existingUserImageValues);
  await createPublicAndPrivateImage(otherId, otherExistingUserImageValues);

  // create potrait to 2 first users
  await createPotrait(id, existingUserPotraitValues);
  await createPotrait(otherId, otherExistingUserPotraitValues);
});

afterEach(() => {
  jest.clearAllMocks();
});

// reset redis db with redisClient.flushAll?
afterAll(async () => {
  await sequelize.drop({});
});
