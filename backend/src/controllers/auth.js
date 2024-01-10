const router = require('express').Router();
const { SESSION_ID } = require('../constants');
const { User } = require('../models');

const { comparePassword } = require('../util/password');
const { getNonSensitiveUser } = require('../util/dto');
const { sessionExtractor } = require('../util/middleware/auth');

router.post('/register', async (req, res) => {
  const { name, username, password } = req.body;

  const user = await User.create({
    name, username,

    // beforeCreate hook encodes password so the password can be validated
    passwordHash: password
  });

  return res.status(201).send(getNonSensitiveUser(user));
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (username === undefined || password === undefined) {
    return res.status(400).send({
      message: 'username or password missing'
    });
  }

  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).send({
      message: 'username and password must be strings'
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

      return res.send(getNonSensitiveUser(user));
    }
  }

  return res.status(401).send({
    message: 'invalid username or password'
  });
});

router.get('/auto-login', sessionExtractor, async (req, res) => {
  const user = req.user;
  return res.send(getNonSensitiveUser(user));
});

router.post('/logout', async (req, res, next) => {
  req.session.destroy((error) => {
    if (error) return next(error);

    return res
      .clearCookie(SESSION_ID)
      .send({ message: "you've been signed out" });
  });
});

module.exports = router;