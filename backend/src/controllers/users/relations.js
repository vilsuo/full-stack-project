const router = require('express').Router({ mergeParams: true });
const { RELATION_FOLLOW } = require('../../constants');
const { Relation, User } = require('../../models');
const { privateExtractor, isAllowedToViewUser } = require('../../util/middleware/auth');
const parser = require('../../util/parser');

/**
 * Only authenticated user can query for its own relation types.
 * Other users can only view relation type of {@link RELATION_FOLLOW}.
 * 
 * Also allows querying for target user by id.
 */
router.get('/', isAllowedToViewUser, async (req, res) => {
  const { user, foundUser } = req;
  const { type, targetUserId } = req.query;

  const searchFilters = {};

  // check if user is authenticated and viewing its own relations
  if (user && user.id === foundUser.id) {
    // apply type filter if specified, else return all types
    if (type !== undefined) {
      searchFilters.type = parser.parseRelationType(type);
    }
  } else {
    if (type !== undefined) {
      return res.status(401).send({
        message: 'Query parameter type is not allowed'
      });
    }
    searchFilters.type = RELATION_FOLLOW;
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

/**
 * Only return relations of type {@link RELATION_FOLLOW}.
 * Allows querying for source user by id.
 */
router.get('/reverse', isAllowedToViewUser, async (req, res) => {
  const { foundUser } = req;
  const { sourceUserId, type } = req.query;

  const searchFilters = {};
  if (sourceUserId !== undefined) {
    searchFilters.sourceUserId = parser.parseId(sourceUserId);
  }

  if (type !== undefined) {
    return res.status(401).send({
      message: 'Query parameter type is not allowed'
    });
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
      type: RELATION_FOLLOW,
      ...searchFilters
    }
  });
  return res.send(relations);
});

router.post('/', privateExtractor, async (req, res) => {
  const { user: sourceUser } = req;

  // parse request body
  const type = parser.parseRelationType(req.body.type);
  const targetUserId = parser.parseId(req.body.targetUserId);

  // target user must exist
  const targetUser = await User.findByPk(targetUserId);
  if (!targetUser) {
    return res.status(404).send({ message: 'Target user does not exist' });
  }

  // target user can not be disabled
  if (targetUser.disabled) {
    return res.status(400).send({ message: 'Target user is disabled' });
  }

  // can not create relation to self
  if (sourceUser.id === targetUser.id) {
    return res.status(400).send({
      message: 'User can not have a relation with itself'
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
      message: 'This relation already exists'
    });
  }

  const relation = await Relation.create({
    sourceUserId: sourceUser.id,
    targetUserId: targetUser.id,
    type,
  });

  return res.status(201).send(relation);
});

router.delete('/:relationId', privateExtractor, async (req, res) => {
  const { relationId } = req.params;
  const { user: sourceUser } = req;

  const id = parser.parseId(relationId);

  const nDestroyed = await Relation.destroy({ 
    where: { id, sourceUserId: sourceUser.id } 
  });

  if (!nDestroyed) {
    return res.status(404).send({ message: 'Relation does not exist' });
  }

  return res.status(204).end();
});

module.exports = router;