
module.exports = {
  up: async ({ context: queryInterface }) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeConstraint('relations', 'follows_pkey', { transaction });

      await queryInterface.addConstraint('relations', { 
        fields: ['source_user_id', 'target_user_id', 'type'],
        type: 'primary key',
        name: 'follows_pkey',
        transaction,
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
      await queryInterface.removeConstraint('relations', 'follows_pkey', { transaction });

      await queryInterface.addConstraint('relations', { 
        fields: ['source_user_id', 'target_user_id'],
        type: 'primary key',
        name: 'follows_pkey',
        transaction,
      });

      await transaction.commit();

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};