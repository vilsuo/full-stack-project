const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../util/db');
const passwordService = require('../util/password');

class User extends Model {}

User.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: 'name can not be null' },
      notEmpty: { msg: 'name can not be empty' }, // remove?
      len: {
        args: [2, 30],
        msg: 'name must be 2-30 characters long'
      }
    },
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      args: true,
      msg: 'username has already been taken',
    },
    validate: {
      notNull: { msg: 'username can not be null' },
      notEmpty: { msg: 'username can not be empty' }, // remove?
      len: {
        args: [2, 30],
        msg: 'username must be 2-30 characters long'
      }
    },
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: 'password can not be null' },
      notEmpty: { msg: 'password can not be empty' }, // remove?
      len: {
        args: [8, 30],
        msg: 'password must be 8-30 characters long'
      }
    },
  },
  disabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  hooks: {
    beforeCreate: async (user) => {
      const rawPassword = user.passwordHash;
      user.passwordHash = await passwordService.encodePassword(rawPassword);
    },
  },
  sequelize,
  underscored: true,
  modelName: 'user',
});

module.exports = User;