const router = require('express').Router();
const { Op } = require('sequelize');
const { sequelize } = require('../util/db');
const { User, Image } = require('../models');
const { 
  //pageParser,
  imageFinder, userFinder, 
  isAuthenticated, userExtractor, composed
} = require('../util/middleware');

// add limits?: https://github.com/expressjs/multer#limits
const path = require('path');
const multer = require('multer');
const upload = multer({ dest: 'images/' });

router.get('/', /*pageParser,*/ async (req, res) => {
  let where = {};

  if (req.query.search) {
    where = {
      [Op.or]: [
        sequelize.where(
          sequelize.fn('lower', sequelize.col('name')),
          { [Op.substring] : req.query.search.toLowerCase() }
        ),
        sequelize.where(
          sequelize.fn('lower', sequelize.col('username')),
          { [Op.substring] : req.query.search.toLowerCase() }
        )
      ]
    }
  }

  where.disabled = false;

  const users = await User.findAll({
    attributes: {
      exclude: ['passwordHash', 'updatedAt']
    },
    where,
    order: [
      ['username', 'ASC']
    ],
    //offset: req.offset,
    //limit: req.limit,
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

  const images = await Image.findAll({ where });
  return res.send(images);
});

router.post('/:username/images', userFinder, isAuthenticated, userExtractor, 
    upload.single('image'), async (req, res) => {

  if (req.foundUser.username !== req.user.username) {
    return res.status(401).send({
      message: 'can not add images to other users'
    });
  }

  logger.info('file', req.file);
  logger.info('body', req.body);

  const { filename, mimetype, size } = req.file;
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

router.get('/:username/images/:filename', userFinder, imageFinder, async (req, res) => {
  const image = req.image;
  const dirname = path.resolve();
  const fullfilepath = path.join(dirname, image.filepath);
  if (!image.private) {
    return res
      .type(image.mimetype)
      .sendFile(fullfilepath)

  } else {
    if (req.session.user) {
      const id = req.session.user.id;
      const user = await User.findByPk(id);
      // image is private: authenticated user must be the owner of the image
      if (user && user.username === req.foundUser.username) {
        return res
          .type(image.mimetype)
          .sendFile(fullfilepath)
      }
    }
    return res.status(401).send({
      message: 'image is private'
    });
  }
});

const sessionHasAccessToImage = async (session, imageOwner, image) => {
  if (!image.private) {
    return true
  }

  if (session.user) {
    // image is private: authenticated user must be the owner of the image
    const user = await User.findByPk(session.user.id);
    return (user && user.username === imageOwner.username);
  }
  return false;
};

// TEST!!
router.get('/:username/images/:filename/details', imageFinder, userFinder, async (req, res) => {
  const image = req.image;
  const { title, caption } = image;
  const privacy = req.body.private;

  if (sessionHasAccessToImage(req.session, req.foundUser, image)) {
    return res.send({ title, caption, private: privacy });
  }
  
  return res.status(401).send({
    message: 'image is private'
  });

  /*
  const image = req.image;
  const { title, caption, private } = image;
  if (!private) {
    return res.send({ title, caption, private });
  } else {
    if (req.session.user) {
      const id = req.session.user.id;
      const user = await User.findByPk(id);
      // image is private: authenticated user must be the owner of the image
      if (user && user.username === req.foundUser.username) {
        return res.send({ title, caption, private });
      }
    }
    return res.status(401).send({
      message: 'image is private'
    });
  }
  */
});

module.exports = router;