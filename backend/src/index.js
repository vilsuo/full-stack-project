const express = require('express');
require('express-async-errors');

const cors = require('cors');

const { PORT, SECRET } = require('./util/config');

const { redisClient, connectToDatabases } = require('./util/db');

const authRouter = require('./controllers/auth');
const usersRouter = require('./controllers/users');
const testRouter = require('./controllers/test');

const { requestLogger, errorHandler, unknownEndpoint } = require('./util/middleware');

const session = require('express-session');
const RedisStore = require('connect-redis').default;

const app = express();

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

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/test', testRouter);

app.use(unknownEndpoint);

app.use(errorHandler);

const start = async () => {
  await connectToDatabases();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();