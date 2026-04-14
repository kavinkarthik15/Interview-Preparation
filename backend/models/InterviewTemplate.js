const mongoose = require('mongoose');

// ─── mock_interviews collection ──────────────────────────────
// Stores reusable interview templates / configurations that
// define the question set, topic, difficulty, and time limits.
// ──────────────────────────────────────────────────────────────

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['technical', 'behavioral', 'situational', 'coding', 'system-design'],
    default: 'technical'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  expectedTopics: [{ type: String, trim: true }],
  timeLimit: {
    type: Number, // seconds per question (0 = unlimited)
    default: 0
  }
}, { _id: true });

const mockInterviewTemplateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Interview title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  topic: {
    type: String,
    required: [true, 'Topic is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['Technical', 'Behavioral', 'System Design', 'HR', 'Coding', 'Mixed'],
    default: 'Technical'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  questions: {
    type: [questionSchema],
    validate: {
      validator: v => v.length > 0,
      message: 'At least one question is required'
    }
  },
  totalTimeLimit: {
    type: Number, // total interview duration in seconds (0 = unlimited)
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null = system-generated template
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: 'mock_interviews'
});

// ─── Indexes ─────────────────────────────────────────────────
mockInterviewTemplateSchema.index({ topic: 1, difficulty: 1 });
mockInterviewTemplateSchema.index({ createdBy: 1 });
mockInterviewTemplateSchema.index({ type: 1 });

module.exports = mongoose.model('InterviewTemplate', mockInterviewTemplateSchema);
