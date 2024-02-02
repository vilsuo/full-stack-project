const router = require('express').Router();
const { SESSION_ID } = require('../constants');
const { User } = require('../models');
const { comparePassword } = require('../util/password');
const { getNonSensitiveUser } = require('../util/dto');
const { sessionExtractor } = require('../util/middleware/auth');
const parser = require('../util/parser');

router.post('/register', async (req, res) => {
  const name = parser.parseStringType(req.body.name, 'name');
  const username = parser.parseStringType(req.body.username, 'username');
  const password = parser.parseStringType(req.body.password, 'password');

  const user = await User.create({
    name, username,

    // beforeCreate hook encodes password so the password can be validated
    passwordHash: password
  });

  return res.status(201).send(getNonSensitiveUser(user));
});

router.post('/login', async (req, res) => {
  const username = parser.parseStringType(req.body.username, 'username');
  const password = parser.parseStringType(req.body.password, 'password');

  const user = await User.findOne({ where: { username } });
  if (user) {
    if (user.disabled) {
      return res.status(401).send({ message: 'User has been disabled' });
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
    message: 'Invalid username or password'
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
      .send({ message: "You've been signed out" });
  });
});

module.exports = router;