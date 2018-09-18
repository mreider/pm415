const Express = require('express');

const router = Express.Router();

router.get('/', function(req, res) {
  res.json({me: "me"});
});

module.exports = router;
