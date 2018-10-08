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

const { validate, NewOrganizationSchema, InviteLinkSchema, UpdateOrganizationSchema } = require('../validation');

const mailer = Nodemailer.createTransport(SendGridTransport(Config.mailerConfig));

mailer.use('compile', Handlebars(Config.mailerConfig.rendererConfig));

router.get('/invitelink', async (req, res) => {
  const token = req.query.token;

  const validated = User.validateToken(token);
  if (!validated.valid || !validated.data || !validated.data.userId) return res.json({ success: false, registration: 'false' });

  const user = await User.where({ email: validated.data.email }).fetch();

  if (!user) return res.json({ success: true, message: 'Invitation token corrupted or expired' });

  res.json({ success: true, registration: 'add', email: validated.data.email, orgId: validated.data.organization });
});

router.get('/', middlewares.LoginRequired, function (req, res) {
  const user = OmitDeep(req.user, ['password']);
  res.json({ success: true, organizations: user.organizations, current: req.organization });
});

router.post('/switch/:orgId', middlewares.LoginRequired, async (req, res) => {
  const orgId = parseInt(req.params.orgId);

  const organization = req.user.organizations.filter(o => o.id === orgId)[0];

  if (!organization) return res.boom.notFound('Not found', { success: false, message: `Organization with ID ${orgId} not found.` });

  const token = await User.forge({ id: req.user.id }).generateToken({}, { orgId });

  return res.json({ success: true, organization, token });
});

router.get('/:orgId/users', middlewares.LoginRequired, async (req, res) => {
  const orgId = req.params.orgId;

  let rows = await UORole.where('organization_id', orgId).fetchAll({ withRelated: ['user', 'role'] });
  rows = rows.map(row => {
    return {
      userId: row.get('userId'),
      firstName: row.related('user').get('firstName'),
      lastName: row.related('user').get('lastName'),
      role: row.related('role').get('role')
    };
  });

  res.json({ success: true, users: rows });
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

router.post('/invitelink', [middlewares.LoginRequired, validate(InviteLinkSchema)], async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  let organization = await Organization.where({ name }).fetch();
  if (!organization) return res.boom.conflict('Not found', { success: false, message: `Organization with the name ${name} was not found` });
  let user = await User.where({ email }).fetch();
  if (user) {
    let uorole = await UORole.where({ user_id: user.id, organization_id: organization.id });
    if (uorole) return res.boom.conflict('Exists', { success: false, message: `This user already have access to this organization ${email}, ${organization}` });
  };
  const token = await req.user.generateToken({ expiresIn: '1d' }, { email: email, organization: organization.id });

  var mail = {
    from: Config.mailerConfig.from,
    to: email,
    subject: 'invitelink',
    template: 'invite-link-registration',
    context: {
      confirm_url: Config.siteUrl + 'invitelink/?token=' + token
    }
  };

  mailer.sendMail(mail);
  return res.json({ success: true, organization, user: req.user, token });
});

router.post('/:orgId/users/remove', middlewares.OrgAdminRequired, async (req, res) => {
  const usersId = req.body.usersid;
  const orgId = req.params.orgId;

  const isAdmin = await UORole.where({ organization_id: orgId, user_id: req.user.id, role_id: Role.AdminRoleId }).fetch();
  if (!isAdmin) return res.boom.forbidden('Forbidden', { success: false, message: 'Organization admin privileges required' });

  const organization = await Organization.where({ id: orgId }).fetch();
  if (!organization) return res.boom.notFound('Not found', { success: false, message: 'Organization not found.' });

  let currentAdmins = await UORole({ organization_id: orgId, role_id: Role.AdminRoleId }).fetchAll();
  currentAdmins = currentAdmins.map(row => row.get('userId'));

  const remainsAdmins = _.difference(currentAdmins, usersId);

  if (remainsAdmins.length < 1) return res.conflict('Conflict', {success: false, message: 'At least one admin must remains in'})

  return res.json({ success: true });
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

router.post('/:orgId/admin/grant', middlewares.OrgAdminRequired, async (req, res) => {
  // TODO: Alex, please rewrite method from below to smaller one here
});

router.post('/:orgId/admin/revoke', middlewares.OrgAdminRequired, async (req, res) => {
  // TODO: Alex, please rewrite method from below to smaller one here
});

// TODO: Implement grant/revoke methods and remove this method
// router.post('/changerole/users', middlewares.OrgAdminRequired, async (req, res) => {
//   const orgId = parseInt(req.organization.id);
//   const usersId = req.body.usersid;
//   const roleId = req.body.roleid;

//   let users = await knex('users_organizations_roles')
//     .where({ organization_id: orgId })
//     .where('user_id', 'in', usersId)
//     .update('role_id', roleId);
//   res.json({ success: true, users });
// });

module.exports = router;
