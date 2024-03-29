const { Op } = require('sequelize');
const { IMAGE_PUBLIC, IMAGE_PRIVATE, RELATION_BLOCK } = require('../../constants');
const { Relation } = require('../../models');
const { IllegalStateError } = require('../error');
const session = require('./session');

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
  if (foundUser === undefined) {
    throw new IllegalStateError('User to be viewed is not set');
  }

  if (req.session.user) {
    return session.sessionExtractor(req, res, async () => {
      const { user } = req;

      if (user.id !== foundUser.id) {
        // check if block exists
        const blocksBetween = await Relation.findAll({
          where: {
            type: RELATION_BLOCK,
            [Op.or]: [
              { [Op.and]: [{ sourceUserId: user.id, targetUserId: foundUser.id }] },
              { [Op.and]: [{ sourceUserId: foundUser.id, targetUserId: user.id }] },
            ],
          },
        });

        // empty array is NOT falsy!
        if (blocksBetween.length > 0) {
          const sessionUserRelation = blocksBetween.find(
            (relation) => relation.sourceUserId === user.id,
          );

          if (sessionUserRelation) {
            return res.status(401).send({ message: 'You have blocked the user' });
          }

          return res.status(401).send({ message: 'You have been blocked by the user' });
        }
      }

      return next();
    });
  }

  return next();
};

/**
 * Checks if image viewing is allowed. Does NOT check {@link RELATION_BLOCK}
 * between users (call middleware {@link isAllowedToViewUser} check block before)
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
  // session extractor should have been called if session exists.
  const { image, user } = req;

  if (image === undefined) {
    throw new IllegalStateError('Image to be viewed is not set');
  }

  switch (image.privacy) {
    case IMAGE_PUBLIC:
      return next();

    case IMAGE_PRIVATE:
      // only authenticated user can view the image, if the authenticated
      // user is the owner of the image.
      if (!user || (user.id !== image.userId)) {
        return res.status(401).send({ message: `Image is ${IMAGE_PRIVATE}` });
      }

      return next();
    default:
      throw new IllegalStateError(`Unhandled privacy '${image.privacy}`);
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
const privateExtractor = async (req, res, next) => {
  const { foundUser } = req;
  if (foundUser === undefined) {
    throw new IllegalStateError('User to be compared against is not set');
  }

  return session.sessionExtractor(req, res, () => {
    const { user: sessionUser } = req;

    if (foundUser.id !== sessionUser.id) {
      return res.status(401).send({ message: 'Private access' });
    }

    return next();
  });
};

/**
 * Checks if session user is admin
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 *
 * @returns response with status
 * - '401' if the authenticated does not have admin role
 */
const adminExtractor = async (req, res, next) => session.sessionExtractor(req, res, () => {
  const { user: sessionUser } = req;
  if (!sessionUser.admin) {
    return res.status(401).send({ message: 'Admin privilege required' });
  }
  return next();
});

module.exports = {
  isAllowedToViewUser,
  isAllowedToViewImage,
  privateExtractor,
  adminExtractor,
};
