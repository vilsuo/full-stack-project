const router = require('express').Router();
const { User, Image } = require('../models');

router.get('/', async (req, res) => {
  const users = await User.count({
    attributes: ['disabled'],
    group: 'disabled',
  });

  const images = await Image.count({
    attributes: ['private'],
    group: 'private',
  });

  return res.status(200).json({ users, images });
});

module.exports = router;