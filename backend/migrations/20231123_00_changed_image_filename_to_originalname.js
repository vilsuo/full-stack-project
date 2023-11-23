const { DataTypes } = require('sequelize');

module.exports = {
  up: async ({ context: queryInterface }) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.renameColumn(
        'images', 
        'filename', 
        'originalname', 
        { transaction },
      );

      await queryInterface.changeColumn(
        'images', 
        'originalname',
        { 
          type: DataTypes.STRING,
          allowNull: false 
        },
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
  down: async ({ context: queryInterface }) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.changeColumn(
        'images', 
        'originalname',
        {
          type: DataTypes.STRING,
          allowNull: true
        },
        { transaction },
      );

      await queryInterface.renameColumn(
        'images',
        'originalname',
        'filename',
        { transaction },
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}