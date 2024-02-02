const { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } = require('../../constants');
const { parseNonNegativeInteger, parsePositiveInteger } = require('../parser');

/**
 * Parse the optional 'page' and 'size' query parameters from the request and
 * attach them to req.pageNumber and req.pageSize.
 * 
 * If parameter is specified and invalid, throw a ParseError.
 * 
 * If parameter is not specified fall back to defaults.
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const pagination = (req, res, next) => {
  const { page, size } = req.query;

  req.pageNumber = (page !== undefined)
    ? parseNonNegativeInteger(page, "query page")
    : DEFAULT_PAGE_NUMBER;

  req.pageSize = (size !== undefined)
    ? parsePositiveInteger(size, "query size")
    : DEFAULT_PAGE_SIZE;

  next();
};

module.exports = {
  pagination,
};