const Express = require('express');

const router = Express.Router();
const UORole = require('../models/users_organizations_roles');
const Role = require('../models/role');
const Backlog = require('../models/backlog');
const middlewares = require('../middlewares');

// list of available backlogs for a particular organization, and whether the user is an admin
router.get('/:orgId', middlewares.LoginRequired, async function(req, res) {
  const orgId = parseInt(req.params.orgId);
  let rows = await Backlog.where({ organization_id: orgId }).fetchAll();
  const isAdmin = await UORole.where({ organization_id: orgId, user_id: req.user.id, role_id: Role.AdminRoleId }).fetch();

  rows = rows.map(row => {
    return {
      backlogId: row.get('id')
    };
  });

  res.json({ success: true, backlogs: rows, admin: !!isAdmin });
});

router.post('/:orgId', middlewares.LoginRequired, async function(req, res) {

});

module.exports = router;
