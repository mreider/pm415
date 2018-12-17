const Express = require('express');
const router = Express.Router();

const middlewares = require('../middlewares');

const Connections = require('../models/connection');
const Backlog = require('../models/backlog');
const Bug = require('../models/bugs');
const Initiative = require('../models/initiative');
const Item = require('../models/items');
const validParams = ['backlog', 'initiative', 'item', 'bug'];
const knex = require('../db').knex;
const Utils = require('../utils');

const { validate, CreateUpdateDeleteConnectionsSchema } = require('../validation');

// get connections
router.get('/:owner/:needInfo/:id', [middlewares.LoginRequired], async (req, res) => {
  const id = parseInt(req.params.id);
  const owner = req.params.owner;
  const needInfo = req.params.needInfo;

  if (validParams.indexOf(owner) === -1 || validParams.indexOf(needInfo) === -1) return res.boom.notFound('Not found', { success: false, message: `not found this connections.` });
  let connections = await Connections.where(owner + '_id', '=', id).fetchAll();
  connections = Utils.serialize(connections);

  let ids = [];
  connections.forEach(element => {
    ids.push(element[needInfo + 'Id']);
  });

  let info = [];

  if (needInfo === 'backlog') {
    info = await Backlog.where('id', 'in', ids).fetchAll();
  } else if (needInfo === 'initiative') {
    info = await Initiative.where('id', 'in', ids).fetchAll();
  } else if (needInfo === 'item') {
    info = await Item.where('id', 'in', ids).fetchAll();
  } else if (needInfo === 'bug') {
    info = await Bug.where('id', 'in', ids).fetchAll();
  };

  return res.json({ success: true, connections, info: Utils.serialize(info) });
});

// set connections delete connections
router.post('/:owner/:id', [middlewares.LoginRequired, validate(CreateUpdateDeleteConnectionsSchema)], async (req, res) => {
  const id = parseInt(req.params.id);
  const owner = req.params.owner;
  const items = req.body.items;
  const backlogs = req.body.backlogs;
  const initiatives = req.body.initiatives;
  const bugs = req.body.bugs;
  // const bugs = req.body.bugs;
  const del = req.body.delete;

  // check owner
  let haveOwner = false;
  if (owner === 'initiative') {
    haveOwner = await Initiative.where({ id }).fetch();
  } else if (owner === 'backlog') {
    haveOwner = await Backlog.where({ id }).fetch();
  } else if (owner === 'item') {
    haveOwner = await Item.where({ id }).fetch();
  } else if (owner === 'bug') {
    haveOwner = await Bug.where({ id }).fetch();
  };
  if (!haveOwner) return res.boom.notFound('Not found', { success: false, message: `not found this ${owner}.` });

  // check params

  // let haveParams = false;
  if (items.length > 0) {
    const fieldName = 'item_id';
    let itemsArray = await Item.where('id', 'in', items).fetchAll();
    itemsArray = (Utils.serialize(itemsArray));

    if (itemsArray.length !== items.length) return res.boom.notFound('Not found', { success: false, message: `not found items.` });

    let dataArr = [];
    items.forEach(element => {
      let data = {};
      data[owner + '_id'] = id;
      data[fieldName] = element;
      dataArr.push(data);
    });

    await knex('connections').where(owner + '_id', '=', id).where(fieldName, 'in', items).del();
    if (del === false) await knex('connections').insert(dataArr);
  };

  if (bugs.length > 0) {
    const fieldName = 'bug_id';
    let bugsArray = await Bug.where('id', 'in', bugs).fetchAll();
    bugsArray = (Utils.serialize(bugsArray));

    if (bugsArray.length !== bugs.length) return res.boom.notFound('Not found', { success: false, message: `not found bugs.` });

    let dataArr = [];
    bugs.forEach(element => {
      let data = {};
      data[owner + '_id'] = id;
      data[fieldName] = element;
      dataArr.push(data);
    });

    await knex('connections').where(owner + '_id', '=', id).where(fieldName, 'in', bugs).del();
    if (del === false) await knex('connections').insert(dataArr);
  };

  if (backlogs.length > 0) {
    const fieldName = 'backlog_id';
    let backlogsArray = await Backlog.where('id', 'in', backlogs).fetchAll();
    backlogsArray = (Utils.serialize(backlogsArray));

    if (backlogsArray.length !== backlogs.length) return res.boom.notFound('Not found', { success: false, message: `not found backlogs.` });

    let dataArr = [];
    backlogs.forEach(element => {
      let data = {};
      data[owner + '_id'] = id;
      data[fieldName] = element;
      dataArr.push(data);
    });

    await knex('connections').where(owner + '_id', '=', id).where(fieldName, 'in', backlogs).del();
    if (del === false) await knex('connections').insert(dataArr);
  };

  if (initiatives.length > 0) {
    const fieldName = 'initiative_id';
    let initiativesArray = await Initiative.where('id', 'in', initiatives).fetchAll();
    initiativesArray = (Utils.serialize(initiativesArray));

    if (initiativesArray.length !== initiatives.length) return res.boom.notFound('Not found', { success: false, message: `not found initiatives.` });

    let dataArr = [];
    initiatives.forEach(element => {
      let data = {};
      data[owner + '_id'] = id;
      data[fieldName] = element;
      dataArr.push(data);
    });

    await knex('connections').where(owner + '_id', '=', id).where(fieldName, 'in', initiatives).del();
    if (del === false) await knex('connections').insert(dataArr);
  };

  return res.json({ success: true });
});
//

module.exports = router;
