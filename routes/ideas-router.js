const Express = require('express');

const router = Express.Router();
const UORole = require('../models/users_organizations_roles');
const User = require('../models/user');
const Role = require('../models/role');
const Idea = require('../models/idea');
// const Statuses = require('../models/statuses');
const middlewares = require('../middlewares');
const knex = require('../db').knex;
const Utils = require('../utils');

const { validate, IdeasSelectSchema, UpdateIdeaSchema, CreateIdeaSchema } = require('../validation');

// list of available ideas for a particular organization, and whether the user is an admin
router.get('/:orgId', middlewares.LoginRequired, async function(req, res) {
  const orgId = parseInt(req.params.orgId);
  const columns = Idea.fieldsToShow(false, 'b.', ['u.email', 'u.first_name as firstName', 'u.last_name as lastName']).columns;
  let rows = await knex('ideas as b').select(columns)
    .leftJoin('users as u', 'b.created_by', 'u.id')
    .where({ organization_id: orgId });
  rows = Utils.serialize(rows);
  const isAdmin = await UORole.where({ organization_id: orgId, user_id: req.user.id, role_id: Role.AdminRoleId }).fetch();

  if (Utils.isPendingUser(orgId, req)) return res.boom.forbidden('Forbidden', { success: false, message: 'Organization privileges required' });

  res.json({ success: true, ideas: rows, admin: !!isAdmin });
});

// one idea info
router.get('/:orgId/:backlogId', middlewares.LoginRequired, async function(req, res) {
  const orgId = parseInt(req.params.orgId);
  const ideaId = parseInt(req.params.backlogId);
  const columns = Idea.fieldsToShow(true, 'b.').columns;
  let rows = await knex('ideas as b').select(columns)
    .where({ organization_id: orgId })
    .where('b.id', '=', ideaId);
  const isAdmin = await UORole.where({ organization_id: orgId, user_id: req.user.id, role_id: Role.AdminRoleId }).fetch();

  if (Utils.isPendingUser(orgId, req)) return res.boom.forbidden('Forbidden', { success: false, message: 'Organization privileges required' });
  if (Utils.serialize(rows).length === 0) return res.boom.notFound('Not found', { success: false, message: `Backlog not found.` });

  const author = await User.where({ id: rows[0].createdBy }).fetch({ columns: ['first_name', 'last_name', 'id', 'email'] });

  rows[0].author = Utils.serialize(author);
  rows = Utils.serialize(rows);

  res.json({ success: true, idea: rows[0], admin: !!isAdmin });
});

// awalible ideas 2 type of returned data for list(FullSelect = false) and for element (FullSelect = true)
router.post('/:orgId', [middlewares.LoginRequired, validate(IdeasSelectSchema)], async function(req, res) {
  const orgId = parseInt(req.params.orgId);

  if (Utils.isPendingUser(orgId, req)) return res.boom.forbidden('Forbidden', { success: false, message: 'Organization privileges required' });

  const ideas = await Idea.where({ organization_id: orgId }).where('id', 'in', req.body.IdeasId).fetchAll(Idea.fieldsToShow(req.body.fullSelect));

  res.json({ success: true, ideas });
});

// edit ideas
router.put('/edit/:orgId/:IdeaId', [middlewares.LoginRequired, validate(UpdateIdeaSchema)], async function(req, res) {
  const orgId = parseInt(req.params.orgId);
  const IdeaId = parseInt(req.params.IdeaId);
  let data = req.body;

  if (Utils.isPendingUser(orgId, req)) return res.boom.forbidden('Forbidden', { success: false, message: 'Organization privileges required' });

  const idea = await Idea.where({ organization_id: orgId }).where('id', '=', IdeaId).fetch();
  if (!idea) return res.boom.notFound('Not found', { success: false, message: `Idea with ID ${IdeaId} not found.` });

  idea.set(data);
  await idea.save();

  res.json({ success: true, idea });
});

// new idea POST
router.post('/new/:orgId', [middlewares.LoginRequired, validate(CreateIdeaSchema)], async function(req, res) {
  const orgId = parseInt(req.params.orgId);
  let data = req.body;
  data.organization_id = orgId;
  data.created_by = req.user.id;

  if (Utils.isPendingUser(orgId, req)) return res.boom.forbidden('Forbidden', { success: false, message: 'Organization privileges required' });

  const idea = await Idea.create(data);
  res.json({ success: true, idea });
});

// delete idea
router.delete('/:orgId/:ideaId', [middlewares.LoginRequired], async function(req, res) {
  const orgId = parseInt(req.params.orgId);
  const ideaId = parseInt(req.params.ideaId);

  if (Utils.isPendingUser(orgId, req)) return res.boom.forbidden('Forbidden', { success: false, message: 'Organization privileges required' });
  const isAdmin = await UORole.where({ organization_id: orgId, user_id: req.user.id, role_id: Role.AdminRoleId }).fetch();

  const idea = await Idea.where({ organization_id: orgId }).where('id', '=', ideaId).fetch();
  if (idea) {
    if (!isAdmin) return res.boom.forbidden('Forbidden', { success: false, message: 'Only admin can delete idea' });
  } else {
    return res.boom.forbidden('Forbidden', { success: false, message: 'idea not found' });
  };
  await idea.destroy();

  res.json({ success: true, idea: ideaId, message: 'Idea deleted' });
});

module.exports = router;
