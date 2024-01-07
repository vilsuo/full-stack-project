const logger = require('../logger');

/*
TODO
- log cookie
*/
const requestLogger = (req, res, next) => {
  logger.info('Method:', req.method);
  logger.info('Path:  ', req.path);
  logger.info('Query: ', req.query);
  logger.info('Body:  ', req.body);
  logger.info('---');
  next();
};

const unknownEndpoint = (req, res) => {
  return res.status(404).send({ message : 'unknown endpoint' });
};

const errorHandler = (error, req, res, next) => {
  switch (error.name) {
    case 'SequelizeValidationError': {
      return res.status(400).send({
        message: error.errors.map(error => error.message)
      });
    }
    case 'SequelizeUniqueConstraintError': {
      return res.status(400).send({
        message: error.errors.map(error => error.message)
      });
    }
    case 'FiletypeError': {
      // 415 Unsupported Media Type
      return res.status(415).send({ message: error.message });
    }
    case 'ParseError': {
      return res.status(400).send({ message: error.message });
    }
    case 'IllegalStateError': {
      return res.status(500).send({ message: error.message });
    }
  }

  next(error);
};

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
};