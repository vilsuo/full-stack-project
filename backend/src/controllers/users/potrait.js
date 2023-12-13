const router = require('express').Router({ mergeParams: true });

const { isSessionUser } = require('../../util/middleware/auth');
const { potraitFinder } = require('../../util/middleware/finder');
const { getNonSensitivePotrait } = require('../../util/dto');
const imageStorage = require('../../util/image-storage'); // importing this way makes it possible to mock 'removeFile'
const { Potrait } = require('../../models');
const logger = require('../../util/logger');

const imageUpload = imageStorage.upload.single('image');

/*
TODO
- write tests
*/

const createPotrait = async (filepath, file, userId) => {
  const { mimetype, size } = file;

  const image = await Potrait.create({
    filepath,
    mimetype, 
    size,
    userId,
  });

  return image;
};

router.get('/', potraitFinder, async (req, res) => {
  const potrait = req.potrait;
  return res.send(getNonSensitivePotrait(potrait));
});

router.post('/', isSessionUser, async (req, res, next) => {
  imageUpload(req, res, async (error) => {
    if (error) return next(error);

    const file = req.file;

    logger.info('Potrait file:    ', file);

    if (!file) {
      return res.status(400).send({ message: 'file is missing' });
    }

    // The full path to the uploaded file (DiskStorage only)
    const filepath = file.path;

    try {
      const userId = req.user.id;
      const potrait = await createPotrait(filepath, file, userId);
      return res.status(201).send(getNonSensitivePotrait(potrait));

    } catch (error) {
      // Image validation failed, image was already saved to the filesystem
      imageStorage.removeFile(filepath);
      return next(error);
    }
  });
});

router.delete('/', potraitFinder, isSessionUser, async (req, res) => {
  const potrait = req.potrait;
  
  await potrait.destroy();

  imageStorage.removeFile(potrait.filepath);

  return res.status(204).end();
});

router.get('/content', potraitFinder, async (req, res) => {
  const potrait = req.potrait;
  const fullfilepath = imageStorage.getImageFilePath(potrait.filepath);

  return res
    .type(potrait.mimetype)
    .sendFile(fullfilepath);
});

module.exports = router;