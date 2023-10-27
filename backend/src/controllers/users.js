const router = require('express').Router();
const bcrypt = require('bcrypt');
const { User } = require('../models');
const { isAuthenticated } = require('../util/middleware');

router.get('/', async (req, res) => {
  try {
    const users = await User.findAll();
    return res.json(users);

  } catch (error) {
    return res.status(500).send({ error });
  }
});

router.get('/noauth', (req, res) => {
  return res.send({ message: 'this is response from no auth route' });
});

router.get('/welcome', isAuthenticated, async (req, res) => {
  //console.log('headers', req.headers);
  //console.log('request.session', req.session)

  const { id } = req.session.user;
  const user = await User.findByPk(id, {
    attributes: { exclude: ['passwordHash'] },
  });

  if (!user) {
    return res.status(404).send({
      error: 'user does not exist'
    });
  }
  return res.status(200).json(user);
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