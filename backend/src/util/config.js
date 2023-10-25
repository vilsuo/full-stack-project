require('dotenv').config();

module.exports = {
  SECRET: process.env.SECRET,
  DATABASE_URL: process.env.DATABASE_URL,
  REDIS: {
    password: process.env.REDIS_PASSWORD,
    socket: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT
    }
  },
  PORT: process.env.PORT || 3001
};