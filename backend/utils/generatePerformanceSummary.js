// ─── Performance Summary Generator (Phase 6) ────────────────
//
// Takes a completed InterviewSession document and produces a
// comprehensive final report:
//
//   • Grade (A+ → F) & readiness verdict
//   • Category breakdown with labels
//   • 4-dimension analysis with actionable insight
//   • Ranked strengths & weaknesses WITH evidence
//   • Competency-gap analysis
//   • Personalized recommendations
//   • Time-management analytics
//
// The returned object is stored as session.performanceSummary.
// ─────────────────────────────────────────────────────────────

// ─── Grade boundaries ───────────────────────────────────────
const GRADE_TABLE = [
  { min: 95, grade: 'A+', label: 'Exceptional' },
  { min: 90, grade: 'A',  label: 'Excellent' },
  { min: 85, grade: 'A-', label: 'Very Good' },
  { min: 80, grade: 'B+', label: 'Good' },
  { min: 75, grade: 'B',  label: 'Above Average' },
  { min: 70, grade: 'B-', label: 'Solid' },
  { min: 65, grade: 'C+', label: 'Satisfactory' },
  { min: 60, grade: 'C',  label: 'Average' },
  { min: 55, grade: 'C-', label: 'Below Average' },
  { min: 50, grade: 'D+', label: 'Needs Improvement' },
  { min: 40, grade: 'D',  label: 'Weak' },
  { min: 0,  grade: 'F',  label: 'Unsatisfactory' }
];

function getGrade(score) {
  for (const row of GRADE_TABLE) {
    if (score >= row.min) return { grade: row.grade, label: row.label };
  }
  return { grade: 'F', label: 'Unsatisfactory' };
}

// ─── Readiness verdicts ─────────────────────────────────────
const READINESS_LEVELS = [
  { min: 85, level: 'Interview Ready',   emoji: 'strong',     advice: 'You are well-prepared. Focus on refining edge cases and behavioral narratives.' },
  { min: 70, level: 'Almost Ready',      emoji: 'good',       advice: 'Strong foundation — address the weak areas identified below and you will be ready.' },
  { min: 55, level: 'Needs Practice',    emoji: 'moderate',   advice: 'You understand the basics but need more practice, especially on depth and practical examples.' },
  { min: 40, level: 'Developing',        emoji: 'developing', advice: 'Review core concepts and practice structuring your answers with concrete examples.' },
  { min: 0,  level: 'Foundational',      emoji: 'early',      advice: 'Start with fundamentals — study the topics listed below and practice articulating your knowledge.' }
];

function getReadiness(score) {
  for (const row of READINESS_LEVELS) {
    if (score >= row.min) return row;
  }
  return READINESS_LEVELS[READINESS_LEVELS.length - 1];
}

// ─── Score label helper ─────────────────────────────────────
function scoreLabel(score10) {
  if (score10 >= 9)  return 'Exceptional';
  if (score10 >= 8)  return 'Excellent';
  if (score10 >= 7)  return 'Strong';
  if (score10 >= 6)  return 'Good';
  if (score10 >= 5)  return 'Average';
  if (score10 >= 4)  return 'Below Average';
  if (score10 >= 3)  return 'Weak';
  return 'Needs Work';
}

// ─── Dimension insight generator ────────────────────────────
const DIMENSION_INSIGHTS = {
  relevance: {
    high: 'Your answers consistently address the questions asked and cover the expected criteria.',
    mid:  'You generally stay on topic but sometimes drift from the core question — re-read the question before answering.',
    low:  'Many answers miss the key criteria. Practice identifying what the interviewer is really asking before responding.'
  },
  clarity: {
    high: 'Your communication is clear, well-structured, and easy to follow.',
    mid:  'Answers are understandable but could benefit from better transitions and more concise phrasing.',
    low:  'Answers are hard to follow — use shorter sentences, transition words, and structured formats (bullet points, numbered steps).'
  },
  depth: {
    high: 'Excellent depth — you provide thorough explanations with strong supporting detail.',
    mid:  'You cover the surface well, but adding more examples, comparisons, and reasoning will significantly improve your answers.',
    low:  'Answers lack sufficient detail. For each point, explain the "why" and give a concrete example.'
  },
  practicalUnderstanding: {
    high: 'You clearly demonstrate hands-on experience with real-world tools, metrics, and decision-making.',
    mid:  'Some practical awareness shown, but referencing specific tools, metrics, and past projects would strengthen your credibility.',
    low:  'Answers lean heavily theoretical. Reference real technologies, quantify outcomes, and describe hands-on experience.'
  }
};

function getDimensionInsight(dim, score10) {
  const map = DIMENSION_INSIGHTS[dim] || DIMENSION_INSIGHTS.relevance;
  if (score10 >= 7) return map.high;
  if (score10 >= 5) return map.mid;
  return map.low;
}

// ─── Category-level recommendations ─────────────────────────
const CATEGORY_RECS = {
  core_knowledge: {
    low: 'Review fundamental concepts for your role — data structures, algorithms, system basics.',
    mid: 'Strengthen conceptual depth by studying advanced topics and edge cases in your domain.'
  },
  scenario_based: {
    low: 'Practice answering "what would you do if…" questions with structured, step-by-step approaches.',
    mid: 'Add more real-world context and trade-off analysis to scenario responses.'
  },
  problem_solving: {
    low: 'Work on breaking problems into steps: identify the issue, analyze causes, propose and evaluate solutions.',
    mid: 'Push deeper into root-cause analysis and discuss alternative approaches and their trade-offs.'
  },
  behavioral: {
    low: 'Prepare 5-6 STAR stories (Situation, Task, Action, Result) from your experience that cover leadership, conflict, failure, and teamwork.',
    mid: 'Your stories are decent — make them more impactful by quantifying results and highlighting your specific contributions.'
  }
};

// ─── Main Generator ─────────────────────────────────────────

/**
 * Generate a comprehensive performance summary for a completed session.
 *
 * @param {Object} session – a Mongoose InterviewSession document (populated)
 * @returns {Object} performanceSummary – the full report object
 */
function generatePerformanceSummary(session) {
  const scoredAnswers = session.answers.filter(a => a.score != null);
  const totalAnswers  = session.answers.length;
  const totalQuestions = session.questions.length;
  const skippedCount  = totalQuestions - totalAnswers;

  // ── Overall score (0-100) ─────────────────────────────────
  let overallScore = 0;
  if (scoredAnswers.length > 0) {
    const avg = scoredAnswers.reduce((s, a) => s + a.score, 0) / scoredAnswers.length;
    overallScore = Math.round((avg / 10) * 100);
  }
  // Penalise unanswered questions
  if (skippedCount > 0) {
    const penalty = Math.round((skippedCount / totalQuestions) * 15); // up to 15 pts
    overallScore = Math.max(0, overallScore - penalty);
  }

  const { grade, label: gradeLabel } = getGrade(overallScore);
  const readiness = getReadiness(overallScore);

  // ── Category breakdown ────────────────────────────────────
  const categories = ['core_knowledge', 'scenario_based', 'problem_solving', 'behavioral'];
  const categoryBreakdown = categories.map(cat => {
    const catAnswers = scoredAnswers.filter(a => a.category === cat);
    const catQuestions = session.questions.filter(q => q.category === cat);
    const avg = catAnswers.length > 0
      ? Math.round((catAnswers.reduce((s, a) => s + a.score, 0) / catAnswers.length) * 10) / 10
      : null;
    return {
      category: cat,
      score: avg,
      label: avg != null ? scoreLabel(avg) : 'Not Assessed',
      questionCount: catQuestions.length,
      answeredCount: catAnswers.length
    };
  });

  // ── Dimension analysis ────────────────────────────────────
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

  const dimensionAnalysis = dimensions.map(dim => ({
    dimension: dim,
    score: dimensionAverages[dim],
    label: dimensionAverages[dim] != null ? scoreLabel(dimensionAverages[dim]) : 'N/A',
    insight: dimensionAverages[dim] != null
      ? getDimensionInsight(dim, dimensionAverages[dim])
      : 'Not enough data to analyse this dimension.'
  }));

  // ── Strengths (ranked, with evidence) ─────────────────────
  const strengths = [];

  // From dimension scores
  const sortedDims = dimensions
    .filter(d => dimensionAverages[d] != null)
    .sort((a, b) => dimensionAverages[b] - dimensionAverages[a]);

  for (const dim of sortedDims.filter(d => dimensionAverages[d] >= 7)) {
    strengths.push({
      area: dim.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()),
      score: dimensionAverages[dim],
      detail: getDimensionInsight(dim, dimensionAverages[dim]),
      evidence: `Averaged ${dimensionAverages[dim]}/10 across all answers.`
    });
  }

  // From category scores — top categories
  for (const cb of categoryBreakdown.filter(c => c.score != null && c.score >= 7)) {
    strengths.push({
      area: cb.category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      score: cb.score,
      detail: `Strong performance on ${cb.category.replace(/_/g, ' ')} questions.`,
      evidence: `Scored ${cb.score}/10 across ${cb.answeredCount} questions.`
    });
  }

  // From individual high-scoring answers (≥ 8)
  const topAnswers = scoredAnswers
    .filter(a => a.score >= 8)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  for (const a of topAnswers) {
    const short = a.questionText.length > 80 ? a.questionText.substring(0, 77) + '...' : a.questionText;
    strengths.push({
      area: (a.category || 'general').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      score: a.score,
      detail: `Excellent answer on: "${short}"`,
      evidence: (a.strengths || []).slice(0, 2).join(' ') || `Scored ${a.score}/10.`
    });
  }

  // Per-answer strengths (deduplicated, limited)
  const allAnswerStrengths = [...new Set(session.answers.flatMap(a => a.strengths || []))];

  // ── Weaknesses (ranked, with recommendations) ─────────────
  const weaknesses = [];

  // From dimension scores
  for (const dim of sortedDims.filter(d => dimensionAverages[d] < 6)) {
    weaknesses.push({
      area: dim.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()),
      score: dimensionAverages[dim],
      detail: getDimensionInsight(dim, dimensionAverages[dim]),
      recommendation: getWeaknessRecommendation(dim, dimensionAverages[dim])
    });
  }

  // From category scores — weak categories
  for (const cb of categoryBreakdown.filter(c => c.score != null && c.score < 6)) {
    const recs = CATEGORY_RECS[cb.category] || {};
    weaknesses.push({
      area: cb.category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      score: cb.score,
      detail: `Below-target performance on ${cb.category.replace(/_/g, ' ')} questions.`,
      recommendation: cb.score < 4 ? (recs.low || '') : (recs.mid || '')
    });
  }

  // From individual low-scoring answers (< 4)
  const weakAnswers = scoredAnswers
    .filter(a => a.score < 4)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  for (const a of weakAnswers) {
    const short = a.questionText.length > 80 ? a.questionText.substring(0, 77) + '...' : a.questionText;
    weaknesses.push({
      area: (a.category || 'general').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      score: a.score,
      detail: `Struggled on: "${short}"`,
      recommendation: (a.improvements || []).slice(0, 2).join(' ') || 'Review this topic and practice with sample answers.'
    });
  }

  // Per-answer improvements (deduplicated, limited)
  const allAnswerImprovements = [...new Set(session.answers.flatMap(a => a.improvements || []))];

  // ── Competency-gap analysis ───────────────────────────────
  const topicsCovered = [...new Set(session.answers.flatMap(a => a.keyTopicsCovered || []))];
  const allExpectedTopics = [...new Set(session.questions.flatMap(q => q.evaluationCriteria || []))];
  const topicsMissed = allExpectedTopics.filter(t => !topicsCovered.includes(t));

  const competencyGaps = [];
  // Group missed topics by category
  for (const cat of categories) {
    const catQuestions = session.questions.filter(q => q.category === cat);
    const catExpected = [...new Set(catQuestions.flatMap(q => q.evaluationCriteria || []))];
    const catMissed = catExpected.filter(t => !topicsCovered.includes(t));
    if (catMissed.length > 0) {
      competencyGaps.push({
        category: cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        missingTopics: catMissed,
        gapSeverity: catMissed.length >= catExpected.length * 0.6 ? 'high'
          : catMissed.length >= catExpected.length * 0.3 ? 'medium' : 'low'
      });
    }
  }

  // ── Personalised recommendations ──────────────────────────
  const recommendations = [];

  // Worst dimension
  if (sortedDims.length > 0 && dimensionAverages[sortedDims[sortedDims.length - 1]] < 7) {
    const worst = sortedDims[sortedDims.length - 1];
    recommendations.push(getWeaknessRecommendation(worst, dimensionAverages[worst]));
  }

  // Weakest category
  const scoredCategories = categoryBreakdown.filter(c => c.score != null).sort((a, b) => a.score - b.score);
  if (scoredCategories.length > 0 && scoredCategories[0].score < 7) {
    const weakCat = scoredCategories[0];
    const recs = CATEGORY_RECS[weakCat.category] || {};
    recommendations.push(weakCat.score < 4 ? (recs.low || '') : (recs.mid || ''));
  }

  // Skipped questions
  if (skippedCount > 0) {
    recommendations.push(`You left ${skippedCount} question(s) unanswered. Practice under timed conditions to build speed and confidence.`);
  }

  // Topic gaps
  if (topicsMissed.length > 0) {
    recommendations.push(`Study these topics you missed: ${topicsMissed.slice(0, 5).join(', ')}${topicsMissed.length > 5 ? ' (and more)' : ''}.`);
  }

  // Generic experience-level tips
  if (session.experienceLevel === 'junior') {
    recommendations.push('Focus on demonstrating foundational understanding and eagerness to learn.');
  } else if (session.experienceLevel === 'senior' || session.experienceLevel === 'lead') {
    recommendations.push('At your level, emphasise system-wide impact, mentoring, and strategic decision-making in your answers.');
  }

  // Deduplicate
  const uniqueRecs = [...new Set(recommendations.filter(Boolean))].slice(0, 8);

  // ── Time analysis ─────────────────────────────────────────
  const answeredWithTime = session.answers.filter(a => a.timeTaken > 0);
  let timeAnalysis = {
    totalSeconds: session.totalTimeTaken || 0,
    averagePerQuestion: 0,
    fastestAnswer: null,
    slowestAnswer: null
  };

  if (answeredWithTime.length > 0) {
    timeAnalysis.averagePerQuestion = Math.round(
      answeredWithTime.reduce((s, a) => s + a.timeTaken, 0) / answeredWithTime.length
    );

    const sorted = [...answeredWithTime].sort((a, b) => a.timeTaken - b.timeTaken);
    timeAnalysis.fastestAnswer = {
      questionText: sorted[0].questionText,
      seconds: sorted[0].timeTaken,
      score: sorted[0].score
    };
    timeAnalysis.slowestAnswer = {
      questionText: sorted[sorted.length - 1].questionText,
      seconds: sorted[sorted.length - 1].timeTaken,
      score: sorted[sorted.length - 1].score
    };
  }

  // ── Answer-level detail cards ─────────────────────────────
  const answerCards = session.answers.map((a, idx) => ({
    questionNumber: idx + 1,
    questionText: a.questionText,
    category: a.category || '',
    answer: a.answer,
    score: a.score,
    dimensionScores: a.dimensionScores || {},
    feedback: a.feedback,
    strengths: a.strengths || [],
    improvements: a.improvements || [],
    keyTopicsCovered: a.keyTopicsCovered || [],
    timeTaken: a.timeTaken || 0
  }));

  // ── Build the final report ────────────────────────────────
  return {
    // Top-level verdict
    overallScore,
    grade,
    gradeLabel,
    readinessLevel: readiness.level,
    readinessAdvice: readiness.advice,

    // Session meta
    jobRole: session.jobRole,
    experienceLevel: session.experienceLevel,
    totalQuestions,
    answeredQuestions: totalAnswers,
    skippedQuestions: skippedCount,

    // Breakdowns
    categoryBreakdown,
    dimensionAnalysis,
    dimensionAverages,

    // Strengths & weaknesses
    strengths: strengths.slice(0, 10),
    weaknesses: weaknesses.slice(0, 10),
    topStrengths: allAnswerStrengths.slice(0, 5),
    topImprovements: allAnswerImprovements.slice(0, 5),

    // Competency gaps
    competencyGaps,
    topicsCovered,
    topicsMissed: topicsMissed.slice(0, 15),

    // Recommendations
    recommendations: uniqueRecs,

    // Time analytics
    timeAnalysis,

    // Per-answer details
    answerDetails: answerCards,

    // Timestamps
    startedAt: session.startedAt,
    completedAt: session.completedAt
  };
}

// ─── Weakness recommendation helper ─────────────────────────
function getWeaknessRecommendation(dimension, score) {
  const recs = {
    relevance: score < 4
      ? 'Carefully re-read each question and identify the key terms before answering. Outline 2-3 points that directly address the criteria.'
      : 'Before writing, list the evaluation criteria in your head and make sure each is addressed in your response.',
    clarity: score < 4
      ? 'Practice writing short, focused sentences. Use numbered lists or headings to organise long answers.'
      : 'Add transition phrases ("however", "for example", "as a result") to improve logical flow between ideas.',
    depth: score < 4
      ? 'For each claim, follow up with "because…" and a specific example. Aim for at least 3-4 supporting details per answer.'
      : 'Go one level deeper on each point — explain not just "what" but "why" and "how", with real-world examples.',
    practicalUnderstanding: score < 4
      ? 'Reference specific tools, technologies, and metrics from your experience. Use action verbs like "built", "deployed", "optimised".'
      : 'Strengthen answers by mentioning quantifiable results (e.g., "reduced latency by 30%") and naming the technologies you used.'
  };
  return recs[dimension] || 'Review this area and practice with sample questions.';
}

module.exports = { generatePerformanceSummary };
