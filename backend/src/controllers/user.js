const router = require('express').Router();
const path = require('path');
const { Image } = require('../models');
const { fileFinder } = require('../util/middleware');

// add limits?: https://github.com/expressjs/multer#limits
const multer = require('multer');
const upload = multer({ dest: 'images/' });

router.post('/profilepicture', upload.single('image'), async (req, res) => {
  console.log('file', req.file);
  console.log('body', req.body);

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
  });

  return res.status(201).send(image);
});

router.get('/profilepicture/:filename', fileFinder, async (req, res) => {
  const image = req.image;
  const dirname = path.resolve();
  const fullfilepath = path.join(dirname, image.filepath);

  return res
    .type(image.mimetype)
    .sendFile(fullfilepath)
});

router.get('/profilepicture/:filename/details', fileFinder, async (req, res) => {
  const { title, caption } = req.image;
  return res.send({ title, caption, });
});

module.exports = router;