class FiletypeError extends Error {
  constructor(message) {
    super(message);
    this.name = 'FiletypeError';
  }
}

class IllegalStateError extends Error {
  constructor(message) {
    super(message);
    this.name = 'IllegalStateError';
  }
}

class ParseError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ParseError';
  }
}

module.exports = {
  FiletypeError,
  ParseError,
  IllegalStateError,
};