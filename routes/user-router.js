const Express = require('express');
const OmitDeep = require('omit-deep');
const User = require('../models/user');
const Organization = require('../models/organization');

const router = Express.Router();

const middlewares = require('../middlewares');

router.get('/', middlewares.LoginRequired, function(req, res) {
  const user = OmitDeep(req.user.toJSON(), ['password']);
  res.json({ success: true, user });
});

router.post('/', middlewares.LoginRequired, async(req, res) => {
  let user = await User.updateUser(req.body.email, req.body.password, req.body.firstname, req.body.lastmame, req.body.id);
  res.json({ userId: user.id, success: true });
});

router.get('/orgs', middlewares.LoginRequired, async(req, res) => {
  // let user = OmitDeep(req.user.toJSON(), ['password']);
  const orgs = await Organization.where({ id: 2 }).fetch({ withRelated: ['roles'] });
  res.json({ success: true, orgs: orgs });
  // res.json({ success: true, organizations: user.organizations, current: req.organization });
});

module.exports = router;
