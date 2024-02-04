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

  return middleware(request, response, next);
};

const getStatus = (response) => response.code;
const getMessage = (response) => response.body.message;

const createSession = (user) => ({ user: { id: user.id, username: user.username } });

/**
 *
 * @param {Object} params request path parameters
 * @param {Object} query request query parameters
 * @param {Object} session session values
 * @returns
 */
const createRequest = (values) => {
  const params = {};
  const query = {};
  const body = {};
  const request = {
    params,
    query,
    body,
    ...values,
  };
  return request;
};

module.exports = {
  callMiddleware,
  getStatus,
  getMessage,
  createRequest,
  createSession,
};
