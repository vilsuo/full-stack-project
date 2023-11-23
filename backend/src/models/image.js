const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../util/db');

class Image extends Model {}

/*
TODO
  - add column original filename
*/

Image.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  filename: {
    type: DataTypes.STRING,
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