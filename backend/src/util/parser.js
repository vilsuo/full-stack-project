const { STRING_MAX_LENGTH } = require('../constants');
const { Relation, Image } = require('../models');
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
  const imagePrivacies = Image.getAttributes().privacy.values;

  if (privacy === undefined) {
    throw new ParseError('image privacy is missing');
  }

  if (!imagePrivacies.includes(privacy)) {
    throw new ParseError('invalid image privacy');
  }
  return privacy;
};

const parseStringType = (value, parameterName) => {
  if (value === undefined) throw new ParseError(`${parameterName} is missing`);

  if (typeof value !== 'string') {
    throw new ParseError(`${parameterName} is not of type string`);
  } 
  
  if (value.length > STRING_MAX_LENGTH) {
    throw new ParseError(`${parameterName} has a max length of ${STRING_MAX_LENGTH}`);
  }

  return value;
};

module.exports = {
  // numbers
  parseNonNegativeInteger,
  parsePositiveInteger,

  // SEQUELIZE DATATYPES
  parseId,          // (DATATYPES.INTEGER)
  parseStringType,  // DATATYPES.STRING

  // enums
  parseRelationType,
  parseImagePrivacy,
};