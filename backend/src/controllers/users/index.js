const router = require('express').Router();
const { Op } = require('sequelize');
const imagesRouter = require('./images');
const potraitRouter = require('./potrait');
const followsRouter = require('./follows');
const { sequelize } = require('../../util/db');
const { User, Follow } = require('../../models');
const { getNonSensitiveUser } = require('../../util/dto');
const { userFinder } = require('../../util/middleware/finder');
const { isSessionUser, sessionExtractor } = require('../../util/middleware/auth');
const { paginationParser } = require('../../util/middleware/parser');

/**
 * Implements searching based on user name and username. 
 * Does not return disabled users. Response is paginated, 
 * see {@link paginationParser}.
 */
router.get('/', paginationParser, async (req, res) => {
  const searchFilters = {};

  const { q: search } = req.query;

  if (search) {
    searchFilters[Op.or] = [
      sequelize.where(
        sequelize.fn('lower', sequelize.col('name')),
        { [Op.substring] : search.toLowerCase() }
      ),
      sequelize.where(
        sequelize.fn('lower', sequelize.col('username')),
        { [Op.substring] : search.toLowerCase() }
      ),
    ];
  }

  const { pageNumber, pageSize } = req;

  const { count, rows } = await User.findAndCountAll({
    where: { ...searchFilters, disabled: false },
    // descending: from largest to smallest
    order: [['createdAt', 'DESC']],
    // pagination
    offset: pageSize * pageNumber,
    limit: pageSize,
  });

  const users = rows.map(user => getNonSensitiveUser(user));

  // total number of pages: the available pages number are [0, pages)
  const pages = Math.ceil(count / pageSize);
  
  return res.send({ users, page: pageNumber, pages, count });
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

/*
router.post('/:username/follow', userFinder, sessionExtractor, async (req, res) => {
  const source = req.user;
  const target = req.foundUser;

  // return res.status(200).send({ follow: Follow.getAttributes() });

  const follow = await Follow.create({
    sourceUserId: source.id,
    targetUserId: target.id
  });

  return res.status(201).send({ follow });
});

router.delete('/:username/follow', userFinder, sessionExtractor, async (req, res) => {
  const source = req.user;
  const target = req.foundUser;

  await Follow.destroy({ where: { sourceUserId: source.id, targetUserId: target.id } });

  return res.status(204).end();
});
*/

router.use('/:username/potrait', userFinder, potraitRouter);

router.use('/:username/images', userFinder, imagesRouter);

router.use('/:username/follows', userFinder, followsRouter);

module.exports = router;