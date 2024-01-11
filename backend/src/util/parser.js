const { STRING_MAX_LENGTH, IMAGE_PRIVACIES } = require('../constants');
const { Relation } = require('../models');
const { ParseError } = require('./error');

const parseNonNegativeInteger = (value, parameterName) => {
  if (value === undefined) throw new ParseError(`${parameterName} is missing`);

  if (typeof value === 'number') {
    if (Number.isInteger(value) && value >= 0) return value;
  }

  if (typeof value === 'string') {
    const regex = /^\d*\.?0*$/; // matches for empty string!
    if (value.length > 0 && regex.test(value)) return Number(value);
  }

  throw new ParseError(`${parameterName} is invalid`);
};

const parsePositiveInteger = (value, parameterName) => {
  const number = parseNonNegativeInteger(value, parameterName);
  // zero is falsy
  if (!number) throw new ParseError(`${parameterName} is invalid`);

  return number;
};

/**
 * If value is a number or a string return the value as a number if it is a valid id,
 * otherwise throw a ParseError.
 * 
 * @param {*} value 
 * @returns the parsed value as a number
 */
const parseId = (value) => {
  return parseNonNegativeInteger(value, 'id');
};

// ENUMS
const parseRelationType = type => {
  const relationTypes = Relation.getAttributes().type.values;

  if (type === undefined) {
    throw new ParseError('relation type is missing');
  }

  if (!relationTypes.includes(type)) {
    throw new ParseError('invalid relation type');
  }
  return type;
};

const parseImagePrivacy = privacy => {
  if (privacy === undefined) {
    throw new ParseError('image privacy is missing');
  }

  if (!IMAGE_PRIVACIES.includes(privacy)) {
    throw new ParseError('invalid image privacy');
  }
  return privacy;
};

// STRING TYPES
const parseTextType = (value, parameterName = 'text type') => {
  if (value === undefined) throw new ParseError(`${parameterName} is missing`);

  if (typeof value !== 'string') {
    throw new ParseError(`${parameterName} is not a string`);
  }

  return value;
};

const parseStringType = (value, parameterName = 'string type') => {
  const text = parseTextType(value, parameterName);

  // additional length restriction
  if (text.length > STRING_MAX_LENGTH) {
    throw new ParseError(`${parameterName} has a max length of ${STRING_MAX_LENGTH}`);
  }

  return text;
};

module.exports = {
  // numbers
  parseNonNegativeInteger,
  parsePositiveInteger,

  // SEQUELIZE DATATYPES
  parseId,          // (DATATYPES.INTEGER)
  parseStringType,  // DATATYPES.STRING
  parseTextType,    // DATATYPES.TEXT

  // enums
  parseRelationType,
  parseImagePrivacy,
};