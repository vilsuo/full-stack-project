const express = require('express');
require('express-async-errors');

const cors = require('cors');

const { SECRET } = require('./util/config');

const { redisClient } = require('./util/db');

const authRouter = require('./controllers/auth');
const usersRouter = require('./controllers/users');
const testRouter = require('./controllers/testr');

const { requestLogger, errorHandler, unknownEndpoint } = require('./util/middleware');

const session = require('express-session');
const RedisStore = require('connect-redis').default;


const app = express();

// MIDDLEWARE
app.use(express.json());

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD'],
  credentials: true,
}));

app.use(requestLogger);

app.use(session({
  store: new RedisStore({ client: redisClient }),
  resave: false,
  saveUninitialized: false,
  secret: SECRET,
  cookie: {
    // if true only transmit cookie over https
    secure: process.env.NODE_ENV === "production",

    // if true prevent client side JS from reading cookie
    httpOnly: true,
  },
}));

// ROUTES
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/test', testRouter);

if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing');
  app.use('/api/testing', testingRouter);
}

// OTHER MIDDLEWARE
app.use(unknownEndpoint);

app.use(errorHandler);

module.exports = app;