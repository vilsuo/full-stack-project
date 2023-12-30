const { ParameterError, IllegalStateError } = require('../error');

const minId = 1;
const maxId = 2147483647;

/**
 * Valid values are strings from '1' to '2147483647'.
 * 
 * @param {*} value route parameter to be parsed to integer
 * 
 * @returns the parsed parameter as an integer
 */
const parseParamId = (value) => {
  if (typeof value !== 'string') {
    throw new IllegalStateError('id parameter is not a string');
  }

  // contains ONLY digits. contains ATLEAST ONE digit
  const onlyDigits = /^\d+$/.test(value);

  const id = Number(value)
  if (onlyDigits && (minId <= id && id <= maxId)) {
    return id;
  }

  throw new ParameterError('id is invalid');
};

const isValidId = (value) => {
  return Number.isInteger(value) && (minId <= value && value <= maxId);
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

  // default has to be zero
  const defaultPageNumber = 0;
  
  const defaultPageSize = 10;

  // if page is zero, the default is returned, which is zero
  req.pageNumber = parsePositiveOrDefault(page, defaultPageNumber);

  // page size can no be 0
  req.pageSize = parsePositiveOrDefault(size, defaultPageSize);
  next();
};

module.exports = {
  parseParamId,
  isValidId,
  paginationParser,
};