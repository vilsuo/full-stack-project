const router = require('express').Router();
const { Op } = require('sequelize');
const { sequelize } = require('../util/db');
const { User } = require('../models');
const { pageParser } = require('../util/middleware');

/**
 * supported query parameters:
 * - search: case insensitive name and username substring search
 * - page
 */
router.get('/', pageParser, async (req, res) => {
  let where = {};

  if (req.query.search) {
    where = {
      [Op.or]: [
        sequelize.where(
          sequelize.fn('lower', sequelize.col('name')),
          { [Op.substring] : req.query.search.toLowerCase() }
        ),
        sequelize.where(
          sequelize.fn('lower', sequelize.col('username')),
          { [Op.substring] : req.query.search.toLowerCase() }
        )
      ]
    }
  }

  where.disabled = false;

  const users = await User.findAll({
    attributes: {
      exclude: ['passwordHash', 'updatedAt']
    },
    where,
    order: [
      ['username', 'ASC']
    ],
    //offset: req.offset,
    //limit: req.limit,
  });

  return res.json(users);
});

router.get('/stats', async (req, res) => {
  const created = await User.count({
    attributes: ['disabled'],
    group: 'disabled',
  });

  return res.status(200).json(created);
});

module.exports = router;