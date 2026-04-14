const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const InterviewSession = require('../models/InterviewSession');
const { generateQuestions, normalizeExperience } = require('../utils/generateQuestions');
const { evaluateAnswer } = require('../utils/evaluateAnswer');
const { generatePerformanceSummary } = require('../utils/generatePerformanceSummary');
const auth = require('../middleware/auth');
const sendError = require('../utils/sendError');

const router = express.Router();

// All mock-interview routes require authentication
router.use(auth);

// ─── Valid experience levels (after normalization) ───────────
const VALID_EXPERIENCE = ['junior', 'mid', 'senior', 'lead', 'principal'];

// ─────────────────────────────────────────────────────────────
// POST /api/mock-interview/start
// Initialize a new dynamic interview session.
//
// Body: {
//   job_role:          string  (required)
//   experience_level:  string  (required)
//   job_description:   string  (optional)
//   difficulty:        string  (optional – easy|medium|hard|mixed)
//   target_company:    string  (optional)
//   timer_enabled:     boolean (optional)
// }
//
// Generates a tailored question set, stores role + experience +
// questions on the session (status = in_progress), and returns
// the first question.
// ─────────────────────────────────────────────────────────────
router.post(
  '/start',
  [
    body('job_role')
      .isString().trim().notEmpty()
      .withMessage('job_role is required'),
    body('experience_level')
      .isString().trim().notEmpty()
      .withMessage('experience_level is required'),
    body('job_description')
      .optional()
      .isString().trim(),
    body('difficulty')
      .optional()
      .isIn(['easy', 'medium', 'hard', 'mixed'])
      .withMessage('difficulty must be easy, medium, hard, or mixed'),
    body('target_company')
      .optional()
      .isString().trim(),
    body('timer_enabled')
      .optional()
      .isBoolean()
      .withMessage('timer_enabled must be a boolean')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      }

      const { job_role, experience_level, job_description, difficulty, target_company, timer_enabled } = req.body;

      // Normalize & validate experience level
      const expKey = normalizeExperience(experience_level);
      if (!VALID_EXPERIENCE.includes(expKey)) {
        return res.status(400).json({
          message: `Invalid experience_level. Accepted values (or synonyms): ${VALID_EXPERIENCE.join(', ')}`
        });
      }

      const difficultyLevel = difficulty || 'mixed';
      const companyName = (target_company || '').trim();
      const timerEnabled = !!timer_enabled;

      // Prevent duplicate active sessions for the same role
      const existingSession = await InterviewSession.findOne({
        user: req.userId,
        jobRole: job_role,
        status: 'in_progress'
      });

      if (existingSession) {
        return res.status(409).json({
          message: 'You already have an active interview session for this role.',
          sessionId: existingSession._id
        });
      }

      // Generate dynamic question set
      const { questions } = generateQuestions({
        jobRole: job_role,
        experienceLevel: experience_level,
        jobDescription: job_description || '',
        difficulty: difficultyLevel,
        targetCompany: companyName,
        timerEnabled
      });

      // Create the session
      const session = await InterviewSession.create({
        user: req.userId,
        jobRole: job_role,
        experienceLevel: expKey,
        jobDescription: job_description || '',
        difficulty: difficultyLevel,
        targetCompany: companyName,
        timerEnabled,
        questions,
        status: 'in_progress',
        currentQuestionIndex: 0,
        answers: [],
        startedAt: new Date()
      });

      // Return session metadata + first question
      const firstQuestion = session.questions[0];

      res.status(201).json({
        message: 'Interview session started.',
        session: {
          sessionId: session._id,
          jobRole: session.jobRole,
          experienceLevel: session.experienceLevel,
          totalQuestions: session.questions.length,
          currentQuestionIndex: 0,
          answeredCount: 0,
          status: session.status,
          startedAt: session.startedAt
        },
        currentQuestion: {
          id: firstQuestion._id,
          text: firstQuestion.text,
          category: firstQuestion.category,
          type: firstQuestion.type,
          difficulty: firstQuestion.difficulty,
          keyCompetency: firstQuestion.keyCompetency,
          evaluationCriteria: firstQuestion.evaluationCriteria,
          expectedTopics: firstQuestion.expectedTopics,
          timeLimit: firstQuestion.timeLimit || 0
        }
      });
    } catch (error) {
      sendError(res, 500, 'Failed to start interview session.', error);
    }
  }
);

// ─────────────────────────────────────────────────────────────
// POST /api/mock-interview/answer
// Submit an answer to the current question in a session.
// Questions are read from session.questions (embedded).
// Body: { sessionId, questionId, answer, timeTaken }
// ─────────────────────────────────────────────────────────────
router.post(
  '/answer',
  [
    body('sessionId').isMongoId().withMessage('Valid sessionId is required'),
    body('questionId').isMongoId().withMessage('Valid questionId is required'),
    body('answer').isString().trim().notEmpty().withMessage('Answer is required'),
    body('timeTaken').optional().isInt({ min: 0 }).withMessage('timeTaken must be a non-negative integer')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      }

      const { sessionId, questionId, answer, timeTaken = 0 } = req.body;

      // Fetch session and verify ownership
      const session = await InterviewSession.findOne({
        _id: sessionId,
        user: req.userId
      });

      if (!session) {
        return res.status(404).json({ message: 'Session not found.' });
      }

      if (session.status !== 'in_progress') {
        return res.status(400).json({ message: 'This session is no longer active.' });
      }

      // Get current question from the embedded questions array
      const currentQ = session.questions[session.currentQuestionIndex];
      if (!currentQ || currentQ._id.toString() !== questionId) {
        return res.status(400).json({ message: 'Question ID does not match the current question.' });
      }

      // Prevent duplicate answers for the same question
      const alreadyAnswered = session.answers.some(
        a => a.questionId.toString() === questionId
      );
      if (alreadyAnswered) {
        return res.status(409).json({ message: 'This question has already been answered.' });
      }

      // ── Evaluate the answer ──────────────────────────────
      const evaluation = evaluateAnswer({
        answer,
        questionText: currentQ.text,
        category: currentQ.category || 'core_knowledge',
        difficulty: currentQ.difficulty || 'medium',
        keyCompetency: currentQ.keyCompetency || '',
        evaluationCriteria: currentQ.evaluationCriteria || [],
        expectedTopics: currentQ.expectedTopics || [],
        jobRole: session.jobRole,
        experienceLevel: session.experienceLevel
      });

      // Record the answer with evaluation results
      session.answers.push({
        questionId: currentQ._id,
        questionText: currentQ.text,
        category: currentQ.category || '',
        answer,
        timeTaken,
        score: evaluation.score,
        feedback: evaluation.feedback,
        dimensionScores: evaluation.dimensionScores,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
        keyTopicsCovered: evaluation.keyTopicsCovered,
        answeredAt: new Date()
      });

      // Advance to the next question
      session.currentQuestionIndex += 1;
      await session.save();

      // Determine if there are more questions
      const hasNext = session.currentQuestionIndex < session.questions.length;
      const nextQuestion = hasNext ? session.questions[session.currentQuestionIndex] : null;

      res.json({
        message: 'Answer recorded.',
        evaluation: {
          score: evaluation.score,
          dimensionScores: evaluation.dimensionScores,
          dimensionFeedback: evaluation.dimensionFeedback,
          feedback: evaluation.feedback,
          strengths: evaluation.strengths,
          improvements: evaluation.improvements,
          keyTopicsCovered: evaluation.keyTopicsCovered
        },
        session: {
          sessionId: session._id,
          currentQuestionIndex: session.currentQuestionIndex,
          totalQuestions: session.questions.length,
          answeredCount: session.answers.length,
          isComplete: !hasNext
        },
        nextQuestion: nextQuestion
          ? {
              id: nextQuestion._id,
              text: nextQuestion.text,
              category: nextQuestion.category,
              type: nextQuestion.type,
              difficulty: nextQuestion.difficulty,
              keyCompetency: nextQuestion.keyCompetency,
              evaluationCriteria: nextQuestion.evaluationCriteria,
              expectedTopics: nextQuestion.expectedTopics,
              timeLimit: nextQuestion.timeLimit || 0
            }
          : null
      });
    } catch (error) {
      sendError(res, 500, 'Failed to record answer.', error);
    }
  }
);

// ─────────────────────────────────────────────────────────────
// POST /api/mock-interview/complete
// Finalize a session — calculates overall score, generates
// full performance summary (grade, strengths, weaknesses,
// recommendations), updates status = completed, stores report,
// and returns the final report.
// Body: { sessionId }
// ─────────────────────────────────────────────────────────────
router.post(
  '/complete',
  [body('sessionId').isMongoId().withMessage('Valid sessionId is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      }

      const { sessionId } = req.body;

      // Fetch session and verify ownership
      const session = await InterviewSession.findOne({
        _id: sessionId,
        user: req.userId
      });

      if (!session) {
        return res.status(404).json({ message: 'Session not found.' });
      }

      if (session.status === 'completed') {
        return res.status(400).json({ message: 'This session is already completed.' });
      }

      if (session.status === 'abandoned') {
        return res.status(400).json({ message: 'This session was abandoned and cannot be completed.' });
      }

      // ── Mark session completed ────────────────────────────
      session.status = 'completed';
      session.completedAt = new Date();

      // ── Calculate overall score ───────────────────────────
      const scoredAnswers = session.answers.filter(a => a.score != null);
      if (scoredAnswers.length > 0) {
        const avgScore = scoredAnswers.reduce((sum, a) => sum + a.score, 0) / scoredAnswers.length;
        session.overallScore = Math.round((avgScore / 10) * 100); // 0-10 → 0-100
      }

      // ── Compute dimension averages ────────────────────────
      const dimensions = ['relevance', 'clarity', 'depth', 'practicalUnderstanding'];
      const dimensionAverages = {};
      for (const dim of dimensions) {
        const vals = scoredAnswers
          .map(a => a.dimensionScores && a.dimensionScores[dim])
          .filter(v => v != null);
        dimensionAverages[dim] = vals.length > 0
          ? Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 10) / 10
          : null;
      }
      session.dimensionAverages = dimensionAverages;

      // ── Build overall feedback ────────────────────────────
      const feedbackLines = [];
      if (session.overallScore >= 80) feedbackLines.push('Outstanding performance across the interview!');
      else if (session.overallScore >= 60) feedbackLines.push('Good performance with some areas to strengthen.');
      else if (session.overallScore >= 40) feedbackLines.push('Adequate performance — focused practice will help improve weaker areas.');
      else feedbackLines.push('This interview highlighted several growth areas — review the feedback and practice targeted topics.');

      const sortedDims = dimensions
        .filter(d => dimensionAverages[d] != null)
        .sort((a, b) => dimensionAverages[a] - dimensionAverages[b]);
      if (sortedDims.length > 0) {
        const strongest = sortedDims[sortedDims.length - 1];
        feedbackLines.push(`Strongest dimension: ${strongest} (${dimensionAverages[strongest]}/10).`);
        const weakest = sortedDims[0];
        if (dimensionAverages[weakest] < 7) {
          feedbackLines.push(`Area needing most improvement: ${weakest} (${dimensionAverages[weakest]}/10).`);
        }
      }
      session.overallFeedback = feedbackLines.join(' ');

      // ── Generate the full performance summary ─────────────
      const performanceSummary = generatePerformanceSummary(session);
      session.performanceSummary = performanceSummary;

      await session.save();

      // ── Return the final report ───────────────────────────
      res.json({
        message: 'Interview session completed.',
        report: {
          sessionId: session._id,
          ...performanceSummary
        }
      });
    } catch (error) {
      sendError(res, 500, 'Failed to complete interview session.', error);
    }
  }
);

// ─────────────────────────────────────────────────────────────
// GET /api/mock-interview/report/:sessionId
// Retrieve the stored final report for a completed session.
// ─────────────────────────────────────────────────────────────
router.get(
  '/report/:sessionId',
  async (req, res) => {
    try {
      const { sessionId } = req.params;

      if (!sessionId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: 'Invalid sessionId format.' });
      }

      const session = await InterviewSession.findOne({
        _id: sessionId,
        user: req.userId
      });

      if (!session) {
        return res.status(404).json({ message: 'Session not found.' });
      }

      if (session.status !== 'completed') {
        return res.status(400).json({ message: 'This session is not yet completed. Complete the interview first.' });
      }

      // If report was stored, return it; otherwise regenerate
      let report = session.performanceSummary;
      if (!report) {
        report = generatePerformanceSummary(session);
        session.performanceSummary = report;
        await session.save();
      }

      res.json({
        message: 'Performance report retrieved.',
        report: {
          sessionId: session._id,
          ...report
        }
      });
    } catch (error) {
      sendError(res, 500, 'Failed to retrieve performance report.', error);
    }
  }
);

// ─────────────────────────────────────────────────────────────
// GET /api/mock-interview/history
// List completed interview sessions for the current user
// with pagination and optional role filter.
// Query: ?page=1&limit=10&role=Frontend+Developer
// ─────────────────────────────────────────────────────────────
router.get('/history', async (req, res) => {
  try {
    const page  = Math.max(parseInt(req.query.page)  || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
    const skip  = (page - 1) * limit;

    const filter = { user: req.userId, status: 'completed' };
    if (req.query.role) {
      filter.jobRole = { $regex: new RegExp(req.query.role, 'i') };
    }

    const [sessions, total] = await Promise.all([
      InterviewSession.find(filter)
        .select('jobRole experienceLevel overallScore dimensionAverages startedAt completedAt totalTimeTaken questions answers performanceSummary')
        .sort({ completedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      InterviewSession.countDocuments(filter)
    ]);

    const history = sessions.map(s => ({
      sessionId:        s._id,
      jobRole:          s.jobRole,
      experienceLevel:  s.experienceLevel,
      overallScore:     s.overallScore,
      grade:            s.performanceSummary?.grade || null,
      gradeLabel:       s.performanceSummary?.gradeLabel || null,
      readinessLevel:   s.performanceSummary?.readinessLevel || null,
      dimensionAverages: s.dimensionAverages || {},
      totalQuestions:   s.questions?.length || 0,
      answeredQuestions: s.answers?.length || 0,
      totalTimeTaken:   s.totalTimeTaken || 0,
      startedAt:        s.startedAt,
      completedAt:      s.completedAt
    }));

    res.json({
      history,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    sendError(res, 500, 'Failed to fetch interview history.', error);
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/mock-interview/analytics
// Aggregated dashboard metrics for mock interviews.
// Returns: overall stats, score trend over time, role-wise
// performance breakdown, dimension averages, improvement trend.
// Query: ?days=90  (default: 90)
// ─────────────────────────────────────────────────────────────
router.get('/analytics', async (req, res) => {
  try {
    const days = Math.min(Math.max(parseInt(req.query.days) || 90, 7), 365);
    const since = new Date();
    since.setDate(since.getDate() - days);

    const sessions = await InterviewSession.find({
      user: req.userId,
      status: 'completed',
      completedAt: { $gte: since }
    })
      .select('jobRole experienceLevel overallScore dimensionAverages completedAt answers totalTimeTaken performanceSummary')
      .sort({ completedAt: 1 })
      .lean();

    // All-time completed count (for the stat card)
    const totalCompleted = await InterviewSession.countDocuments({
      user: req.userId,
      status: 'completed'
    });

    if (sessions.length === 0) {
      return res.json({
        totalCompleted,
        periodDays: days,
        periodSessions: 0,
        averageScore: null,
        bestScore: null,
        worstScore: null,
        improvementTrend: null,
        scoreTrend: [],
        rolePerformance: [],
        dimensionAverages: {},
        recentGrades: []
      });
    }

    // ── Basic aggregates ────────────────────────────────────
    const scores = sessions.map(s => s.overallScore).filter(s => s != null);
    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null;
    const bestScore  = scores.length > 0 ? Math.max(...scores) : null;
    const worstScore = scores.length > 0 ? Math.min(...scores) : null;

    // ── Improvement trend ───────────────────────────────────
    // Compare average of first half vs second half of sessions
    let improvementTrend = null;
    if (scores.length >= 2) {
      const mid = Math.floor(scores.length / 2);
      const firstHalf  = scores.slice(0, mid);
      const secondHalf = scores.slice(mid);
      const avgFirst  = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      improvementTrend = Math.round((avgSecond - avgFirst) * 10) / 10; // positive = improving
    }

    // ── Score trend (for line chart) ────────────────────────
    const scoreTrend = sessions
      .filter(s => s.overallScore != null)
      .map(s => ({
        sessionId: s._id,
        date: s.completedAt,
        score: s.overallScore / 10, // 0-10 scale for HistoricalLineChart
        rawScore: s.overallScore,
        title: s.jobRole,
        grade: s.performanceSummary?.grade || null
      }));

    // ── Role-wise performance ───────────────────────────────
    const roleMap = {};
    for (const s of sessions) {
      const role = s.jobRole || 'Unknown';
      if (!roleMap[role]) {
        roleMap[role] = { role, scores: [], sessions: 0, totalTime: 0, totalAnswers: 0, totalQuestions: 0 };
      }
      roleMap[role].sessions += 1;
      if (s.overallScore != null) roleMap[role].scores.push(s.overallScore);
      roleMap[role].totalTime += s.totalTimeTaken || 0;
      roleMap[role].totalAnswers += s.answers?.length || 0;
    }

    const rolePerformance = Object.values(roleMap).map(r => ({
      role: r.role,
      sessions: r.sessions,
      averageScore: r.scores.length > 0
        ? Math.round(r.scores.reduce((a, b) => a + b, 0) / r.scores.length)
        : null,
      bestScore: r.scores.length > 0 ? Math.max(...r.scores) : null,
      totalAnswers: r.totalAnswers,
      avgTimePerSession: r.sessions > 0 ? Math.round(r.totalTime / r.sessions) : 0
    })).sort((a, b) => b.sessions - a.sessions);

    // ── Dimension averages across all sessions ──────────────
    const dims = ['relevance', 'clarity', 'depth', 'practicalUnderstanding'];
    const dimAccum = {};
    for (const dim of dims) {
      const vals = sessions
        .map(s => s.dimensionAverages?.[dim])
        .filter(v => v != null);
      dimAccum[dim] = vals.length > 0
        ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
        : null;
    }

    // ── Recent grades ───────────────────────────────────────
    const recentGrades = sessions
      .slice(-10)
      .reverse()
      .map(s => ({
        sessionId: s._id,
        jobRole: s.jobRole,
        grade: s.performanceSummary?.grade || null,
        score: s.overallScore,
        date: s.completedAt
      }));

    res.json({
      totalCompleted,
      periodDays: days,
      periodSessions: sessions.length,
      averageScore: avgScore,
      bestScore,
      worstScore,
      improvementTrend,
      scoreTrend,
      rolePerformance,
      dimensionAverages: dimAccum,
      recentGrades
    });
  } catch (error) {
    sendError(res, 500, 'Failed to generate analytics.', error);
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/mock-interview/upload-jd
// Upload a JD file (PDF/DOCX/TXT) and extract text.
// Returns extracted text to use in /start.
// ─────────────────────────────────────────────────────────────

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const jdStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `jd-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const jdFilter = (req, file, cb) => {
  const allowed = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, DOCX, and TXT files are allowed'), false);
  }
};

const jdUpload = multer({
  storage: jdStorage,
  fileFilter: jdFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

async function extractJDText(filePath, mimetype) {
  if (mimetype === 'text/plain') {
    return await fsPromises.readFile(filePath, 'utf-8');
  }
  if (mimetype === 'application/pdf') {
    const dataBuffer = await fsPromises.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  }
  if (
    mimetype === 'application/msword' ||
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }
  throw new Error('Unsupported file type');
}

router.post('/upload-jd', jdUpload.single('jd_file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded. Send a file with field name "jd_file".' });
    }

    const text = await extractJDText(req.file.path, req.file.mimetype);

    // Clean up the uploaded file
    await fsPromises.unlink(req.file.path).catch(() => {});

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Could not extract text from the uploaded file.' });
    }

    res.json({
      message: 'Job description extracted successfully.',
      jobDescription: text.trim().slice(0, 10000) // cap at 10k chars
    });
  } catch (error) {
    // Clean up on error
    if (req.file?.path) await fsPromises.unlink(req.file.path).catch(() => {});
    sendError(res, 500, 'Failed to process JD file.', error);
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/mock-interview/skill-gaps
// Analyse all completed sessions for the current user and
// detect skill gaps across categories, dimensions, and
// key competencies.
// Query: ?days=90
// ─────────────────────────────────────────────────────────────
router.get('/skill-gaps', async (req, res) => {
  try {
    const days = Math.min(Math.max(parseInt(req.query.days) || 90, 7), 365);
    const since = new Date();
    since.setDate(since.getDate() - days);

    const sessions = await InterviewSession.find({
      user: req.userId,
      status: 'completed',
      completedAt: { $gte: since }
    })
      .select('jobRole answers questions dimensionAverages completedAt')
      .sort({ completedAt: -1 })
      .lean();

    if (sessions.length === 0) {
      return res.json({
        periodDays: days,
        totalSessions: 0,
        categoryGaps: [],
        dimensionGaps: [],
        competencyGaps: [],
        topWeakAreas: [],
        recommendations: []
      });
    }

    // ── Category-level analysis ──────────────────────────
    const catAccum = {};
    for (const s of sessions) {
      for (const a of (s.answers || [])) {
        const cat = a.category || 'core_knowledge';
        if (!catAccum[cat]) catAccum[cat] = { scores: [], improvements: [], topicsMissed: [] };
        if (a.score != null) catAccum[cat].scores.push(a.score);
        if (a.improvements?.length) catAccum[cat].improvements.push(...a.improvements);
      }
    }

    const CATEGORY_LABELS = {
      core_knowledge: 'Core Knowledge',
      scenario_based: 'Scenario-Based',
      problem_solving: 'Problem Solving',
      behavioral: 'Behavioral'
    };

    const categoryGaps = Object.entries(catAccum)
      .map(([cat, data]) => {
        const avg = data.scores.length > 0
          ? Math.round((data.scores.reduce((a, b) => a + b, 0) / data.scores.length) * 10) / 10
          : null;
        // Count recurring improvement themes
        const freqMap = {};
        for (const imp of data.improvements) {
          const key = imp.toLowerCase().trim();
          freqMap[key] = (freqMap[key] || 0) + 1;
        }
        const recurring = Object.entries(freqMap)
          .filter(([, count]) => count >= 2)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([text]) => text);

        return {
          category: cat,
          label: CATEGORY_LABELS[cat] || cat,
          averageScore: avg,
          totalAnswers: data.scores.length,
          gapSeverity: avg != null ? (avg < 4 ? 'critical' : avg < 6 ? 'moderate' : avg < 7.5 ? 'mild' : 'none') : 'unknown',
          recurringImprovements: recurring
        };
      })
      .sort((a, b) => (a.averageScore ?? 10) - (b.averageScore ?? 10));

    // ── Dimension-level analysis ─────────────────────────
    const dims = ['relevance', 'clarity', 'depth', 'practicalUnderstanding'];
    const DIM_LABELS = {
      relevance: 'Relevance', clarity: 'Clarity',
      depth: 'Depth', practicalUnderstanding: 'Practical Understanding'
    };
    const dimAccum = {};
    for (const dim of dims) {
      const vals = sessions
        .map(s => s.dimensionAverages?.[dim])
        .filter(v => v != null);
      const avg = vals.length > 0
        ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
        : null;
      dimAccum[dim] = {
        dimension: dim,
        label: DIM_LABELS[dim],
        averageScore: avg,
        sessionsAnalysed: vals.length,
        gapSeverity: avg != null ? (avg < 4 ? 'critical' : avg < 6 ? 'moderate' : avg < 7.5 ? 'mild' : 'none') : 'unknown'
      };
    }
    const dimensionGaps = Object.values(dimAccum)
      .sort((a, b) => (a.averageScore ?? 10) - (b.averageScore ?? 10));

    // ── Competency-level analysis ────────────────────────
    const compAccum = {};
    for (const s of sessions) {
      for (let i = 0; i < (s.answers || []).length; i++) {
        const a = s.answers[i];
        // Match question to get keyCompetency
        const q = s.questions?.[i];
        const competency = q?.keyCompetency || 'General';
        if (!compAccum[competency]) compAccum[competency] = { scores: [], improvements: [] };
        if (a.score != null) compAccum[competency].scores.push(a.score);
        if (a.improvements?.length) compAccum[competency].improvements.push(...a.improvements);
      }
    }

    const competencyGaps = Object.entries(compAccum)
      .map(([comp, data]) => {
        const avg = data.scores.length > 0
          ? Math.round((data.scores.reduce((a, b) => a + b, 0) / data.scores.length) * 10) / 10
          : null;
        return {
          competency: comp,
          averageScore: avg,
          totalAnswers: data.scores.length,
          gapSeverity: avg != null ? (avg < 4 ? 'critical' : avg < 6 ? 'moderate' : avg < 7.5 ? 'mild' : 'none') : 'unknown',
          topImprovements: data.improvements.slice(0, 3)
        };
      })
      .filter(c => c.gapSeverity !== 'none' && c.gapSeverity !== 'unknown')
      .sort((a, b) => (a.averageScore ?? 10) - (b.averageScore ?? 10));

    // ── Top weak areas (union of worst) ───────────────────
    const topWeakAreas = [
      ...categoryGaps.filter(c => c.gapSeverity === 'critical' || c.gapSeverity === 'moderate').map(c => ({ type: 'category', name: c.label, score: c.averageScore, severity: c.gapSeverity })),
      ...dimensionGaps.filter(d => d.gapSeverity === 'critical' || d.gapSeverity === 'moderate').map(d => ({ type: 'dimension', name: d.label, score: d.averageScore, severity: d.gapSeverity })),
      ...competencyGaps.filter(c => c.gapSeverity === 'critical').map(c => ({ type: 'competency', name: c.competency, score: c.averageScore, severity: c.gapSeverity }))
    ].sort((a, b) => (a.score ?? 10) - (b.score ?? 10)).slice(0, 8);

    // ── Auto-recommendations ─────────────────────────────
    const recommendations = [];
    for (const gap of categoryGaps) {
      if (gap.gapSeverity === 'critical') {
        recommendations.push(`Focus on ${gap.label} questions — your average (${gap.averageScore}/10) indicates a critical gap.`);
      } else if (gap.gapSeverity === 'moderate') {
        recommendations.push(`Strengthen ${gap.label} skills — scoring ${gap.averageScore}/10 on average.`);
      }
    }
    for (const gap of dimensionGaps) {
      if (gap.gapSeverity === 'critical' || gap.gapSeverity === 'moderate') {
        recommendations.push(`Improve your ${gap.label.toLowerCase()} in answers — currently at ${gap.averageScore}/10.`);
      }
    }
    if (recommendations.length === 0) {
      recommendations.push('Great performance across all areas! Keep practicing to maintain your edge.');
    }

    res.json({
      periodDays: days,
      totalSessions: sessions.length,
      categoryGaps,
      dimensionGaps,
      competencyGaps: competencyGaps.slice(0, 10),
      topWeakAreas,
      recommendations: recommendations.slice(0, 6)
    });
  } catch (error) {
    sendError(res, 500, 'Failed to analyse skill gaps.', error);
  }
});

module.exports = router;
