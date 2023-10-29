const { DataTypes } = require('sequelize');

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.createTable('users', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
       },
       name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
       },
       username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true
        }
       },
       password_hash: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
       },
    });
  },
  down: async ({ context: queryInterface}) => {
    await queryInterface.dropTable('users');
  },
};