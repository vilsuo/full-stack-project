const multer = require('multer');
const { Sequelize } = require('sequelize');
const logger = require('../logger');
const { FILE_SIZE_LIMIT } = require('../../constants');
const { FiletypeError, ParseError, IllegalStateError } = require('../error');

/*
TODO
- log cookie?
*/
const requestLogger = (req, res, next) => {
  logger.info('Method:', req.method);
  logger.info('Path:  ', req.path);
  logger.info('Query: ', req.query);
  logger.info('Body:  ', req.body);
  logger.info('---');
  next();
};

const unknownEndpoint = (req, res) => res.status(404).send({
  message: 'Unknown endpoint',
});

const errorHandler = (error, req, res, next) => {
  switch (true) {
    // MULTER ERRORS https://github.com/expressjs/multer/blob/master/lib/multer-error.js
    case error instanceof multer.MulterError: {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).send({
          message: `Maximum file size is ${FILE_SIZE_LIMIT} bytes`,
        });
      }
      // return the multer default
      return res.status(400).send({ message: error.code });
    }

    // SEQUELIZE ERRORS https://github.com/sequelize/sequelize/blob/3e5b8772ef75169685fc96024366bca9958fee63/lib/errors.js
    case error instanceof Sequelize.ValidationError: {
      return res.status(400).send({
        message: error.errors.map((err) => err.message),
      });
    }
    case error instanceof Sequelize.UniqueConstraintError: {
      return res.status(400).send({
        message: error.errors.map((err) => err.message),
      });
    }

    // CUSTOM ERRORS
    case error instanceof FiletypeError: {
      // 415 Unsupported Media Type
      return res.status(415).send({ message: error.message });
    }
    case error instanceof ParseError: {
      return res.status(400).send({ message: error.message });
    }
    case error instanceof IllegalStateError: {
      return res.status(500).send({ message: error.message });
    }

    // DEFAULT
    default: {
      logger.error('Unhandled error', error);
      return res.status(500).send({ message: 'Unknown error happened' });
    }
  }
};

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
};
