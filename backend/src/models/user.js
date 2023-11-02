const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../util/db');

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
    notEmpty: {
      msg: "name can not be empty"
    },
  },
 },
 username: {
  type: DataTypes.STRING,
  allowNull: false,
  unique: true,
  validate: {
    notEmpty: {
      msg: "username can not be empty"
    }
  },
 },
 passwordHash: {
  type: DataTypes.STRING,
  allowNull: false,
  validate: {
    notEmpty: true
  },
 },
 disabled: {
  type: DataTypes.BOOLEAN,
  defaultValue: false,
 },
}, {
  sequelize,
  underscored: true,
  modelName: 'user',
});

module.exports = User;