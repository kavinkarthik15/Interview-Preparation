const express = require('express');
const Interview = require('../models/Interview');
const admin = require('../config/firebaseAdmin');

const router = express.Router();

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token' });
    }

    const decoded = await admin.auth().verifyIdToken(token);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

// Create Interview
router.post('/create', verifyToken, async (req, res) => {
  try {
    const { company, role, status, date, notes } = req.body;
    const userId = req.user.uid;

    const interview = new Interview({
      userId,
      company,
      role,
      status,
      date,
      notes,
    });

    await interview.save();

    res.status(201).json(interview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get All Interviews (for a user)
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;

    const interviews = await Interview.find({ userId }).sort({
      createdAt: -1,
    });

    res.json(interviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Interview
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const updated = await Interview.findOneAndUpdate(
      { _id: req.params.id, userId },
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Interview
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const deleted = await Interview.findOneAndDelete({ _id: req.params.id, userId });

    if (!deleted) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
