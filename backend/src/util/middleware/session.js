const session = require('express-session');
const RedisStore = require('connect-redis').default;
const { redisClient } = require('../db');

const { SECRET } = require('../config');
const { SESSION_ID } = require('../../constants');
const { User } = require('../../models');

const sessionOptions = {
  store: new RedisStore({ client: redisClient }),

  // Forces the session to be saved back to the session store, even if the session
  // was never modified during the request
  resave: false,            // required: force lightweight session keep alive (touch)

  saveUninitialized: false, // recommended: only save session when data exists

  secret: SECRET,

  name: SESSION_ID,

  cookie: {
    //maxAge: 60 * 60 * 1000, // (ms)

    // cookie is not sent on cross-site requests, but is sent when a user is
    // navigating to the origin site from an external site
    sameSite: 'lax', // 'none',

    // cookie is inaccessible to the JavaScript Document.cookie API
    httpOnly: true,

    // When truthy, the Set-Cookie Secure attribute is set (only transmit 
    // cookie over https)
    secure: process.env.NODE_ENV === 'production',
  },
};

/**
 * Extracts the authenticated User from request session to request.user.
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * 
 * @returns response with status
 * - '401' if authentication is not present
 * - '404' if authenticated user does not exist
 */
const sessionExtractor = async (req, res, next) => {
  const session = req.session;
  if (!session.user) {
    // there is no session or session is invalid/expired
    return res
      .clearCookie(SESSION_ID)
      .status(401).send({ message: 'Authentication required' });
  }

  const user = await User.findByPk(session.user.id);
  if (!user) {
    // session exists, but the user does not
    return session.destroy((error) => {
      if (error) return next(error);
  
      return res
        .clearCookie(SESSION_ID)
        .status(404).send({ message: 'Session user does not exist' });
    });
  }

  req.user = user;
  return next();
};

module.exports = {
  session: session(sessionOptions),

  sessionExtractor,
};