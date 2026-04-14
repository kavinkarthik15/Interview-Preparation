const mongoose = require('mongoose');

// ─── interview_sessions collection ──────────────────────────
// Tracks a live interview attempt. Supports both template-based
// sessions and dynamically-generated sessions (Phase 2).
// ─────────────────────────────────────────────────────────────

// Embedded question schema (stored directly on the session)
const sessionQuestionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['core_knowledge', 'scenario_based', 'problem_solving', 'behavioral'],
    required: true
  },
  type: {
    type: String,
    enum: ['core_knowledge', 'scenario_based', 'problem_solving', 'behavioral',
           'technical', 'situational', 'coding', 'system-design'],
    default: 'core_knowledge'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  keyCompetency: {
    type: String,
    trim: true,
    default: ''
  },
  evaluationCriteria: [{ type: String, trim: true }],
  expectedTopics: [{ type: String, trim: true }],
  timeLimit: {
    type: Number,
    default: 0
  }
}, { _id: true });

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  questionText: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['core_knowledge', 'scenario_based', 'problem_solving', 'behavioral', ''],
    default: ''
  },
  answer: {
    type: String,
    trim: true,
    default: ''
  },
  timeTaken: {
    type: Number, // seconds spent on this question
    default: 0
  },
  score: {
    type: Number,
    min: 0,
    max: 10,
    default: null
  },
  feedback: {
    type: String,
    trim: true,
    default: ''
  },
  // ─── Universal dimension scores (Phase 5) ──────────
  dimensionScores: {
    relevance:              { type: Number, min: 0, max: 10, default: null },
    clarity:                { type: Number, min: 0, max: 10, default: null },
    depth:                  { type: Number, min: 0, max: 10, default: null },
    practicalUnderstanding: { type: Number, min: 0, max: 10, default: null }
  },
  strengths: [{ type: String, trim: true }],
  improvements: [{ type: String, trim: true }],
  keyTopicsCovered: [{ type: String, trim: true }],
  answeredAt: {
    type: Date,
    default: null
  }
}, { _id: true });

const interviewSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // ─── Template reference (optional for dynamic sessions) ─
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InterviewTemplate',
    default: null
  },

  // ─── Dynamic session inputs (Phase 2 + Phase 9) ───────
  jobRole: {
    type: String,
    trim: true,
    default: ''
  },
  experienceLevel: {
    type: String,
    enum: ['junior', 'mid', 'senior', 'lead', 'principal', ''],
    default: ''
  },
  jobDescription: {
    type: String,
    trim: true,
    default: ''
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'mixed', ''],
    default: 'mixed'
  },
  targetCompany: {
    type: String,
    trim: true,
    default: ''
  },
  timerEnabled: {
    type: Boolean,
    default: false
  },

  // ─── Generated / embedded questions ────────────────────
  questions: [sessionQuestionSchema],

  status: {
    type: String,
    enum: ['in_progress', 'completed', 'abandoned'],
    default: 'in_progress'
  },
  currentQuestionIndex: {
    type: Number,
    default: 0
  },
  answers: [answerSchema],

  // ─── Timing ────────────────────────────────────────────
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  },
  totalTimeTaken: {
    type: Number, // total seconds
    default: 0
  },

  // ─── Results (populated on /complete) ──────────────────
  overallScore: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  overallFeedback: {
    type: String,
    trim: true,
    default: ''  },

  // ─── Per-dimension averages (Phase 5) ──────────────
  dimensionAverages: {
    relevance:              { type: Number, min: 0, max: 10, default: null },
    clarity:                { type: Number, min: 0, max: 10, default: null },
    depth:                  { type: Number, min: 0, max: 10, default: null },
    practicalUnderstanding: { type: Number, min: 0, max: 10, default: null }
  },

  // ─── Final Performance Report (Phase 6) ────────────
  performanceSummary: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
}, {
  timestamps: true,
  collection: 'interview_sessions'
});

// Auto-compute totalTimeTaken from answers on save
interviewSessionSchema.pre('save', function (next) {
  if (this.answers && this.answers.length > 0) {
    this.totalTimeTaken = this.answers.reduce((sum, a) => sum + (a.timeTaken || 0), 0);
  }
  next();
});

// ─── Indexes ─────────────────────────────────────────────────
interviewSessionSchema.index({ user: 1, status: 1 });
interviewSessionSchema.index({ user: 1, jobRole: 1 });
interviewSessionSchema.index({ user: 1, createdAt: -1 });
interviewSessionSchema.index({ template: 1 });

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
