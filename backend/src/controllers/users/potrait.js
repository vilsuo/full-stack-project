const router = require('express').Router({ mergeParams: true });

const { sequelize } = require('../../util/db');
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

const createPotrait = async (filepath, file, userId, transaction = {}) => {
  const { mimetype, size } = file;

  const image = await Potrait.create(
    { filepath, mimetype, size, userId },
    transaction
  );

  return image;
};

// TODO make route for user only?
router.get('/', potraitFinder, async (req, res) => {
  const potrait = req.potrait;
  return res.send(getNonSensitivePotrait(potrait));
});

// TODO write tests
/**
 * create/replace a {@link Potrait} to user.
 * 
 * responses with
 * - 201 if a new potrait was created
 * - 200 if old potrait was replace by a new potrait
 */
router.put('/', isSessionUser, async (req, res, next) => {
  imageUpload(req, res, async (error) => {
    if (error) return next(error);

    const file = req.file;

    logger.info('Potrait file:    ', file);

    if (!file) {
      return res.status(400).send({ message: 'file is missing' });
    }

    // The full path to the uploaded file (DiskStorage only)
    const filepath = file.path;

    const userId = req.user.id;
    const oldPotrait = await Potrait.findOne({ where: { userId } });

    if (!oldPotrait) {
      // user does not have a potrait: simply create one
      let newPotrait;
      try {
        newPotrait = await createPotrait(filepath, file, userId);

      } catch (error) {
        // error happened but, posted file was already saved to the filesystem
        imageStorage.removeFile(filepath);
        return next(error);
      }
      // successfull create: return '201'
      return res.status(201).send(getNonSensitivePotrait(newPotrait));

    } else {
      // user has a potrait: try to replace the old one with the new one
      let newPotrait;
      const transaction = await sequelize.transaction();
      try {
        // 1. delete old one
        await oldPotrait.destroy({ transaction });

        // 2. create a new one
        newPotrait = await createPotrait(filepath, file, userId, { transaction });

        await transaction.commit();

        // transaction on remove old file from the filesystem
        imageStorage.removeFile(oldPotrait.filepath);

      } catch (error) {
        await transaction.rollback();

        // error happened but, posted file was already saved to the filesystem
        imageStorage.removeFile(filepath);
        return next(error);
      }
      // successfull update: return '200'
      return res.status(200).send(getNonSensitivePotrait(newPotrait));
    }
  });
});

// TODO write tests
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