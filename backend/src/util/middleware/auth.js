const { SESSION_ID, IMAGE_PUBLIC, IMAGE_PRIVATE, RELATION_BLOCK } = require('../../constants');
const { User, Relation } = require('../../models');
const { IllegalStateError } = require('../error');
const { userFinder, imageFinder } = require('./finder');

const { Op } = require('sequelize');

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
    return session.destroy((error) => {
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
 * Viewing is allowed if viewer is not authenticated or is authenticated but there
 * does not exist a {@link Relation} with type {@link RELATION_BLOCK} between the viewer
 * and the user.
 * 
 * Calls {@link sessionExtractor} middleware if session is present.
 * 
 * Expects middleware {@link userFinder} to have been called beforehand.
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns response with status
 * - '401' if block exists between the user and the session user
 */
const isAllowedToViewUser = async (req, res, next) => {
  const { foundUser } = req;

  if (req.session.user) {
    return await sessionExtractor(req, res, async () => {
      const { user } = req;

      if (user.id !== foundUser.id) {
        // check if block exists
        const blocksBetween = await Relation.findAll({
          where: {
            type: RELATION_BLOCK,
            [Op.or]: [
              { [Op.and]: [{ sourceUserId: user.id, targetUserId: foundUser.id }] },
              { [Op.and]: [{ sourceUserId: foundUser.id, targetUserId: user.id }] },
            ]
          }
        });

        // empty array is NOT falsy!
        if (blocksBetween.length > 0) {
          return res.status(401).send({ message: 'block exists' });
        }
      }

      return next();
    });
  }

  next();
};

/**
 * Checks if image viewing is allowed.
 * 
 * Expects the middlewares {@link isAllowedToViewUser} and {@link imageFinder}
 * to have been handled beforehand.
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
  // session extractor should have been called if session exists.
  const { image, user } = req;

  switch (image.privacy) {
    case IMAGE_PUBLIC:
      return next();

    case IMAGE_PRIVATE:
      // only authenticated user can view the image, if the authenticated
      // user is the owner of the image.
      if (!user || (user.id !== image.userId)) {
        return res.status(401).send({ message: `image is ${IMAGE_PRIVATE}` });
      }

      return next();
    
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
    const { user: sessionUser, foundUser } = req;

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
  isAllowedToViewUser,
  isAllowedToViewImage,
  isSessionUser,
};