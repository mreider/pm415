const UUID4 = require('uuid/v4');
const Express = require('express');

const router = Express.Router();

const knex = require('../db').knex;
const middlewares = require('../middlewares');
const Utils = require('../utils');

const Role = require('../models/role');

const { validate, UpdateUserSchema } = require('../validation');

const User = require('../models/user');

router.use(middlewares.LoginRequired);

router.get('/', function(req, res) {
  res.json({ success: true, user: Utils.serialize(req.user), organization: Utils.serialize(req.organization) });
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
    if (req.body.password !== req.body.confirmation) return res.boom.badData('Bad data', { success: false, message: 'Confirmation must match password' });

    data.password = await User.hashPassword(req.body.password);
    passwordChanged = true;
  }

  if (req.body.email && req.body.email !== user.get('email')) {
    const emailsCount = await User.forge().where('id', '<>', req.user.id).where('email', req.body.email).count();

    if (emailsCount > 0) return res.boom.conflict('Conflict', { success: false, message: `Email ${req.body.email} already registered` });

    data.email = req.body.email;
    // emailChanged = true;
  }

  try {
    if (emailChanged) {
      // TODO: Send confirmation email
      // data.confirmedAt = null;
      // data.isActive = false;
    }

    user.set(data);
    await user.save();

    // TODO: Send confirmation email delete after
    emailChanged = false;
    passwordChanged = false;
    // TODO: Send confirmation email

    if (emailChanged) {

    }

    res.json({ success: true, doLogout: emailChanged || passwordChanged, user: req.user });
  } catch (error) {
    res.json({ success: false, message: error.toString() });
  }
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
  var organizations = req.user.organizations.map(org => {
    const role = Role.sort(org.roles)[0];

    return {
      orgId: org.id,
      name: org.name,
      role: role && role.role
    };
  });

  res.json({ success: true, organizations });
});

module.exports = router;
