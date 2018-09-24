const Express = require('express');
const router = Express.Router();
const middlewares = require('../middlewares');
const Organization = require('../models/organization');
const OmitDeep = require('omit-deep');

router.get('/', middlewares.LoginRequired, function (req, res) {
  const user = OmitDeep(req.user.toJSON(), ['password']);
  res.json({ success: true, organizations: user.organizations, current: req.organization });
});

router.post('/switch/:organizationId', middlewares.LoginRequired, async (req, res) => {
  const organizationId = parseInt(req.params.organizationId);

  const organization = req.user.related('organizations').filter(o => o.get('id') === organizationId)[0];

  if (!organization) return res.boom.notFound('Not found', { success: false, message: `Organization with ID ${organizationId} not found.` });

  const token = await req.user.generateToken({}, { organizationId });

  return res.json({ success: true, organization, token });
});

router.get('/users/:organizationId', middlewares.LoginRequired, async (req, res) => {
  const organizationId = parseInt(req.params.organizationId);
  console.log(organizationId);
  const organization = await Organization.where({ 'id': organizationId }).fetch({ withRelated: ['users.roles'] });
  console.log(organization);
  // var user = organization.related('users').map(us => {
  //   const role = us.related('roles').first();

  //   return {
  //     id: us.get('id'),
  //     name: us.get('name'),
  //     role_id: role && role.get('id'),
  //     role: role && role.get('role')
  //   };
  // });

  res.json({ success: true, organization });
});

module.exports = router;
