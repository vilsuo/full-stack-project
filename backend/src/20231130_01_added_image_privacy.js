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
      await queryInterface.addColumn('images', 'privacy',
        {
          type: DataTypes.ENUM('public', 'private'),
          defaultValue: 'public',
          allowNull: false,
        },
        { transaction }
      );

      await queryInterface.sequelize.query(
        `UPDATE images 
        SET privacy = :privacy 
        WHERE private IS :private;`,
        { 
          replacements: { privacy: 'private', private: true },
          transaction, 
        },
      );

      //await queryInterface.removeColumn('images', 'private', { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('images', 'privacy');
    /*
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn('images', 'private',
        {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        { transaction }
      );

      await queryInterface.sequelize.query(
        `UPDATE images 
        SET private = :private 
        WHERE privacy = :privacy;`,
        { 
          replacements: { privacy: 'private', private: true },
          transaction,
        },
      );

      await queryInterface.removeColumn('images', 'privacy', { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
    */
  },
};