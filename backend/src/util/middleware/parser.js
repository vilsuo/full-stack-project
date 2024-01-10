const { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } = require('../../constants');
const { Relation } = require('../../models');
const { ParseError } = require('../error');

/*
TODO
- paginationParser:
  - if query parameter is not supplied, return default
  - if query parameter is supplied and is in invalid format, throw error
  - else return query parameter
*/

/**
 * If value is a number or a string return the value as a number if it is a valid id,
 * otherwise throw a ParseError.
 * 
 * @param {*} value 
 * @returns the parsed value as a number
 */
const parseId = (value) => {
  if (value === undefined) throw new ParseError('id is missing');
  
  // parsing request body
  if (typeof value === 'number') {
    if (Number.isInteger(value) && value >= 0) return value;
  }

  // parsing request & query parameters
  if (typeof value === 'string') {
    const regex = /^\d*\.?0*$/; // matches for empty string!
    if (value.length > 0 && regex.test(value)) return Number(value);
  }

  throw new ParseError('id is invalid');
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

/**
 * 
 * @param {*} value 
 * @param {*} defaultValue 
 * @returns value, if it can be parsed to positive number
 */
const parsePositiveOrDefault = (value, defaultValue) => {
  if (value) {
    const nValue = Number(value);
    if (Number.isInteger(nValue) && nValue > 0) {
      return nValue;
    }
  }
  return defaultValue;
};

/*
const parsePositive = (value) => {
  if ((typeof value === 'string' && value)) {

  }
  if (typeof value === 'number' || (typeof value === 'string' && value)) {
    const number = Number(value);

  }
  throw new ParseError()
};
*/

/**
 * Parse the 'page' and 'size' query parameters from the request and
 * attach them to req.pageNumber and req.pageSize.
 * 
 * If the query parameters are invalid, silently falls to default values:
 * - default page number = 0
 * - default page size = 10
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const paginationParser = (req, res, next) => {
  /*
  const queryParams = req.query;

  req.pageNumber = Object.hasOwn(queryParams, 'page')
    ? 
    : DEFAULT_PAGE_NUMBER;
  
  req.pageSize = Object.hasOwn(queryParams, 'size')
    ?
    : DEFAULT_PAGE_SIZE;

  next();
  */
  const { page, size } = req.query;

  req.pageNumber = parsePositiveOrDefault(page, DEFAULT_PAGE_NUMBER);
  req.pageSize = parsePositiveOrDefault(size, DEFAULT_PAGE_SIZE);

  next();
};

module.exports = {
  parseId,
  parseRelationType,

  paginationParser,
};