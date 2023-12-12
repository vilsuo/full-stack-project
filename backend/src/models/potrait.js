const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../util/db');

class Potrait extends Model {};

Potrait.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  filepath: {
    type: DataTypes.STRING,
  },
  mimetype: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  size: {
    type: DataTypes.INTEGER,
  },
}, {
  sequelize,
  underscored: true,
  modelName: 'potrait',
});

module.exports = Potrait;