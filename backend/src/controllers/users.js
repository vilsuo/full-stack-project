const router = require('express').Router();
const { Op } = require('sequelize');
const { sequelize } = require('../util/db');
const path = require('path');

const { User, Image } = require('../models');
const { userFinder, } = require('../util/middleware/finder');
const { isAllowedToViewImage, isAllowedToEditImage, isAllowedToPostImage, } = require('../util/middleware/auth');
const { upload, removeFile } = require('../util/image-storage');
const { getNonSensitiveUser, getNonSensitiveImage } = require('../util/dto');
const logger = require('../util/logger');
const imageUpload = upload.single('image');

router.get('/', async (req, res) => {
  const searchFilters = {};

  if (req.query.search) {
    searchFilters[Op.or] = [
      sequelize.where(
        sequelize.fn('lower', sequelize.col('name')),
        { [Op.substring] : req.query.search.toLowerCase() }
      ),
      sequelize.where(
        sequelize.fn('lower', sequelize.col('username')),
        { [Op.substring] : req.query.search.toLowerCase() }
      ),
    ];
  }

  const users = await User.findAll({
    where: { ...searchFilters, disabled: false },
    order: [
      ['username', 'ASC']
    ],
  });

  return res.json(users.map(user => getNonSensitiveUser(user)));
});

router.get('/:username', userFinder, async (req, res) => {
  const user = req.foundUser;
  return res.send(getNonSensitiveUser(user));
});

router.get('/:username/images', userFinder, async (req, res) => {
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

const validateImageValues = (req, res, next) => {

};

// TODO
// - IMAGE IS STILL SAVED TO FILESYSTEM EVEN WHEN THE IMAGE VALIDATION FAILS!
// - IMAGE VALIDATION CRASHES APP!
// - add validations to values
router.post('/:username/images', isAllowedToPostImage, async (req, res) => {
  // multer upload error handling see: https://github.com/expressjs/multer/issues/336
  imageUpload(req, res, async (error) => {
    // handle this error in middleware somehow?
    if (error) {
      return res.status(400).send({ message: error.message });
    }

    logger.info('File:  ', req.file);

    if (!req.file) {
      return res.status(400).send({ message: 'file is missing' });
    }

    // The full path to the uploaded file (DiskStorage only)
    const filepath = req.file.path;

    const { mimetype, size, originalname, } = req.file;
    const { title, caption, privacy } = req.body;

    try {
      const image = await Image.create({
        originalname, filepath,
        mimetype, size,
        title, caption,
        privacy,
        userId: req.user.id,
      });

      return res.status(201).send(getNonSensitiveImage(image));
    } catch (error) {
      throw new Error(error.errors[0].message);
      //return res.status(500).send(error);
    }
  });
});

router.get('/:username/images/:imageId', isAllowedToViewImage, async (req, res) => {
  const image = req.image;
  return res.send(getNonSensitiveImage(image));
});

router.delete('/:username/images/:imageId', isAllowedToEditImage, async (req, res) => {
  const image = req.image;

  await image.destroy();

  // filepath is null in tests!
  removeFile(image.filepath);
  
  return res.status(204).end();
});

// TODO test
// add validations to values?
router.put('/:username/images/:imageId', isAllowedToEditImage, async (req, res) => {
  const image = req.image;

  const { title, caption, privacy } = req.body;
  if (title !== undefined)    { image.title = title; }
  if (caption !== undefined)  { image.caption = caption; }
  if (privacy !== undefined)  { image.privacy = privacy; }

  const updatedImage = await image.save();
  return res.send(getNonSensitiveImage(updatedImage));
});

// TODO test
// - create a helper function for getting the image file path
//    - mock it in tests?
router.get('/:username/images/:imageId/content', isAllowedToViewImage, async (req, res) => {
  const image = req.image;
  
  const dirname = path.resolve();
  const fullfilepath = path.join(dirname, image.filepath);

  return res
    .type(image.mimetype)
    .sendFile(fullfilepath);
});

module.exports = router;