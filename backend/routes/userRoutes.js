const express = require('express');
const User = require('../models/User');

const router = express.Router();

// POST /api/users/create
router.post('/create', async (req, res) => {
  console.log('BODY:', req.body);

  try {
    const { name, email } = req.body;
    const user = new User({ name, email });
    await user.save();

    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users
router.get('/', async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    next(err);
  }
});

module.exports = router;