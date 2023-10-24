const User = require('./user');

// This creates the table if it doesn't exist
User.sync();

module.exports = {
  User,
};