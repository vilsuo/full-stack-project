const session = require('express-session');
const RedisStore = require('connect-redis').default;
const { redisClient } = require('../db');

const { SECRET } = require('../config');
const { cookieKey } = require('../../constants');

const sessionOptions = {
  store: new RedisStore({ client: redisClient }),

  // Forces the session to be saved back to the session store, even if the session
  // was never modified during the request
  resave: false,            // required: force lightweight session keep alive (touch)

  saveUninitialized: false, // recommended: only save session when data exists

  secret: SECRET,

  name: cookieKey,

  cookie: {
    //maxAge: 60 * 60 * 1000, // (ms)

    // cookie is not sent on cross-site requests, but is sent when a user is
    // navigating to the origin site from an external site
    sameSite: 'lax',

    // cookie is inaccessible to the JavaScript Document.cookie API
    httpOnly: true,

    // When truthy, the Set-Cookie Secure attribute is set (only transmit 
    // cookie over https)
    secure: process.env.NODE_ENV === 'production',
  },
};

module.exports = session(sessionOptions);