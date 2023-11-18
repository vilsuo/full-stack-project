const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../util/db');

class Image extends Model {}

/*
TODO
  - add key to owner
*/

Image.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  filepath: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  mimetype: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  size: {
    type: DataTypes.INTEGER,
  },
  title: {
    type: DataTypes.STRING,
  },
  caption: {
    type: DataTypes.STRING,
  },
  private: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  sequelize,
  underscored: true,
  modelName: 'image',
});

module.exports = Image;