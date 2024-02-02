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
      notNull: { msg: 'Name can not be null' },
      len: {
        args: [2, 30],
        msg: 'Name must be 2-30 characters long'
      }
    },
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      args: true,
      msg: 'Username has already been taken',
    },
    validate: {
      notNull: { msg: 'Username can not be null' },
      len: {
        args: [2, 30],
        msg: 'Username must be 2-30 characters long'
      }
    },
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: 'Password can not be null' },
      len: {
        args: [8, 30],
        msg: 'Password must be 8-30 characters long'
      }
    },
  },
  disabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  admin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
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