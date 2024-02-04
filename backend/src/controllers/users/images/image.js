const router = require('express').Router({ mergeParams: true });
const fileStorage = require('../../../util/file-storage');
const {
  privateExtractor, isAllowedToViewUser, isAllowedToViewImage,
} = require('../../../util/middleware/auth');
const { getNonSensitiveImage } = require('../../../util/dto');
const parser = require('../../../util/parser');

router.get('/', isAllowedToViewUser, isAllowedToViewImage, async (req, res) => {
  const { image } = req;

  const viewIncrementedImage = await image.increment('views');

  return res.send(getNonSensitiveImage(viewIncrementedImage));
});

router.put('/', privateExtractor, async (req, res) => {
  const { image } = req;

  // all parameters are optional
  const { title, caption, privacy } = req.body;
  if (title !== undefined) { image.title = parser.parseStringType(title, 'title'); }
  if (caption !== undefined) { image.caption = parser.parseTextType(caption, 'caption'); }
  if (privacy !== undefined) { image.privacy = parser.parseImagePrivacy(privacy); }

  image.editedAt = new Date();

  const updatedImage = await image.save();
  return res.send(getNonSensitiveImage(updatedImage));
});

router.delete('/', privateExtractor, async (req, res) => {
  const { image } = req;

  await image.destroy();

  fileStorage.removeFile(image.filepath);

  return res.status(204).end();
});

router.get('/content', isAllowedToViewUser, isAllowedToViewImage, async (req, res) => {
  const { image } = req;
  const fullfilepath = fileStorage.getImageFilePath(image.filepath);

  return res
    .type(image.mimetype)
    .sendFile(fullfilepath);
});

module.exports = router;
