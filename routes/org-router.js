const Express = require('express');

const router = Express.Router();

const middlewares = require('../middlewares');

const Organization = require('../models/organization');

router.get('/', function(req, res) {
  res.json({org_id : 1, org_name : 'company name', admins : [1,2,3,4], authorized : [1,2],  verified: [1], backlogs : [1,2], strategic_i : [11,233,44] });
});

router.post('/switch/:organizationId', middlewares.LoginRequired, async (req, res) => {
  const organizationId = parseInt(req.params.organizationId);
  const organization = await Organization.where({id: organizationId}).fetch();

  if (!organization) return res.boom.notFound('Not found', {success: false, message: `Organization with ID ${organizationId} not found.`});

  const token = await req.user.generateToken({}, {organizationId});

  return res.json({success: true, organization, token});
});

module.exports = router;
