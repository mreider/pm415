const Express = require('express');
const Nodemailer = require('nodemailer');
const SendGridTransport = require('nodemailer-sendgrid-transport');
const Handlebars = require('nodemailer-express-handlebars');
const models = require('../models');
const Config = require('../config');

const {validate, LoginSchema, RegisterSchema} = require('../validation');

const router = Express.Router();
const mailer = Nodemailer.createTransport(SendGridTransport(Config.mailerConfig));
mailer.use('compile', Handlebars(Config.mailerConfig.rendererConfig));

router.post('/login', validate(LoginSchema), async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = await models.User.findOne({where: {email: email}});
  if (!user) return res.boom.notFound('Not found', {success: false, message: `User with email ${email} not found.`});
  if (!user.isActive || !user.confirmedAt) return res.boom.forbidden('Forbidden', {success: false, message: 'User not confirmed or inactive'});

  await user.checkPassword(password);

  const role = await user.getRole();

  const token = await user.generateToken();
  res.json({token: token, isAdmin: user.hasRole(models.User.AdminRole), success: true});
  // res.json({token: token, isAdmin: true, success: true});
});

router.post('/register', validate(RegisterSchema), async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let user = await models.User.findOne({where: {email: email}});
  if (user) return res.boom.conflict('Exists', {success: false, message: `User with email ${email} already exists`});

  user = await models.User.create(email, password);
  const token = await user.generateToken({expiresIn: '1d'});

  var mail = {
    from: Config.mailerConfig.from,
    to: user.email,
    subject: 'Email verification',
    template: 'email-verification',
    context: {
      confirm_url: Config.siteUrl + 'verify/?token=' + token
    }
  };

  mailer.sendMail(mail);
  res.json({userId: user.id, success: true});
});

module.exports = router;
