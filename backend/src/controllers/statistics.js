const router = require('express').Router();
const { User, Image, Potrait } = require('../models');

router.get('/count', async (req, res) => {
  const users = await User.count({
    attributes: ['disabled'],
    group: 'disabled',
  });

  const images = await Image.count({
    attributes: ['privacy'],
    group: 'privacy',
  });

  const potraits = await Potrait.count();

  return res.status(200).json({ users, images, potraits });
});

module.exports = router;