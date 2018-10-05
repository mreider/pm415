const Express = require('express');
const User = require('../models/user');

const router = Express.Router();

const middlewares = require('../middlewares');
const Utils = require('../utils');
const UUID = require('uuid/v4');

const { validate, UpdateUserSchema } = require('../validation');
router.use(middlewares.LoginRequired);

router.get('/', function(req, res) {
  res.json({ success: true, user: Utils.serialize(req.user), organization: Utils.serialize(req.organization) });
});

router.get('/apikey', function(req, res) {
  const apikey = Utils.serialize(req.user).apiKey;
  res.json({ success: true, apikey: apikey });
});

router.post('/apikey', async(req, res) => {
  const apiKey = UUID() + UUID();
  req.user.set({ apiKey });
  await req.user.save();

  res.json({ success: true, apiKey });
});

router.get('/orgs', async(req, res) => {
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

router.put('/', validate(UpdateUserSchema), async(req, res) => {
  req.user.set({
    password: await User.hashPassword(req.body.password),
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName
  });
  await req.user.save();

  res.json({ success: true, user: req.user });
});

module.exports = router;
