const Express = require('express');

const router = Express.Router();

const Auth = require('../auth');

router.get('/', function(req, res) {
  res.send('Wanna something?');
});


module.exports = router;
 