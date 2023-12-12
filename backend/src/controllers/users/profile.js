const router = require('express').Router({ mergeParams: true });

const { isSessionUser } = require('../../util/middleware/auth');
const { getNonSensitiveUser } = require('../../util/dto');
const imageStorage = require('../../util/image-storage'); // importing this way makes it possible to mock 'removeFile'
const { Image } = require('../../models');

/*
TODO
- test
- GET: add error handling & logging when image is not found in filesystem
*/

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

router.put('/', isSessionUser, async (req, res) => {
  // expects imageId as query parameter
  const { imageId } = req.query;

  if (!imageId) {
    return res.status(400).send({ error: 'missing query parameter "imageId"' });
  }

  const user = req.user;
  const image = await Image.findByPk(imageId);

  if (image && (image.userId === user.id)) {
    user.imageId = image.id;
    const updatedUser = await user.save();
    return res.send(getNonSensitiveUser(updatedUser));
  }
  
  return res.status(404).send({ error: 'image does not exist' });
});

router.delete('/', isSessionUser, async (req, res) => {
  const user = req.user;

  user.imageId = null;
  await user.save();

  return res.status(204).end();
});

module.exports = router;