const { DataTypes } = require('sequelize');

module.exports = {
  up: async ({ context: queryInterface }) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn('users', 'image_id', 
        {
          type: DataTypes.INTEGER,
          references: { model: 'images', key: 'id' },
        },
        { transaction }
      );

      await queryInterface.addConstraint('users',
        {
          fields: ['image_id'], // field name of the foreign key
          type: 'foreign key',
          name: 'profile_picture_fkey_constraint',  // Name of the constraint
          references: {       // Required field
            table: 'images',  // Target table name
            field: 'id'       // Target column name
          },
          transaction,
        },
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
      await queryInterface.removeConstraint('users', 'profile_picture_fkey_constraint', {
        transaction
      });

      await queryInterface.removeColumn('users', 'image_id', { transaction });

      await transaction.commit();

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};