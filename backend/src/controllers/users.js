const router = require('express').Router();
const { Op } = require('sequelize');
const { sequelize } = require('../util/db');
const { User } = require('../models');
const { isAuthenticated } = require('../util/middleware');

/**
 * supported query parameters:
 * - search: case insensitive name and username substring search
 * - page
 */
router.get('/', async (req, res) => {
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

  let offset;
  const pageSize = 3;
  if (req.query.page) {
    const pageNumber = Number(req.query.page);
    if (isNaN(pageNumber) || pageNumber < 0) {
      return res.status(400).send(
        { message: 'invalid query parameter "page"' }
      );
    }
    offset = pageSize * Number(req.query.page);
  };

  const users = await User.findAll({
    attributes: {
      exclude: ['passwordHash', 'updatedAt']
    },
    where,
    order: [
      ['username', 'ASC']
    ],
    offset: offset,
    limit: pageSize,
  });

  return res.json(users);

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