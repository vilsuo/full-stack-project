const router = require('express').Router();
const path = require('path');
const { Image } = require('../models');
const { isAuthenticated, userExtractor, imageFinder } = require('../util/middleware');
const logger = require('../util/logger');

/*
TODO
- remove this route (use route: 'users' instead)
*/
/*
const multer = require('multer');
const upload = multer({ dest: 'images/' });

router.post('/image', isAuthenticated, userExtractor, upload.single('image'), async (req, res) => {
  logger.info('file', req.file);
  logger.info('body', req.body);

  const { filename, mimetype, size } = req.file;
  const filepath = req.file.path;
  const { title, caption } = req.body;
  const privacy = req.body.private;

  const image = await Image.create({
    filename,
    filepath,
    mimetype,
    size,
    title,
    caption,
    private: privacy,
    userId: req.user.id,
  });

  return res.status(201).send(image);
});

router.get('/image', async (req, res) => {
  const images = await Image.findAll();

  return res.send(images);
});

router.get('/image/:filename', imageFinder, async (req, res) => {
  const image = req.image;
  const dirname = path.resolve();
  const fullfilepath = path.join(dirname, image.filepath);

  return res
    .type(image.mimetype)
    .sendFile(fullfilepath)
});

router.get('/image/:filename/details', imageFinder, async (req, res) => {
  const { title, caption } = req.image;
  return res.send({ title, caption, });
});
*/

module.exports = router;