const cors = require('cors');

const corsOptions = {
  // Configures the Access-Control-Allow-Origin CORS header:
  //
  // The Access-Control-Allow-Origin response header indicates whether the
  // response can be shared with requesting code from the given origin.
  // origin: 'http://localhost:5173',

  // Configures the Access-Control-Allow-Credentials CORS header. Set to true
  // to pass the header.
  credentials: true,

  // default is 204, but some legacy browsers choke on it
  optionsSuccessStatus: 200,
};

module.exports = cors(corsOptions);
