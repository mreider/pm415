const Express = require('express');
const User = require('../models/user');

const router = Express.Router();

const middlewares = require('../middlewares');
const Utils = require('../utils');
const UUID4 = require('uuid/v4');

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
  const apikey = (UUID4() + UUID4()).replace(/-/g, '');

  try {
    req.user.set({ apiKey: apikey });
    await req.user.save();

    res.json({ success: true, apikey });
  } catch (error) {
    res.json({ success: false, message: 'Unable to set new API key.' });
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
  const data = {
    firstName: req.body.firstName,
    lastName: req.body.lastName
  };

  let emailChanged = false;
  let passwordChanged = false;

  if (req.body.password) {
    if (req.body.password !== req.body.confirmation) return res.boom.badData('Bad data', { success: false, message: 'Confirmation must match password' })

    data.password = await User.hashPassword(req.body.password);
    passwordChanged = true;
  }

  if (req.body.email) {
    const emailsCount = await User.forge().where('id', '<>', req.user.id).where('email', req.body.email).count();

    if (emailsCount > 0) return res.boom.conflict('Conflict', { success: false, message: `Email ${req.body.email} already registered` });

    data.email = req.body.email;
    emailChanged = true;
  }

  try {
    if (emailChanged || passwordChanged) {
      data.confirmedAt = null;
      data.isActive = false;
    }

    req.user.set(data);
    await req.user.save();

    if (emailChanged) {
      // TODO: Send confirmation email
    }

    res.json({ success: true, doLogout: emailChanged || passwordChanged, user: req.user });
  } catch (error) {
    res.json({ success: false, message: error.toString() });
  }
});

module.exports = router;
