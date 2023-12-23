const { Follow, User } = require('../../models');
const { isSessionUser, sessionExtractor } = require('../../util/middleware/auth');

const router = require('express').Router({ mergeParams: true });

/*
TODO
- how to pass target user?
  - post: has to be valited that the user exists
    - can follow disabled user?
  - delete: without validation

- get: do not return user
*/

router.get('/', async (req, res) => {
  const user = req.foundUser;

  const follows = await User.findByPk(user.id, {
    include: [{
      model: User,
      as: 'follows',
      duplicating: false,
      attributes: { exclude: ['follows'] },
      through: {
        attributes: [], // has to be included: otherwise causes nested including
      },
    }]
  });

  return res.send({ follows });
});

router.post('/', sessionExtractor, /* isSessionUser ,*/ async (req, res) => {
  const source = req.user;
  const target = req.foundUser;

  // return res.status(200).send({ follow: Follow.getAttributes() });

  const follow = await Follow.create({
    sourceUserId: source.id,
    targetUserId: target.id
  });

  return res.status(201).send({ follow });
});

router.delete('/', isSessionUser, async (req, res) => {
  const source = req.user;
  const target = req.foundUser;

  await Follow.destroy({ where: { sourceUserId: source.id, targetUserId: target.id } });

  return res.status(204).end();
});

module.exports = router;