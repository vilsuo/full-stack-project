const router = require('express').Router({ mergeParams: true });

const { Follow, User } = require('../../models');
const { isSessionUser } = require('../../util/middleware/auth');
const { getNonSensitiveUser } = require('../../util/dto');

router.get('/', async (req, res) => {
  const user = req.foundUser;

  const userWithFollowTargets = await User.findByPk(user.id, {
    include: [{
      model: User,
      as: 'follows',
      attributes: { exclude: ['follows'] },
      through: {
        attributes: [], // has to be included: otherwise causes nested including
      },
    }]
  });

  const follows = userWithFollowTargets.follows
    .map(target => getNonSensitiveUser(target));

  return res.send(follows);
});

router.post('/', isSessionUser, async (req, res) => {
  const sourceUser = req.user;
  const { id: targetId } = req.body;

  // target user must exist
  const targetUser = await User.findByPk(targetId);
  if (!targetUser) {
    return res.status(404).send({ message: 'user does not exist' });
  }

  // target user can not be the source user
  if (sourceUser.id === targetUser.id) {
    return res.status(400).send({ message: 'you can not follow yourself' });
  }

  // relation must not already exist
  const followFound = await Follow.findOne({
    where: {
      sourceUserId: sourceUser.id,
      targetUserId: targetUser.id,
    }
  });

  if (followFound) {
    return res.status(400).send({ message: 'you are already following the user' });
  }

  const follow = await Follow.create({
    sourceUserId: sourceUser.id,
    targetUserId: targetUser.id,
  });

  return res.status(201).send({ follow });
});

router.delete('/:id', isSessionUser, async (req, res) => {
  const sourceUser = req.user;
  const { id: targetUserId } = req.params;

  await Follow.destroy({ where: { sourceUserId: sourceUser.id, targetUserId } });

  return res.status(204).end();
});

module.exports = router;