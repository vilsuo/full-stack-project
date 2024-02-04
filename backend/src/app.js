const express = require('express');
require('express-async-errors');

// middleware
const cors = require('./util/middleware/cors');
const { session } = require('./util/middleware/session');
const { requestLogger, errorHandler, unknownEndpoint } = require('./util/middleware/common');
const { adminExtractor } = require('./util/middleware/auth');

// routers
const authRouter = require('./controllers/auth');
const usersRouter = require('./controllers/users');
const statisticsRouter = require('./controllers/statistics');
const adminRouter = require('./controllers/admin');

const app = express();

// serve static content
app.use(express.static('dist'));
app.use('/static', express.static('public'));

// MIDDLEWARE
app.use(express.json());

app.use(cors);
app.use(session);

app.use(requestLogger);

// ROUTES
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/statistics', statisticsRouter);
app.use('/api/admin', adminExtractor, adminRouter);

if (process.env.NODE_ENV === 'test') {
  // reset route for E2E testing only!
  const testingRouter = require('./controllers/testing');
  app.use('/api/testing', testingRouter);
} else if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1); // trust first proxy
}

// OTHER MIDDLEWARE
app.use(unknownEndpoint);

app.use(errorHandler);

module.exports = app;
