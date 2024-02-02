const { User, Image, Potrait } = require('../../models');
const { IllegalStateError } = require('../error');
const parser = require('../parser');

/**
 * Extracts the User from request parameter 'username' to request.foundUser.
 * 
 * @param {*} req
 * @param {*} res
 * @param {*} next  
 * 
 * @returns response with status 
 *  - '404' if user does not exist
 *  - '400' if user is disabled
 */
const userFinder = async (req, res, next) => {
  const { username } = req.params;

  if (typeof username !== 'string') {
    throw new IllegalStateError(
      'Request parameter username is not a string'
    );
  }

  const foundUser = await User.findOne({ where: { username } });
  
  if (!foundUser) {
    return res.status(404).send({ message: 'User does not exist' });

  } else if (foundUser.disabled) {
    return res.status(400).send({ message: 'User is disabled' })
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
 * - '404' if the found user does not have an image with id of 'imageId'
 */
const imageFinder = async (req, res, next) => {
  const { foundUser } = req;
  const { imageId: rawImageId } = req.params;

  if (!foundUser) {
    throw new IllegalStateError('User of the image to be found is not specified');
  }

  const imageId = parser.parseId(rawImageId);
  const image = await Image.findByPk(imageId);

  if (image && image.userId === foundUser.id) {
    req.image = image;
    return next();
  }

  return res.status(404).send({ message: 'Image does not exist' });
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
 * - '404' if the found user does not have potrait
 */
const potraitFinder = async (req, res, next) => {
  const foundUser = req.foundUser;

  if (!foundUser) {
    throw new IllegalStateError('User of the potrait to be found is not specified');
  }
  
  const potrait = await Potrait.findOne({ where: { userId: foundUser.id } });
  if (potrait) {
    req.potrait = potrait;
    return next();
  }

  return res.status(404).send({ message: 'User does not have a potrait' });
};

module.exports = {
  userFinder,
  imageFinder,
  potraitFinder,
};