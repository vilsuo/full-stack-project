const router = require('express').Router();

const { User, Image, Potrait, Relation } = require('../models');

const getUserCounts = async () => {
  const users = await User.count({
    attributes: ['disabled'],
    group: 'disabled',
  });

  const userCounts = Object.assign(
    {}, 
    ...users.map(
      ({ disabled, count }) => {
        const key = disabled ? 'disabled' : 'active';
        return ({ [key]: count });
      }
    )
  );

  return { 'disabled': 0, 'active': 0, ...userCounts };
};

const getImageCounts = async () => {
  const images = await Image.count({
    attributes: ['privacy'],
    group: 'privacy',
  });

  const imageCounts = Object.assign(
    {}, ...images.map(({ privacy, count }) => ({ [privacy]: count }))
  );

  const defaultImageCounts = Object.assign(
    {}, ...Image.getAttributes().privacy.values.map(privacy => ({ [privacy]: 0 }))
  );

  return { ...defaultImageCounts, ...imageCounts };
};

const getRelationCounts = async () => {
  const relations = await Relation.count({
    attributes: ['type'],
    group: 'type',
  });

  const relationCounts = Object.assign(
    {}, ...relations.map(({ type, count }) => ({ [type]: count }))
  );

  const defaultRelationCounts = Object.assign(
    {}, ...Relation.getAttributes().type.values.map(type => ({ [type]: 0 }))
  );

  return { ...defaultRelationCounts, ...relationCounts };
};

router.get('/count', async (req, res) => {
  const users = await getUserCounts();
  const images = await getImageCounts();
  const potraits = await Potrait.count();
  const relations = await getRelationCounts();

  return res.status(200).json({ users, images, potraits, relations });
});

module.exports = router;