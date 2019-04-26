const Express = require('express');
const router = Express.Router();

const middlewares = require('../middlewares');

const Subscribers = require('../models/subscribers');

const { validate, SubscribersInserDeleteSchema } = require('../validation');

// get subscribers id array of users
router.get('/:ownerTable/:id/:subowner/:subownerId', [middlewares.LoginRequired], async (req, res) => {
  const id = parseInt(req.params.id);
  const ownerTable = req.params.ownerTable;
  const subownerId = parseInt(req.params.subownerId);
  const subowner = req.params.subowner;

  let subscribers = await Subscribers.getSubscribers(ownerTable, id, subowner, subownerId);

  return res.json({ success: true, subscribers });
});

// get subscribers id array of users
router.get('/:ownerTable/:id', [middlewares.LoginRequired], async (req, res) => {
  const id = parseInt(req.params.id);
  const ownerTable = req.params.ownerTable;
  let subscribers = await Subscribers.getSubscribers(ownerTable, id);

  return res.json({ success: true, subscribers });
});

// new subscriber or delete subscribers
router.post('/new/:ownerTable/:id', [middlewares.LoginRequired, validate(SubscribersInserDeleteSchema)], async (req, res) => {
  const id = parseInt(req.params.id);
  const ownerTable = req.params.ownerTable;
  let data = req.body;
  let success = await Subscribers.addDeleteUsers(ownerTable, id, data.subowner, data.subownerId, data.usersId);
  return res.json({ success });
});

router.post('/delete/:ownerTable/:id', [middlewares.LoginRequired, validate(SubscribersInserDeleteSchema)], async (req, res) => {
  const id = parseInt(req.params.id);
  const ownerTable = req.params.ownerTable;
  let data = req.body;
  let success = await Subscribers.DeleteUsers(ownerTable, id, data.subowner, data.subownerId, data.usersId);
  return res.json({ success });
});

module.exports = router;
