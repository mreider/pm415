const Express = require('express');
const router = Express.Router();

const middlewares = require('../middlewares');

const Connections = require('../models/connection');
// const knex = require('../db').knex;
const Utils = require('../utils');

// get connections
router.get('/:owner/:needInfo/:id', [middlewares.LoginRequired], async (req, res) => {
  const id = parseInt(req.params.id);
  const owner = req.params.owner;
  const needInfo = req.params.needInfo;

  let connections = await Connections.where(owner, '=', id).fetchAll({ withRelaited: [needInfo] });
  connections = Utils.serialize(connections);

  return res.json({ success: true, connections });
});

module.exports = router;
