const testingRouter  = require('express').Router();
const { User } = require('../models');

testingRouter.post('/reset', async (req, res) => {
  await User.destroy({ truncate: true });

  return res.status(204).end();
});

module.exports = testingRouter;