const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const Topic = require('../models/Topic');
const auth = require('../middleware/auth');
const sendError = require('../utils/sendError');

const router = express.Router();

// All routes require authentication
router.use(auth);

// POST /api/topics - Add a preparation topic
router.post('/', [
  body('title').trim().notEmpty().withMessage('Topic title is required'),
  body('category').optional().isIn(['DSA', 'System Design', 'Behavioral', 'Frontend', 'Backend', 'Database', 'DevOps', 'Other']),
  body('difficulty').optional().isIn(['Easy', 'Medium', 'Hard']),
  body('notes').optional().trim(),
  body('resources').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const allowedFields = ['title', 'category', 'difficulty', 'notes', 'resources'];
    const topicData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) topicData[field] = req.body[field];
    }
    topicData.user = req.userId;

    const topic = new Topic(topicData);
    await topic.save();

    res.status(201).json({ message: 'Topic added successfully', topic });
  } catch (error) {
    sendError(res, 500, 'Server error', error);
  }
});

// GET /api/topics - Fetch all topics for user
router.get('/', async (req, res) => {
  try {
    const { category, completed } = req.query;
    const filter = { user: req.userId };

    if (category) filter.category = String(category);
    if (completed !== undefined) filter.completed = completed === 'true';

    const topics = await Topic.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ topics });
  } catch (error) {
    sendError(res, 500, 'Failed to load topics', error);
  }
});

// GET /api/topics/progress - Fetch progress percentage (optimized with aggregation)
router.get('/progress', async (req, res) => {
  try {
    // Single aggregation instead of multiple countDocuments
    const pipeline = await Topic.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.userId) } },
      {
        $group: {
          _id: '$category',
          total: { $sum: 1 },
          completed: { $sum: { $cond: ['$completed', 1, 0] } }
        }
      }
    ]);

    let totalTopics = 0;
    let completedTopics = 0;
    const categoryProgress = [];

    for (const cat of pipeline) {
      totalTopics += cat.total;
      completedTopics += cat.completed;
      categoryProgress.push({
        category: cat._id,
        total: cat.total,
        completed: cat.completed,
        percentage: Math.round((cat.completed / cat.total) * 100)
      });
    }

    // Sort categories alphabetically
    categoryProgress.sort((a, b) => a.category.localeCompare(b.category));

    const percentage = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);

    res.json({
      totalTopics,
      completedTopics,
      percentage,
      categoryProgress
    });
  } catch (error) {
    sendError(res, 500, 'Failed to load progress', error);
  }
});

// PUT /api/topics/:id/complete - Mark topic as complete
router.put('/:id/complete', async (req, res) => {
  try {
    const topic = await Topic.findOne({ _id: req.params.id, user: req.userId });
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    topic.completed = !topic.completed;
    topic.status = topic.completed ? 'completed' : 'pending';
    topic.completedAt = topic.completed ? new Date() : null;
    await topic.save();

    res.json({
      message: topic.completed ? 'Topic marked as complete' : 'Topic marked as incomplete',
      topic
    });
  } catch (error) {
    sendError(res, 500, 'Server error', error);
  }
});

// PUT /api/topics/:id - Update topic
router.put('/:id', [
  body('title').optional().trim().notEmpty(),
  body('category').optional().isIn(['DSA', 'System Design', 'Behavioral', 'Frontend', 'Backend', 'Database', 'DevOps', 'Other']),
  body('difficulty').optional().isIn(['Easy', 'Medium', 'Hard']),
  body('notes').optional().trim(),
  body('resources').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const allowedFields = ['title', 'category', 'difficulty', 'notes', 'resources'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    // Use find + save to trigger pre-save hooks
    const topic = await Topic.findOne({ _id: req.params.id, user: req.userId });
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    Object.assign(topic, updates);
    await topic.save();

    res.json({ message: 'Topic updated successfully', topic });
  } catch (error) {
    sendError(res, 500, 'Server error', error);
  }
});

// DELETE /api/topics/:id - Delete topic
router.delete('/:id', async (req, res) => {
  try {
    const topic = await Topic.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    res.json({ message: 'Topic deleted successfully' });
  } catch (error) {
    sendError(res, 500, 'Server error', error);
  }
});

module.exports = router;
