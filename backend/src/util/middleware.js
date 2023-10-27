const { User } = require('../models');;

const isAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).send({ error: 'authentication required' });
  }
  next();
};

const userExtractor = async (req, res, next) => {
  const id = req.session.user.id;
  const user = await User.findByPk(id);
  if (!user) {
    return res.status(404).send({ error: 'user does not exist' });
  }

  req.user = user;
  next();
};

const requestLogger = (req, res, next) => {
  console.log('Method:', req.method);
  console.log('Path:  ', req.path);
  console.log('Body:  ', req.body);
  console.log('---');
  next();
};

const unknownEndpoint = (req, res) => {
  return res.status(404).send({ error : "unknown endpoint" });
};

const errorHandler = (error, req, res, next) => {
  switch (error.name) {
    case 'SequelizeValidationError':
      return res.status(400).send({
        error: error.errors.map(error => error.message)
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