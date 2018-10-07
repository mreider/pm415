const Express = require('express');
const User = require('../models/user');
const Role = require('../models/role');
const router = Express.Router();

const middlewares = require('../middlewares');
const Utils = require('../utils');
const uuidv4 = require('uuid/v4');
const knex = require('../db').knex;

const { validate, UpdateUserSchema } = require('../validation');
router.use(middlewares.LoginRequired);

router.get('/', function(req, res) {
  res.json({ success: true, user: Utils.serialize(req.user), organization: Utils.serialize(req.organization), role: Role.RolesObject[req.roleId] });
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
    res.json({ success: true, apikey });
  } catch (error) {
    res.json({ success: false });
  }
});

router.get('/orgs', async(req, res) => {
  let organizations = await knex('users_organizations_roles').select(
    'roles.id as role_id',
    'roles.role',
    'organizations.name',
    'organizations.id as id').leftJoin(
    'roles', 'users_organizations_roles.role_id', 'roles.id').leftJoin(
    'organizations', 'users_organizations_roles.organization_id', 'organizations.id').where({ user_id: req.user.id });
  res.json({ success: true, organizations });
});

router.put('/', validate(UpdateUserSchema), async(req, res) => {
  const data = {};
  if (req.body.hasOwnProperty('password') && req.body.password) {
    console.log('password', req.body.password, 'confirmation', req.body.confirmation);
    if (req.body.password !== req.body.confirmation) return res.json({ success: false, message: 'Password and confirmation does not match' });
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
