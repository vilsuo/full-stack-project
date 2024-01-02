const router = require('express').Router({ mergeParams: true }); // use parameter 'username'
const imageRouter = require('./image');

const { Image, User } = require('../../../models');
const { isSessionUser } = require('../../../util/middleware/auth');
const { getNonSensitiveImage } = require('../../../util/dto');
const logger = require('../../../util/logger');
const fileStorage = require('../../../util/file-storage'); // importing this way makes it possible to mock 'removeFile'
const { imageFinder } = require('../../../util/middleware/finder');

const fileUpload = fileStorage.upload.single('image');

const createImage = async (filepath, file, fields, userId) => {
  const { mimetype, size, originalname } = file;
  const { title, caption, privacy } = fields;

  const image = await Image.create({
    originalname, 
    filepath,
    mimetype, 
    size,
    title, 
    caption,
    privacy,
    userId,
  });

  return image;
};

router.get('/', async (req, res) => {
  const foundUser = req.foundUser;

  const where = { userId: foundUser.id, privacy: 'public' };

  if (req.session.user) {
    const userId = req.session.user.id;
    const user = await User.findOne({ where: { id: userId } });
    if (user && userId === foundUser.id) {
      // send all images only if user is the owner
      delete where.privacy;
    }
  }

  const images = await Image.findAll({ where });

  return res.send(images.map(image => getNonSensitiveImage(image)));
});

router.post('/', isSessionUser, async (req, res, next) => {
  fileUpload(req, res, async (error) => {
    if (error) return next(error);

    const file = req.file;
    const fields = req.body;

    logger.info('Image file:    ', file);
    logger.info('Image fields:  ', fields);

    if (!file) {
      return res.status(400).send({ message: 'file is missing' });
    }

    // The full path to the uploaded file (DiskStorage only)
    const filepath = file.path;

    try {
      const userId = req.user.id;
      const image = await createImage(filepath, file, fields, userId);
      return res.status(201).send(getNonSensitiveImage(image));

    } catch (error) {
      // Image validation failed, image was already saved to the filesystem
      fileStorage.removeFile(filepath);
      return next(error);
    }
  });
});

router.use('/:imageId', imageFinder, imageRouter);

module.exports = router;