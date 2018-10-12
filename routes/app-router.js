const Express = require('express');

const router = Express.Router();

router.get('/', function(req, res) {
  res.send('Wanna something?');
});

module.exports = router;
