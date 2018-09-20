const Express = require('express');
const OmitDeep = require('omit-deep');

const router = Express.Router();

const middlewares = require('../middlewares');

router.get('/', middlewares.LoginRequired, function(req, res) {
  const user = OmitDeep(req.user.toJSON(), ['password']);
  res.json({ success: true, user });
});

module.exports = router;
