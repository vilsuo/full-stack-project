
module.exports = {
  up: async ({ context: queryInterface }) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // source
      await queryInterface.removeConstraint(
        'relations',
        'follows_source_user_id_fkey',
        { transaction },
      );

      await queryInterface.addConstraint('relations', {
        fields: ['source_user_id'],
        type: 'foreign key',
        name: 'relations_source_user_id_fkey',
        references: {
          table: 'users',
          field: 'id',
        },
        onDelete: 'CASCADE',
        transaction
      });

      // target
      await queryInterface.removeConstraint(
        'relations',
        'follows_target_user_id_fkey',
        { transaction },
      );

      await queryInterface.addConstraint('relations', {
        fields: ['target_user_id'],
        type: 'foreign key',
        name: 'relations_target_user_id_fkey',
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
      // source
      await queryInterface.removeConstraint(
        'relations',
        'relations_source_user_id_fkey',
        { transaction }
      );

      await queryInterface.addConstraint('relations', {
        fields: ['source_user_id'],
        type: 'foreign key',
        name: 'follows_source_user_id_fkey',
        references: {
          table: 'users',
          field: 'id',
        },
        onDelete: 'CASCADE',
        transaction
      });

      // target
      await queryInterface.removeConstraint(
        'relations',
        'relations_target_user_id_fkey',
        { transaction }
      );

      await queryInterface.addConstraint('relations', {
        fields: ['target_user_id'],
        type: 'foreign key',
        name: 'follows_target_user_id_fkey',
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
  }
};