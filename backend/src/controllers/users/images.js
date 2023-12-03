const router = require('express').Router({ mergeParams: true }); // use parameter 'username'
const path = require('path');

const { Image, User } = require('../../models');
const { userFinder } = require('../../util/middleware/finder');
const { isAllowedToPostImage, isAllowedToViewImage, isAllowedToEditImage } = require('../../util/middleware/auth');
const { getNonSensitiveImage } = require('../../util/dto');
const logger = require('../../util/logger');
const imageStorage = require('../../util/image-storage'); // importing this way makes it possible to mock 'removeFile'

const imageUpload = imageStorage.upload.single('image');

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

router.get('/', userFinder, async (req, res) => {
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


router.post('/', isAllowedToPostImage, async (req, res, next) => {
  imageUpload(req, res, async (error) => {
    if (error) return next(error);

    const file = req.file;
    const fields = req.body;

    logger.info('File:    ', file);
    logger.info('Fields:  ', fields);

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
      imageStorage.removeFile(filepath);
      return next(error);
    }
  });
});

router.get('/:imageId', isAllowedToViewImage, async (req, res) => {
  const image = req.image;
  return res.send(getNonSensitiveImage(image));
});

router.delete('/:imageId', isAllowedToEditImage, async (req, res) => {
  const image = req.image;

  await image.destroy();

  // filepath is null in tests!
  imageStorage.removeFile(image.filepath);
  
  return res.status(204).end();
});

router.put('/:imageId', isAllowedToEditImage, async (req, res) => {
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
router.get('/:imageId/content', isAllowedToViewImage, async (req, res) => {
  const image = req.image;
  
  const dirname = path.resolve();
  const fullfilepath = path.join(dirname, image.filepath);

  return res
    .type(image.mimetype)
    .sendFile(fullfilepath);
});

module.exports = router;