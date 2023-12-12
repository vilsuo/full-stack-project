const User = require('./user');
const Image = require('./image');
const Potrait = require('./potrait');

User.hasMany(Image);
Image.belongsTo(User);

// User.hasOne(Potrait);
Potrait.belongsTo(User); // This will add userId to the potrait table

module.exports = {
  User,
  Image,
  Potrait,
};