const { DataTypes } = require('sequelize');

/*
Postgres bug
- have to add 'type' to change column even when not changing it, see:
https://stackoverflow.com/questions/62667269/sequelize-js-how-do-we-change-column-type-in-migration
*/
module.exports = {
  up: async ({ context: queryInterface }) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.changeColumn('images', 'title', 
        { 
          type: DataTypes.STRING,
          defaultValue: '',
        },
        { transaction },
      );

      await queryInterface.changeColumn('images', 'caption',
        { 
          type: DataTypes.STRING,
          defaultValue: '',
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
      await queryInterface.changeColumn('images', 'title', 
        { type: DataTypes.STRING },
        { transaction },
      );

      await queryInterface.changeColumn('images', 'caption',
        { type: DataTypes.STRING },
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};