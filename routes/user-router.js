const Express = require('express');
const User = require('../models/user');

const router = Express.Router();

const middlewares = require('../middlewares');
const Utils = require('../utils');
const uuidv4 = require('uuid/v4');

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
  const apikey = uuidv4() + uuidv4();
  const data = { apiKey: apikey };
  try {
    req.user.set(data);
    await req.user.save();
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false });
  }
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
  const data = {};
  if (req.body.hasOwnProperty('password')) {
    const hash = await User.hashPassword(req.body.password);
    data.password = hash;
  };
  if (req.body.hasOwnProperty('firstName')) { data.firstName = req.body.firstName; };
  if (req.body.hasOwnProperty('lastName')) { data.lastName = req.body.lastName; };
  if (req.body.hasOwnProperty('email')) { data.email = req.body.email; };
  try {
    req.user.set(data);
    await req.user.save();
    res.json({ success: true, user: req.user });
  } catch (error) {
    res.json({ success: false, user: req.user });
  }
});

module.exports = router;
