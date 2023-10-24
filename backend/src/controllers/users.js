const router = require('express').Router();
const bcrypt = require('bcrypt');
const { User } = require('../models');

router.get('/', async (req, res) => {
  try {
    const users = await User.findAll();

    res.json(users);
  } catch (error) {
    res.status(500).send({ error });
  }
});

const encodePassword = async plainTextPassword => {
  const saltRounds = 10;
  return await bcrypt.hash(plainTextPassword, saltRounds);
}

router.post('/', async (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).send({ error: 'password is missing' });
  }

  const encodedPassword = await encodePassword(password);

  const user = await User.create({
    ...req.body,
    passwordHash: encodedPassword
  });

  return res.status(201).send(user);
});

module.exports = router;