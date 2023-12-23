const router = require('express').Router({ mergeParams: true });

const { Relation, User, Image } = require('../../models');
const { isSessionUser } = require('../../util/middleware/auth');
const { getNonSensitiveUser } = require('../../util/dto');
const { sequelize } = require('../../util/db');

/*
TODO
- add optional query param to filter relation type
- group by relation type?
*/
router.get('/', async (req, res) => {
  const user = req.foundUser;

  return res.status(200).send({ relation: Relation.getAttributes() });

  try {
    const userWithRelationTargets = await User.findByPk(user.id, {
      attributes: [
        'id',
        'username',
      ],
      //includeIgnoreAttributes: false,
      include: [{
        model: User,
        as: 'relations',
        attributes: [
          'id', 
          'username',
          //'relation.type'
        ],
        through: {
          //where: { type: 'follow' },
          attributes: ['type'],
          //group: 'type'
        },
      }],
      //group: 'relations.relation.type'
    });

    //const follows = userWithRelationTargets.relations
    //.map(target => getNonSensitiveUser(target));

    return res.send(userWithRelationTargets);

  } catch (err) {
    console.log('err', err)
    return res.status(500).send({ err })
  }
});

router.post('/', isSessionUser, async (req, res) => {
  const sourceUser = req.user;
  const { id: targetId, type } = req.body;

  // target user must exist
  const targetUser = await User.findByPk(targetId);
  if (!targetUser) {
    return res.status(404).send({ message: 'user does not exist' });
  }

  // target user can not be the source user
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

router.delete('/:id', isSessionUser, async (req, res) => {
  const sourceUser = req.user;
  const { id: targetUserId, type } = req.params;

  await Relation.destroy({ 
    where: { 
      sourceUserId: sourceUser.id, 
      targetUserId,
      type,
    }
  });

  return res.status(204).end();
});

module.exports = router;