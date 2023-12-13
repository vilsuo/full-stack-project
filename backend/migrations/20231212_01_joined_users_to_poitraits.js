const { DataTypes } = require('sequelize');

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('potraits', 'user_id', {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    });
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('potraits', 'user_id');
  },
};