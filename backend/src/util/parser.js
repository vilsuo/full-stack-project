const { STRING_MAX_LENGTH, IMAGE_PRIVACIES, RELATION_TYPES } = require('../constants');
const { ParseError } = require('./error');

const parseRequired = (value, parameterName) => {
  if (value === undefined) throw new ParseError(`Parameter ${parameterName} is required`);
};

const parseNonNegativeInteger = (value, parameterName) => {
  parseRequired(value, parameterName);

  if (typeof value === 'number') {
    if (Number.isInteger(value) && value >= 0) return value;
  }

  if (typeof value === 'string') {
    const regex = /^\d*\.?0*$/; // matches for empty string!
    if (value.length > 0 && regex.test(value)) return Number(value);
  }

  throw new ParseError(`Parameter ${parameterName} must be a non-negative integer`);
};

const parsePositiveInteger = (value, parameterName) => {
  const number = parseNonNegativeInteger(value, parameterName);
  // zero is falsy
  if (!number) throw new ParseError(`Parameter ${parameterName} must be a positive integer`);

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

const parseType = (value, type, parameterName = 'param') => {
  parseRequired(value, parameterName);

  if (typeof value !== type) {
    throw new ParseError(`Parameter ${parameterName} must be of type ${type}`);
  }

  return value;
};

const parseBooleanType = (value, parameterName) => {
  return parseType(value, 'boolean', parameterName);
};

// STRINGS

/**
 * Parse a string without length restriction
 * 
 * @param {*} value 
 * @param {string} parameterName 
 * @returns the param value, if it is a string
 */
const parseTextType = (value, parameterName) => {
  return parseType(value, 'string', parameterName);
};

/**
 * Parse a string with length restriction
 * 
 * @param {*} value 
 * @param {string} parameterName 
 * @returns the param value, if it is a string and a its length is less than 
 *          or equal to {@link STRING_MAX_LENGTH}
 */
const parseStringType = (value, parameterName) => {
  const text = parseTextType(value, parameterName);

  if (text.length > STRING_MAX_LENGTH) {
    throw new ParseError(
      `Parameter ${parameterName} has a max length of ${STRING_MAX_LENGTH}`
    );
  }

  return text;
};

// ENUMS

const parseEnumType = (value, enumValues, parameterName = 'enum') => {
  parseRequired(value, parameterName);

  if (!enumValues.includes(value)) {
    throw new ParseError(
      `Parameter ${parameterName} must be one of [${enumValues.join('|')}]`
    );
  }

  return value;
};

const parseRelationType = type => {
  return parseEnumType(type, RELATION_TYPES, 'type');
};

const parseImagePrivacy = privacy => {
  return parseEnumType(privacy, IMAGE_PRIVACIES, 'privacy');
};

module.exports = {
  // numbers
  parseNonNegativeInteger,
  parsePositiveInteger,

  parseBooleanType,

  // SEQUELIZE DATATYPES
  parseId,          // (DATATYPES.INTEGER)
  parseTextType,    // DATATYPES.TEXT
  parseStringType,  // DATATYPES.STRING

  // enums
  parseRelationType,
  parseImagePrivacy,
};