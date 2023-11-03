const { User } = require('../models');;
const logger = require('./logger');

const isAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).send({ message: 'authentication required' });
  }
  next();
};

const userExtractor = async (req, res, next) => {
  const id = req.session.user.id;
  const user = await User.findByPk(id);
  if (!user) {
    return res.status(404).send({ message: 'user does not exist' });
  }

  req.user = user;
  next();
};

const requestLogger = (req, res, next) => {
  logger.info('Method:', req.method);
  logger.info('Path:  ', req.path);
  logger.info('Body:  ', req.body);
  logger.info('---');
  next();
};

const unknownEndpoint = (req, res) => {
  return res.status(404).send({ message : "unknown endpoint" });
};

const errorHandler = (error, req, res, next) => {
  switch (error.name) {
    case 'SequelizeValidationError':
      return res.status(400).send({
        message: error.errors.map(error => error.message)
      });
    case 'SequelizeUniqueConstraintError':
      return res.status(400).send({
        message: error.errors.map(error => error.message)
      });
  }

  next(error);
};

module.exports = {
  isAuthenticated,
  userExtractor,
  requestLogger,
  unknownEndpoint,
  errorHandler,
};