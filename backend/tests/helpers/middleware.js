const callMiddleware = async (middleware, request, next) => {
  const response = {};

  response.status = (statusCode) => {
    response.code = statusCode;
    return response;
  };

  response.send = (obj) => {
    response.body = obj;
    return response;
  };

  return await middleware(request, response, next);
};

const getStatus = response => response.code;
const getMessage = response => response.body.message;

/**
 * 
 * @param {Object} params request parameters
 * @param {Object} query query parameters
 * @returns 
 */
const createRequest = (params = {}, query = {}) => {
  const request = { params, query };
  return request;
};

/**
 * 
 * @param {*} request 
 * @param {Object} newParams request parameters to be added to the request
 */
const addParamsToRequest = (request, newParams = {}) => {
  const { params: oldParams } = request;

  request.params = { ...oldParams, ...newParams };
};

module.exports = {
  callMiddleware,
  getStatus,
  getMessage,
  createRequest,
  addParamsToRequest,
};