const _ = require('lodash');
const Express = require('express');
const Nodemailer = require('nodemailer');
const SendGridTransport = require('nodemailer-sendgrid-transport');
const Handlebars = require('nodemailer-express-handlebars');

const Config = require('../config');
const Utils = require('../utils');

const { validate, LoginSchema, RegisterSchema, ForgotPasswordSchema, ChangePasswordSchema } = require('../validation');

const User = require('../models/user');
const Organization = require('../models/organization');
const Role = require('../models/role');
const UORole = require('../models/users_organizations_roles');

const router = Express.Router();
const mailer = Nodemailer.createTransport(SendGridTransport(Config.mailerConfig));
mailer.use('compile', Handlebars(Config.mailerConfig.rendererConfig));

router.post('/login', validate(LoginSchema), async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = await User.where({ email }).fetch({ withRelated: ['organizations'] });
  if (!user) return res.boom.notFound('Not found', { success: false, message: `User with email ${email} not found.` });
  if (!user.get('isActive') || !user.get('confirmedAt')) return res.boom.forbidden('Forbidden', { success: false, message: 'User not confirmed or inactive' });

  try {
    await user.checkPassword(password);
  } catch (error) {
    return res.boom.unauthorized('Unauthorized', {success: true, message: error.toString()});
  }

  const orgId = _.get(user.related('organizations'), 'models[0].id');
  const token = await user.generateToken({}, { orgId: orgId });

  res.json({ token: token, success: true, user: Utils.serialize(user) });
});

router.post('/forgotpassword', validate(ForgotPasswordSchema), async (req, res) => {
  const email = req.body.email;

  const user = await User.where({ email }).fetch();
  if (!user) return res.boom.notFound('Not found', { success: false, message: `User with email ${email} not found.` });

  const token = await user.generateToken({ expiresIn: '1d' });
  const confirmationUrl = `${Config.siteUrl}reset-password/?token=${token}`;

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

    if (!org) return res.boom.badData('Bad data', { success: false, message: 'Organization is incorrect' });

    await UORole.create({ user_id: user.id, organization_id: orgId, role_id: Role.PendingRoleId });
  } else if (orgName) {
    // User registered - orgName got from form

    const org = Organization.forge({ name: orgName });
    await org.save();

    await UORole.create({ user_id: user.id, organization_id: org.get('id'), role_id: Role.AdminRoleId });
  };

  token = await user.generateToken({ expiresIn: '1d' });
  const confirmationUrl = `${Config.siteUrl}verify/?token=${token}`;

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

module.exports = router;
