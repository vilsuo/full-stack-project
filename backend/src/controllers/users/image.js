const router = require('express').Router({ mergeParams: true });

const { isAllowedToViewImage, isSessionUser } = require('../../util/middleware/auth');
const { getNonSensitiveImage } = require('../../util/dto');
const imageStorage = require('../../util/image-storage'); // importing this way makes it possible to mock 'removeFile'

/*
TODO
- convert put to patch?
*/

router.get('/', isAllowedToViewImage, async (req, res) => {
  const image = req.image;
  return res.send(getNonSensitiveImage(image));
});

router.put('/', isSessionUser, async (req, res) => {
  const image = req.image;

  const { title, caption, privacy } = req.body;
  if (title !== undefined)    { image.title = title; }
  if (caption !== undefined)  { image.caption = caption; }
  if (privacy !== undefined)  { image.privacy = privacy; }

  const updatedImage = await image.save();
  return res.send(getNonSensitiveImage(updatedImage));
});

router.delete('/', isSessionUser, async (req, res) => {
  const image = req.image;
  
  await image.destroy();

  imageStorage.removeFile(image.filepath);

  return res.status(204).end();
});

router.get('/content', isAllowedToViewImage, async (req, res) => {
  const image = req.image;
  const fullfilepath = imageStorage.getImageFilePath(image.filepath);

  return res
    .type(image.mimetype)
    .sendFile(fullfilepath);
});

module.exports = router;