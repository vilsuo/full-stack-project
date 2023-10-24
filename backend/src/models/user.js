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
    notEmpty: true
  }
 },
 username: {
  type: DataTypes.STRING,
  allowNull: false,
  unique: true,
  validate: {
    notEmpty: true
  }
 },
 passwordHash: {
  type: DataTypes.STRING,
  allowNull: false,
  validate: {
    notEmpty: true
  }
 },
}, {
  sequelize,
  underscored: true,
  modelName: 'user',
});

module.exports = User;