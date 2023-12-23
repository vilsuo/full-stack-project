const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../util/db');

class Relation extends Model {}

Relation.init({
  type: {
    type: DataTypes.ENUM('follow', 'block'),
    primaryKey: true,
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