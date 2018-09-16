const Express = require('express');
const Nodemailer = require('nodemailer');
const SendGridTransport = require('nodemailer-sendgrid-transport');
const Handlebars = require('nodemailer-express-handlebars');
const Jwt = require('jsonwebtoken');
const User = require('../models/user');
const Config = require('../config');

const {validate, LoginSchema, RegisterSchema, VerifySchema} = require('../validation');

const router = Express.Router();
const mailer = Nodemailer.createTransport(SendGridTransport(Config.mailerConfig));
mailer.use('compile', Handlebars(Config.mailerConfig.rendererConfig));

router.post('/login', validate(LoginSchema), async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = await User.findOne({email: email});
  if (!user) return res.boom.notFound('Not found', {success: false, message: `User with email ${email} not found.`});
  if (!user.isActive || !user.confirmedAt) return res.boom.forbidden('Forbidden', {success: false, message: 'User not confirmed or inactive'});

  await user.checkPassword(password);

  const token = Jwt.sign({userId: user._id.toString()}, Config.appKey, Config.jwtOptions);
  res.json({token: token, isAdmin: user.hasRole(User.AdminRole), success: true});
});

router.post('/register', validate(RegisterSchema), async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  let user = await User.findOne({email: email});
  if (user) return res.boom.conflict('Exists', {success: false, message: `User with email ${email} already exists`});

  user = await User.create(email, password);
  const token = user.generateConfirmationToken();

  var mail = {
    from: Config.mailerConfig.from,
    to: user.email,
    subject: 'Email verification',
    template: 'email-verification',
    context: {
      confirm_url: Config.siteUrl + 'verify/?token=' + token
    }
  };
  console.log("1", mail);
  mailer.sendMail(mail);
  res.json({userId: user._id.toString(), success: true});

});
 



module.exports = router;
