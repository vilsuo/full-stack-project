const router = require('express').Router();
const { isAuthenticated } = require('../util/middleware');

router.get('/all', (req, res) => {
  return res.status(200).send("Public Content.");
});

router.get('/user', isAuthenticated, (req, res) => {
  return res.status(200).send("User Content.");
});

module.exports = router;