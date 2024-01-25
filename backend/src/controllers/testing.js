const testingRouter  = require('express').Router();
const { sequelize } = require('../util/db');

testingRouter.post('/reset', async (req, res) => {
  // create the tables, dropping them first if they already existed
  await sequelize.sync({ force: true });

  return res.status(204).end();
});

module.exports = testingRouter;