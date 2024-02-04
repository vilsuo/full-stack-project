const { Sequelize } = require('sequelize');
const { Umzug, SequelizeStorage } = require('umzug');
const { createClient } = require('redis');
const logger = require('./logger');
const { DATABASE_URL, REDIS_URL } = require('./config');

const sequelize = new Sequelize(DATABASE_URL, {
  logging: false,
  pool: { max: 4 }, // ElephantSQL allows 5 connections: save one for psql
});

const redisClient = createClient({ url: REDIS_URL });
redisClient.on('error', (err) => logger.error('Redis Client Error', err));

const migrationConf = {
  migrations: {
    glob: 'migrations/*.js',
  },
  storage: new SequelizeStorage({ sequelize, tableName: 'migrations' }),
  context: sequelize.getQueryInterface(),
  logger,
};

const runMigrations = async () => {
  const migrator = new Umzug(migrationConf);
  const migrations = await migrator.up();
  logger.info('Migrations up to date', {
    files: migrations.map((mig) => mig.name),
  });
};

const rollbackMigration = async () => {
  await sequelize.authenticate();
  const migrator = new Umzug(migrationConf);
  await migrator.down();
};

const connectToDatabases = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Connected to the Postgre database');

    await redisClient.connect();
    logger.info('Connected to the Redis database');

    await runMigrations();
  } catch (err) {
    logger.error('Error', err);
    logger.error('Failed to connect to the database');
    return process.exit(1);
  }

  return null;
};

module.exports = {
  sequelize,
  redisClient,
  connectToDatabases,
  rollbackMigration,
};
