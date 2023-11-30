const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../util/db');

class Image extends Model {};

Image.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  originalname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  filepath: {
    type: DataTypes.STRING,
  },
  mimetype: {
    type: DataTypes.STRING,
  },
  size: {
    type: DataTypes.INTEGER,
  },
  title: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  caption: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  private: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  /*
  privacy: {
    type: DataTypes.ENUM('public, private'),
    defaultValue: 'public',
    allowNull: false,
  },
  */
}, {
  sequelize,
  underscored: true,
  modelName: 'image',
});

module.exports = Image;