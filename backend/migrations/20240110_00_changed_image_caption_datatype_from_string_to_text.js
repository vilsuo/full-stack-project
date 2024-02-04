const { DataTypes } = require('sequelize');

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.changeColumn(
      'images',
      'caption',
      {
        type: DataTypes.TEXT,
        defaultValue: '',
      },
    );
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.changeColumn(
      'images',
      'caption',
      {
        type: DataTypes.STRING,
        defaultValue: '',
      },
    );
  },
};
