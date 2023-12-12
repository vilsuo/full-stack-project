const { User, Image } = require('../../models');

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
  try {
    const { username } = req.params;
    const user = await User.findOne({ where: { username } });
    
    if (!user) {
      return res.status(404).send({ message: 'user does not exist' });

    } else if (user.disabled) {
      return res.status(400).send({ message: 'user is disabled' })
    }

    req.foundUser = user;
    next();
    
  } catch (error) {
    console.log('error', error)
    return res.status(500).send({ error });
  }
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
  try {
    const imageId = Number(req.params.imageId);

    if (!isNaN(imageId)) {
      const image = await Image.findByPk(imageId);

      if (image && image.userId === req.foundUser.id) {
        req.image = image;
        return next();
      }
    }

    return res.status(404).send({ message: 'image does not exist' });
  } catch (error) {
    console.log('error');
    return res.status(500).send({ error });
  }
};

/**
 * Combines middlewares {@link userFinder} and {@link imageFinder} to one middleware
 */
const userImageFinder = [userFinder, imageFinder];

module.exports = {
  userFinder,
  userImageFinder,
};