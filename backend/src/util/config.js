require('dotenv').config();

module.exports = {
  SECRET: process.env.SECRET,
  DATABASE_URL: process.env.NODE_ENV === 'test'
    ? process.env.TEST_DATABASE_URL
    : process.env.DATABASE_URL,
  REDIS_URL: process.env.NODE_ENV === 'test'
    ? process.env.TEST_REDIS_URL
    : process.env.REDIS_URL,
  PORT: process.env.PORT || 3001
};