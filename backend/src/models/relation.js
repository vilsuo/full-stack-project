const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../util/db');
const { RELATION_TYPES } = require('../constants');

class Relation extends Model {}

Relation.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  type: {
    type: DataTypes.ENUM(...RELATION_TYPES),
    allowNull: false,
    validate: {
      isIn: {
        args: [RELATION_TYPES],
        msg: `Type must be one of [${RELATION_TYPES.join('|')}]`,
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
