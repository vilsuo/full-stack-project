const parseNonNegative = (value, name) => {
  const n = Number(value);
  if (isNaN(n) || n < 0) {
    throw new Error(`parameter '${name}' must be non-negative`);
  }
  return n;
};

// use sequelize 'findAndCountAll'
// https://sequelize.org/docs/v6/core-concepts/model-querying-finders/#findandcountall
const pageParser = async (req, res, next) => {
  const defaultPageNumber = 0;
  const defaultPageSize = 10;

  try {
    const pageNumber = req.query.page
      ? parseNonNegative(req.query.page, 'page')
      : defaultPageNumber;

    const pageSize = req.query.size
      ? parseNonNegative(req.query.size, 'size')
      : defaultPageSize;

    req.offset = pageNumber * pageSize;
    req.limit = pageSize;
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }

  next();
};

module.exports = {
  pageParser,
};