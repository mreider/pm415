const Express = require('express');

const router = Express.Router();

router.get('/', function(req, res) {
  res.json({org_id : 1, org_name : 'company name', admins : [1,2,3,4], authorized : [1,2],  verified: [1], backlogs : [1,2], strategic_i : [11,233,44] });
});

module.exports = router;
