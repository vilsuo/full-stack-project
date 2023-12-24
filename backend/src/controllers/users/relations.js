const router = require('express').Router({ mergeParams: true });

const { Relation, User } = require('../../models');
const { isSessionUser } = require('../../util/middleware/auth');

/*
TODO
- check passed relation type before
  - get: applying search filter
  - post: checking if a relation with the type exists
*/
router.get('/', async (req, res) => {
  const user = req.foundUser;

  const searchFilters = {};
  const { type } = req.query;
  if (type) {
    searchFilters.type = type;
  }

  const userWithRelationTargets = await User.findByPk(user.id, {
    attributes: ['id', 'username'],
    include: [
      {
        model: Relation, 
        attributes: ['id', 'type'],
        include: [
          {
            model: User, 
            as: 'targetUser',
            attributes: ['id', 'username'],
          }
        ],
        where: searchFilters,
      }
    ]
  });

  return res.send(userWithRelationTargets);
});

router.post('/', isSessionUser, async (req, res) => {
  const sourceUser = req.user;
  const { targetUserId, type } = req.body;

  // target user must exist
  const targetUser = await User.findByPk(targetUserId);
  if (!targetUser) {
    return res.status(404).send({ message: 'user does not exist' });
  }

  // can not create relation to self
  if (sourceUser.id === targetUser.id) {
    return res.status(400).send({
      message: 'you can not have a relation with yourself'
    });
  }

  // relation must not already exist
  const relationFound = await Relation.findOne({
    where: {
      sourceUserId: sourceUser.id,
      targetUserId: targetUser.id,
      type,
    }
  });

  if (relationFound) {
    return res.status(400).send({ 
      message: `you are already have a relation '${type}' with the user` 
    });
  }

  const relation = await Relation.create({
    sourceUserId: sourceUser.id,
    targetUserId: targetUser.id,
    type,
  });

  return res.status(201).send({ relation });
});

router.delete('/:relationId', isSessionUser, async (req, res) => {
  const { relationId } = req.params;
  const nDetroyed = await Relation.destroy({ where: { id: relationId, } });

  if (!nDetroyed) {
    return res.status(404).send({ message: 'relation does not exist' });
  }

  return res.status(204).end();
});

module.exports = router;