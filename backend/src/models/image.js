const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../util/db');
const { IMAGE_PRIVACIES, IMAGE_PUBLIC } = require('../constants');

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
    type: DataTypes.ENUM(...IMAGE_PRIVACIES),
    defaultValue: IMAGE_PUBLIC,
    allowNull: false,
    validate: {
      isIn: {
        args: [IMAGE_PRIVACIES],
        msg: `image privacy must be one of [${IMAGE_PRIVACIES.join('|')}]`
      },
    },
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  editedAt: {
    type: DataTypes.DATE,
    defaultValue: null,
    allowNull: true,
  }
}, {
  sequelize,
  underscored: true,
  updatedAt: false,
  modelName: 'image',
});

module.exports = Image;