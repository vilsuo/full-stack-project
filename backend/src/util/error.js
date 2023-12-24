class FiletypeError extends Error {
  constructor(message) {
    super(message);
    this.name = 'FiletypeError';
  }
};

class EnumError extends Error {
  constructor(message) {
    super(message);
    this.name = 'EnumError';
  }
};

module.exports = {
  FiletypeError,
  EnumError,
};