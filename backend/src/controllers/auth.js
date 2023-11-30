const router = require('express').Router();
const { cookieKey } = require('../constants');
const { User } = require('../models');

const { encodePassword, comparePassword } = require('../util/auth');
const { getNonSensitiveUser } = require('../util/dto');

router.post('/register', async (req, res) => {
  const { name, username, password } = req.body;
  if (!password) {
    return res.status(400).send({ message: 'password is missing' });
  }

  const encodedPassword = await encodePassword(password);
  const user = await User.create({
    name, username,
    passwordHash: encodedPassword
  });

  return res.status(201).send(getNonSensitiveUser(user));
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send({
      message: 'username or password missing'
    });
  }

  const user = await User.findOne({ where: { username } });
  if (user) {
    if (user.disabled) {
      return res.status(401).send({ message: 'user has been disabled' });
    }

    const passwordMatches = await comparePassword(password, user.passwordHash);
    if (passwordMatches) {
      req.session.user = {
        id: user.id,
        username: user.username,
      };

      return res.send({
        id: user.id,
        name: user.name,
        username: user.username,
      });
    }
  }

  return res.status(401).send({
    message: 'invalid username or password'
  });
});

router.post('/logout', async (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      return res.status(400).send({
        message: error.message
      })
    }

    return res
      .clearCookie(cookieKey)
      .send({ message: "you've been signed out" });
  });
});

module.exports = router;