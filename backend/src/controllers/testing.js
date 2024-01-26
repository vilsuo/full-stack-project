const testingRouter  = require('express').Router();
const { User } = require('../models');
const { sequelize } = require('../util/db');
const { getNonSensitiveUser } = require('../util/dto');

testingRouter.post('/reset', async (req, res) => {
  // create the tables, dropping them first if they already existed
  await sequelize.sync({ force: true });

  return res.status(204).end();
});

/**
 * Route to create disabled users
 */
testingRouter.post('/disabled', async (req, res) => {
  const { name, username, password } = req.body;

  const user = await User.create({
    name, username,

    // beforeCreate hook encodes password so the password can be validated
    passwordHash: password,

    // create diabled user
    disabled: true,
  });

  return res.status(201).send(getNonSensitiveUser(user));
});

module.exports = testingRouter;