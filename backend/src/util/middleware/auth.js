const { User } = require('../../models');
const { userFinder, userImageFinder } = require('./finder');

/**
 * Extracts the authenticated User from request session to request.user.
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * 
 * @returns response with status
 * - '401' if authentication is not present
 * - '404' if authenticated user does not exist
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

/**
 * 
 * @param {*} session       request session
 * @param {number} ownerId  id of the owner of the resource 
 * 
 * @returns true if authenticated user is the owner, false otherwise
 */
const isSessionUserOwner = async (session, ownerId) => {
  if (session.user) {
    const user = await User.findByPk(session.user.id);
    return (user && user.id === ownerId);
  }

  return false;
};

/**
 * Checks if image viewing is allowed.
 * 
 * Expects the middleware {@link userImageFinder} to have been handled beforehand.
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * 
 * @returns response with status
 * - '401' if the image is private and the (authenticated) user is the
 * not owner of the image
 */
const checkImageViewAccess = async (req, res, next) => {
  const image = req.image;

  if (image.privacy === 'public') {
    return next();
  }
  
  const allowAccess = await isSessionUserOwner(req.session, image.userId);
  if (allowAccess) {
    return next();
  }
  
  return res.status(401).send({ message: 'image is private' });
};

/**
 * Checks if image editing is allowed.
 * 
 * Expects the middlewares {@link userImageFinder} and {@link sessionExtractor}
 * to have been handled beforehand.
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * 
 * @returns response with status
 * - '401' if the authenticated user is not the owner of the image 
 */
const checkImageEditAccess = async (req, res, next) => {
  const image = req.image;
  const user = req.user;

  // check if authenticated user is the owner of the image
  if (user.id !== image.userId) {
    return res.status(401).send({ message: 'can not modify other users images' });
  }
  next();
};

/**
 * Checks if image posting is allowed.
 * 
 * Expects {@link userFinder} & {@link sessionExtractor} middlewares
 * to have been handled.
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * 
 * @returns response with status
 * - '401' if the image is being posted to other user than the authenticated user 
 */
const checkImagePostAccess = (req, res, next) => {
  // check if user is posting image to self
  if (req.foundUser.id !== req.user.id) {
    return res.status(401).send({
      message: 'can not add images to other users'
    });
  }

  next();
};

/**
 * Combines middlewares {@link userImageFinder} and {@link checkImageViewAccess} 
 * to one middleware
 */
const isAllowedToViewImage = [ ...userImageFinder, checkImageViewAccess ];

/**
 * Combines middlewares {@link userImageFinder}, {@link sessionExtractor} 
 * and {@link checkImageEditAccess} to one middleware
 */
const isAllowedToEditImage = [ ...userImageFinder, sessionExtractor, checkImageEditAccess ];

/**
 * Combines middlewares {@link userFinder}, {@link sessionExtractor} 
 * and {@link checkImagePostAccess} to one middleware
 */
const isAllowedToPostImage = [ userFinder, sessionExtractor, checkImagePostAccess ];

module.exports = {
  isAllowedToViewImage,
  isAllowedToEditImage,
  isAllowedToPostImage,
};