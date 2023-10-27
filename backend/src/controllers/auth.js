const router = require('express').Router();
const { User } = require('../models');
const bcrypt = require('bcrypt');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send({
      message: 'username or password missing'
    });
  }

  const user = await User.findOne({ where: { username } });
  if (user) {
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
  console.log('in path')
  req.session.destroy((error) => {
    console.log('in cb')
    if (error) {
      console.log('in error')
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