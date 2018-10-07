const Express = require('express');
const router = Express.Router();
const middlewares = require('../middlewares');
const Organization = require('../models/organization');
const UORole = require('../models/users_organizations_roles');
const Role = require('../models/role');
const User = require('../models/user');
const OmitDeep = require('omit-deep');
const Config = require('../config');
const Nodemailer = require('nodemailer');
const SendGridTransport = require('nodemailer-sendgrid-transport');
const Handlebars = require('nodemailer-express-handlebars');
const { validate, NewOrganizationSchema, InviteLinkSchema, DeleteOrgSchema, UpdateOrganizationSchema } = require('../validation');
const mailer = Nodemailer.createTransport(SendGridTransport(Config.mailerConfig));
const knex = require('../db').knex;
const Utils = require('../utils');

mailer.use('compile', Handlebars(Config.mailerConfig.rendererConfig));

router.get('/invitelink', async (req, res) => {
  const token = req.query.token;

  const validated = User.validateToken(token);
  if (!validated.valid || !validated.data || !validated.data.userId) return res.json({ success: false, registration: 'false' });
  let orgranization = await Organization.where({ id: validated.data.organization }).fetch();
  if (!orgranization) return res.json({ success: false, registration: 'false' });
  orgranization = Utils.serialize(orgranization);
  const user = await User.where({ email: validated.data.email }).fetch();
  if (!user) return res.json({ success: true, registration: 'new', email: validated.data.email, organization_id: validated.data.organization, orgranization_name: orgranization.name });
  res.json({ success: true, registration: 'add', email: validated.data.email, organization_id: validated.data.organization, orgranization_name: orgranization.name });
});

router.use(middlewares.LoginRequired);

router.get('/', function (req, res) {
  const user = OmitDeep(req.user.toJSON(), ['password']);
  res.json({ success: true, organizations: user.organizations, current: req.organization });
});

router.post('/switch/:organizationId', async (req, res) => {
  const organizationId = parseInt(req.params.organizationId);
  const organization = req.user.related('organizations').filter(o => o.get('id') === organizationId)[0];

  if (!organization) return res.boom.conflict('Not found', { success: false, message: `Organization with ID ${organizationId} not found.` });

  const token = await req.user.generateToken({}, { organizationId });

  return res.json({ success: true, organization, token });
});

router.get('/users/:organizationId', async (req, res) => {
  const organizationId = parseInt(req.params.organizationId);
  let users = await knex('users_organizations_roles').select(
    'users.id',
    'users.email',
    'roles.role',
    'users.first_name',
    'users.last_name',
    'users.is_active',
    'users.api_key').leftJoin(
    'roles', 'users_organizations_roles.role_id', 'roles.id').leftJoin(
    'users', 'users_organizations_roles.user_id', 'users.id').where({ organization_id: organizationId });
  res.json({ success: true, users });
});

router.post('/new', validate(NewOrganizationSchema), async (req, res) => {
  const name = req.body.name;
  let organization = await Organization.where({ name }).fetch();
  if (organization) return res.boom.conflict('Exists', { success: false, message: `Organization with name ${name} already exists` });
  organization = await Organization.create({ name: name });

  let alreadyAdmin = await UORole.where({ user_id: req.user.id, organization_id: organization.id, role_id: Role.AdminRoleId }).fetch(); // I do not know if it's right to keep the admin role id in the code
  if (!alreadyAdmin) alreadyAdmin = await UORole.create({ user_id: req.user.id, organization_id: organization.id, role_id: Role.AdminRoleId });

  return res.json({ success: true, organization, user: req.user });
});

router.post('/invitelink', validate(InviteLinkSchema), async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const send = req.body.send;
  let organization = await Organization.where({ name }).fetch();
  if (!organization) return res.boom.conflict('Not found', { success: false, message: `Organization with the name ${name} was not found` });
  let user = await User.where({ email }).fetch();
  if (user) {
    let uorole = await UORole.where({ user_id: user.id, organization_id: organization.id });
    if (uorole) return res.boom.conflict('Exists', { success: false, message: `This user already have access to this organization ${email}, ${organization}` });
  };
  const token = await req.user.generateToken({ expiresIn: '1d' }, { email: email, organization: organization.id });
  if (send === true) {
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
  }
  return res.json({ success: true, organization, user: req.user, token, confirm_url: Config.siteUrl + 'invitelink/?token=' + token });
});

// admin routes
router.use(middlewares.OrgAdminRequired);
// admin routes

router.post('/delete/users', async (req, res) => {
  const usersId = req.body.usersid;
  const organizationId = req.organization.id;
  try {
    const ourole = await UORole.where({ organization_id: organizationId }).where('user_id', 'in', usersId).where('role_id', '<>', Role.AdminRoleId).fetchAll();
    await UORole.where({ organization_id: organizationId }).where('user_id', 'in', usersId).where('role_id', '<>', Role.AdminRoleId).destroy();
    return res.json({ success: true, allrecords: usersId, organizationId, deleted: ourole });
  } catch (error) {
    return res.json({ success: false });
  }
});

router.post('/update', validate(UpdateOrganizationSchema), async (req, res) => {
  const name = req.body.name;
  const id = req.body.orgid;
  let organization = await Organization.where({ id }).fetch();
  if (!organization) return res.boom.conflict('Not found', { success: false, message: `Organization with id ${id} not found` });
  await knex('organizations')
    .where({ id: id })
    .update('name', name);
  return res.json({ success: true, organization });
});

router.post('/delete', validate(DeleteOrgSchema), async (req, res) => {
  const userId = req.body.userid;
  const organizationId = req.body.orgid;
  const admin = await UORole.where({ organization_id: organizationId, user_id: userId, role_id: Role.AdminRoleId }).fetch();
  const organization = await Organization.where({ id: organizationId }).fetch();
  if (organization && !admin) return res.json({ success: false, message: 'Only the administrator of this organization can delete this organization.' });
  if (!admin && !organization) return res.json({ success: false, message: 'Organization not found.' });
  await UORole.where({ organization_id: organizationId }).destroy();
  await Organization.where({ id: organizationId }).destroy();
  return res.json({ success: true, message: 'Deleted' });
});

router.post('/resetpassword/users', async (req, res) => {
  const usersId = req.body.usersid;
  const users = await User.where('id', 'in', usersId).fetchAll();
  await users.forEach(newPasswordAndSendMail);
  return res.json({ success: true, users });
});

router.post('/changerole/admin/users', async (req, res) => {
  const organizationId = parseInt(req.organization.id);
  const usersId = req.body.usersid;
  const roleId = Role.AdminRoleId;
  let users = await knex('users_organizations_roles')
    .where({ organization_id: organizationId })
    .where('user_id', 'in', usersId)
    .update('role_id', roleId);
  res.json({ success: true, users });
});

router.post('/changerole/member/users', async (req, res) => {
  const organizationId = parseInt(req.organization.id);
  const usersId = req.body.usersid;
  const roleId = Role.MemberRoleId;
  let users = await knex('users_organizations_roles')
    .where({ organization_id: organizationId })
    .where('user_id', 'in', usersId)
    .update('role_id', roleId);
  res.json({ success: true, users });
});

function newPasswordAndSendMail(user) {
  return new Promise(async (resolve, reject) => {
    const randomstring = Math.random().toString(36).slice(-8);
    try {
      const hash = await User.hashPassword(randomstring);
      user.set({ password: hash });
      await user.save();

      var mail = {
        from: Config.mailerConfig.from,
        to: user.get('email'),
        subject: 'Password reset',
        template: 'admin-change-password',
        context: {
          newpassword: randomstring
        }
      };
      mailer.sendMail(mail);

      resolve(user);
    } catch (error) {
      reject(error);
    }
  });
};
module.exports = router;
