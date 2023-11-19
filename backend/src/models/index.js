const User = require('./user');
const Image = require('./image');

User.hasMany(Image);
Image.belongsTo(User);

module.exports = {
  User,
  Image,
};