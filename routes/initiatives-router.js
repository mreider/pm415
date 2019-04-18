const Express = require('express');

const router = Express.Router();
const UORole = require('../models/users_organizations_roles');
const User = require('../models/user');
const Role = require('../models/role');
const Initiative = require('../models/initiative');
// const Statuses = require('../models/statuses');
const middlewares = require('../middlewares');
const knex = require('../db').knex;
const Utils = require('../utils');
const UtilsAsync = require('../utilsAsync');
const _ = require('lodash');

const { validate, InitiativesSelectSchema, UpdateInitiativesSchema, CreateInitiativesSchema } = require('../validation');

// list of available initiatives for a particular organization, and whether the user is an admin
router.get('/all/:showArchived/:orgId', middlewares.LoginRequired, async function(req, res) {
  const orgId = parseInt(req.params.orgId);
  const showArchived = req.params.showArchived;

  let where = { organization_id: orgId };
  if (showArchived === 'false') where.archived = 0;
  const columns = Initiative.fieldsToShow(true, 'b.', ['u.email', 'u.first_name as firstName', 'u.last_name as lastName']).columns;
  let rows = await knex('initiatives as b').select(columns)
    .leftJoin('users as u', 'b.created_by', 'u.id')
    .where(where);
  rows = Utils.serialize(rows);

  // take popularity
  let initiativesArrai = [];
  rows.forEach(element => {
    initiativesArrai.push(element.id);
  });
  let votes = await knex('votes as i').sum('vote as sum').select('owner_id').groupBy('owner_id')
    .where({ owner_table: 'initiatives' })
    .where('owner_id', 'in', initiativesArrai);
  votes = Utils.serialize(votes);
  rows.forEach(element => {
    element.popularity = 0;
    let voteSum = _.filter(votes, function(vote) {
      return vote.owner_id === element.id;
    });
    if (voteSum.length !== 0) element.popularity = voteSum[0].sum;
  });
  // take popularity

  const isAdmin = await UORole.where({ organization_id: orgId, user_id: req.user.id, role_id: Role.AdminRoleId }).fetch();

  if (Utils.isPendingUser(orgId, req)) return res.boom.forbidden('Forbidden', { success: false, message: 'Organization privileges required' });

  res.json({ success: true, initiatives: rows, admin: !!isAdmin });
});

// one initiatives info
router.get('/:orgId/:initiativeId', middlewares.LoginRequired, async function(req, res) {
  const orgId = parseInt(req.params.orgId);
  const initiativeId = parseInt(req.params.initiativeId);
  const columns = Initiative.fieldsToShow(true, 'b.').columns;
  let rows = await knex('initiatives as b').select(columns)
    .where({ organization_id: orgId })
    .where('b.id', '=', initiativeId);
  const isAdmin = await UORole.where({ organization_id: orgId, user_id: req.user.id, role_id: Role.AdminRoleId }).fetch();

  if (Utils.isPendingUser(orgId, req)) return res.boom.forbidden('Forbidden', { success: false, message: 'Organization privileges required' });
  if (Utils.serialize(rows).length === 0) return res.boom.notFound('Not found', { success: false, message: `Initiative not found.` });

  const author = await User.where({ id: rows[0].createdBy }).fetch({ columns: ['first_name', 'last_name', 'id', 'email'] });

  rows[0].author = Utils.serialize(author);
  rows = Utils.serialize(rows);

  res.json({ success: true, initiative: rows[0], admin: !!isAdmin });
});

// awalible initiatives 2 type of returned data for list(FullSelect = false) and for element (FullSelect = true)
router.post('/:orgId', [middlewares.LoginRequired, validate(InitiativesSelectSchema)], async function(req, res) {
  const orgId = parseInt(req.params.orgId);

  if (Utils.isPendingUser(orgId, req)) return res.boom.forbidden('Forbidden', { success: false, message: 'Organization privileges required' });

  const initiatives = await Initiative.where({ organization_id: orgId }).where('id', 'in', req.body.initiativeId).fetchAll(Initiative.fieldsToShow(req.body.fullSelect));

  res.json({ success: true, initiatives });
});

// edit initiatives
router.put('/edit/:orgId/:initiativeId', [middlewares.LoginRequired, validate(UpdateInitiativesSchema)], async function(req, res) {
  const orgId = parseInt(req.params.orgId);
  const initiativeId = parseInt(req.params.initiativeId);
  let data = req.body;

  if (Utils.isPendingUser(orgId, req)) return res.boom.forbidden('Forbidden', { success: false, message: 'Organization privileges required' });

  const initiative = await Initiative.where({ organization_id: orgId }).where('id', '=', initiativeId).fetch();
  if (!initiative) return res.boom.notFound('Not found', { success: false, message: `Initiative with ID ${initiativeId} not found.` });

  initiative.set(data);
  await initiative.save();
  res.json({ success: true, initiative });

  await UtilsAsync.addDataToIndex(initiative, 'initiatives', 'put');

  await UtilsAsync.addAuthorAndAssigneeToSubscribers('initiatives', Utils.serialize(initiative).id, req.user.id);
});

// new Initiatives POST
router.post('/new/:orgId', [middlewares.LoginRequired, validate(CreateInitiativesSchema)], async function(req, res) {
  const orgId = parseInt(req.params.orgId);
  let data = req.body;
  data.organization_id = orgId;
  data.created_by = req.user.id;

  if (Utils.isPendingUser(orgId, req)) return res.boom.forbidden('Forbidden', { success: false, message: 'Organization privileges required' });

  const initiative = await Initiative.create(data);
  res.json({ success: true, initiative });
  await UtilsAsync.addDataToIndex(initiative, 'initiatives', 'put');

  await UtilsAsync.addAuthorAndAssigneeToSubscribers('initiatives', Utils.serialize(initiative).id, req.user.id);
});

// delete initiative
router.delete('/:orgId/:initiativeId', [middlewares.LoginRequired], async function(req, res) {
  const orgId = parseInt(req.params.orgId);
  const initiativeId = parseInt(req.params.initiativeId);

  if (Utils.isPendingUser(orgId, req)) return res.boom.forbidden('Forbidden', { success: false, message: 'Organization privileges required' });
  const isAdmin = await UORole.where({ organization_id: orgId, user_id: req.user.id, role_id: Role.AdminRoleId }).fetch();

  const initiative = await Initiative.where({ organization_id: orgId }).where('id', '=', initiativeId).fetch();
  if (initiative) {
    if (!isAdmin) return res.boom.forbidden('Forbidden', { success: false, message: 'Only admin can delete initiative' });
  } else {
    return res.boom.forbidden('Forbidden', { success: false, message: 'initiative not found' });
  };

  await UtilsAsync.deleteCommentsConnections('initiatives', initiativeId, 'initiative_id');

  await UtilsAsync.addDataToIndex(initiative, 'initiatives', 'delete');

  await UtilsAsync.addAuthorAndAssigneeToSubscribers('initiatives', Utils.serialize(initiative).id);

  await initiative.destroy();

  res.json({ success: true, initiative: initiativeId, message: 'initiative deleted' });
});

module.exports = router;
