const { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } = require('../../constants');
const { Relation } = require('../../models');
const { ParseError } = require('../error');

/*
TODO
- parseId:
  - Number() converts rmpty or whitespace-only strings to 0: make throw ParseError

- paginationParser:
  - if query parameter is not supplied, return default
  - if query parameter is supplied and is in invalid format, throw error
  - else return query parameter
*/

/**
 * Valid values are strings/numbers from 1 to 2147483647.
 * 
 * @param {*} value 
 * @param {*} name 
 * @returns the parsed number if the value is valid id
 */
const parseId = (value) => {
  if (value === undefined) {
    throw new ParseError('id is missing');
  }
  
  const minId = 1;
  const maxId = 2147483647;

  if (typeof value === 'number' || typeof value === 'string') {
    const number = Number(value) ;
    
    if (Number.isInteger(number) && (minId <= number && number <= maxId)) {
      return number;
    }
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