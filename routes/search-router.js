const Express = require('express');
const router = Express.Router();
const Utils = require('../utils');
const middlewares = require('../middlewares');

// start search
router.get('/:orgId/:where/:text', [middlewares.LoginRequired], async (req, res) => {
  const where = req.params.where;
  const text = req.params.text;
  const orgId = req.params.orgId;
  const responce = await Utils.search(where, text, orgId);
  let data = {};
  if (responce.hits) {
    responce.hits.forEach(element => {
      let item = {};
      item = element._source;
      if (!data[element._source.type]) {
        data[element._source.type] = [];
      };
      data[element._source.type].push(item);
    });
  }
  return res.json({ success: true, data });
});

module.exports = router;
