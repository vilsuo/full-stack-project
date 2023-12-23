const { DataTypes } = require('sequelize');

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.createTable('follows', {
      source_user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        onDelete: 'CASCADE',
        references: { model: 'users', key: 'id'},
      },
      target_user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        onDelete: 'CASCADE',
        references: { model: 'users', key: 'id'}
      }
    });
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.dropTable('follows');
  }
};