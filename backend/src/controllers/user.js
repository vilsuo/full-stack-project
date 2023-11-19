const router = require('express').Router();
const path = require('path');
const { Image } = require('../models');
const { isAuthenticated, userExtractor, fileFinder } = require('../util/middleware');
const logger = require('../util/logger');

// add limits?: https://github.com/expressjs/multer#limits
const multer = require('multer');
const upload = multer({ dest: 'images/' });

router.post('/image', isAuthenticated, userExtractor, upload.single('image'), async (req, res) => {
  logger.info('file', req.file);
  logger.info('body', req.body);

  const { filename, mimetype, size } = req.file;
  const filepath = req.file.path;
  const { title, caption } = req.body;

  const image = await Image.create({
    filename,
    filepath,
    mimetype,
    size,
    title,
    caption,
    userId: req.user.id,
  });

  return res.status(201).send(image);
});

router.get('/image/:filename', fileFinder, async (req, res) => {
  const image = req.image;
  const dirname = path.resolve();
  const fullfilepath = path.join(dirname, image.filepath);

  return res
    .type(image.mimetype)
    .sendFile(fullfilepath)
});

router.get('/image/:filename/details', fileFinder, async (req, res) => {
  const { title, caption } = req.image;
  return res.send({ title, caption, });
});

module.exports = router;