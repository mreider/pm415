const Express = require('express');
const router = Express.Router();

const middlewares = require('../middlewares');

const Votes = require('../models/vote');
const knex = require('../db').knex;
const Utils = require('../utils');

// votes get curent scores, and vote or not current user
router.get('/:ownerTable/:id', [middlewares.LoginRequired], async (req, res) => {
  const id = parseInt(req.params.id);
  const ownerTable = req.params.ownerTable;

  const votes = await Votes.where({ owner_table: ownerTable, owner_id: id, user_id: req.user.id }).fetch();
  let voted = false;
  if (votes) voted = true;
  const sum = await getVotes(ownerTable, id);

  return res.json({ success: true, voted, votes: sum });
});

// new vote
router.post('/:ownerTable/:id/:vote', [middlewares.LoginRequired], async (req, res) => {
  const id = parseInt(req.params.id);
  const ownerTable = req.params.ownerTable;
  let vote = req.params.vote;
  if (vote === 'true') {
    vote = 1;
  } else if (vote === 'false') {
    vote = -1;
  };

  let votes = await Votes.where({ owner_table: ownerTable, owner_id: id, user_id: req.user.id }).fetch();

  if (votes) {
    votes = await knex('votes')
      .where({ owner_table: ownerTable, owner_id: id, user_id: req.user.id })
      .update({ vote: vote });
  } else {
    let data = {};
    data.ownerTable = ownerTable;
    data.ownerId = id;
    data.userId = req.user.id;
    data.vote = vote;

    votes = await Votes.create(data);
  };

  const sum = await getVotes(ownerTable, id);

  return res.json({ success: true, votes: sum });
});

async function getVotes(ownerTable, id) {
  let rows = await knex('votes as i').sum('vote as sum').select()
    .where({ owner_table: ownerTable, owner_id: id });
  rows = Utils.serialize(rows);
  let sum = 0;
  if (rows[0].sum) sum = rows[0].sum;
  return sum;
}

module.exports = router;
