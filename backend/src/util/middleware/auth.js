const { SESSION_ID } = require('../../constants');
const { User } = require('../../models');
const { IllegalStateError } = require('../error');
const { userFinder, imageFinder } = require('./finder');

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
  const session = req.session;
  if (!session.user) {
    // there is no session or session is invalid/expired
    return res
      .clearCookie(SESSION_ID)
      .status(401).send({ message: 'authentication required' });
  }

  const user = await User.findByPk(session.user.id);
  if (!user) {
    // session exists, but the user does not
    return req.session.destroy((error) => {
      if (error) return next(error);
  
      return res
        .clearCookie(SESSION_ID)
        .status(404).send({ message: 'session user does not exist' });
    });
  }

  req.user = user;
  next();
};

/**
 * Checks if image viewing is allowed.
 * 
 * Expects the middleware {@link imageFinder} to have been handled beforehand.
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * 
 * @returns response with status
 * - '401' if the image is private and the (authenticated) user is the
 * not owner of the image
 */
const isAllowedToViewImage = async (req, res, next) => {
  const image = req.image;

  switch (image.privacy) {
    case 'public':
      return next();

    case 'private':
      // only authenticated user can view the image, if the authenticated
      // user is the owner of the image
      return await sessionExtractor(req, res, () => {
        const user = req.user;
        if (user.id !== image.userId) {
          return res.status(401).send({ message: 'image is private' });
        }

        return next();
      });
    
    default: 
      throw new IllegalStateError(`unhandled privacy '${image.privacy}`);
  }
};


/**
 * Checks if session user is the current user route owner
 * 
 * Expects {@link userFinder} middleware to have been handled.
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * 
 * @returns response with status
 * - '401' if the authenticated user is not the current user route owner
 */
const isSessionUser = async (req, res, next) => {
  await sessionExtractor(req, res, () => {
    const sessionUser = req.user;
    const foundUser = req.foundUser;
    if (foundUser.id !== sessionUser.id) {
      return res.status(401).send({
        message: 'session user is not the owner'
      });
    }
  
    next();
  });
};

module.exports = {
  sessionExtractor,
  isAllowedToViewImage,
  isSessionUser,
};