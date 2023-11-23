const router = require('express').Router();
const { Op } = require('sequelize');
const { sequelize } = require('../util/db');
const logger = require('../util/logger');
const { User, Image } = require('../models');

const { userFinder, } = require('../util/middleware/finder');
const { sessionExtractor, isAllowedToViewImage, isAllowedToEditImage, } = require('../util/middleware/auth');

const path = require('path');
const upload = require('../util/image-storage');

/*
TODO
  - add tests for single image routes
  - add methods for deleting/editing single images
  - test that only images can be uploaded
*/

router.get('/', /*pageParser,*/ async (req, res) => {
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
    attributes: {
      exclude: ['passwordHash', 'updatedAt']
    },
    where: { ...searchFilters, disabled: false },
    order: [
      ['username', 'ASC']
    ],
    //offset: req.offset, limit: req.limit,
  });

  return res.json(users);
});

router.get('/:username', userFinder, async (req, res) => {
  const user = req.foundUser;
  return res.send(user);
});

router.get('/:username/images', userFinder, async (req, res) => {
  const foundUser = req.foundUser;

  const where = { userId: foundUser.id, private: false };
  if (req.session.user) {
    const user = await User.findByPk(req.session.user.id);
    if (user && user.username === foundUser.username ) {
      // send all private images only if user is the owner
      delete where.private;
    }
  }

  const images = await Image.findAll({
    attributes: { exclude: ['filepath', 'size'] },
    where, 
  });

  return res.send(images);
});

router.post('/:username/images', userFinder, sessionExtractor, 
    upload.single('image'), async (req, res) => {

  logger.info('File:  ', req.file);

  if (req.foundUser.id !== req.user.id) {
    return res.status(401).send({
      message: 'can not add images to other users'
    });
  }

  if (!req.file) {
    return res.status(400).send({ message: 'file is missing' });
  }

  const {
    mimetype, size,
    filename, // The name of the file within the destination (DiskStorage only)
  } = req.file;

  // The full path to the uploaded file (DiskStorage only)
  const filepath = req.file.path;

  const { title, caption } = req.body;
  const privacy = req.body.private;

  const image = await Image.create({
    filename, filepath,
    mimetype, size,
    title, caption,
    private: privacy,
    userId: req.user.id,
  });

  return res.status(201).send(image);
});

// TODO write tests
router.get('/:username/images/:imageId', isAllowedToViewImage, async (req, res) => {
  const image = req.image;
  return res.send(image);
});

// TODO write tests
router.delete('/:username/images/:imageId', isAllowedToEditImage, async (req, res) => {
  const image = req.image;
  await image.destroy();

  return res.status(204).end();
});

// TODO TEST
router.put('/:username/images/:imageId', isAllowedToEditImage, async (req, res) => {
  const image = req.image;

  const { title, caption, private } = req.body;
  if (title !== undefined)    { image.title = title; }
  if (caption !== undefined)  { image.caption = caption; }
  if (private !== undefined)  { image.private = private; }

  const updatedImage = await image.save();
  return res.send(updatedImage);
});

// TEST
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