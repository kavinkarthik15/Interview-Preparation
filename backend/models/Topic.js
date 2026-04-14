const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Topic title is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['DSA', 'System Design', 'Behavioral', 'Frontend', 'Backend', 'Database', 'DevOps', 'Other'],
    default: 'Other'
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  notes: {
    type: String,
    default: ''
  },
  resources: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['completed', 'in-progress', 'pending'],
    default: 'pending'
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  scoreLabel: {
    type: String,
    enum: ['Excellent', 'Good', 'Average', 'Needs Work', null],
    default: null
  }
}, {
  timestamps: true
});

// Auto-compute scoreLabel before saving
topicSchema.pre('save', function (next) {
  if (this.score != null) {
    if (this.score >= 90) this.scoreLabel = 'Excellent';
    else if (this.score >= 75) this.scoreLabel = 'Good';
    else if (this.score >= 50) this.scoreLabel = 'Average';
    else this.scoreLabel = 'Needs Work';
  }

  // Keep completed flag in sync with status
  if (this.isModified('status')) {
    this.completed = this.status === 'completed';
    if (this.completed && !this.completedAt) this.completedAt = new Date();
  }

  next();
});

// ─── Indexes for query optimization ─────────────────────────
topicSchema.index({ user: 1, createdAt: -1 });
topicSchema.index({ user: 1, category: 1 });
topicSchema.index({ user: 1, completed: 1 });

module.exports = mongoose.model('Topic', topicSchema);
