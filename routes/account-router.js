const _ = require('lodash');
const Express = require('express');
const Nodemailer = require('nodemailer');
const SendGridTransport = require('nodemailer-sendgrid-transport');
const Handlebars = require('nodemailer-express-handlebars');

const Config = require('../config');
const Utils = require('../utils');
const knex = require('../db').knex;

const { validate, LoginSchema, RegisterSchema, ForgotPasswordSchema, ChangePasswordSchema } = require('../validation');

const User = require('../models/user');
const Organization = require('../models/organization');
const Role = require('../models/role');
const UORole = require('../models/users_organizations_roles');

const router = Express.Router();
const mailer = Nodemailer.createTransport(SendGridTransport(Config.mailerConfig));
mailer.use('compile', Handlebars(Config.mailerConfig.rendererConfig));

router.post('/login', validate(LoginSchema), async (req, res) => {
  let email = req.body.email;
  const password = req.body.password;
  let token = req.body.token;
  let orgId;

  if (token) {
    const validated = User.validateToken(token);
    if (!validated.valid || !validated.data || !validated.data.email || !validated.data.orgId) return res.boom.badData('Bad data', { success: false });

    const invitedEmail = validated.data.email;
    if (email !== invitedEmail) return res.boom.badData('Bad data', { success: false, message: 'Invitation email mismatch' });

    email = invitedEmail;
    orgId = validated.data.orgId;
  }

  const user = await User.where({ email }).fetch({ withRelated: ['organizations'] });
  if (!user) return res.boom.notFound('Not found', { success: false, message: `User with email ${email} not found.` });
  if (!user.get('isActive') || !user.get('confirmedAt')) return res.boom.forbidden('Forbidden', { success: false, message: 'User not confirmed or inactive' });

  try {
    await user.checkPassword(password);
  } catch (error) {
    return res.boom.unauthorized('Unauthorized', { success: true, message: 'Unable to login user'; });
  }

  if (token) {
    const organization = await Organization.where({ id: orgId }).fetch();
    if (!organization) return res.boom.notFound('Not found', { success: false, message: 'Invitation organization incorrect' });

    const userOrgRole = await UORole.where({ user_id: user.get('id'), organization_id: orgId }).fetch;

    if (userOrgRole) return res.boom.conflict('Conflict', { success: false, message: 'Invitation already accepted' });

    await UORole.create({ user_id: user.get('id'), organization_id: orgId, role_id: Role.PendingRoleId });
  }

  orgId = _.get(user.related('organizations'), 'models[0].id');

  token = await user.generateToken({}, { orgId: orgId });

  res.json({ token: token, success: true, user: Utils.serialize(user) });
});

router.post('/forgotpassword', validate(ForgotPasswordSchema), async (req, res) => {
  const email = req.body.email;

  const user = await User.where({ email }).fetch();
  if (!user) return res.boom.notFound('Not found', { success: false, message: `User with email ${email} not found.` });

  const token = await user.generateToken({ expiresIn: '1d' });
  const confirmationUrl = `${Config.siteUrl}account/reset-password/?token=${token}`;

  var mail = {
    from: Config.mailerConfig.from,
    to: user.get('email'),
    subject: 'Password recovery',
    template: 'forgotpassword-verification',
    context: {
      confirmationUrl
    }
  };

  mailer.sendMail(mail);

  res.json({ message: `A message was sent to the ${email}`, success: true, userId: user.id });
});

router.post('/register', validate(RegisterSchema), async (req, res) => {
  let email = req.body.email;
  const password = req.body.password;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  let orgName = req.body.organization;
  let orgId = null;
  const confirmation = req.body.confirmation;
  let token = req.body.token; // Used when redirected from invitation link and user already registered

  if (token) {
    // User invited - get sensitive information from token, not from form

    const validated = User.validateToken(token);

    if (!validated.valid || !validated.data || !validated.data.email || !validated.data.orgId) {
      return res.boom.badData('Bad data', { success: false, message: 'Invitation token invalid or expired' });
    }

    if (email !== validated.data.email) return res.boom.badData('Bad data', { success: true, message: 'Email is incorrect' });

    email = validated.data.email;
    orgId = validated.data.orgId;
  }

  let user = await User.where({ email }).fetch();
  if (user) return res.boom.conflict('Exists', { success: false, message: `User with email ${email} already exists` });
  if (password !== confirmation) return res.boom.conflict('Not confirmed password', { success: false, message: `Password and confirmation doesn't match` });

  user = await User.create(email, password, firstName, lastName);

  if (orgId) {
    // User invited - orgId got from token

    const org = await Organization.where({ id: orgId }).fetch();

    if (!org) return res.boom.notFound('Not found', { success: false, message: 'Organization not found' });

    await UORole.create({ user_id: user.id, organization_id: orgId, role_id: Role.PendingRoleId });
  } else if (orgName) {
    // User registered - orgName got from form
    let org = await Organization.where({ name: orgName }).fetch();

    if (org) return res.boom.conflict('Conflict', { success: false, message: `Organization ${orgName} already exists.` });

    org = Organization.forge({ name: orgName });
    await org.save();

    await UORole.create({ user_id: user.id, organization_id: org.get('id'), role_id: Role.AdminRoleId });
  };

  token = await user.generateToken({ expiresIn: '1d' });
  const confirmationUrl = `${Config.siteUrl}account/verify/?token=${token}`;

  var mail = {
    from: Config.mailerConfig.from,
    to: user.get('email'),
    subject: 'Email verification',
    template: 'email-verification',
    context: {
      confirmationUrl
    }
  };

  mailer.sendMail(mail);
  res.json({ userId: user.id, success: true });
});

router.post('/changepassword', validate(ChangePasswordSchema), async(req, res) => {
  const token = req.body.token;
  const password = req.body.password;
  const confirmation = req.body.confirmation;

  let user = await User.resetPassword(token, password, confirmation);

  res.json({ userId: user.id, success: true, message: 'New password saved' });
});

router.get('/verify', async (req, res) => {
  const token = req.query.token;

  const validated = User.validateToken(token);
  if (!validated.valid || !validated.data || !validated.data.userId) return res.json({ success: false, message: 'Token is invalid or expired.' });

  const user = await User.where({ id: validated.data.userId }).fetch();
  if (!user) return res.json({ success: false, message: 'User not found' });
  user.set({ isActive: true, confirmedAt: new Date() });
  await user.save();

  // send mail admins
  if (validated.data.organization) {
    const uorole = await UORole.where({ user_id: Number(validated.data.userId), organization_id: Number(validated.data.organization) }).fetch();
    if (uorole) return res.json({ success: true, message: 'User already confirmed' });
    let users = await knex('users_organizations_roles').select('u.email', 'o.name as organization')
      .leftJoin('users as u', 'users_organizations_roles.user_id', 'u.id')
      .leftJoin('organizations as o', 'users_organizations_roles.organization_id', 'o.id')
      .where({ organization_id: validated.data.organization, role_id: Role.AdminRoleId, 'is_active': 1 });
    let data = {};
    if (user.get('firstName')) data.firstName = user.get('firstName');
    if (user.get('lastName')) data.lastName = user.get('lastName');
    if (user.get('email')) data.email = user.get('email');
    users = Utils.serialize(users);
    users.createdUser = data;
    users.forEach(sendMail, data);
  }

  res.json({ userId: Utils.serialize(user).id, success: true, message: 'User registration is completed, lets go login' });
});

function sendMail(value) {
  var mail = {
    from: Config.mailerConfig.from,
    to: value.email,
    subject: 'Authorization pending for' + this.firstName + ' ' + this.lastName,
    template: 'admin-info_pending',
    context: {
      firstName: this.firstName,
      lastName: this.firstName,
      email: this.email,
      organization: value.organization
    }
  };
  mailer.sendMail(mail);
}

module.exports = router;
