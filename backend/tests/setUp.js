const { User } = require('../src/models');
const { encodePassword } = require('../src/util/auth');
const { sequelize, connectToDatabases } = require('../src/util/db');

const { existingUserValues, existingDisabledUserValues } = require('./helpers/constants');

let userCreationValues;

beforeAll(async () => {
  await connectToDatabases();
  console.log('Connected to Databases.');

  const userValues = [ ...existingUserValues, ...existingDisabledUserValues ];

  userCreationValues = await Promise.all(userValues.map(async (user) => {
    const { name, username, password, disabled = false } = user;

    // encode user passwords
    const passwordHash = await encodePassword(password);

    return { name, username, passwordHash, disabled };
  }));

  //console.log('userCreationValues', userCreationValues);
});

beforeEach(async () => {
  // create the tables, dropping them first if they already existed
  try {
    await sequelize.sync({ force: true });
    console.log('All models were synchronized successfully.');
    
  } catch (error) {
    console.log('sync error', error);
    throw error;
  }

  // create users
  await User.bulkCreate(userCreationValues);
});

afterAll(async () => {
  try {
    await sequelize.drop({});
    console.log('All tables dropped!');
  } catch (error) {
    console.log('drop error', error);
    throw error;
  }
  // reset redis db with redisClient.flushAll?
});