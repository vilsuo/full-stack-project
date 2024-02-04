const bcrypt = require('bcrypt');

const encodePassword = async (plainTextPassword) => {
  const saltRounds = 10;
  return bcrypt.hash(plainTextPassword, saltRounds);
};

const comparePassword = async (password, passwordHash) => bcrypt
  .compare(password, passwordHash);

module.exports = {
  encodePassword,
  comparePassword,
};
