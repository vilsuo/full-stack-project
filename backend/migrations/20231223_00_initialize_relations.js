const { DataTypes } = require('sequelize');

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.createTable('relations', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      type: {
        type: DataTypes.ENUM('follow', 'block'),
        allowNull: false,
      },
      source_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        onDelete: 'CASCADE',
        references: { model: 'users', key: 'id'},
      },
      target_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        onDelete: 'CASCADE',
        references: { model: 'users', key: 'id'}
      }
    });
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.dropTable('relations');
  }
};