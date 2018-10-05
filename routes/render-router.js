const Express = require('express');
const User = require('../models/user');
const router = Express.Router();
const knex = require('../db').knex;
const Role = require('../models/role');
const UORole = require('../models/users_organizations_roles');
const Config = require('../config');
const Nodemailer = require('nodemailer');
const SendGridTransport = require('nodemailer-sendgrid-transport');
const Handlebars = require('nodemailer-express-handlebars');
const mailer = Nodemailer.createTransport(SendGridTransport(Config.mailerConfig));
const Utils = require('../utils');
mailer.use('compile', Handlebars(Config.mailerConfig.rendererConfig));

// TODO: Revert these changes back. Verification works only for one user. If you need another verification - user another url
// router.get('/verify', async (req, res) => {
//   const token = req.query.token;

//   const validated = User.validateToken(token);
//   if (!validated.valid || !validated.data || !validated.data.userId) return res.send('Token is invalid or expired.');

//   const user = await User.where({ id: validated.data.userId }).fetch();
//   if (!user) return res.send('User not found.');
//   user.set({ isActive: true, confirmedAt: new Date() });
//   await user.save();
//   // send mail admins
//   if (validated.data.organization) {
//     const uorole = await UORole.where('role_id', '<>', Role.PendingRoleId).where({ user_id: Number(validated.data.userId), organization_id: Number(validated.data.organization) }).fetch();
//     if (uorole) return res.send('already confirmed');
//     let users = await knex('users_organizations_roles').select('u.email', 'o.name as organization')
//       .leftJoin('users as u', 'users_organizations_roles.user_id', 'u.id')
//       .leftJoin('organizations as o', 'users_organizations_roles.organization_id', 'o.id')
//       .where({ organization_id: validated.data.organization, role_id: Role.AdminRoleId, 'is_active': 1 });
//     let data = {};
//     if (user.get('firstName')) data.firstName = user.get('firstName');
//     if (user.get('lastName')) data.lastName = user.get('lastName');
//     if (user.get('email')) data.email = user.get('email');
//     users = Utils.serialize(users);
//     users.createdUser = data;
//     users.forEach(sendMail, data);
//   }

//   res.send('Your account confirmed successfully.');
// });

// function sendMail(value) {
//   var mail = {
//     from: Config.mailerConfig.from,
//     to: value.email,
//     subject: 'Authorization pending for' + this.firstName + ' ' + this.lastName,
//     template: 'admin-info_pending',
//     context: {
//       firstName: this.firstName,
//       lastName: this.firstName,
//       email: this.email,
//       organization: value.organization
//     }
//   };
//   mailer.sendMail(mail);
// }

module.exports = router;
