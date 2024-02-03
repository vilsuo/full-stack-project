const router = require('express').Router();
const parser = require('../util/parser');
const { getNonSensitiveUser } = require('../util/dto');
const { User } = require('../models');

router.get('/users/:username', async (req, res) => {
  const username = parser.parseStringType(req.params.username);
  const foundUser = await User.findByUsername(username);

  if (!foundUser) {
    return res.status(404).send({ message: 'User does not exist' });
  }

  return res.send(getNonSensitiveUser(foundUser));
});

router.put('/users/:username', async (req, res) => {
  const { user: adminUser } = req;

  const username = parser.parseStringType(req.params.username);
  const foundUser = await User.findByUsername(username);

  if (!foundUser) {
    return res.status(400).send({ message: 'User does not exist' });
  }

  const { disabled } = req.body;
  if (disabled !== undefined) {
    if (foundUser.id === adminUser.id) {
      return res.status(400).send({ message: 'Admin can not disable itself' });
    }
    foundUser.disabled = parser.parseBooleanType(disabled);
  }

  await foundUser.save();

  return res.send(getNonSensitiveUser(foundUser));
});

module.exports = router;