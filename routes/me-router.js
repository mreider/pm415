const Express = require('express');

const router = Express.Router();

const models = require('../models');
const middlewares = require('../auth');

router.get('/', middlewares.LoginRequired, function(req, res) {
  res.json({me: 'me'});
});

module.exports = router;
