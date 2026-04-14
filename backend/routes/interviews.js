const express = require('express');
const { body, validationResult } = require('express-validator');
const MockInterview = require('../models/MockInterview');
const auth = require('../middleware/auth');
const sendError = require('../utils/sendError');

const router = express.Router();

router.use(auth);

// ─── Shared enrichment helper ────────────────────────────────
function enrichInterview(obj) {
  obj.scoreBreakdown = {
    technical_score: obj.scores?.technical_score ?? null,
    clarity_score: obj.scores?.clarity_score ?? null,
    confidence_score: obj.scores?.confidence_score ?? null,
    problem_solving_score: obj.scores?.problem_solving_score ?? null,
    communication_score: obj.scores?.communication_score ?? null,
    status: obj.status || 'pending'
  };

  obj.aiFeedbackSummary = {
    strengths: obj.aiFeedback?.strengths || [],
    weaknesses: obj.aiFeedback?.weaknesses || [],
    suggestions: obj.aiFeedback?.suggestions || [],
    hasAIFeedback: !!(obj.aiFeedback?.strengths?.length || obj.aiFeedback?.weaknesses?.length || obj.aiFeedback?.suggestions?.length)
  };

  obj.mlPredictionSummary = {
    score: obj.mlPrediction?.score ?? null,
    confidence: obj.mlPrediction?.confidence ?? null,
    weak_area: obj.mlPrediction?.weak_area ?? null,
    explanation: obj.mlPrediction?.explanation ?? '',
    hasPrediction: !!(obj.mlPrediction?.score != null || obj.mlPrediction?.weak_area)
  };

  return obj;
}

// ─────────────────────────────────────────────────────────────
// GET /api/interviews/readiness – Composite readiness score
// Computes weighted readiness from interviews, scores, streaks
// ─────────────────────────────────────────────────────────────
router.get('/readiness', async (req, res) => {
  try {
    const interviews = await MockInterview.find({ user: req.userId }).sort({ date: -1 }).lean();

    if (interviews.length === 0) {
      return res.json({
        readinessScore: 0,
        readinessLabel: 'Not Started',
        confidence: 0,
        confidenceLabel: 'Low',
        totalInterviews: 0,
        completedInterviews: 0,
        avgScore: 0,
        avgScoreLabel: 'N/A',
        streakDays: 0,
        dimensionAverages: {
          technical: 0, clarity: 0, confidence: 0,
          problem_solving: 0, communication: 0
        }
      });
    }

    const completed = interviews.filter(i => i.status === 'completed');
    const totalInterviews = interviews.length;
    const completedInterviews = completed.length;

    // Average overall score (0–100)
    const scoredInterviews = interviews.filter(i => i.score != null);
    const avgScore = scoredInterviews.length
      ? Math.round(scoredInterviews.reduce((sum, i) => sum + i.score, 0) / scoredInterviews.length)
      : 0;

    // Average per-dimension (0–10)
    const dims = ['technical_score', 'clarity_score', 'confidence_score', 'problem_solving_score', 'communication_score'];
    const dimensionAverages = {};
    for (const dim of dims) {
      const vals = interviews.map(i => i.scores?.[dim]).filter(v => v != null);
      const key = dim.replace('_score', '');
      dimensionAverages[key] = vals.length
        ? parseFloat((vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(1))
        : 0;
    }

    // Practice streak (consecutive days with at least one interview, counting back from today)
    let streakDays = 0;
    if (interviews.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dateSet = new Set(interviews.map(i => {
        const d = new Date(i.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      }));
      let checkDate = new Date(today);
      while (dateSet.has(checkDate.getTime())) {
        streakDays++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }

    // ── Readiness formula ─────────────────────────────────────
    // 40% average score + 25% completion rate + 20% dimension coverage + 15% streak bonus
    const completionRate = totalInterviews > 0 ? (completedInterviews / totalInterviews) * 100 : 0;
    const dimCoverage = Object.values(dimensionAverages).filter(v => v > 0).length / 5 * 100;
    const streakBonus = Math.min(streakDays * 10, 100); // cap at 100

    const readinessScore = Math.round(
      avgScore * 0.4 +
      completionRate * 0.25 +
      dimCoverage * 0.2 +
      streakBonus * 0.15
    );

    // Labels
    const readinessLabel = readinessScore >= 85 ? 'Interview Ready'
      : readinessScore >= 65 ? 'Almost Ready'
      : readinessScore >= 40 ? 'Making Progress'
      : readinessScore > 0 ? 'Just Getting Started'
      : 'Not Started';

    // AI Confidence (based on data quality — how much data we have)
    const confidence = Math.min(
      (totalInterviews / 10) * 0.3 +
      (totalInterviews > 0 ? scoredInterviews.length / totalInterviews : 0) * 0.4 +
      (dimCoverage / 100) * 0.3,
      1
    );
    const confidenceLabel = confidence >= 0.8 ? 'High' : confidence >= 0.5 ? 'Medium' : 'Low';

    const avgScoreLabel = avgScore >= 90 ? 'Excellent'
      : avgScore >= 75 ? 'Good'
      : avgScore >= 50 ? 'Average'
      : avgScore > 0 ? 'Needs Work' : 'N/A';

    res.json({
      readinessScore: Math.min(readinessScore, 100),
      readinessLabel,
      confidence: parseFloat(confidence.toFixed(2)),
      confidenceLabel,
      totalInterviews,
      completedInterviews,
      avgScore,
      avgScoreLabel,
      streakDays,
      dimensionAverages
    });
  } catch (error) {
    sendError(res, 500, 'Failed to calculate readiness', error);
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/interviews/history – Historical performance data
// Returns per-interview timeline + rolling averages
// ─────────────────────────────────────────────────────────────
router.get('/history', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const parsedDays = Math.max(1, parseInt(days) || 30);
    const since = new Date();
    since.setDate(since.getDate() - parsedDays);

    const interviews = await MockInterview.find({
      user: req.userId,
      date: { $gte: since }
    }).sort({ date: 1 }).lean();

    // Build timeline entries (already plain objects from .lean())
    const timeline = interviews.map(i => ({
      id: i._id,
      date: i.date,
      title: i.title,
      type: i.type,
      score: i.score,
      scoreLabel: i.scoreLabel,
      status: i.status,
      scores: {
        technical: i.scores?.technical_score ?? null,
        clarity: i.scores?.clarity_score ?? null,
        confidence: i.scores?.confidence_score ?? null,
        problem_solving: i.scores?.problem_solving_score ?? null,
        communication: i.scores?.communication_score ?? null
      }
    }));

    // Compute rolling averages (last 3, last 5, all-time in window)
    const scoredTimeline = timeline.filter(t => t.score != null);
    const rollingAvg = (arr, n) => {
      const slice = arr.slice(-n);
      return slice.length ? parseFloat((slice.reduce((s, t) => s + t.score, 0) / slice.length).toFixed(1)) : 0;
    };

    // Trend direction
    const last3Avg = rollingAvg(scoredTimeline, 3);
    const prev3Avg = scoredTimeline.length > 3
      ? rollingAvg(scoredTimeline.slice(0, -3), 3)
      : last3Avg;
    const trend = last3Avg > prev3Avg ? 'improving' : last3Avg < prev3Avg ? 'declining' : 'stable';

    // Per-type breakdown
    const typeBreakdown = {};
    for (const t of timeline) {
      if (!typeBreakdown[t.type]) typeBreakdown[t.type] = { count: 0, totalScore: 0, scored: 0 };
      typeBreakdown[t.type].count++;
      if (t.score != null) {
        typeBreakdown[t.type].totalScore += t.score;
        typeBreakdown[t.type].scored++;
      }
    }
    for (const type of Object.keys(typeBreakdown)) {
      const tb = typeBreakdown[type];
      tb.avgScore = tb.scored ? parseFloat((tb.totalScore / tb.scored).toFixed(1)) : 0;
    }

    res.json({
      period: parsedDays,
      totalInPeriod: timeline.length,
      timeline,
      rolling: {
        last3: last3Avg,
        last5: rollingAvg(scoredTimeline, 5),
        allTime: rollingAvg(scoredTimeline, scoredTimeline.length)
      },
      trend,
      typeBreakdown
    });
  } catch (error) {
    sendError(res, 500, 'Failed to load history', error);
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/interviews/predict – ML-style prediction based on user data
// Returns: { score, confidence, weak_area, explanation }
// ─────────────────────────────────────────────────────────────────
router.get('/predict', async (req, res) => {
  try {
    const interviews = await MockInterview.find({ user: req.userId }).sort({ date: -1 }).lean();

    if (interviews.length === 0) {
      return res.json({
        score: 0,
        confidence: 0,
        weak_area: 'No Data',
        explanation: 'Complete at least one mock interview to generate predictions.',
        history: []
      });
    }

    // ── Compute per-dimension averages ───────────────────────
    const dimKeys = ['technical_score', 'clarity_score', 'confidence_score', 'problem_solving_score', 'communication_score'];
    const dimLabels = {
      technical_score: 'Technical Skills',
      clarity_score: 'Clarity of Explanation',
      confidence_score: 'Confidence',
      problem_solving_score: 'Problem Solving',
      communication_score: 'Communication'
    };

    const dimAverages = {};
    for (const dk of dimKeys) {
      const vals = interviews.map(i => i.scores?.[dk]).filter(v => v != null);
      dimAverages[dk] = vals.length
        ? parseFloat((vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(2))
        : null;
    }

    // ── Identify weakest area ───────────────────────────────
    let minDim = null;
    let minVal = Infinity;
    for (const [dk, avg] of Object.entries(dimAverages)) {
      if (avg != null && avg < minVal) {
        minVal = avg;
        minDim = dk;
      }
    }
    const weak_area = minDim ? dimLabels[minDim] : 'General Preparation';

    // ── Overall predicted score (weighted recent performance) ───
    const scoredInterviews = interviews.filter(i => i.score != null);
    // Weight recent interviews more heavily (exponential decay)
    let weightedSum = 0;
    let weightTotal = 0;
    scoredInterviews.forEach((interview, idx) => {
      const weight = Math.pow(0.85, idx); // most recent = highest weight
      weightedSum += interview.score * weight;
      weightTotal += weight;
    });
    const predictedOverall = weightTotal > 0
      ? parseFloat((weightedSum / weightTotal).toFixed(1))
      : 0;

    // Convert 0-100 to 0-10 scale
    const score = parseFloat((predictedOverall / 10).toFixed(1));

    // ── Confidence (based on data volume & consistency) ──────
    const dataCoverage = Math.min(interviews.length / 10, 1); // caps at 10 interviews
    const dimCoverage = Object.values(dimAverages).filter(v => v != null).length / 5;
    const scoreConsistency = scoredInterviews.length >= 3
      ? 1 - (Math.abs(scoredInterviews[0].score - scoredInterviews[scoredInterviews.length - 1].score) / 100)
      : 0.5;
    const confidence = Math.round(
      (dataCoverage * 0.35 + dimCoverage * 0.35 + scoreConsistency * 0.3) * 100
    );

    // ── Generate explanation ─────────────────────────────────
    const explanationParts = [];
    if (score >= 8) {
      explanationParts.push(`Strong overall performance with a predicted score of ${score}/10.`);
    } else if (score >= 6) {
      explanationParts.push(`Solid performance with room for improvement. Predicted score: ${score}/10.`);
    } else if (score >= 4) {
      explanationParts.push(`Moderate performance. Focus on weak areas to improve. Predicted: ${score}/10.`);
    } else {
      explanationParts.push(`Early stage preparation. More practice needed. Current prediction: ${score}/10.`);
    }

    if (minDim && minVal < 6) {
      explanationParts.push(`Your weakest area is ${weak_area} (avg ${minVal}/10). Consider focused practice here.`);
    }

    if (confidence >= 70) {
      explanationParts.push(`Prediction confidence is high (${confidence}%) based on ${interviews.length} interviews.`);
    } else {
      explanationParts.push(`Complete more interviews with detailed scores to improve prediction accuracy (currently ${confidence}%).`);
    }

    // ── Historical prediction points (for line chart) ─────────
    const historyPoints = [];
    for (let i = scoredInterviews.length - 1; i >= 0; i--) {
      const si = scoredInterviews[i];
      // Running weighted avg up to this point
      let runSum = 0;
      let runWeight = 0;
      for (let j = i; j < scoredInterviews.length; j++) {
        const w = Math.pow(0.85, j - i);
        runSum += scoredInterviews[j].score * w;
        runWeight += w;
      }
      historyPoints.push({
        date: si.date,
        score: parseFloat((runSum / runWeight / 10).toFixed(1)),
        rawScore: si.score,
        title: si.title
      });
    }

    res.json({
      score,
      confidence,
      weak_area,
      explanation: explanationParts.join(' '),
      dimensions: Object.fromEntries(
        Object.entries(dimAverages).map(([k, v]) => [k.replace('_score', ''), v])
      ),
      history: historyPoints
    });
  } catch (error) {
    sendError(res, 500, 'Failed to generate prediction', error);
  }
});

// POST /api/interviews - Store mock interview history
router.post('/', [
  body('title').trim().notEmpty().withMessage('Interview title is required'),
  body('type').optional().isIn(['Technical', 'Behavioral', 'System Design', 'HR', 'Coding', 'Other']),
  body('company').optional().trim(),
  body('duration').optional().isNumeric(),
  body('score').optional().isFloat({ min: 0, max: 100 }),
  body('status').optional().isIn(['completed', 'in-progress', 'pending', 'failed']),
  body('aiConfidence').optional().isFloat({ min: 0, max: 1 }),
  body('overallRating').optional().isFloat({ min: 1, max: 5 }),
  body('feedback').optional().trim(),
  body('questionsAsked').optional().isArray(),
  body('scores').optional().isObject(),
  body('scores.technical_score').optional().isFloat({ min: 0, max: 10 }),
  body('scores.clarity_score').optional().isFloat({ min: 0, max: 10 }),
  body('scores.confidence_score').optional().isFloat({ min: 0, max: 10 }),
  body('scores.problem_solving_score').optional().isFloat({ min: 0, max: 10 }),
  body('scores.communication_score').optional().isFloat({ min: 0, max: 10 }),
  body('aiFeedback').optional().isObject(),
  body('aiFeedback.strengths').optional().isArray(),
  body('aiFeedback.strengths.*').optional().isString().trim(),
  body('aiFeedback.weaknesses').optional().isArray(),
  body('aiFeedback.weaknesses.*').optional().isString().trim(),
  body('aiFeedback.suggestions').optional().isArray(),
  body('aiFeedback.suggestions.*').optional().isString().trim(),
  body('mlPrediction').optional().isObject(),
  body('mlPrediction.score').optional().isFloat({ min: 0, max: 10 }),
  body('mlPrediction.confidence').optional().isFloat({ min: 0, max: 100 }),
  body('mlPrediction.weak_area').optional().isString().trim(),
  body('mlPrediction.explanation').optional().isString().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const allowedFields = ['title', 'type', 'company', 'duration', 'score', 'status',
      'aiConfidence', 'overallRating', 'feedback', 'questionsAsked', 'scores', 'aiFeedback', 'mlPrediction'];
    const interviewData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) interviewData[field] = req.body[field];
    }
    interviewData.user = req.userId;

    const interview = new MockInterview(interviewData);
    await interview.save();

    res.status(201).json({ message: 'Mock interview recorded successfully', interview });
  } catch (error) {
    sendError(res, 500, 'Failed to save interview', error);
  }
});

// GET /api/interviews - Fetch all mock interviews
router.get('/', async (req, res) => {
  try {
    const { type, limit } = req.query;
    const filter = { user: req.userId };
    if (type) filter.type = String(type);

    let query = MockInterview.find(filter).sort({ date: -1 }).lean();
    const parsedLimit = parseInt(limit);
    if (parsedLimit > 0) query = query.limit(parsedLimit);

    const interviews = await query;

    // Enrich each interview with structured score data for frontend visual styling
    const enriched = interviews.map(enrichInterview);

    res.json({ interviews: enriched });
  } catch (error) {
    sendError(res, 500, 'Failed to load interviews', error);
  }
});

// GET /api/interviews/:id - Fetch single interview
router.get('/:id', async (req, res) => {
  try {
    const obj = await MockInterview.findOne({ _id: req.params.id, user: req.userId }).lean();
    if (!obj) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    res.json({ interview: enrichInterview(obj) });
  } catch (error) {
    sendError(res, 500, 'Failed to load interview', error);
  }
});

// PUT /api/interviews/:id - Update interview
router.put('/:id', [
  body('title').optional().trim().notEmpty(),
  body('type').optional().isIn(['Technical', 'Behavioral', 'System Design', 'HR', 'Coding', 'Other']),
  body('company').optional().trim(),
  body('duration').optional().isNumeric(),
  body('score').optional().isFloat({ min: 0, max: 100 }),
  body('status').optional().isIn(['completed', 'in-progress', 'pending', 'failed']),
  body('feedback').optional().trim(),
  body('scores').optional().isObject(),
  body('scores.technical_score').optional().isFloat({ min: 0, max: 10 }),
  body('scores.clarity_score').optional().isFloat({ min: 0, max: 10 }),
  body('scores.confidence_score').optional().isFloat({ min: 0, max: 10 }),
  body('scores.problem_solving_score').optional().isFloat({ min: 0, max: 10 }),
  body('scores.communication_score').optional().isFloat({ min: 0, max: 10 }),
  body('aiFeedback').optional().isObject(),
  body('mlPrediction').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const interview = await MockInterview.findOne({ _id: req.params.id, user: req.userId });
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // Update allowed fields
    const allowedFields = ['title', 'type', 'company', 'duration', 'score', 'status',
      'feedback', 'questionsAsked', 'overallRating', 'scores', 'aiFeedback', 'mlPrediction'];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        interview[field] = req.body[field];
      }
    }

    await interview.save();
    res.json({ message: 'Interview updated successfully', interview });
  } catch (error) {
    sendError(res, 500, 'Failed to update interview', error);
  }
});

// DELETE /api/interviews/:id - Delete interview
router.delete('/:id', async (req, res) => {
  try {
    const interview = await MockInterview.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }
    res.json({ message: 'Interview deleted successfully' });
  } catch (error) {
    sendError(res, 500, 'Failed to delete interview', error);
  }
});

module.exports = router;
