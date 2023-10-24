const router = require('express').Router();
const { User } = require('../models');
const bcrypt = require('bcrypt');

router.post('/', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send({ error: 'username or password missing' });
  }

  const user = await User.findOne({ where: { username } });
  if (user) {
    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (passwordMatches) {
      return res.send('logged in');
    }
  }

  return res.status(401).send({ error: 'invalid username or password' });
});

module.exports = router;