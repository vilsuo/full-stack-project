const User = require('./user');
const Image = require('./image');
const Potrait = require('./potrait');
const Relation = require('./relation');

User.hasMany(Image, {
  foreignKey: { allowNull: false }, // Image can not exist without User
  onDelete: 'CASCADE', // when deleting an user, delete also linked images
});
Image.belongsTo(User);

// These will add userId to the potrait table
User.hasOne(Potrait, {
  foreignKey: { allowNull: false }, // Potrait can not exist without User
  onDelete: 'CASCADE', // when deleting an user, delete also linked potraits
});
Potrait.belongsTo(User);

// https://github.com/sequelize/sequelize/issues/6906:
// Creates a 1:m association between this (the source) and the provided target.
// The foreign key is added on the target.
User.hasMany(Relation, {
  foreignKey: { name: 'sourceUserId', allowNull: false },
});

// Creates an association between this (the source) and the provided target.
// The foreign key is added on the source.
Relation.belongsTo(User, {
  as: 'targetUser',
  foreignKey: { name: 'targetUserId', allowNull: false },
  onDelete: 'CASCADE',
});

Relation.belongsTo(User, {
  as: 'sourceUser',
  foreignKey: { name: 'sourceUserId', allowNull: false },
  onDelete: 'CASCADE',
});

// to see follow table
// return res.status(200).send({ relation: Relation.getAttributes() });

module.exports = {
  User,
  Image,
  Potrait,
  Relation,
};
