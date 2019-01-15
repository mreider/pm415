const Express = require('express');

const router = Express.Router();
const UORole = require('../models/users_organizations_roles');
const User = require('../models/user');
const Role = require('../models/role');
const Backlog = require('../models/backlog');
const Statuses = require('../models/statuses');
const middlewares = require('../middlewares');
const knex = require('../db').knex;
const Utils = require('../utils');
const UtilsAsync = require('../utilsAsync');
const Item = require('../models/items');

const { validate, CreateBacklogSchema, BackLogsSelectSchema, UpdateBacklogSchema } = require('../validation');

// list of available backlogs for a particular organization, and whether the user is an admin
router.get('/:showArchived/:orgId', middlewares.LoginRequired, async function(req, res) {
  const orgId = parseInt(req.params.orgId);
  const showArchived = req.params.showArchived;

  let where = { organization_id: orgId };
  if (showArchived === 'false') where.archived = 0;

  const columns = Backlog.fieldsToShow(false, 'b.', ['u.email', 'u.first_name as firstName', 'u.last_name as lastName']).columns;
  let rows = await knex('backlogs as b').select(columns)
    .leftJoin('users as u', 'b.created_by', 'u.id')
    .where(where);
  rows = Utils.serialize(rows);
  const isAdmin = await UORole.where({ organization_id: orgId, user_id: req.user.id, role_id: Role.AdminRoleId }).fetch();

  if (Utils.isPendingUser(orgId, req)) return res.boom.forbidden('Forbidden', { success: false, message: 'Organization privileges required' });

  res.json({ success: true, backlogs: rows, admin: !!isAdmin });
});

// one backlog info
router.get('/one/:orgId/:backlogId', middlewares.LoginRequired, async function(req, res) {
  const orgId = parseInt(req.params.orgId);
  const backlogId = parseInt(req.params.backlogId);
  const columns = Backlog.fieldsToShow(true, 'b.').columns;
  let rows = await knex('backlogs as b').select(columns)
    .where({ organization_id: orgId })
    .where('b.id', '=', backlogId);
  const isAdmin = await UORole.where({ organization_id: orgId, user_id: req.user.id, role_id: Role.AdminRoleId }).fetch();

  if (Utils.isPendingUser(orgId, req)) return res.boom.forbidden('Forbidden', { success: false, message: 'Organization privileges required' });
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

  if (Utils.isPendingUser(orgId, req)) return res.boom.forbidden('Forbidden', { success: false, message: 'Organization privileges required' });

  const backlogs = await Backlog.where({ organization_id: orgId }).where('id', 'in', req.body.backlogsId).fetchAll(Backlog.fieldsToShow(req.body.fullSelect));

  res.json({ success: true, backlogs });
});

// edit backlogs
router.put('/edit/:orgId/:backlogId', [middlewares.LoginRequired, validate(UpdateBacklogSchema)], async function(req, res) {
  const orgId = parseInt(req.params.orgId);
  const backlogId = parseInt(req.params.backlogId);
  let data = req.body;

  if (Utils.isPendingUser(orgId, req)) return res.boom.forbidden('Forbidden', { success: false, message: 'Organization privileges required' });

  const backlog = await Backlog.where({ organization_id: orgId }).where('id', '=', backlogId).fetch();
  if (!backlog) return res.boom.notFound('Not found', { success: false, message: `Backlog with ID ${backlogId} not found.` });

  const oldStatusId = backlog.get('statusId');
  const newStatusId = Number.parseInt(data.statusId);

  if (oldStatusId !== newStatusId) {
    if (newStatusId === Statuses.statusPlannedId) {
      data.plannedOn = new Date();
    } else if (newStatusId === Statuses.statusDoneId) {
      data.actualRelease = new Date();
    } else if (newStatusId === Statuses.statusUnplannedId) {
      data.actualRelease = null;
      data.plannedOn = null;
    };
  };

  backlog.set(data);
  await backlog.save();

  res.json({ success: true, backlog });
  await UtilsAsync.addDataToIndex(backlog, 'backlogs', 'put');
});

// new backlog POST
router.post('/new/:orgId', [middlewares.LoginRequired, validate(CreateBacklogSchema)], async function(req, res) {
  const orgId = parseInt(req.params.orgId);
  let data = req.body;
  data.organization_id = orgId;
  data.created_by = req.user.id;

  if (Utils.isPendingUser(orgId, req)) return res.boom.forbidden('Forbidden', { success: false, message: 'Organization privileges required' });

  const newStatusId = Number.parseInt(data.statusId);
  // switch else if todo
  if (newStatusId) {
    if (newStatusId === Statuses.statusPlannedId) {
      data.plannedOn = new Date();
    } else if (newStatusId === Statuses.statusDoneId) {
      data.actualRelease = new Date();
    } else if (newStatusId === Statuses.statusUnplannedId) {
      data.actualRelease = null;
      data.plannedOn = null;
    };
  };

  const backlog = await Backlog.create(data);
  res.json({ success: true, backlog });
  await UtilsAsync.addDataToIndex(backlog, 'backlogs', 'put');
});

// delete backlogs
router.delete('/:orgId/:backlogId', [middlewares.LoginRequired], async function(req, res) {
  const orgId = parseInt(req.params.orgId);
  const backlogId = parseInt(req.params.backlogId);

  if (Utils.isPendingUser(orgId, req)) return res.boom.forbidden('Forbidden', { success: false, message: 'Organization privileges required' });
  const isAdmin = await UORole.where({ organization_id: orgId, user_id: req.user.id, role_id: Role.AdminRoleId }).fetch();

  const backlog = await Backlog.where({ organization_id: orgId }).where('id', '=', backlogId).fetch();
  if (backlog) {
    if (backlog.get('createdBy') !== req.user.id && !isAdmin) return res.boom.forbidden('Forbidden', { success: false, message: 'Only admin or owner can delete backlog' });
  } else {
    return res.boom.forbidden('Forbidden', { success: false, message: 'backlog not found' });
  };
  await UtilsAsync.addDataToIndex(backlog, 'backlogs', 'delete');
  // delete all dependent data
  let columns = Item.fieldsToShow(true, '', ['organization_id as organizationId']).columns;
  let rows = await knex('items').select(columns).where({ owner_id: backlogId });
  rows = Utils.serialize(rows);
  for (const element of rows) {
    let columnComment = ['id', 'owner_id as ownerId', 'owner_table as ownerTable', 'comment', 'created_by as createdBy', 'created_at as createdAt', 'organization_id as organizationId'];
    let rowsComment = await knex('comments as b').select(columnComment).where({ owner_id: element.id });
    rowsComment = Utils.serialize(rowsComment);
    for (const elementC of rowsComment) {
      await UtilsAsync.addDataToIndex(elementC, 'comments', 'delete');
    };
    await UtilsAsync.addDataToIndex(element, 'items', 'delete');
    await knex('comments').del().where({ owner_id: element.id, owner_table: 'items' });
    await knex('connections').del().where({ item_id: element.id });
  };
  await knex('items').del().where({ owner_id: backlogId });
  // delete all dependent data
  await backlog.destroy();

  res.json({ success: true, backlog: backlogId, message: 'Backlog deleted' });
});

module.exports = router;
