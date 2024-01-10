const router = require('express').Router({ mergeParams: true });

const fileStorage = require('../../../util/file-storage'); // importing this way makes it possible to mock 'removeFile'

const { isAllowedToViewImage, isSessionUser } = require('../../../util/middleware/auth');
const { getNonSensitiveImage } = require('../../../util/dto');
const { parseImagePrivacy, parseStringType, parseTextType } = require('../../../util/parser');

router.get('/', isAllowedToViewImage, async (req, res) => {
  const image = req.image;
  return res.send(getNonSensitiveImage(image));
});

router.put('/', isSessionUser, async (req, res) => {
  const image = req.image;

  // all parameters are optional
  const { title, caption, privacy } = req.body;
  if (title !== undefined)    { image.title = parseStringType(title, 'title'); }
  if (caption !== undefined)  { image.caption = parseTextType(caption, 'caption'); }
  if (privacy !== undefined)  { image.privacy = parseImagePrivacy(privacy); }

  const updatedImage = await image.save();
  return res.send(getNonSensitiveImage(updatedImage));
});

router.delete('/', isSessionUser, async (req, res) => {
  const image = req.image;
  
  await image.destroy();

  fileStorage.removeFile(image.filepath);

  return res.status(204).end();
});

router.get('/content', isAllowedToViewImage, async (req, res) => {
  const image = req.image;
  const fullfilepath = fileStorage.getImageFilePath(image.filepath);

  return res
    .type(image.mimetype)
    .sendFile(fullfilepath);
});

module.exports = router;