const router = require('express').Router({ mergeParams: true });

const { isSessionUser } = require('../../util/middleware/auth');
const { getNonSensitiveUser } = require('../../util/dto');
const imageStorage = require('../../util/image-storage'); // importing this way makes it possible to mock 'removeFile'

// TODO add error handling & logging when image is not found in filesystem
router.get('/', async (req, res) => {
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

  return res.status(404).send({ error: 'user does not have profile picture' })
});

// TODO how to pass in image.id ?
// - validate: image exists in correct user
/*
router.put('/', isSessionUser, async (req, res) => {
  const image = req.image;
  const user = req.user;

  user.imageId = image.id;
  const updatedUser = await user.save();
  return res.send(getNonSensitiveUser(updatedUser));
});
*/

router.delete('/', isSessionUser, async (req, res) => {
  const user = req.user;

  user.imageId = null;
  await user.save();

  return res.status(204).end();
});

module.exports = router;