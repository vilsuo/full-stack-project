const testingRouter  = require('express').Router();
const { User, Image } = require('../models');

testingRouter.post('/reset', async (req, res) => {
  await User.destroy({ truncate: true });
  await Image.destroy({ truncate: true });

  return res.status(204).end();
});

module.exports = testingRouter;