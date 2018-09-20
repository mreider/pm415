const Express = require('express');

const User = require('../models/user');

const router = Express.Router();

router.get('/verify', async(req, res) => {
  const token = req.query.token;

  const validated = User.validateToken(token);
  if (!validated.valid || !validated.data || !validated.data.userId) return res.send('Token is invalid or expired.');

  const user = await User.where({ id: validated.data.userId }).fetch();
  if (!user) return res.send('User not found.');

  user.set({ isActive: true, confirmedAt: new Date() });
  await user.save();

  res.send('Your account confirmed successfully.');
});

router.post('/forgotpassword', async(req, res) => {
  const token = req.query.token;
  const validated = User.validateToken(token);
  const password = req.body.password;
  const confirmation = req.body.confirmation;

  if (!validated.valid || !validated.data || !validated.data.userId) return res.send('Token is invalid or expired.');
  console.log(validated.data);

  const user = await User.where({ id: validated.data.userId }).fetch();
  if (!user) return res.send('User not found.');
  const newUser = user.ResetPassword(password, confirmation, token);
  if (!newUser) res.send('Your password not been changed');
  if (newUser) res.send('Your password has been changed');

//  user.set({isActive: true, confirmedAt: new Date()});
//  await user.save();
});

router.get('/forgotpassword', async(req, res) => {
  const token = req.query.token;
  const validated = User.validateToken(token);

  if (!validated.valid || !validated.data || !validated.data.userId) return res.send('Token is invalid or expired.');
  console.log(validated.data);

  const user = await User.where({ id: validated.data.userId }).fetch();
  if (!user) return res.send('User not found.');
  res.send('You in place where you can change password');

//  user.set({isActive: true, confirmedAt: new Date()});
//  await user.save();
});

module.exports = router;
