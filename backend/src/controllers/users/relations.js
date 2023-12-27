const router = require('express').Router({ mergeParams: true });

const { Relation, User } = require('../../models');
const { EnumError } = require('../../util/error');
const { isSessionUser } = require('../../util/middleware/auth');

/*
TODO
- post:
  - what target user values to return?
    - all non sensitive?
    - just id AND/OR username?
*/

const isValidRelationType = type => {
  const relationTypes = Relation.getAttributes().type.values;

  return relationTypes.includes(type);
};

router.get('/', async (req, res) => {
  const user = req.foundUser;

  const searchFilters = {};
  const { type, targetUserId } = req.query;
  if (type) {
    if (!isValidRelationType(type)) {
      throw new EnumError(`invalid relation type '${type}'`);
    }
    searchFilters.type = type;
  }
  if (targetUserId) {
    searchFilters.targetUserId = targetUserId;
  }

  const relations = await Relation.findAll({
    //attributes: { exclude: ['sourceUserId'] },
    where: { 
      sourceUserId: user.id,
      ...searchFilters
    }
  });
  return res.send(relations);

  /*
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
  */
});

router.post('/', isSessionUser, async (req, res) => {
  const sourceUser = req.user;
  const { targetUserId, type } = req.body;

  if (!type || !isValidRelationType(type)) {
    throw new EnumError(`invalid relation type '${type}'`);
  }

  // target user must exist
  const targetUser = await User.findByPk(targetUserId);
  if (!targetUser) {
    return res.status(404).send({ message: 'target user does not exist' });
  }

  // can not create relation to self
  if (sourceUser.id === targetUser.id) {
    return res.status(400).send({
      message: 'user can not have a relation with itself'
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
      message: `relation with type '${type}' already exists` 
    });
  }

  const relation = await Relation.create({
    sourceUserId: sourceUser.id,
    targetUserId: targetUser.id,
    type,
  });

  return res.status(201).send(relation);
});

router.delete('/:relationId', isSessionUser, async (req, res) => {
  const { relationId } = req.params;
  const sourceUser = req.user;

  const nDestroyed = await Relation.destroy({ 
    where: { 
      id: relationId, 
      sourceUserId: sourceUser.id,
    } 
  });

  if (!nDestroyed) {
    return res.status(404).send({ message: 'relation does not exist' });
  }

  return res.status(204).end();
});

module.exports = router;