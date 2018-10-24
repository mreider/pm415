const Express = require('express');
const router = Express.Router();

const middlewares = require('../middlewares');

const Statuses = require('../models/statuses');

router.get('/:orgId', [middlewares.LoginRequired], async (req, res) => {
  const orgId = parseInt(req.params.orgId);
  // { id: orgId }
  const statuses = await Statuses.where({ organization_id: orgId, owner_table: 'backlogs' }).orWhere({ organization_id: 0 }).fetchAll(Statuses.fieldsToShow());

  if (!statuses) return res.boom.notFound('Not found', { success: false, message: 'Statuses not found.' });

  return res.json({ success: true, statuses });
});

module.exports = router;
