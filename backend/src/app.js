const express = require('express');
require('express-async-errors');

const cors = require('cors');

const { SECRET } = require('./util/config');

const { redisClient } = require('./util/db');

const authRouter = require('./controllers/auth');
const usersRouter = require('./controllers/users');
const statisticsRouter = require('./controllers/statistics');

const { requestLogger, errorHandler, unknownEndpoint } = require('./util/middleware/common');

const session = require('express-session');
const RedisStore = require('connect-redis').default;

const app = express();

// serve static content
app.use('/static', express.static('public'));

// MIDDLEWARE
app.use(express.json());

app.use(cors({
  // Configures the Access-Control-Allow-Origin CORS header:
  //
  // The Access-Control-Allow-Origin response header indicates whether the
  // response can be shared with requesting code from the given origin.
  origin: 'http://localhost:5173',

  // Configures the Access-Control-Allow-Credentials CORS header. Set to true
  // to pass the header.
  credentials: true,

  // default is 204, but some legacy browsers choke on it
  optionsSuccessStatus: 200,
}));

app.use(requestLogger);

/*
TODO
- set short life time
*/
app.use(session({
  store: new RedisStore({ client: redisClient }),
  resave: false,
  saveUninitialized: false,
  secret: SECRET,

  cookie: {
    // cookie is not sent on cross-site requests, but is sent when a user is
    // navigating to the origin site from an external site
    sameSite: 'lax',

    // cookie is inaccessible to the JavaScript Document.cookie API
    httpOnly: true,

    // When truthy, the Set-Cookie Secure attribute is set (only transmit 
    // cookie over https)
    secure: process.env.NODE_ENV === 'production',
  },
}));

// ROUTES
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/statistics', statisticsRouter);

if (process.env.NODE_ENV === 'test') {
  // reset route for E2E testing only!
  const testingRouter = require('./controllers/testing');
  app.use('/api/testing', testingRouter);
}

// OTHER MIDDLEWARE
app.use(unknownEndpoint);

app.use(errorHandler);

module.exports = app;