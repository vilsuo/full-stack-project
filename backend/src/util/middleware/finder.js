const { User, Image } = require('../../models');

const userFinder = async (req, res, next) => {
  const { username } = req.params;
  const user = await User.findOne({ where: { username } });
  
  if (!user) {
    return res.status(404).send({ message: 'user does not exist' });

  } else if (user.disabled) {
    return res.status(400).send({ message: 'user is disabled' })
  }

  req.foundUser = user;
  next();
};

/**
 * Expects userFinder middleware to have been handled
 */
const imageFinder = async (req, res, next) => {
  const imageId = Number(req.params.imageId);

  if (!isNaN(imageId)) {
    const image = await Image.findByPk(imageId);

    if (image && image.userId === req.foundUser.id) {
      req.image = image;
      return next();
    }
  }

  return res.status(404).send({ message: 'image does not exist' });
};

const userImageFinder = [userFinder, imageFinder];

module.exports = {
  userFinder,
  userImageFinder,
};