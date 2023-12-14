module.exports = {
  up: async ({ context: queryInterface }) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeConstraint(
        'images',
        'images_user_id_fkey',
        { transaction },
      );

      await queryInterface.addConstraint('images', {
        fields: ['user_id'],
        type: 'foreign key',
        name: 'images_user_id_fkey',
        references: {
          table: 'users',
          field: 'id',
        },
        onDelete: 'CASCADE',
        transaction
      });

      await transaction.commit();

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
  down: async ({ context: queryInterface }) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeConstraint(
        'images',
        'images_user_id_fkey',
        { transaction }
      );

      await queryInterface.addConstraint('images', {
        fields: ['user_id'],
        type: 'foreign key',
        name: 'images_user_id_fkey',
        references: {
          table: 'users',
          field: 'id',
        },
        transaction
      });

      await transaction.commit();

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};