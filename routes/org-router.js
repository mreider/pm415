const Express = require('express');
const router = Express.Router();
const middlewares = require('../middlewares');
const Organization = require('../models/organization');
const UORole = require('../models/users_organizations_roles');
const Role = require('../models/role');
// const User = require('../models/user');
const OmitDeep = require('omit-deep');

router.use(middlewares.LoginRequired);
const { validate, NewOrganizationSchema } = require('../validation');

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
  const UO = await UORole.where({ organization_id: organizationId }).fetchAll();
  // var userid = UO.map(us => {
  //     const user = await User.where({ 'id': UO.userId }).fetch({ withRelated: ['roles'] });

  // }};

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

  res.json({ success: true, UO });
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

module.exports = router;
