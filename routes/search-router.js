const Express = require('express');
const router = Express.Router();
const UtilsAsync = require('../utilsAsync');
const Utils = require('../utils');
const middlewares = require('../middlewares');
const knex = require('../db').knex;
const Initiative = require('../models/initiative');
const Item = require('../models/items');
const Backlog = require('../models/backlog');
const Bugs = require('../models/bugs');
const Axios = require('axios');
const config = require('../config');

// start search
router.get('/:text/:orgId/:showArchived', [middlewares.LoginRequired], async (req, res) => {
  const text = req.params.text;
  const orgId = req.params.orgId;
  const showArchived = req.params.showArchived;
  let where = { organization: orgId };

  const responce = await UtilsAsync.search(where, text, orgId);
  let data = [];
  if (responce.hits) {
    responce.hits.forEach(element => {
      element._source.tableOwner = element._source.ownerTable;
      if (showArchived === 'false') {
        if (element._source.archived === 0) {
          data.push(element._source);
        };
      } else if (showArchived === 'true') {
        data.push(element._source);
      };
    });
  }
  return res.json({ success: true, data: data, query: responce.query });
});

// reindex search
router.get('/reindex', [middlewares.LoginRequired], async (req, res) => {
  // delete
  try {
    await Axios.delete(config.elasticsearch + '/_all/');
  } catch (error) {
    return res.json({ success: false, error });
  };

  // insert

  let columns = Initiative.fieldsToShow(true, 'b.', ['b.organization_id as organizationId']).columns;
  let rows = await knex('initiatives as b').select(columns);
  rows = Utils.serialize(rows);
  let indexInitiatives = false;
  for (const element of rows) {
    indexInitiatives = await UtilsAsync.addDataToIndex(element, 'initiatives', 'put');
  };

  columns = Item.fieldsToShow(true, 'b.', ['b.organization_id as organizationId']).columns;
  rows = await knex('items as b').select(columns);
  rows = Utils.serialize(rows);
  let indexItems = false;
  for (const element of rows) {
    indexItems = await UtilsAsync.addDataToIndex(element, 'items', 'put');
  };

  columns = Backlog.fieldsToShow(true, 'b.', ['b.organization_id as organizationId']).columns;
  rows = await knex('backlogs as b').select(columns);
  rows = Utils.serialize(rows);
  let indexBacklogs = false;
  for (const element of rows) {
    indexBacklogs = await UtilsAsync.addDataToIndex(element, 'backlogs', 'put');
  };

  columns = Bugs.fieldsToShow(true, 'b.', ['b.organization_id as organizationId']).columns;
  rows = await knex('bugs as b').select(columns);
  rows = Utils.serialize(rows);
  let indexBugs = false;
  for (const element of rows) {
    indexBugs = await UtilsAsync.addDataToIndex(element, 'bugs', 'put');
  };

  columns = ['id', 'owner_id as ownerId', 'owner_table as ownerTable', 'comment', 'created_by as createdBy', 'created_at as createdAt', 'organization_id as organizationId'];
  rows = await knex('comments as b').select(columns);
  rows = Utils.serialize(rows);
  let indexComments = false;
  for (const element of rows) {
    indexComments = await UtilsAsync.addDataToIndex(element, 'comments', 'put');
  };
  // await UtilsAsync.addDataToIndex(initiative, 'initiatives', 'put');
  return res.json({ success: true, indexInitiatives, indexItems, indexBacklogs, indexBugs, indexComments });
});

module.exports = router;
