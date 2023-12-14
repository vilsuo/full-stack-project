const router = require('express').Router();
const { Op } = require('sequelize');
const imagesRouter = require('./images');
const potraitRouter = require('./potrait');
const { sequelize } = require('../../util/db');
const { User } = require('../../models');
const { getNonSensitiveUser } = require('../../util/dto');
const { userFinder } = require('../../util/middleware/finder');
const { isSessionUser } = require('../../util/middleware/auth');

router.get('/', async (req, res) => {
  const searchFilters = {};

  if (req.query.search) {
    searchFilters[Op.or] = [
      sequelize.where(
        sequelize.fn('lower', sequelize.col('name')),
        { [Op.substring] : req.query.search.toLowerCase() }
      ),
      sequelize.where(
        sequelize.fn('lower', sequelize.col('username')),
        { [Op.substring] : req.query.search.toLowerCase() }
      ),
    ];
  }

  const users = await User.findAll({
    where: { ...searchFilters, disabled: false },
    order: [
      ['username', 'ASC']
    ],
  });

  return res.json(users.map(user => getNonSensitiveUser(user)));
});

router.get('/:username', userFinder, async (req, res) => {
  const user = req.foundUser;
  return res.send(getNonSensitiveUser(user));
});

router.delete('/:username', userFinder, isSessionUser, async (req, res) => {
  const user = req.foundUser;
  await user.destroy();

  return res.status(204).send();
});

router.use('/:username/potrait', userFinder, potraitRouter);

router.use('/:username/images', userFinder, imagesRouter);

module.exports = router;