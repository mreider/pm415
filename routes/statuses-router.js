const Express = require('express');
const router = Express.Router();

const middlewares = require('../middlewares');

const Statuses = require('../models/statuses');

router.get('/:ownerTable/:orgId', [middlewares.LoginRequired], async (req, res) => {
  const orgId = parseInt(req.params.orgId);
  const ownerTable = req.params.ownerTable;
  // { id: orgId }
  const statuses = await Statuses.where({ organization_id: orgId, owner_table: ownerTable }).orWhere({ organization_id: 0, owner_table: ownerTable }).fetchAll(Statuses.fieldsToShow());

  if (!statuses) return res.boom.notFound('Not found', { success: false, message: 'Statuses not found.' });

  return res.json({ success: true, statuses });
});

module.exports = router;
