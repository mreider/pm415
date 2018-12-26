const Express = require('express');
const router = Express.Router();
const UtilsAsync = require('../utilsAsync');
const middlewares = require('../middlewares');

// start search
router.get('/:text/:orgId', [middlewares.LoginRequired], async (req, res) => {
  const where = req.params.where;
  const text = req.params.text;
  const orgId = req.params.orgId;
  const responce = await UtilsAsync.search(where, text, orgId);
  let data = [];
  if (responce.hits) {
    responce.hits.forEach(element => {
      data.push(element._source);
    });
  }
  return res.json({ success: true, data: data });
});

module.exports = router;
