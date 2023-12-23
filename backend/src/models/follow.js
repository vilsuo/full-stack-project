const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../util/db');

class Follow extends Model {}

Follow.init({
  /*
  sourceUserId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    references: { model: 'users', key: 'id'}
  },
  targetUserId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    references: { model: 'users', key: 'id'}
  }
  */
}, {
  sequelize,
  underscored: true,
  timestamps: false,
  modelName: 'follow',
});

module.exports = Follow;