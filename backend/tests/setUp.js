const { sequelize, connectToDatabases } = require('../src/util/db');

beforeAll(async () => {
  await connectToDatabases();
  console.log('Connected to Databases.')
});

// This creates the tables, dropping them first if they already existed
beforeEach(async () => {
  await sequelize.sync({ force: true });
  console.log("All models were synchronized successfully.");
});

afterAll(async () => {
  await sequelize.drop();
  console.log("All tables dropped!");

  // reset redis db with redisClient.flushAll?
});