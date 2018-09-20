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
  const organization = await Organization.where({ id: organizationId }).fetch();

  if (!organization) return res.boom.notFound('Not found', { success: false, message: `Organization with ID ${organizationId} not found.` });

  const token = await req.user.generateToken({}, { organizationId });

  return res.json({ success: true, organization, token });
});

module.exports = router;
