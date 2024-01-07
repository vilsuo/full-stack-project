const router = require('express').Router();
const { cookieKey } = require('../constants');
const { User } = require('../models');

const { comparePassword } = require('../util/password');
const { getNonSensitiveUser } = require('../util/dto');
const { sessionExtractor } = require('../util/middleware/auth');

/*
TODO
- parse login username & password
  - check ONLY? they are strings
*/

router.post('/register', async (req, res) => {
  const { name, username, password } = req.body;

  const user = await User.create({
    name, username,

    // beforeCreate hook encodes password
    passwordHash: password
  });

  return res.status(201).send(getNonSensitiveUser(user));
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send({
      message: 'username or password missing'
    });
  }

  const user = await User.findOne({ where: { username } });
  if (user) {
    if (user.disabled) {
      return res.status(401).send({ message: 'user has been disabled' });
    }

    const passwordMatches = await comparePassword(password, user.passwordHash);
    if (passwordMatches) {
      req.session.user = {
        id: user.id,
        username: user.username,
      };

      return res.send(getNonSensitiveUser(user));

      /*
      // regenerate the session, which is good practice to help
      // guard against forms of session fixation
      return req.session.regenerate(function (err) {
        if (err) return next(err);

        // store user information in session, typically a user id
        req.session.user = {
          id: user.id,
          username: user.username,
        };

        // save the session before redirection to ensure page
        // load does not happen before session is saved
        return req.session.save(function (err) {
          if (err) return next(err);
          console.log('login session id', req.session.id);
          return res.send(getNonSensitiveUser(user));
        });
      });
      */
    }
  }

  return res.status(401).send({
    message: 'invalid username or password'
  });
});

router.get('/auto-login', sessionExtractor, async (req, res) => {
  const user = req.user;
  return res.send(getNonSensitiveUser(user));
});

router.post('/logout', async (req, res, next) => {
  req.session.destroy((error) => {
    if (error) return next(error);

    return res
      .clearCookie(cookieKey)
      .send({ message: "you've been signed out" });
  });
});

module.exports = router;