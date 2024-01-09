const router = require('express').Router();
const { Op } = require('sequelize');
const imagesRouter = require('./images');
const potraitRouter = require('./potrait');
const relationsRouter = require('./relations');
const { sequelize } = require('../../util/db');
const { User } = require('../../models');
const { getNonSensitiveUser } = require('../../util/dto');
const { userFinder } = require('../../util/middleware/finder');
const { isSessionUser } = require('../../util/middleware/auth');
const { paginationParser } = require('../../util/middleware/parser');
const fileStorage = require('../../util/file-storage'); // importing this way makes it possible to mock 'removeFile'
const { cookieKey } = require('../../constants');

const getUserSearchFilter = (columnName, query) => {
  return sequelize.where(
    sequelize.fn('lower', sequelize.col(columnName)),
    { [Op.substring] : query.toLowerCase() }
  );
};

/**
 * Implements searching based on user name and username. 
 * Does not return disabled users. Response is paginated, 
 * see {@link paginationParser}.
 */
router.get('/', paginationParser, async (req, res) => {
  const searchFilters = { disabled: false };

  const { q: query } = req.query;

  if (typeof query === 'string') {
    searchFilters[Op.or] = [
      getUserSearchFilter('name', query),
      getUserSearchFilter('username', query)
    ];
  }

  const { pageNumber, pageSize } = req;

  const { count, rows } = await User.findAndCountAll({
    where: searchFilters,
    
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

router.delete('/:username', userFinder, isSessionUser, async (req, res, next) => {
  const user = req.foundUser;

  await fileStorage.removeUserFiles(user.id);

  await user.destroy();

  return req.session.destroy((error) => {
    if (error) return next(error);

    return res
      .clearCookie(cookieKey)
      .status(204)
      .send();
  });
});

router.use('/:username/potrait', userFinder, potraitRouter);

router.use('/:username/images', userFinder, imagesRouter);

router.use('/:username/relations', userFinder, relationsRouter);

module.exports = router;