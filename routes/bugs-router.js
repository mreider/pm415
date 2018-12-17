const Express = require('express');

const router = Express.Router();
const UORole = require('../models/users_organizations_roles');
const User = require('../models/user');
const Role = require('../models/role');
const Connection = require('../models/connection');
const Comments = require('../models/comments');
// const Initiative = require('../models/initiative');
const Bugs = require('../models/bugs');
// const Statuses = require('../models/statuses');
const middlewares = require('../middlewares');
const knex = require('../db').knex;
const Utils = require('../utils');
// const _ = require('lodash');

// const { validate, InitiativesSelectSchema, UpdateInitiativesSchema, CreateInitiativesSchema } = require('../validation');
const { validate, BugsSelectSchema, UpdateBugsSchema, CreateBugsSchema } = require('../validation');

// list of available bugs for a particular organization, and whether the user is an admin
router.get('/full/:orgId/:fullSelect', middlewares.LoginRequired, async function(req, res) {
  const orgId = parseInt(req.params.orgId);
  let fullSelect = false;
  if (req.params.fullSelect === 'true') fullSelect = true;

  const columns = Bugs.fieldsToShow(fullSelect, 'b.', [
    'u.email as emailCreatedBy',
    'u.first_name as firstNameCreatedBy',
    'u.last_name as lastNameCreatedBy',
    'a.email as emailAssignee',
    'a.first_name as firstNameAssignee',
    'a.last_name as lastNameAssignee']).columns;
  let rows = await knex('bugs as b').select(columns)
    .leftJoin('users as u', 'b.created_by', 'u.id')
    .leftJoin('users as a', 'b.assignee', 'a.id')
    .where({ organization_id: orgId });
  rows = Utils.serialize(rows);
  rows.forEach(element => {
    element.reportedByData = { email: element.emailCreatedBy, firstName: element.firstNameCreatedBy, lastName: element.lastNameCreatedBy };
    element.assigneeData = { email: element.emailAssignee, firstName: element.firstNameAssignee, lastName: element.lastNameAssignee };
    delete element['emailCreatedBy']; delete element['firstNameCreatedBy']; delete element['lastNameCreatedBy']; delete element['emailAssignee']; delete element['lastNameAssignee']; delete element['firstNameAssignee'];
  });

  if (fullSelect) {
    for (const element of rows) {
      element.items = await Connection.connectionsList(element.id, 'bug', 'item');
      element.initiatives = await Connection.connectionsList(element.id, 'bug', 'initiative');
      element.comments = await Comments.getComments(orgId, 'bugs', element.id);
    };
  };

  const isAdmin = await UORole.where({ organization_id: orgId, user_id: req.user.id, role_id: Role.AdminRoleId }).fetch();

  if (Utils.isPendingUser(orgId, req)) return res.boom.forbidden('Forbidden', { success: false, message: 'Organization privileges required' });

  res.json({ success: true, bugs: rows, admin: !!isAdmin });
});

// // one bug info
router.get('/:orgId/:bugId', middlewares.LoginRequired, async function(req, res) {
  const orgId = parseInt(req.params.orgId);
  const bugId = parseInt(req.params.bugId);
  const columns = Bugs.fieldsToShow(true, 'b.').columns;
  let rows = await knex('bugs as b').select(columns)
    .where({ organization_id: orgId })
    .where('b.id', '=', bugId);
  const isAdmin = await UORole.where({ organization_id: orgId, user_id: req.user.id, role_id: Role.AdminRoleId }).fetch();

  if (Utils.isPendingUser(orgId, req)) return res.boom.forbidden('Forbidden', { success: false, message: 'Organization privileges required' });
  if (Utils.serialize(rows).length === 0) return res.boom.notFound('Not found', { success: false, message: `bug not found.` });

  const reportedByData = await User.where({ id: rows[0].createdBy }).fetch({ columns: ['first_name', 'last_name', 'id', 'email'] });
  const assigneeData = await User.where({ id: rows[0].assignee }).fetch({ columns: ['first_name', 'last_name', 'id', 'email'] });

  rows[0].reportedBy = Utils.serialize(reportedByData);
  rows[0].assignee = Utils.serialize(assigneeData);
  rows = Utils.serialize(rows);

  res.json({ success: true, bug: rows[0], admin: !!isAdmin });
});

// awalible bugs 2 type of returned data for list(FullSelect = false) and for element (FullSelect = true)
router.post('/:orgId', [middlewares.LoginRequired, validate(BugsSelectSchema)], async function(req, res) {
  const orgId = parseInt(req.params.orgId);

  if (Utils.isPendingUser(orgId, req)) return res.boom.forbidden('Forbidden', { success: false, message: 'Organization privileges required' });

  const bugs = await Bugs.where({ organization_id: orgId }).where('id', 'in', req.body.bugId).fetchAll(Bugs.fieldsToShow(req.body.fullSelect));

  res.json({ success: true, bugs });
});

// edit bug
router.put('/edit/:orgId/:bugId', [middlewares.LoginRequired, validate(UpdateBugsSchema)], async function(req, res) {
  const orgId = parseInt(req.params.orgId);
  const bugId = parseInt(req.params.bugId);
  let data = req.body;

  if (Utils.isPendingUser(orgId, req)) return res.boom.forbidden('Forbidden', { success: false, message: 'Organization privileges required' });

  const bug = await Bugs.where({ organization_id: orgId }).where('id', '=', bugId).fetch();
  if (!bug) return res.boom.notFound('Not found', { success: false, message: `Bug with ID ${bugId} not found.` });

  let mailers = '';
  if (Utils.serialize(bug).createdBy) {
    const user = await User.where({ id: (Utils.serialize(bug).createdBy) }).fetch();
    if (user) mailers = mailers + '!' + Utils.serialize(user).email + '!';
  };
  data.mailers = mailers;

  bug.set(data);
  await bug.save();

  res.json({ success: true, bug });
});

// new bug POST
router.post('/new/:orgId', [middlewares.LoginRequired, validate(CreateBugsSchema)], async function(req, res) {
  const orgId = parseInt(req.params.orgId);
  let data = req.body;
  data.organizationId = orgId;
  // data.createdBy = req.user.id;

  if (Utils.isPendingUser(orgId, req)) return res.boom.forbidden('Forbidden', { success: false, message: 'Organization privileges required' });

  let mailers = '';
  if (data.createdBy) {
    const user = await User.where({ id: data.createdBy }).fetch();
    if (user) mailers = mailers + '!' + Utils.serialize(user).email + '!';
  };
  data.mailers = mailers;

  const bugs = await Bugs.create(data);
  res.json({ success: true, bugs });
});

// delete bug
router.delete('/:orgId/:bugId', [middlewares.LoginRequired], async function(req, res) {
  const orgId = parseInt(req.params.orgId);
  const bugId = parseInt(req.params.bugId);

  if (Utils.isPendingUser(orgId, req)) return res.boom.forbidden('Forbidden', { success: false, message: 'Organization privileges required' });
  const isAdmin = await UORole.where({ organization_id: orgId, user_id: req.user.id, role_id: Role.AdminRoleId }).fetch();

  const bug = await Bugs.where({ organization_id: orgId }).where('id', '=', bugId).fetch();
  if (bug) {
    if (!isAdmin) return res.boom.forbidden('Forbidden', { success: false, message: 'Only admin can delete bug' });
  } else {
    return res.boom.forbidden('Forbidden', { success: false, message: 'bug not found' });
  };
  await bug.destroy();

  res.json({ success: true, bug: bugId, message: 'bug deleted' });
});

module.exports = router;
