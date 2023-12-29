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

class IllegalStateError extends Error {
  constructor(message) {
    super(message);
    this.name = 'IllegalStateError';
  }
};

class ParameterError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ParameterError';
  }
};

module.exports = {
  FiletypeError,
  EnumError,
  IllegalStateError,
  ParameterError,
};