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
  paginationParser,
};