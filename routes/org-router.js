const _ = require('lodash');
const OmitDeep = require('omit-deep');

const Nodemailer = require('nodemailer');
const SendGridTransport = require('nodemailer-sendgrid-transport');
const Handlebars = require('nodemailer-express-handlebars');

const Express = require('express');
const router = Express.Router();

const middlewares = require('../middlewares');

const Organization = require('../models/organization');
const UORole = require('../models/users_organizations_roles');
const Role = require('../models/role');
const User = require('../models/user');

const Config = require('../config');

const knex = require('../db').knex;
// const Utils = require('../utils');

const { validate, NewOrganizationSchema, InviteLinkSchema, UpdateOrganizationSchema } = require('../validation');

const mailer = Nodemailer.createTransport(SendGridTransport(Config.mailerConfig));

mailer.use('compile', Handlebars(Config.mailerConfig.rendererConfig));

router.get('/', middlewares.LoginRequired, function (req, res) {
  const user = OmitDeep(req.user, ['password']);
  res.json({ success: true, organizations: user.organizations, current: req.organization });
});

router.post('/', [middlewares.LoginRequired, validate(NewOrganizationSchema)], async (req, res) => {
  const name = req.body.name;
  let organization = await Organization.where({ name }).fetch();
  if (organization) return res.boom.conflict('Exists', { success: false, message: `Organization with name ${name} already exists` });
  organization = await Organization.create({ name: name });

  let alreadyAdmin = await UORole.where({ user_id: req.user.id, organization_id: organization.id, role_id: Role.AdminRoleId }).fetch(); // I do not know if it's right to keep the admin role id in the code
  if (!alreadyAdmin) alreadyAdmin = await UORole.create({ user_id: req.user.id, organization_id: organization.id, role_id: Role.AdminRoleId });

  return res.json({ success: true, organization, user: req.user });
});

router.post('/switch/:orgId', middlewares.LoginRequired, async (req, res) => {
  const orgId = parseInt(req.params.orgId);

  const organization = req.user.organizations.filter(o => o.id === orgId)[0];

  if (!organization) return res.boom.notFound('Not found', { success: false, message: `Organization with ID ${orgId} not found.` });

  const token = await User.forge({ id: req.user.id }).generateToken({}, { orgId });

  return res.json({ success: true, organization, token });
});

router.put('/:orgId', [middlewares.LoginRequired, validate(UpdateOrganizationSchema)], async (req, res) => {
  const name = req.body.name;
  const orgId = req.params.orgId;

  const isAdmin = await UORole.where({ organization_id: orgId, user_id: req.user.id, role_id: Role.AdminRoleId }).fetch();
  if (!isAdmin) return res.boom.forbidden('Forbidden', { success: false, message: 'Organization admin privileges required' });

  const organization = await Organization.where({ id: orgId }).fetch();
  if (!organization) return res.boom.notFound('Not found', { success: false, message: 'Organization not found.' });

  organization.set('name', name);
  await organization.save();

  return res.json({ success: true, organization });
});

router.delete('/:orgId', middlewares.LoginRequired, async (req, res) => {
  const orgId = req.params.orgId;

  const admin = await UORole.where({ organization_id: orgId, user_id: req.user.id, role_id: Role.AdminRoleId }).fetch();
  if (!admin) return res.boom.forbidden('Forbidden', { success: false, message: 'Organization admin privileges required' });

  const organization = await Organization.where({ id: orgId }).fetch();
  if (!organization) return res.boom.notFound('Not found', { success: false, message: 'Organization not found.' });

  await UORole.where({ organization_id: orgId }).destroy();
  await Organization.where({ id: orgId }).destroy();

  return res.json({ success: true });
});

router.get('/:orgId/users', middlewares.LoginRequired, async (req, res) => {
  const orgId = req.params.orgId;

  let rows = await UORole.where('organization_id', orgId).fetchAll({ withRelated: ['user', 'role'] });
  rows = rows.map(row => {
    return {
      userId: row.related('user').get('id'),
      email: row.related('user').get('email'),
      firstName: row.related('user').get('firstName'),
      lastName: row.related('user').get('lastName'),
      isActive: row.related('user').get('isActive'),
      role: row.related('role').get('role')
    };
  });

  res.json({ success: true, users: rows });
});

router.get('/invite', async (req, res) => {
  const token = req.query.token;

  const validated = User.validateToken(token);
  if (!validated.valid || !validated.data || !validated.data.userId || !validated.data.orgId) return res.boom.badData('Bad data', { success: false });

  const user = await User.where({ id: validated.data.userId }).fetch();
  if (!user) return res.boom.badData('Bad data', { success: false, message: 'Invitation token invalid or expired' });

  const organization = await Organization.where({ id: validated.data.orgId }).fetch();
  if (!organization) return res.boom.badData('Bad data', { success: false, message: 'Invitation token invalid or expired' });

  res.json({ success: true, email: validated.data.email, organization: organization.get('name') });
});

router.post('/:orgId/invitelink', [middlewares.LoginRequired, validate(InviteLinkSchema)], async (req, res) => {
  const email = req.body.email;
  const orgId = req.params.orgId;

  const organization = await Organization.where({ id: orgId }).fetch();
  if (!organization) return res.boom.notFound('Not found', { success: false, message: `Organization not found` });

  let user = await User.where({ email }).fetch();

  if (user) {
    const access = await UORole.where({ user_id: user.id, organization_id: organization.id }).fetch();
    if (access) return res.boom.conflict('Exists', { success: false, message: `User ${email} already have access to organization ${organization.get('name')}` });
  };

  const currentUser = await User.where({ id: req.user.id }).fetch();

  const token = await currentUser.generateToken({ expiresIn: '1d' }, { email, orgId: orgId });
  const confirmUrl = Config.siteUrl + 'account/invite/?token=' + token;

  var mail = {
    from: Config.mailerConfig.from,
    to: email,
    subject: 'invitelink',
    template: 'invite-link-registration',
    context: {
      confirmationUrl: confirmUrl
    }
  };
  mailer.sendMail(mail);

  return res.json({ success: true, confirmUrl });
});

router.post('/:orgId/users/remove', middlewares.LoginRequired, async (req, res) => {
  const usersId = req.body.usersId;
  const orgId = req.params.orgId;
  console.log(req.body);

  const isAdmin = await UORole.where({ organization_id: orgId, user_id: req.user.id, role_id: Role.AdminRoleId }).fetch();
  if (!isAdmin) return res.boom.forbidden('Forbidden', { success: false, message: 'Organization admin privileges required' });

  const organization = await Organization.where({ id: orgId }).fetch();
  if (!organization) return res.boom.notFound('Not found', { success: false, message: 'Organization not found.' });

  let currentAdmins = await UORole.where({ organization_id: orgId, role_id: Role.AdminRoleId }).fetchAll();
  currentAdmins = currentAdmins.map(row => row.get('userId'));

  const remainsAdmins = _.difference(currentAdmins, usersId);

  if (remainsAdmins.length < 1) return res.boom.conflict('Conflict', { success: false, message: 'At least one admin must remains in' });

  await UORole.where('user_id', 'IN', usersId).where('organization_id', orgId).destroy();

  return res.json({ success: true });
});

router.put('/:orgId/admin/grant', middlewares.LoginRequired, async (req, res) => {
  const usersId = req.body.usersId;
  const organizationId = req.params.orgId;

  const isAdmin = await UORole.where({ organization_id: organizationId, user_id: req.user.id, role_id: Role.AdminRoleId }).fetch();
  if (!isAdmin) return res.boom.forbidden('Forbidden', { success: false, message: 'Organization admin privileges required' });

  let users = await knex('users_organizations_roles')
    .where({ organization_id: organizationId })
    .where('user_id', 'in', usersId)
    .update('role_id', Role.AdminRoleId);

  res.json({ success: true, users });
});

router.put('/:orgId/admin/revoke', middlewares.LoginRequired, async (req, res) => {
  const usersId = req.body.usersId;
  const organizationId = req.params.orgId;

  const isAdmin = await UORole.where({ organization_id: organizationId, user_id: req.user.id, role_id: Role.AdminRoleId }).fetch();
  if (!isAdmin) return res.boom.forbidden('Forbidden', { success: false, message: 'Organization admin privileges required' });

  let users = await knex('users_organizations_roles')
    .where({ organization_id: organizationId })
    .where('user_id', 'in', usersId)
    .update('role_id', Role.MemberRoleId);

  res.json({ success: true, users });
});

module.exports = router;
