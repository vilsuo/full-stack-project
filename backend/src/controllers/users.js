const router = require('express').Router();
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

module.exports = router;