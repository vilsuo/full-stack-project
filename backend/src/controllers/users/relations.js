const router = require('express').Router({ mergeParams: true });

const { Relation, User } = require('../../models');
const { isSessionUser } = require('../../util/middleware/auth');

/*
TODO
- add optional query param to filter relation type
- how to group?
*/
router.get('/', async (req, res) => {
  const user = req.foundUser;

  // return res.status(200).send({ relation: Relation.getAttributes() });

  /*
  const results = await sequelize.query(
    `SELECT ut.id as id, ut.username as username, r.type as type
    FROM Users us 
    JOIN Relations r ON r.source_user_id = us.id 
    JOIN Users ut ON r.target_user_id = ut.id;`,
    { type: QueryTypes.SELECT }
  );

  return res.send({ results });
  */

  try {
    const userWithRelationTargets = await User.findByPk(user.id, {
      attributes: ['id', 'username'],
      include: [
        {
          model: Relation, 
          as: 'sources', 
          attributes: ['id', 'type'],
          include: [
            {
              model: User, 
              as: 'targets',
            }
          ]
        }
      ]
    });

    return res.send(userWithRelationTargets);

  } catch (err) {
    console.log('err', err)

    return res.status(500).send({ err })
  }
});

/*
TODO
- need to check that relation type is valid before checking if it exists
*/
router.post('/', isSessionUser, async (req, res) => {
  const sourceUser = req.user;
  const { id: targetId, type } = req.body;

  // target user must exist
  const targetUser = await User.findByPk(targetId);
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

/*
TODO
- pass id OR username of the target user?
- how to pass type and id?
  - parameter? query? body? or mix?
*/
router.delete('/', isSessionUser, async (req, res) => {
  const sourceUser = req.user;
  const { id: targetUserId, type } = req.body;

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