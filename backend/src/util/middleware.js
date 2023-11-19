const { User, Image } = require('../models');;
const logger = require('./logger');

const parseNonNegative = (value, name) => {
  const n = Number(value);
  if (isNaN(n) || n < 0) {
    throw new Error(`parameter '${name}' must be non-negative`);
  }
  return n;
};

const pageParser = async (req, res, next) => {
  const defaultPageNumber = 0;
  const defaultPageSize = 10;

  try {
    const pageNumber = req.query.page
      ? parseNonNegative(req.query.page, 'page')
      : defaultPageNumber;

    const pageSize = req.query.size
      ? parseNonNegative(req.query.size, 'size')
      : defaultPageSize;

    req.offset = pageNumber * pageSize;
    req.limit = pageSize;
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }

  next();
};

const fileFinder = async (req, res, next) => {
  const { filename } = req.params;
  const image = await Image.findOne({ where: { filename } });

  if (!image) {
    return res.status(404).send({ message: 'image not found' });
  }

  req.image = image;
  next();
}

const isAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).send({ message: 'authentication required' });
  }
  next();
};

const userExtractor = async (req, res, next) => {
  console.log('userExtractor')
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
  pageParser,
  fileFinder,
  isAuthenticated,
  userExtractor,
  requestLogger,
  unknownEndpoint,
  errorHandler,
};