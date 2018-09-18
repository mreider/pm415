const Express = require('express');

const User = require('../models/user');

const router = Express.Router();

router.get('/verify', async(req, res) => {
  const token = req.query.token;

  const validated = User.validateToken(token);
  if (!validated.valid || !validated.data || !validated.data.userId) return res.send('Token is invalid or expired.');

  const user = await User.where({id: validated.data.userId}).fetch();
  if (!user) return res.send('User not found.');

  user.set({isActive: true, confirmedAt: new Date()});
  await user.save();

  res.send('Your account confirmed successfully.');
});

module.exports = router;
