const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../util/db');

class Relation extends Model {}

Relation.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  type: {
    type: DataTypes.ENUM('follow', 'block'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['follow', 'block']],
        msg: 'relation type must be follow or block'
      },
    },
  },
}, {
  sequelize,
  underscored: true,
  timestamps: false,
  modelName: 'relation',
});

module.exports = Relation;