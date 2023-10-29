const { Sequelize } = require('sequelize');
const { Umzug, SequelizeStorage } = require('umzug');

const { DATABASE_URL, REDIS_URL } = require('./config');

const { createClient } = require('redis');

const sequelize = new Sequelize(DATABASE_URL);

const redisClient = createClient({ url: REDIS_URL });
redisClient.on('error', err => console.log('Redis Client Error', err));

const runMigrations = async () => {
  const migrator = new Umzug({
    migrations: {
      glob: 'migrations/*.js',
    },
    storage: new SequelizeStorage({ sequelize, tableName: 'migrations' }),
    context: sequelize.getQueryInterface(),
    logger: console,
  });
  
  const migrations = await migrator.up();
  console.log('Migrations up to date', {
    files: migrations.map((mig) => mig.name),
  });
};

const connectToDatabases = async () => {
  try {
    await sequelize.authenticate();
    console.log('connected to the Postgre database');

    await redisClient.connect();
    console.log('connected to the Redis database');

    await runMigrations();
    
  } catch (err) {
    console.log('error', err);
    console.log('failed to connect to the database');
    return process.exit(1);
  }

  return null;
}

module.exports = {
  sequelize,
  redisClient,
  connectToDatabases,
}