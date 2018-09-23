const Express = require('express');
const User = require('../models/user');

const router = Express.Router();

const middlewares = require('../middlewares');
const Utils = require('../utils');

router.get('/', middlewares.LoginRequired, function(req, res) {
  res.json({ success: true, user: Utils.serialize(req.user), organization: Utils.serialize(req.organization) });
});

router.post('/', middlewares.LoginRequired, async(req, res) => {
  let user = await User.updateUser(req.body.email, req.body.password, req.body.lastName, req.body.lastName, req.body.id);
  res.json({ userId: user.id, success: true });
});

router.get('/orgs', middlewares.LoginRequired, async(req, res) => {
  var organizations = req.user.related('organizations').map(org => {
    const role = org.related('roles').first();

    return {
      id: org.get('id'),
      name: org.get('name'),
      role_id: role && role.get('id'),
      role: role && role.get('role')
    };
  });

  res.json({ success: true, organizations });
});

module.exports = router;
