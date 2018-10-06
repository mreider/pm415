const Express = require('express');

const router = Express.Router();
const Role = require('../models/role');
const UOrole = require('../models/users_organizations_roles');
const middlewares = require('../middlewares');

router.get('/', function(req, res) {
  res.send('Wanna something?');
});

router.put('/orgs/autorize', middlewares.OrgAdminRequired, async (req, res) => {
  const usersId = req.body.ids;
  const orgid = req.body.orgid;
  const dataToUpdate = await UOrole.where('user_id', ' in ', usersId).where({ role_id: Role.PendingRoleId, organization_id: orgid }).fetchAll();
  if (!dataToUpdate) return res.boom.conflict('Not found', { success: false, message: `No data to update` });
  await UOrole.where('user_id', ' in ', usersId).where({ role_id: Role.PendingRoleId, organization_id: orgid }).save({
    role_id: Role.MemberRoleId }, {
    method: 'update', patch: true }
  );
  res.json({ Updated: dataToUpdate, success: true });
});

module.exports = router;
