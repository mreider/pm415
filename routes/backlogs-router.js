const Express = require('express');

const router = Express.Router();
const UORole = require('../models/users_organizations_roles');
const User = require('../models/user');
const Role = require('../models/role');
const Backlog = require('../models/backlog');
const middlewares = require('../middlewares');
const _ = require('lodash');
const knex = require('../db').knex;
const Utils = require('../utils');

const { validate, CreateBacklogSchema, BackLogsSelectSchema, UpdateBacklogSchema } = require('../validation');

// list of available backlogs for a particular organization, and whether the user is an admin
router.get('/:orgId', middlewares.LoginRequired, async function(req, res) {
  const orgId = parseInt(req.params.orgId);
  const columns = Backlog.fieldsToShow(false, 'b.', ['u.email', 'u.first_name as firstName', 'u.last_name as lastName']).columns;
  let rows = await knex('backlogs as b').select(columns)
    .leftJoin('users as u', 'b.created_by', 'u.id')
    .where({ organization_id: orgId });
  rows = Utils.serialize(rows);
  const isAdmin = await UORole.where({ organization_id: orgId, user_id: req.user.id, role_id: Role.AdminRoleId }).fetch();

  if (isPendingUser(orgId, req)) return res.boom.forbidden('Forbidden', { success: false, message: 'Organization privileges required' });

  res.json({ success: true, backlogs: rows, admin: !!isAdmin });
});

// one backlog info
router.get('/:orgId/:backlogId', middlewares.LoginRequired, async function(req, res) {
  const orgId = parseInt(req.params.orgId);
  const backlogId = parseInt(req.params.backlogId);
  const columns = Backlog.fieldsToShow(true, 'b.').columns;
  let rows = await knex('backlogs as b').select(columns)
    .where({ organization_id: orgId })
    .where('b.id', '=', backlogId);
  const isAdmin = await UORole.where({ organization_id: orgId, user_id: req.user.id, role_id: Role.AdminRoleId }).fetch();

  if (isPendingUser(orgId, req)) return res.boom.forbidden('Forbidden', { success: false, message: 'Organization privileges required' });
  if (Utils.serialize(rows).length === 0) return res.boom.notFound('Not found', { success: false, message: `Backlog not found.` });

  const author = await User.where({ id: rows[0].createdBy }).fetch({ columns: ['first_name', 'last_name', 'id', 'email'] });
  const assignee = await User.where({ id: rows[0].assignee }).fetch({ columns: ['first_name', 'last_name', 'id as userId', 'email'] });

  rows[0].author = Utils.serialize(author);
  if (assignee) rows[0].assignee = Utils.serialize(assignee);
  if (!assignee) rows[0].assignee = { firstName: '', lastName: '', email: '', id: 0 };
  rows = Utils.serialize(rows);

  res.json({ success: true, backlog: rows[0], admin: !!isAdmin });
});

// awalible backlogs 2 type of returned data for list(FullSelect = false) and for element (FullSelect = true)
router.post('/:orgId', [middlewares.LoginRequired, validate(BackLogsSelectSchema)], async function(req, res) {
  const orgId = parseInt(req.params.orgId);

  if (isPendingUser(orgId, req)) return res.boom.forbidden('Forbidden', { success: false, message: 'Organization privileges required' });

  const backlogs = await Backlog.where({ organization_id: orgId }).where('id', 'in', req.body.backlogsId).fetchAll(Backlog.fieldsToShow(req.body.fullSelect));

  res.json({ success: true, backlogs });
});

// edit backlogs
router.put('/edit/:orgId/:backlogId', [middlewares.LoginRequired, validate(UpdateBacklogSchema)], async function(req, res) {
  const orgId = parseInt(req.params.orgId);
  const backlogId = parseInt(req.params.backlogId);
  let data = req.body;

  if (JSON.stringify(data) === '{}') return res.boom.conflict('Conflict', { success: false, message: 'No data to update' });
  if (isPendingUser(orgId, req)) return res.boom.forbidden('Forbidden', { success: false, message: 'Organization privileges required' });

  const backlog = await Backlog.where({ organization_id: orgId }).where('id', '=', backlogId).fetch();
  if (!backlog) return res.boom.notFound('Not found', { success: false, message: `Backlog with ID ${backlogId} not found.` });

  backlog.set(data);
  await backlog.save();

  res.json({ success: true, backlog });
});

// new backlog
router.put('/new/:orgId', [middlewares.LoginRequired, validate(CreateBacklogSchema)], async function(req, res) {
  const orgId = parseInt(req.params.orgId);
  let data = req.body;
  data.organization_id = orgId;
  data.created_by = req.user.id;
  if (JSON.stringify(data) === '{}') return res.boom.conflict('Conflict', { success: false, message: 'No data to create new backlog' });
  if (isPendingUser(orgId, req)) return res.boom.forbidden('Forbidden', { success: false, message: 'Organization privileges required' });
  const backlog = await Backlog.create(data);
  res.json({ success: true, backlog });
});

// delete backlogs
router.delete('/:orgId/:backlogId', [middlewares.LoginRequired, validate(UpdateBacklogSchema)], async function(req, res) {
  const orgId = parseInt(req.params.orgId);
  const backlogId = parseInt(req.params.backlogId);

  if (isPendingUser(orgId, req)) return res.boom.forbidden('Forbidden', { success: false, message: 'Organization privileges required' });
  const isAdmin = await UORole.where({ organization_id: orgId, user_id: req.user.id, role_id: Role.AdminRoleId }).fetch();

  const backlog = await Backlog.where({ organization_id: orgId }).where('id', '=', backlogId).fetch();
  if (backlog) {
    if (backlog.get('createdBy') !== req.user.id && !isAdmin) return res.boom.forbidden('Forbidden', { success: false, message: 'Only admin or owner can delete backlog' });
  } else {
    return res.boom.forbidden('Forbidden', { success: false, message: 'backlog not found' });
  };
  await backlog.destroy();

  res.json({ success: true, backlog: backlogId, message: 'Backlog deleted' });
});

function isPendingUser(orgId, req) {
  const organization = _.find(req.user.organizations, org => { return org.id === orgId; });
  if (!organization) return true;

  const RolePending = _.find(organization.roles, role => { return role.id === Role.PendingRoleId; });
  if (RolePending) return true;

  return false;
};

module.exports = router;
