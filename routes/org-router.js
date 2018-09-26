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
const { validate, NewOrganizationSchema, InviteLingSchema } = require('../validation');
const mailer = Nodemailer.createTransport(SendGridTransport(Config.mailerConfig));

mailer.use('compile', Handlebars(Config.mailerConfig.rendererConfig));

router.get('/invitelink', async (req, res) => {
  const token = req.query.token;

  const validated = User.validateToken(token);
  if (!validated.valid || !validated.data || !validated.data.userId) return res.json({ success: false, registration: 'false' });

  const user = await User.where({ email: validated.data.email }).fetch();
  if (!user) return res.json({ success: true, registration: 'new', email: validated.data.email, organizationId: validated.data.organization });
  res.json({ success: true, registration: 'add', email: validated.data.email, organizationId: validated.data.organization });
});

router.use(middlewares.LoginRequired);

router.get('/', function (req, res) {
  const user = OmitDeep(req.user.toJSON(), ['password']);
  res.json({ success: true, organizations: user.organizations, current: req.organization });
});

router.post('/switch/:organizationId', async (req, res) => {
  const organizationId = parseInt(req.params.organizationId);

  const organization = req.user.related('organizations').filter(o => o.get('id') === organizationId)[0];

  if (!organization) return res.boom.notFound('Not found', { success: false, message: `Organization with ID ${organizationId} not found.` });

  const token = await req.user.generateToken({}, { organizationId });

  return res.json({ success: true, organization, token });
});

router.get('/users/:organizationId', async (req, res) => {
  const organizationId = parseInt(req.params.organizationId);
  // const UO = await UORole.where({ organization_id: organizationId }).fetchAll({ withRelated: ['roles'] });
  // console.log(UO.related('roles').fetch().toJSON());
  // var userid = UO.related('roles').fetchAll().map(async (us) => {
  //   console.log(us);
  // });

  // );
  // var user = organization.related('users').map(us => {
  //   const role = us.related('roles').first();

  //   return {
  //     id: us.get('id'),
  //     name: us.get('name'),
  //     role_id: role && role.get('id'),
  //     role: role && role.get('role')
  //   };
  // });
  const organization = await Organization.where({ id: organizationId }).fetch({ withRelated: ['roles'] });

  res.json({ success: true, organization });
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

router.post('/invitelink', validate(InviteLingSchema), async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  let organization = await Organization.where({ name }).fetch();
  if (!organization) return res.boom.conflict('Not found', { success: false, message: `Organization with the name ${email} was not found` });
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

module.exports = router;
