const { DataTypes } = require('sequelize');

module.exports = {
  up: async ({ context: queryInterface }) => {
    const transaction = await queryInterface.sequelize.transaction();
  
    try {
      // allow nulls temporarily so we can map all existing entries to type 'follow'
      // without setting a default value to the table
      await queryInterface.addColumn('relations', 'type', 
        {
          type: DataTypes.ENUM('follow', 'block'),
          allowNull: true,
        },
        { transaction }
      );

      await queryInterface.sequelize.query(
        `UPDATE relations
        SET type = :type
        `,
        {
          replacements: { type: 'follow' },
          transaction
        }
      );

      // do not allow nulls
      await queryInterface.changeColumn('relations', 'type', 
        {
          type: DataTypes.ENUM('follow', 'block'),
          allowNull: false,
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
    await queryInterface.removeColumn('relations', 'type');
  }
};