const router = require('express').Router({ mergeParams: true });

const { isAllowedToViewImage, isSessionUser } = require('../../util/middleware/auth');
const { getNonSensitiveImage } = require('../../util/dto');
const { sequelize } = require('./../../util/db');
const imageStorage = require('../../util/image-storage'); // importing this way makes it possible to mock 'removeFile'
const logger = require('../../util/logger');

router.get('/', isAllowedToViewImage, async (req, res) => {
  const image = req.image;
  return res.send(getNonSensitiveImage(image));
});

router.put('/', isSessionUser, async (req, res) => {
  const image = req.image;

  const { title, caption, privacy } = req.body;
  if (title !== undefined)    { image.title = title; }
  if (caption !== undefined)  { image.caption = caption; }
  if (privacy !== undefined)  { image.privacy = privacy; }

  const updatedImage = await image.save();
  return res.send(getNonSensitiveImage(updatedImage));
});

router.delete('/', isSessionUser, async (req, res) => {
  const image = req.image;
  const user = req.user;

  // image being deleted is users profile picture
  if (image.id === user.imageId) {
    user.imageId = null;
  }

  const transaction = await sequelize.transaction();

  try {
    await user.save({ transaction })
    await image.destroy({ transaction });

    await transaction.commit();
    imageStorage.removeFile(image.filepath);

  } catch (error) {
    logger.error('Error deleting image:', error);
    await transaction.rollback();
  }
  
  return res.status(204).end();
});

router.get('/content', isAllowedToViewImage, async (req, res) => {
  const image = req.image;
  const fullfilepath = imageStorage.getImageFilePath(image.filepath);

  return res
    .type(image.mimetype)
    .sendFile(fullfilepath);
});

module.exports = router;