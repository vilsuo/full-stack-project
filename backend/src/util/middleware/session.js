const { User } = require('../../models');

/**
 * Extracts the authenticated User from request to req.user.
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
const sessionExtractor = async (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).send({ message: 'authentication required' });
  }

  const id = req.session.user.id;
  const user = await User.findByPk(id);
  if (!user) {
    return res.status(404).send({ message: 'user does not exist' });
  }

  req.user = user;
  next();
};

module.exports = {
  sessionExtractor,
};