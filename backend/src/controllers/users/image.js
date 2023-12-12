const router = require('express').Router({ mergeParams: true }); // use parameter 'username'

const { isAllowedToViewImage, isSessionUser } = require('../../util/middleware/auth');
const { getNonSensitiveImage, getNonSensitiveUser } = require('../../util/dto');
const imageStorage = require('../../util/image-storage'); // importing this way makes it possible to mock 'removeFile'

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

/*
router.get('/profile', async (req, res) => {
  const imageId = req.foundUser.imageId;

  if (imageId) {
    const image = await Image.findByPk(imageId);

    if (image) {
      const fullfilepath = imageStorage.getImageFilePath(image.filepath);

      return res
        .type(image.mimetype)
        .sendFile(fullfilepath);
    }
  }
});
*/

router.put('/profile', isSessionUser, async (req, res) => {
  const image = req.image;
  const user = req.user;

  user.imageId = image.id;
  const updatedUser = await user.save();
  return res.send(getNonSensitiveUser(updatedUser));
});

router.delete('/profile', isSessionUser, async (req, res) => {
  const user = req.user;

  user.imageId = null;
  const updatedUser = await user.save();
  return res.send(getNonSensitiveUser(updatedUser));
});

module.exports = router;