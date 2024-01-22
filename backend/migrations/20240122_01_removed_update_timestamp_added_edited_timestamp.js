module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.renameColumn(
      'images', 'updated_at', 'edited_at', 
    );
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.renameColumn(
      'images', 'edited_at', 'updated_at', 
    );
  },
};