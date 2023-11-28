const router = require('express').Router();
const { User } = require('../models');

const { encodePassword, comparePassword } = require('../util/auth');

router.post('/register', async (req, res) => {
  const { password } = req.body;
  // if password is undefined or empty string
  if (!password) {
    return res.status(400).send({ message: 'password is missing' });
  }

  const encodedPassword = await encodePassword(password);
  const user = await User.create({
    ...req.body,
    passwordHash: encodedPassword
  });

  // do not return the passworHash
  const { passwordHash: _, ...userValues } = user.toJSON();
  return res.status(201).send(userValues);
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
      .clearCookie('connect.sid')
      .send({ message: "you've been signed out" });
  });
});

module.exports = router;