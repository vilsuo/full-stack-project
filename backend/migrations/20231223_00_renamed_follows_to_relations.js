
module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.renameTable('follows', 'relations');
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.renameTable('relations', 'follows');
  }
};