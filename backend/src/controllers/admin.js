const router = require('express').Router();
const parser = require('../util/parser');
const { getNonSensitiveUser } = require('../util/dto');
const { User } = require('../models');

router.put('/users/:username', async (req, res) => {
  const username = parser.parseStringType(req.params.username);
  const foundUser = await User.findByUsername(username);

  if (!foundUser) {
    return res.status(400).send({ message: 'User does not exist' });
  }

  const { disabled } = req.body;
  if (disabled !== undefined) {
    foundUser.disabled = parser.parseBooleanType(disabled);
  }

  await foundUser.save();

  return res.send(getNonSensitiveUser(foundUser));
});

module.exports = router;