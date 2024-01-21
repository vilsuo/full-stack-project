const router = require('express').Router({ mergeParams: true });
const { Relation, User } = require('../../models');
const { isSessionUser, isAllowedToViewUser } = require('../../util/middleware/auth');
const parser = require('../../util/parser');

/*
TODO
- get forward route:  
  - return all types of relations only to the sourceUser, else return just follows
  - remove query parameters for other than sourceUser
  
- get reverse route:
  - return only relations of type 'follow'
  - remove query parameters

- post route:
  - check if target user is disabled
*/

router.get('/', isAllowedToViewUser, async (req, res) => {
  const { foundUser } = req;
  const { type, targetUserId } = req.query;

  const searchFilters = {};
  if (type !== undefined) {
    searchFilters.type = parser.parseRelationType(type);
  }
  if (targetUserId !== undefined) {
    searchFilters.targetUserId = parser.parseId(targetUserId);
  }

  const relations = await Relation.findAll({
    include: { 
      model: User, as: 'targetUser',
      attributes: ['id', 'username']
    },
    order: [
      [{ model: User, as:'targetUser' }, 'username', 'ASC']
    ],
    where: { 
      sourceUserId: foundUser.id,
      ...searchFilters
    }
  });
  return res.send(relations);
});

router.get('/reverse', isAllowedToViewUser, async (req, res) => {
  const { foundUser } = req;
  const { type, sourceUserId } = req.query;

  const searchFilters = {};
  if (type !== undefined) {
    searchFilters.type = parser.parseRelationType(type);
  }
  if (sourceUserId !== undefined) {
    searchFilters.sourceUserId = parser.parseId(sourceUserId);
  }

  const relations = await Relation.findAll({
    include: { 
      model: User, as: 'sourceUser',
      attributes: ['id', 'username']
    },
    order: [
      [{ model: User, as:'sourceUser' }, 'username', 'ASC']
    ],
    where: { 
      targetUserId: foundUser.id,
      ...searchFilters
    }
  });
  return res.send(relations);
});

router.post('/', isSessionUser, async (req, res) => {
  const { user: sourceUser } = req;

  // parse request body
  const type = parser.parseRelationType(req.body.type);
  const targetUserId = parser.parseId(req.body.targetUserId);

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
  const { user: sourceUser } = req;

  const id = parser.parseId(relationId);

  const nDestroyed = await Relation.destroy({ 
    where: { id, sourceUserId: sourceUser.id } 
  });

  if (!nDestroyed) {
    return res.status(404).send({ message: 'relation does not exist' });
  }

  return res.status(204).end();
});

module.exports = router;