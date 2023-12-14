const User = require('./user');
const Image = require('./image');
const Potrait = require('./potrait');

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

module.exports = {
  User,
  Image,
  Potrait,
};