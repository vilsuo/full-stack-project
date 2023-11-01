const router = require('express').Router();
const { User } = require('../models');
const bcrypt = require('bcrypt');

const encodePassword = async plainTextPassword => {
  const saltRounds = 10;
  return await bcrypt.hash(plainTextPassword, saltRounds);
}

router.post('/register', async (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).send({ message: 'password is missing' });
  }

  const encodedPassword = await encodePassword(password);
  const user = await User.create({
    ...req.body,
    passwordHash: encodedPassword
  });

  return res.status(201).send(user);
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
      return res.status(401).send({ message: 'user is disabled' });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash
    );

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
      .send({ message: "You've been signed out!" });
  });
});

module.exports = router;