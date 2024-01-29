const testingRouter  = require('express').Router();
const { User, Relation } = require('../models');
const { sequelize } = require('../util/db');
const { getNonSensitiveUser } = require('../util/dto');
const parser = require('../util/parser');

testingRouter.post('/reset', async (req, res) => {
  // create the tables, dropping them first if they already existed
  await sequelize.sync({ force: true });

  return res.status(204).end();
});

/**
 * Route to create disabled users
 */
testingRouter.post('/disabled', async (req, res) => {
  const { name, username, password } = req.body;

  const user = await User.create({
    name, username,

    // beforeCreate hook encodes password so the password can be validated
    passwordHash: password,

    // create diabled user
    disabled: true,
  });

  return res.status(201).send(getNonSensitiveUser(user));
});

// delete all relations
testingRouter.delete('/relations', async (req, res) => {
  // will delete all rows in a table
  await Relation.truncate();

  return res.status(204).send();
});

// create a relation with source and target user usernames
testingRouter.post('/relations', async (req, res) => {
  const type = parser.parseRelationType(req.body.type);

  const sourceUser = await User.findOne({ 
    where: { username: req.body.sourceUserUsername } 
  });

  const targetUser = await User.findOne({ 
    where: { username: req.body.targetUserUsername } 
  });

  const relation = await Relation.create({
    sourceUserId: sourceUser.id,
    targetUserId: targetUser.id,
    type,
  });

  return res.status(201).send(relation);
});

module.exports = testingRouter;