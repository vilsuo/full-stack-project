
export const createErrorMessage = (error) => {
  const { response, request } = error;
  
  if (response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx

    return response.data.message || 'something went wrong';

  } else if (request) {
    // The request was made but no response was received
    return 'server time out';

  } else {
    // Something happened in setting up the request that triggered an Error
    return 'something went wrong while setting up the request'
  }
};