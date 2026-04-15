const express = require('express');
const router = express.Router();
const User = require('../models/User');
 
// Create user
router.post('/', async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.status(201).json(user);
});
 
// Read all users
router.get('/', async (req, res) => {
  const users = await User.find();
  res.json(users);
});
 
module.exports = router;