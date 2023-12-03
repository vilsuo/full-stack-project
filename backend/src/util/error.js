class FiletypeError extends Error {
  constructor(message) {
    super(message);
    this.name = 'FiletypeError';
  }
};

module.exports = {
  FiletypeError,
};