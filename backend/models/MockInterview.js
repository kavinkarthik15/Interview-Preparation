const mongoose = require('mongoose');

const mockInterviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Interview title is required'],
    trim: true
  },
  company: {
    type: String,
    trim: true,
    default: ''
  },
  type: {
    type: String,
    enum: ['Technical', 'Behavioral', 'System Design', 'HR', 'Coding', 'Other'],
    default: 'Technical'
  },
  date: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: Number, // in minutes
    default: 0
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
  },
  status: {
    type: String,
    enum: ['completed', 'in-progress', 'pending', 'failed'],
    default: 'pending'
  },
  aiConfidence: {
    type: Number,
    min: 0,
    max: 1,
    default: null
  },
  aiConfidenceLabel: {
    type: String,
    enum: ['High', 'Medium', 'Low', null],
    default: null
  },
  feedback: {
    type: String,
    default: ''
  },
  questionsAsked: [{
    question: String,
    answer: String,
    rating: { type: Number, min: 1, max: 5 }
  }],
  overallRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  // ─── Structured Score Breakdown ───────────────────────────
  scores: {
    technical_score: { type: Number, min: 0, max: 10, default: null },
    clarity_score: { type: Number, min: 0, max: 10, default: null },
    confidence_score: { type: Number, min: 0, max: 10, default: null },
    problem_solving_score: { type: Number, min: 0, max: 10, default: null },
    communication_score: { type: Number, min: 0, max: 10, default: null }
  },

  // ─── Categorized AI Feedback ────────────────────────────
  aiFeedback: {
    strengths: [{ type: String, trim: true }],
    weaknesses: [{ type: String, trim: true }],
    suggestions: [{ type: String, trim: true }]
  },

  // ─── ML Prediction Output ──────────────────────────────
  mlPrediction: {
    score: { type: Number, min: 0, max: 10, default: null },
    confidence: { type: Number, min: 0, max: 100, default: null },
    weak_area: { type: String, trim: true, default: null },
    explanation: { type: String, trim: true, default: '' },
    assessed_at: { type: Date, default: null }
  }
}, {
  timestamps: true
});

// Auto-compute scoreLabel and aiConfidenceLabel before saving
mockInterviewSchema.pre('save', function (next) {
  // Score label
  if (this.score != null) {
    if (this.score >= 90) this.scoreLabel = 'Excellent';
    else if (this.score >= 75) this.scoreLabel = 'Good';
    else if (this.score >= 50) this.scoreLabel = 'Average';
    else this.scoreLabel = 'Needs Work';
  }

  // AI confidence label
  if (this.aiConfidence != null) {
    if (this.aiConfidence >= 0.8) this.aiConfidenceLabel = 'High';
    else if (this.aiConfidence >= 0.5) this.aiConfidenceLabel = 'Medium';
    else this.aiConfidenceLabel = 'Low';
  }

  // Auto-detect weak area from lowest dimension score if not set
  if (!this.mlPrediction?.weak_area && this.scores) {
    const dimMap = {
      technical_score: 'Technical Skills',
      clarity_score: 'Clarity of Explanation',
      confidence_score: 'Confidence',
      problem_solving_score: 'Problem Solving',
      communication_score: 'Communication'
    };
    let minVal = Infinity;
    let weakKey = null;
    for (const [key, label] of Object.entries(dimMap)) {
      const val = this.scores[key];
      if (val != null && val < minVal) {
        minVal = val;
        weakKey = label;
      }
    }
    if (weakKey && !this.mlPrediction) {
      this.mlPrediction = {};
    }
    if (weakKey && this.mlPrediction) {
      this.mlPrediction.weak_area = this.mlPrediction.weak_area || weakKey;
    }
  }

  next();
});

// ─── Indexes for query optimization ─────────────────────────
mockInterviewSchema.index({ user: 1, date: -1 });
mockInterviewSchema.index({ user: 1, status: 1 });
mockInterviewSchema.index({ user: 1, type: 1 });

module.exports = mongoose.model('MockInterview', mockInterviewSchema);
