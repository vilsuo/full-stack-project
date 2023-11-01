const app = require('./app');
const { PORT } = require('./util/config');
const { connectToDatabases } = require('./util/db');
const logger = require('./util/logger');

const start = async () => {
  await connectToDatabases();

  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

start();