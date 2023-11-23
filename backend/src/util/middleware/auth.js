const { User } = require('../../models');
const { userImageFinder } = require('./finder');

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

const isSessionUserOwner = async (session, ownerId) => {
  if (session.user) {
    const user = await User.findByPk(session.user.id);
    return (user && user.id === ownerId);
  }

  return false;
};

/**
 * Expects userImageFinder middlewares to have been handled
 */
const checkImageViewAccess = async (req, res, next) => {
  const image = req.image;
  if (!image.private) {
    // use 'return next' to jump out the callback immediately
    return next();
  }
  
  const allowAccess = await isSessionUserOwner(req.session, image.userId);
  if (allowAccess) {
    return next();
  }

  return res.status(401).send({ message: 'image is private' });
};

const checkImageEditAccess = async (req, res, next) => {
  const image = req.image;
  const allowAccess = await isSessionUserOwner(req.session, image.userId);
  if (!allowAccess) {
    return res.status(401).send({ message: 'can not modify other users images' });
  }
  next();
};

const isAllowedToViewImage = [ ...userImageFinder, checkImageViewAccess ];
const isAllowedToEditImage = [ ...userImageFinder, checkImageEditAccess ];

module.exports = {
  sessionExtractor,
  isAllowedToViewImage,
  isAllowedToEditImage,
};