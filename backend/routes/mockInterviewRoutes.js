const express = require('express');
const MockInterviewAnswer = require('../models/MockInterviewAnswer');
const admin = require('../config/firebaseAdmin');
const evaluateWithAI = require('../utils/aiEvaluator');

const router = express.Router();

// Middleware
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token' });
    }

    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

// Save Answer
router.post('/save', verifyToken, async (req, res) => {
  try {
    const { question, answer } = req.body;
    const evaluation = await evaluateWithAI(question, answer);

    const data = new MockInterviewAnswer({
      userId: req.user.uid,
      question,
      answer,
      score: evaluation.score,
      feedback: evaluation.feedback,
      suggestion: evaluation.suggestion,
    });

    await data.save();

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
