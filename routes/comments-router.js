const Express = require('express');
const router = Express.Router();
const knex = require('../db').knex;
const Comments = require('../models/comments');

const middlewares = require('../middlewares');
// const Utils = require('../utils');

// new comment
router.put('/new/:ownerTable/:orgId/:ownerId', [middlewares.LoginRequired], async function(req, res) {
  const ownerId = parseInt(req.params.ownerId);
  const orgId = parseInt(req.params.orgId);
  const ownerTable = req.params.ownerTable;
  let data = req.body;

  if (JSON.stringify(data) === '{}') return res.boom.conflict('Conflict', { success: false, message: 'No data to create new backlog' });

  data.organization_id = orgId;
  data.created_by = req.user.id;
  data.ownerId = ownerId;
  data.ownerTable = ownerTable;
  let haveOwner = false;
  try {
    let rows = await knex(ownerTable).count().where({ organization_id: orgId, id: ownerId });
    let count = rows[0]['count(*)'];
    if (count === 1) haveOwner = true;
  } catch (error) {
    haveOwner = false;
  }
  if (!haveOwner) return res.boom.notFound('Not found', { success: false, message: `Owner not found.` });
  const comment = await Comments.create(data);
  res.json({ success: true, comment });
});

// get comments
router.get('/get/:ownerTable/:orgId/:ownerId', middlewares.LoginRequired, async function(req, res) {
  const organizationId = parseInt(req.params.orgId);
  const ownerTable = req.params.ownerTable;
  const ownerId = parseInt(req.params.ownerId);
  let comments = [];
  try {
    comments = await Comments.where({ organization_id: organizationId, owner_table: ownerTable, owner_id: ownerId }).fetchAll();
  } catch (error) {
    return res.boom.notFound('Not found', { success: false, message: `Comments not found.` });
  };

  res.json({ success: true, comments });
});

// edit comment
router.put('/edit/:id', middlewares.LoginRequired, async function(req, res) {
  const id = parseInt(req.params.id);
  let data = req.body;

  const comment = await Comments.where({ id: id }).fetch();
  if (!comment) return res.boom.notFound('Not found', { success: false, message: `Comments not found.` });

  comment.set(data);
  await comment.save();

  res.json({ success: true, comment });
});

module.exports = router;
