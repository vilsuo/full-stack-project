const router = require('express').Router({ mergeParams: true });

const { Relation, User } = require('../../models');
const { isSessionUser } = require('../../util/middleware/auth');
const { parseId, parseRelationType } = require('../../util/middleware/parser');

/*
TODO
- parsers for GET-methods
- combine EnumError and ParameterError to more general Error type.
*/

/*
router.get('/', async (req, res) => {
  const user = req.foundUser;

  const searchFilters = {};
  const { type, targetUserId } = req.query;
  if (type) {
    searchFilters.type = parseRelationType(type);
  }
  if (targetUserId) {
    searchFilters.targetUserId = parseParamId(targetUserId);
  }

  const relations = await Relation.findAll({
    where: { 
      sourceUserId: user.id,
      ...searchFilters
    }
  });
  return res.send(relations);

  //const userWithRelationTargets = await User.findByPk(user.id, {
  //  attributes: ['id', 'username'],
  //  include: [
  //    {
  //      model: Relation, 
  //      attributes: ['id', 'type'],
  //      include: [
  //        {
  //          model: User, 
  //          as: 'targetUser',
  //          attributes: ['id', 'username'],
  //        }
  //      ],
  //      where: searchFilters,
  //    }
  //  ]
  //});
  //
  //return res.send(userWithRelationTargets);
});

router.get('/reverse', async (req, res) => {
  const user = req.foundUser;

  const searchFilters = {};
  const { type, sourceUserId } = req.query;
  if (type) {
    if (!isValidRelationType(type)) {
      return res.status(400).send({ message: 'invalid relation type' });
    }
    searchFilters.type = type;
  }

  if (sourceUserId) {
    searchFilters.sourceUserId = parseParamId(sourceUserId);
  }

  const relations = await Relation.findAll({
    where: { 
      targetUserId: user.id,
      ...searchFilters
    }
  });
  return res.send(relations);
});
*/

router.post('/', isSessionUser, async (req, res) => {
  const sourceUser = req.user;

  // parse request body
  const type = parseRelationType(req.body.type);
  const targetUserId = parseId(req.body.targetUserId, 'targetUserId');

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

  const id = parseId(relationId, 'relationId');

  const nDestroyed = await Relation.destroy({ 
    where: { id, sourceUserId: sourceUser.id } 
  });

  if (!nDestroyed) {
    return res.status(404).send({ message: 'relation does not exist' });
  }

  return res.status(204).end();
});

module.exports = router;