const _ = require('lodash');
const Express = require('express');
const Nodemailer = require('nodemailer');
const SendGridTransport = require('nodemailer-sendgrid-transport');
const Handlebars = require('nodemailer-express-handlebars');

const Config = require('../config');
const Utils = require('../utils');

const { validate, LoginSchema, RegisterSchema, ForgotPasswordSchema } = require('../validation');

const User = require('../models/user');

const router = Express.Router();
const mailer = Nodemailer.createTransport(SendGridTransport(Config.mailerConfig));
mailer.use('compile', Handlebars(Config.mailerConfig.rendererConfig));

router.post('/login', validate(LoginSchema), async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = await User.where({ email }).fetch({ withRelated: ['organizations'] });
  if (!user) return res.boom.notFound('Not found', { success: false, message: `User with email ${email} not found.` });
  if (!user.get('isActive') || !user.get('confirmedAt')) return res.boom.forbidden('Forbidden', { success: false, message: 'User not confirmed or inactive' });

  await user.checkPassword(password);

  const orgId = _.get(user.related('organizations'), 'models[0].id');

  const token = await user.generateToken({}, { organizationId: orgId });
  res.json({ token: token, success: true, user: Utils.serialize(user) });
});

router.post('/forgotpassword', validate(ForgotPasswordSchema), async (req, res) => {
  const email = req.body.email;

  const user = await User.where({ email }).fetch();
  if (!user) return res.boom.notFound('Not found', { success: false, message: `User with email ${email} not found.` });

  const token = await user.generateToken({ expiresIn: '1d' }, { email: email });

  var mail = {
    from: Config.mailerConfig.from,
    to: user.get('email'),
    subject: 'Password recovery',
    template: 'forgotpassword-verification',
    context: {
      confirm_url: Config.siteUrl + 'forgotpassword/?token=' + token
    }
  };

  mailer.sendMail(mail);

  res.json({ message: `A message was sent to the ${email}`, success: true, userId: user.id });
});

router.post('/register', validate(RegisterSchema), async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const organization = req.body.organization;
  const confirmation = req.body.confirmation;

  let user = await User.where({ email }).fetch();
  if (user) return res.boom.conflict('Exists', { success: false, message: `User with email ${email} already exists` });
  if (password !== confirmation) return res.boom.conflict('Not confirmed password', { success: false, message: `Password and confirmation doesn't match` });

  user = await User.create(email, password, firstName, lastName, organization);

  const token = await user.generateToken({ expiresIn: '1d' });

  var mail = {
    from: Config.mailerConfig.from,
    to: user.get('email'),
    subject: 'Email verification',
    template: 'email-verification',
    context: {
      confirm_url: Config.siteUrl + 'verify/?token=' + token
    }
  };

  mailer.sendMail(mail);
  res.json({ userId: user.id, success: true });
});

router.post('/changepassword', async(req, res) => {
  const token = req.body.token;
  const password = req.body.password;
  const confirmation = req.body.confirmation;
  let user = await User.resetPassword(token, password, confirmation);
  res.json({ userId: user.id, success: true });
});

module.exports = router;
