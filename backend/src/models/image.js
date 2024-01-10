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
    allowNull: false,
  },
  size: {
    type: DataTypes.INTEGER,
  },
  title: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  caption: {
    type: DataTypes.TEXT, // text type stores strings of any length
    defaultValue: '',
  },
  privacy: {
    type: DataTypes.ENUM('public', 'private'),
    defaultValue: 'public',
    allowNull: false,
    validate: {
      isIn: {
        args: [['public', 'private']],
        msg: 'image must be public or private'
      },
    },
  },
}, {
  sequelize,
  underscored: true,
  modelName: 'image',
});

module.exports = Image;