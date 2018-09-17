const Express = require('express');

const models = require('../models');

const router = Express.Router();

router.get('/verify', async(req, res) => {
  const token = req.query.token;

  const validated = models.User.validateToken(token);
  if (!validated.valid || !validated.data || !validated.data.userId) return res.send('Token is invalid or expired.');

  const user = await models.User.findById(validated.data.userId);
  if (!user) return res.send('User not found.');

  user.isActive = true;
  user.confirmedAt = new Date();
  await user.save();

  res.send('Your account confirmed successfully.');
});

module.exports = router;
