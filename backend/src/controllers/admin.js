const router = require('express').Router();
const parser = require('../util/parser');
const { getNonSensitiveUser } = require('../util/dto');
const { userFinder } = require('../util/middleware/finder');

router.put('/users/:username', userFinder, async (req, res) => {
  const user = req.foundUser;
  const { disabled } = req.body;

  if (disabled !== undefined) {
    user.disabled = parser.parseBooleanType(disabled);
  }

  await user.save();

  return res.send(getNonSensitiveUser(user));
});

module.exports = router;