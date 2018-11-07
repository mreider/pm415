const Express = require('express');

const router = Express.Router();
const UORole = require('../models/users_organizations_roles');
const User = require('../models/user');
const Role = require('../models/role');
// const Backlog = require('../models/backlog');
const Statuses = require('../models/statuses');
const Item = require('../models/items.js');
const middlewares = require('../middlewares');
// const _ = require('lodash');
const knex = require('../db').knex;
const Utils = require('../utils');

const { validate, CreateItemSchema, ItemSelectSchema, UpdateItemSchema } = require('../validation');

// list of available items for a particular organization and backlog, and whether the user is an admin
router.get('/:ownerTable/:orgId/:ownerId', middlewares.LoginRequired, async function(req, res) {
  const ownerId = parseInt(req.params.ownerId);
  const ownerTable = req.params.ownerTable;
  const orgId = parseInt(req.params.orgId);
  const columns = Item.fieldsToShow(false, 'i.', ['u.email', 'u.first_name as firstName', 'u.last_name as lastName']).columns;
  let rows = await knex('items as i').select(columns)
    .leftJoin('users as u', 'i.created_by', 'u.id')
    .where({ owner_table: ownerTable, owner_id: ownerId })
    .where({ owner_id: ownerId });
  rows = Utils.serialize(rows);

  const isAdmin = await UORole.where({ organization_id: orgId, user_id: req.user.id, role_id: Role.AdminRoleId }).fetch();

  if (Utils.isPendingUser(orgId, req)) return res.boom.forbidden('Forbidden', { success: false, message: 'Organization privileges required' });

  res.json({ success: true, items: rows, admin: !!isAdmin });
});

// one item info
router.get('/:orgId/:itemId', middlewares.LoginRequired, async function(req, res) {
  const orgId = parseInt(req.params.orgId);
  const itemId = parseInt(req.params.itemId);
  const columns = Item.fieldsToShow(true, 'i.').columns;
  let rows = await knex('items as i').select(columns)
    .where({ organization_id: orgId })
    .where('i.id', '=', itemId);
  const isAdmin = await UORole.where({ organization_id: orgId, user_id: req.user.id, role_id: Role.AdminRoleId }).fetch();

  if (Utils.isPendingUser(orgId, req)) return res.boom.forbidden('Forbidden', { success: false, message: 'Organization privileges required' });
  if (Utils.serialize(rows).length === 0) return res.boom.notFound('Not found', { success: false, message: `Item not found.` });

  const author = await User.where({ id: rows[0].createdBy }).fetch({ columns: ['first_name', 'last_name', 'id', 'email'] });
  const assignee = await User.where({ id: rows[0].assignee }).fetch({ columns: ['first_name', 'last_name', 'id as userId', 'email'] });

  rows[0].author = Utils.serialize(author);
  if (assignee) rows[0].assignee = Utils.serialize(assignee);
  if (!assignee) rows[0].assignee = { firstName: '', lastName: '', email: '', id: 0 };
  rows = Utils.serialize(rows);

  res.json({ success: true, item: rows[0], admin: !!isAdmin });
});

// awalible items 2 type of returned data for list(FullSelect = false) and for element (FullSelect = true)
router.post('/:orgId', [middlewares.LoginRequired, validate(ItemSelectSchema)], async function(req, res) {
  const orgId = parseInt(req.params.orgId);

  if (Utils.isPendingUser(orgId, req)) return res.boom.forbidden('Forbidden', { success: false, message: 'Organization privileges required' });

  const items = await Item.where({ organization_id: orgId }).where('id', 'in', req.body.itemsId).fetchAll(Item.fieldsToShow(req.body.fullSelect));

  res.json({ success: true, items });
});

// edit item
router.put('/edit/:orgId/:itemId', [middlewares.LoginRequired, validate(UpdateItemSchema)], async function(req, res) {
  const orgId = parseInt(req.params.orgId);
  const itemId = parseInt(req.params.itemId);
  let data = req.body;

  if (JSON.stringify(data) === '{}') return res.boom.conflict('Conflict', { success: false, message: 'No data to update' });
  if (Utils.isPendingUser(orgId, req)) return res.boom.forbidden('Forbidden', { success: false, message: 'Organization privileges required' });

  const item = await Item.where({ organization_id: orgId }).where('id', '=', itemId).fetch();
  if (!item) return res.boom.notFound('Not found', { success: false, message: `Item with ID ${itemId} not found.` });

  const oldStatusId = item.get('statusId');
  const newStatusId = Number.parseInt(data.statusId);
  if (oldStatusId !== newStatusId) {
    if (newStatusId === Statuses.statusPlannedId) data.plannedOn = new Date();
    if (newStatusId === Statuses.statusDoneId) data.actualRelease = new Date();
    if (newStatusId === Statuses.statusUnplannedId) {
      data.actualRelease = null;
      data.plannedOn = null;
    };
  };

  item.set(data);
  await item.save();

  res.json({ success: true, item });
});

// new item
router.post('/new/:orgId', [middlewares.LoginRequired, validate(CreateItemSchema)], async function(req, res) {
  const orgId = parseInt(req.params.orgId);
  let data = req.body;
  data.organization_id = orgId;
  data.created_by = req.user.id;
  if (JSON.stringify(data) === '{}') return res.boom.conflict('Conflict', { success: false, message: 'No data to create new item' });
  if (Utils.isPendingUser(orgId, req)) return res.boom.forbidden('Forbidden', { success: false, message: 'Organization privileges required' });

  const newStatusId = Number.parseInt(data.statusId);
  if (newStatusId) {
    if (newStatusId === Statuses.statusPlannedId) data.plannedOn = new Date();
    if (newStatusId === Statuses.statusDoneId) data.actualRelease = new Date();
    if (newStatusId === Statuses.statusUnplannedId) {
      data.actualRelease = null;
      data.plannedOn = null;
    };
  };

  const item = await Item.create(data);
  res.json({ success: true, item });
});

// delete item
router.delete('/:orgId/:itemId', [middlewares.LoginRequired], async function(req, res) {
  const orgId = parseInt(req.params.orgId);
  const itemId = parseInt(req.params.itemId);

  if (Utils.isPendingUser(orgId, req)) return res.boom.forbidden('Forbidden', { success: false, message: 'Organization privileges required' });
  const isAdmin = await UORole.where({ organization_id: orgId, user_id: req.user.id, role_id: Role.AdminRoleId }).fetch();

  const item = await Item.where({ organization_id: orgId }).where('id', '=', itemId).fetch();
  if (item) {
    if (item.get('createdBy') !== req.user.id && !isAdmin) return res.boom.forbidden('Forbidden', { success: false, message: 'Only admin or owner can delete item' });
  } else {
    return res.boom.forbidden('Forbidden', { success: false, message: 'backlog not found' });
  };
  await item.destroy();

  res.json({ success: true, backlog: itemId, message: 'Item deleted' });
});

module.exports = router;
