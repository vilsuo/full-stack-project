const router = require('express').Router({ mergeParams: true });
const { sequelize } = require('../../util/db');
const { isSessionUser, isAllowedToViewUser } = require('../../util/middleware/auth');
const { potraitFinder } = require('../../util/middleware/finder');
const { getNonSensitivePotrait } = require('../../util/dto');
const fileStorage = require('../../util/file-storage');
const { Potrait } = require('../../models');
const logger = require('../../util/logger');

const fileUpload = fileStorage.upload.single('image');

const createPotrait = async (filepath, file, userId, transaction = {}) => {
  const { mimetype, size } = file;

  const image = await Potrait.create(
    { filepath, mimetype, size, userId },
    transaction
  );

  return image;
};

router.get('/', isAllowedToViewUser, potraitFinder, async (req, res) => {
  const { potrait } = req;
  return res.send(getNonSensitivePotrait(potrait));
});

/**
 * create/replace a {@link Potrait} to user.
 * 
 * responses with
 * - 201 if a new potrait was created
 * - 200 if old potrait was replace by a new potrait
 */
router.put('/', isSessionUser, async (req, res, next) => {
  fileUpload(req, res, async (error) => {
    if (error) return next(error);

    const file = req.file;

    logger.info('Potrait file:', file);

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
        fileStorage.removeFile(filepath);
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

      } catch (error) {
        await transaction.rollback();

        // error happened but, posted file was already saved to the filesystem
        fileStorage.removeFile(filepath);
        return next(error);
      }
      // transaction successfull: remove old file from the filesystem
      fileStorage.removeFile(oldPotrait.filepath);

      // successfull update: return '200'
      return res.status(200).send(getNonSensitivePotrait(newPotrait));
    }
  });
});

router.delete('/', potraitFinder, isSessionUser, async (req, res) => {
  const { potrait } = req;
  
  await potrait.destroy();

  fileStorage.removeFile(potrait.filepath);

  return res.status(204).end();
});

router.get('/content', isAllowedToViewUser, potraitFinder, async (req, res) => {
  const { potrait } = req;
  const fullfilepath = fileStorage.getImageFilePath(potrait.filepath);

  return res
    .type(potrait.mimetype)
    .sendFile(fullfilepath);
});

module.exports = router;