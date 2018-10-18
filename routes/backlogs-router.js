const Express = require('express');

const router = Express.Router();
const UORole = require('../models/users_organizations_roles');
const Role = require('../models/role');
const Backlog = require('../models/backlog');
const middlewares = require('../middlewares');
const _ = require('lodash');

const { validate, BackLogsSelectSchema, UpdateBacklogSchema } = require('../validation');

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

// awalible backlogs 2 type of returned data for list(FullSelect = false) and for element (FullSelect = true)
router.post('/:orgId', [middlewares.LoginRequired, validate(BackLogsSelectSchema)], async function(req, res) {
  const orgId = parseInt(req.params.orgId);
  const organization = _.find(req.user.organizations, org => { return org.id === orgId; });

  if (!organization) return res.boom.forbidden('Forbidden', { success: false, message: 'Organization privileges required' });
  const backlogs = await Backlog.where({ organization_id: orgId }).where('id', 'in', req.body.backlogsId).fetchAll(Backlog.fieldsToShow(req.body.fullSelect));

  res.json({ success: true, backlogs, orgs: organization });
});

// edit backlogs
router.put('/:orgId/:backlogId', [middlewares.LoginRequired, validate(UpdateBacklogSchema)], async function(req, res) {
  const orgId = parseInt(req.params.orgId);
  const backlogId = parseInt(req.params.backlogId);
  const organization = _.find(req.user.organizations, org => { return org.id === orgId; });
  let data = req.body;

  if (JSON.stringify(data) === '{}') return res.boom.conflict('Conflict', { success: false, message: 'No data to update' });

  if (!organization) return res.boom.forbidden('Forbidden', { success: false, message: 'Organization privileges required' });
  const backlog = await Backlog.where({ organization_id: orgId }).where('id', '=', backlogId).fetch();

  backlog.set(data);
  await backlog.save();

  res.json({ success: true, orgs: organization, backlog });
});

module.exports = router;
