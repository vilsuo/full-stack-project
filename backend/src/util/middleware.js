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
  errorHandler,
};