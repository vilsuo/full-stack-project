const User = require('./user');
const Image = require('./image');
const Potrait = require('./potrait');
const Relation = require('./relation');

User.hasMany(Image, {
  foreignKey: { allowNull: false} , // Image can not exist without User
  onDelete: 'CASCADE',              // when deleting an user, delete also linked images
});
Image.belongsTo(User);

// These will add userId to the potrait table
User.hasOne(Potrait, {
  foreignKey: { allowNull: false} , // Potrait can not exist without User
  onDelete: 'CASCADE',              // when deleting an user, delete also linked potraits
});
Potrait.belongsTo(User);

/*
User.belongsToMany(User, { 
  through: { model: Relation, unique: false },
  as: 'relations',

  // The name of the foreign key in the join table (representing the source model)
  // or an object representing the type definition for the foreign column (see 
  // Sequelize.define for syntax). When using an object, you can add a name property
  // to set the name of the column. Defaults to the name of source + primary key of
  // source
  foreignKey: 'sourceUserId',        

  // The name of the foreign key in the join table (representing the target model) or
  // an object representing the type definition for the other column (see Sequelize.define
  // for syntax). When using an object, you can add a name property to set the name of the
  // column. Defaults to the name of target + primary key of target
  otherKey: 'targetUserId',
});
*/


// https://github.com/sequelize/sequelize/issues/6906:
// Creates a 1:m association between this (the source) and the provided target.
// The foreign key is added on the target.
User.hasMany(Relation, { 
  // The alias of this model. If you provide a string, it should be plural, and
  // will be singularized using node.inflection.

  // If you create multiple associations between the same tables, you should provide
  // an alias to be able to distinguish between them.
  
  // If you provide an alias when creating the association, you should provide the
  // same alias when eager loading and when getting associated models.
  as: 'targets',

  // The name of the foreign key in the target table or an object representing the type
  // definition for the foreign column
  foreignKey: 'targetUserId' 
});
User.hasMany(Relation, {
  as: 'sources', 
  foreignKey: 'sourceUserId'
});

// Creates an association between this (the source) and the provided target.
// The foreign key is added on the source.
Relation.belongsTo(User, { as: 'sources', foreignKey: 'sourceUserId'});
Relation.belongsTo(User, { as: 'targets', foreignKey: 'targetUserId'});

// to see follow table
// return res.status(200).send({ relation: Relation.getAttributes() });

module.exports = {
  User,
  Image,
  Potrait,
  Relation,
};