const Express = require('express');

const router = Express.Router();
const middlewares = require('../middlewares');
const { validate, UpdateOrderIndexSchema } = require('../validation');
// const knex = require('../db').knex;
const Item = require('../models/items.js');
const Initiative = require('../models/initiative');
const Utils = require('../utils');

router.get('/', function(req, res) {
  res.send('Wanna something?');
});

// edit order index
router.put('/orderindexchange/:orgId', [middlewares.LoginRequired, validate(UpdateOrderIndexSchema)], async function(req, res) {
  const orgId = parseInt(req.params.orgId);

  let items = req.body.items;
  let initiatives = req.body.initiatives;

  if (Utils.isPendingUser(orgId, req)) return res.boom.forbidden('Forbidden', { success: false, message: 'Organization privileges required' });
  let counter = 0;
  for (const element of items) {
    counter += 1;
    const item = await Item.where({ organization_id: orgId }).where('id', '=', element).fetch();
    if (!item) return res.boom.notFound('Not found', { success: false, message: `item with ID ${element} not found.` });
    item.set({ order_index: counter });
    await item.save();
  };

  counter = 0;
  for (const element of initiatives) {
    counter += 1;
    const initiative = await Initiative.where({ organization_id: orgId }).where('id', '=', element).fetch();
    if (!initiative) return res.boom.notFound('Not found', { success: false, message: `Initiative with ID ${element} not found.` });
    initiative.set({ order_index: counter });
    await initiative.save();
  };
  res.json({ success: true });
});

module.exports = router;
