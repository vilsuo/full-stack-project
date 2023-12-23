const User = require('./user');
const Image = require('./image');
const Potrait = require('./potrait');
const Follow = require('./follow');

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

User.belongsToMany(User, { 
  through: Follow, 
  as: 'follows',

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

//Follow.belongsTo(User, { as: 'sourceUser', onDelete: 'CASCADE'});
//Follow.belongsTo(User, { as: 'targetUser', onDelete: 'CASCADE' });

module.exports = {
  User,
  Image,
  Potrait,
  Follow,
};