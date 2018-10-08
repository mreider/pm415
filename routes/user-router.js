const UUID4 = require('uuid/v4');
const Express = require('express');

const router = Express.Router();

const knex = require('../db').knex;
const middlewares = require('../middlewares');
const Utils = require('../utils');

const { validate, UpdateUserSchema } = require('../validation');

const User = require('../models/user');

router.use(middlewares.LoginRequired);

router.get('/', function(req, res) {
  res.json({ success: true, user: Utils.serialize(req.user), organization: Utils.serialize(req.organization) });
});

router.get('/apikey', function(req, res) {
  const apikey = Utils.serialize(req.user).apiKey;
  res.json({ success: true, apikey: apikey });
});

router.post('/apikey', async(req, res) => {
  const apiKey = (UUID4() + UUID4()).replace(/-/g, '');

  await knex('users').where({ id: req.user.id }).update('api_key', apiKey);
  req.user.apiKey = apiKey;
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
  const data = {
    firstName: req.body.firstName,
    lastName: req.body.lastName
  };

  let emailChanged = false;
  let passwordChanged = false;
  const user = await User.where({ id: req.user.id }).fetch();

  if (req.body.password) {
    if (req.body.password !== req.body.confirmation) return res.boom.badData('Bad data', { success: false, message: 'Confirmation must match password' })

    data.password = await User.hashPassword(req.body.password);
    passwordChanged = true;
  }

  if (req.body.email && req.body.email !== user.get('email')) {
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

    user.set(data);
    await user.save();

    if (emailChanged) {
      // TODO: Send confirmation email
    }

    res.json({ success: true, doLogout: emailChanged || passwordChanged, user: req.user });
  } catch (error) {
    res.json({ success: false, message: error.toString() });
  }
});

module.exports = router;
