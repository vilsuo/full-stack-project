const { User, Image, Potrait, Relation } = require('../../models');
const { IllegalStateError } = require('../error');
const { parseParamId } = require('./parser');

/*
TODO
- implement relationFinder by relationId param
*/

/**
 * Extracts the User from request parameter 'username' to request.foundUser.
 * 
 * @param {*} req
 * @param {*} res
 * @param {*} next  
 * 
 * @returns response with status 
 *  - '404' if said user does not exist
 *  - '400' if said user is disabled
 */
const userFinder = async (req, res, next) => {
  const { username } = req.params;

  if (!username) {
    throw new IllegalStateError('missing parameter "username"');
  }

  const foundUser = await User.findOne({ where: { username } });
  
  if (!foundUser) {
    return res.status(404).send({ message: 'user does not exist' });

  } else if (foundUser.disabled) {
    return res.status(400).send({ message: 'user is disabled' })
  }

  req.foundUser = foundUser;
  next();
};

/**
 * Extracts the Image from request parameter 'imageId' to request.image.
 * 
 * Expects the middleware {@link userFinder} to have been handled beforehand.
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * 
 * @returns response with status
 * - '404' if there is no image with id = imageId.
 * - '404' if the image owner is not the request.foundUser
 */
const imageFinder = async (req, res, next) => {
  const { foundUser } = req;

  if (!foundUser) {
    throw new IllegalStateError('foundUser is not set');
  }

  const imageId = parseParamId(req.params.imageId);

  const image = await Image.findByPk(imageId);

  if (image && image.userId === foundUser.id) {
    req.image = image;
    return next();
  }

  return res.status(404).send({ message: 'image does not exist' });
};

/**
 * Extracts the {@link Potrait} of the from the request.foundUser to request.potrait.
 * 
 * Expects the middleware {@link userFinder} to have been handled beforehand.
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * 
 * @returns response with status
 * - '404' if the user does not have potrait
 */
const potraitFinder = async (req, res, next) => {
  const foundUser = req.foundUser;

  if (!foundUser) {
    throw new IllegalStateError('foundUser is not set');
  }
  
  const potrait = await Potrait.findOne({ where: { userId: foundUser.id } });
  if (potrait) {
    req.potrait = potrait;
    return next();
  }

  return res.status(404).send({ message: 'user does not have a potrait' });
};

/*
const relationFinder = async (req, res, next) => {
  const foundUser = req.foundUser;

  if (!foundUser) {
    throw new IllegalStateError('foundUser is not set');
  }

  const relationId = parseParamId(req.params.relationId);

  if (isNaN(relationId)) {
    return res.status(400).send({ message: 'id must be a number' });
  }

  const relation = await Relation.findByPk(relationId);

  if (relation && relation.userId === foundUser.id) {
    req.relation = relation;
    return next();
  }

  return res.status(404).send({ message: 'relation does not exist' });
};
*/

module.exports = {
  userFinder,
  imageFinder,
  potraitFinder,
};