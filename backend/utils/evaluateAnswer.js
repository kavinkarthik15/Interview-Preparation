// ─── Universal Scoring Engine (Phase 5) ─────────────────────
//
// Evaluates every answer across 4 universal dimensions:
//
//   1. Relevance            – Does the answer address the question?
//   2. Clarity              – Is the answer clear and well-articulated?
//   3. Depth                – Is the answer thorough and detailed?
//   4. Practical Understanding – Does the candidate show real-world know-how?
//
// Each dimension is scored 0-10 with its own feedback and
// improvement suggestions.  The composite score is a weighted
// average that can be swapped for an LLM later — the contract
// stays the same:
//
//  { score, dimensionScores, feedback, strengths, improvements,
//    keyTopicsCovered, dimensionFeedback }
// ─────────────────────────────────────────────────────────────

// ─── Concept Maps ───────────────────────────────────────────
// Organised by competency area. Terms → relevance weight.
const CONCEPT_MAPS = {
  // Software fundamentals
  'data structures':      { stack: 2, queue: 2, 'linked list': 2, tree: 2, graph: 2, array: 1, hash: 2, map: 1, set: 1, heap: 2, 'binary tree': 2, trie: 2 },
  'algorithms':           { 'time complexity': 3, 'big o': 3, 'space complexity': 2, sorting: 2, searching: 2, recursion: 2, 'dynamic programming': 3, greedy: 2, 'divide and conquer': 2, bfs: 2, dfs: 2 },
  'oop fundamentals':     { class: 2, object: 2, inheritance: 2, polymorphism: 2, encapsulation: 2, abstraction: 2, interface: 2, 'design pattern': 2 },
  'databases':            { sql: 2, nosql: 2, index: 2, query: 1, schema: 2, normalization: 2, join: 2, transaction: 2, acid: 3, partition: 2, replication: 2 },
  'api design':           { rest: 2, endpoint: 1, resource: 2, http: 1, 'status code': 2, pagination: 2, versioning: 2, authentication: 2, authorization: 2, graphql: 2 },
  'security':             { encryption: 2, hashing: 2, tls: 2, ssl: 2, jwt: 2, oauth: 2, 'access control': 2, rbac: 2, xss: 2, csrf: 2, 'sql injection': 2, cors: 2, certificate: 2 },
  'distributed systems':  { cap: 3, consistency: 2, availability: 2, partition: 2, replication: 2, sharding: 2, consensus: 2, 'load balancer': 2, 'message queue': 2, eventual: 2, raft: 2, paxos: 2 },
  'system design':        { 'load balancing': 2, caching: 2, database: 1, 'message queue': 2, microservice: 2, monolith: 1, cdn: 2, 'rate limit': 2, scaling: 2, horizontal: 2, vertical: 1, proxy: 2 },
  'devops':               { ci: 2, cd: 2, pipeline: 2, docker: 2, kubernetes: 2, container: 2, terraform: 2, monitoring: 2, logging: 2, alerting: 2, deployment: 1, infrastructure: 2 },
  'testing':              { 'unit test': 2, 'integration test': 2, 'e2e': 2, mock: 2, stub: 1, tdd: 2, coverage: 2, regression: 2, automation: 2 },
  'performance':          { latency: 2, throughput: 2, caching: 2, profiling: 2, 'memory leak': 2, bottleneck: 2, optimization: 2, 'connection pool': 2, indexing: 2, 'lazy loading': 2 },
  'frontend':             { dom: 2, 'virtual dom': 2, component: 2, state: 2, render: 1, css: 1, responsive: 2, accessibility: 2, 'web vitals': 2, ssr: 2, csr: 2, ssg: 2, hydration: 2 },
  'mobile':               { native: 2, 'cross-platform': 2, offline: 2, state: 1, gesture: 1, notification: 2, 'deep link': 2, 'app store': 1 },
  'data engineering':     { etl: 2, pipeline: 2, batch: 2, stream: 2, warehouse: 2, lake: 2, spark: 2, kafka: 2, airflow: 2, partition: 2 },
  'ml':                   { model: 2, training: 2, inference: 2, 'feature engineering': 2, 'bias-variance': 2, overfitting: 2, 'cross-validation': 2, precision: 2, recall: 2, 'f1 score': 2 },

  // Behavioral & soft skills
  'communication':        { communicate: 2, explain: 1, discuss: 1, clarify: 2, document: 2, present: 2, stakeholder: 2, feedback: 2, listen: 2 },
  'leadership':           { lead: 2, mentor: 2, delegate: 2, motivate: 2, vision: 2, empower: 2, accountability: 2, decision: 2, team: 1, 'cross-functional': 2 },
  'problem solving':      { analyze: 2, debug: 2, investigate: 2, 'root cause': 3, hypothesis: 2, diagnose: 2, troubleshoot: 2, systematic: 2, metric: 2, 'trade-off': 2 },
  'collaboration':        { team: 1, collaborate: 2, pair: 2, review: 1, consensus: 2, compromise: 2, align: 2, 'code review': 2 },
  'adaptability':         { learn: 1, adapt: 2, change: 1, flexible: 2, pivot: 2, 'new technology': 2, iterate: 2, agile: 2 },
  'ownership':            { responsible: 2, accountable: 2, initiative: 2, proactive: 2, ownership: 2, follow: 1, deliver: 2, impact: 2 },
  'conflict resolution':  { conflict: 2, resolve: 2, mediate: 2, disagree: 1, compromise: 2, empathy: 2, perspective: 2, 'common ground': 2 },
  'mentoring':            { mentor: 2, coach: 2, guide: 2, teach: 2, 'pair program': 2, onboard: 2, 'code review': 2, feedback: 1, growth: 2 },
  'time management':      { prioritize: 2, deadline: 2, estimate: 2, plan: 1, scope: 2, buffer: 2, urgent: 2, important: 2, backlog: 2, sprint: 2 },
  'growth mindset':       { learn: 2, improve: 2, mistake: 2, failure: 1, feedback: 2, iterate: 2, reflect: 2, experiment: 2, curiosity: 2 },
  'initiative':           { proactive: 2, identify: 1, suggest: 2, propose: 2, volunteer: 2, beyond: 2, initiative: 2, self: 1 },
  'decision making':      { decision: 2, 'trade-off': 2, risk: 2, data: 1, evidence: 2, framework: 2, criteria: 2, stakeholder: 2, outcome: 2 },
  'incident management':  { incident: 2, triage: 2, 'root cause': 3, escalate: 2, 'post-mortem': 3, runbook: 2, 'on-call': 2, restore: 2, communicate: 2 }
};

// ─── Practical-understanding indicators ─────────────────────
// Phrases / patterns that signal real-world, hands-on knowledge.
const PRACTICAL_INDICATORS = [
  // Tools & platforms
  /\b(aws|azure|gcp|docker|kubernetes|k8s|jenkins|github actions|terraform|ansible|datadog|grafana|splunk|new relic)\b/i,
  // Frameworks & libraries
  /\b(react|angular|vue|express|spring|django|flask|rails|next\.?js|nest\.?js|fastapi)\b/i,
  // Implementation specifics
  /\b(implemented|deployed|migrated|configured|built|shipped|released|refactored|optimized|debugged|profiled)\b/i,
  // Metrics & numbers
  /\d+\s*(%|ms|seconds|minutes|users|requests|rps|tps|qps|nodes|instances|GB|MB|TB)/i,
  // Real-world patterns
  /\b(production|staging|canary|blue.?green|rolling deploy|feature flag|a\/b test|oncall|runbook|post.?mortem|sla|slo|sli)\b/i,
  // Methodology
  /\b(agile|scrum|kanban|lean|sprint|retrospective|stand.?up|backlog grooming|jira|confluence)\b/i,
  // Trade-offs & decisions
  /\b(trade.?off|chose .+ over|decided to|we opted|considered .+ but|pros and cons|benefits .+ drawbacks)\b/i,
  // Scenario language
  /\b(in my (previous |last |current )?(role|project|team|company))\b/i,
  /\b(at (my |our )(company|startup|org|team))\b/i,
  // Code / architecture specifics
  /\b(api gateway|load balancer|message broker|event bus|circuit breaker|retry policy|connection pool|thread pool)\b/i
];

// ─── Difficulty thresholds ──────────────────────────────────
const DIFFICULTY_THRESHOLD = {
  easy:   { minWords: 20, goodWords: 50,  minTopics: 1, goodTopics: 2 },
  medium: { minWords: 40, goodWords: 100, minTopics: 2, goodTopics: 4 },
  hard:   { minWords: 60, goodWords: 150, minTopics: 3, goodTopics: 5 }
};

// ─── Dimension weights per category ─────────────────────────
// How much each dimension contributes to the composite score,
// tuned by question category.
const DIMENSION_WEIGHTS = {
  core_knowledge:  { relevance: 0.35, clarity: 0.15, depth: 0.30, practicalUnderstanding: 0.20 },
  scenario_based:  { relevance: 0.25, clarity: 0.20, depth: 0.20, practicalUnderstanding: 0.35 },
  problem_solving: { relevance: 0.30, clarity: 0.15, depth: 0.30, practicalUnderstanding: 0.25 },
  behavioral:      { relevance: 0.25, clarity: 0.25, depth: 0.15, practicalUnderstanding: 0.35 }
};

// ─── Helpers ─────────────────────────────────────────────────

function tokenize(text) {
  return (text || '').toLowerCase().replace(/[^a-z0-9\s\-]/g, ' ').split(/\s+/).filter(Boolean);
}

function wordCount(text) {
  return tokenize(text).length;
}

function containsPhrase(tokens, joinedText, phrase) {
  const phraseWords = phrase.toLowerCase().split(/\s+/);
  if (phraseWords.length === 1) return tokens.includes(phraseWords[0]);
  return joinedText.includes(phrase.toLowerCase());
}

function clamp(val, min = 0, max = 10) {
  return Math.round(Math.min(max, Math.max(min, val)) * 10) / 10;
}

// ─────────────────────────────────────────────────────────────
// 1. RELEVANCE SCORER
//    Does the answer address the question asked?
//    — Criteria keyword overlap
//    — Concept-map keyword overlap
//    — Question-word echo (key nouns from the question)
// ─────────────────────────────────────────────────────────────
function scoreRelevance({ tokens, joinedText, evaluationCriteria, keyCompetency, questionText }) {
  const feedback = [];
  const suggestions = [];
  const topicsCovered = [];

  // 1a. Evaluation-criteria coverage
  let criteriaHits = 0;
  const criteriaTotal = Math.max(evaluationCriteria.length, 1);
  const missedCriteria = [];

  for (const criterion of evaluationCriteria) {
    const cl = criterion.toLowerCase();
    if (joinedText.includes(cl)) {
      criteriaHits++;
      topicsCovered.push(criterion);
      continue;
    }
    const cWords = cl.split(/\s+/).filter(w => w.length > 3);
    const matched = cWords.filter(w => joinedText.includes(w));
    if (matched.length >= Math.ceil(cWords.length * 0.5)) {
      criteriaHits += 0.7;
      topicsCovered.push(criterion);
    } else {
      missedCriteria.push(criterion);
    }
  }

  const criteriaCoverage = criteriaTotal > 0 ? Math.min(1, criteriaHits / criteriaTotal) : 0;

  // 1b. Concept-map coverage
  const compKey = (keyCompetency || '').toLowerCase();
  const conceptMap = CONCEPT_MAPS[compKey] || {};
  let conceptHits = 0;
  let conceptTotal = 0;

  for (const [term, weight] of Object.entries(conceptMap)) {
    conceptTotal += weight;
    if (containsPhrase(tokens, joinedText, term)) {
      conceptHits += weight;
    }
  }

  const conceptCoverage = conceptTotal > 0 ? Math.min(1, conceptHits / conceptTotal) : 0;

  // 1c. Question-echo: does the answer reference key nouns from the question?
  const stopWords = new Set(['what', 'how', 'why', 'when', 'where', 'which', 'describe', 'explain', 'discuss',
    'would', 'could', 'should', 'your', 'have', 'been', 'with', 'from', 'that', 'this', 'they', 'them',
    'about', 'between', 'into', 'does', 'will', 'the', 'and', 'for', 'are', 'you', 'can']);
  const qTokens = tokenize(questionText).filter(t => t.length > 3 && !stopWords.has(t));
  const echoHits = qTokens.filter(t => tokens.includes(t)).length;
  const echoScore = qTokens.length > 0 ? Math.min(1, echoHits / Math.min(qTokens.length, 5)) : 0.5;

  // Combine
  let raw;
  if (conceptTotal > 0) {
    raw = criteriaCoverage * 0.45 + conceptCoverage * 0.30 + echoScore * 0.25;
  } else {
    raw = criteriaCoverage * 0.60 + echoScore * 0.40;
  }

  const score = clamp(raw * 10);

  // Feedback
  if (score >= 8) feedback.push('Highly relevant — directly addresses the question and key criteria.');
  else if (score >= 6) feedback.push('Mostly relevant, but some criteria could be addressed more directly.');
  else if (score >= 4) feedback.push('Partially relevant — several expected topics are missing.');
  else feedback.push('The answer does not adequately address the question asked.');

  if (missedCriteria.length > 0 && missedCriteria.length <= 3) {
    suggestions.push(`Address these missed topics: ${missedCriteria.join(', ')}.`);
  } else if (missedCriteria.length > 3) {
    suggestions.push(`Cover more key topics, especially: ${missedCriteria.slice(0, 3).join(', ')}.`);
  }
  if (echoScore < 0.5) {
    suggestions.push('Ensure your answer directly references the core concepts from the question.');
  }

  return { score, feedback, suggestions, topicsCovered };
}

// ─────────────────────────────────────────────────────────────
// 2. CLARITY SCORER
//    Is the answer clear, well-structured, and readable?
//    — Sentence-length analysis
//    — Transition / connector usage
//    — Logical sectioning (paragraphs, bullet markers)
//    — Avoidance of filler / vagueness
// ─────────────────────────────────────────────────────────────
function scoreClarity({ text, words }) {
  const feedback = [];
  const suggestions = [];

  if (words === 0) return { score: 0, feedback: ['No answer provided.'], suggestions: ['Write a substantive response.'] };

  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = sentences.length;
  const avgLen = words / Math.max(sentenceCount, 1);

  // 2a. Sentence-length quality (ideal 10-25 words)
  let lenScore = 1.0;
  if (avgLen < 5) lenScore = 0.3;
  else if (avgLen < 10) lenScore = 0.65;
  else if (avgLen > 40) lenScore = 0.4;
  else if (avgLen > 30) lenScore = 0.65;

  // 2b. Transition / connector words
  const transitions = /\b(however|therefore|furthermore|moreover|additionally|consequently|in addition|as a result|on the other hand|for example|for instance|in contrast|similarly|meanwhile|nevertheless|in particular)\b/gi;
  const transitionCount = (text.match(transitions) || []).length;
  const transitionScore = Math.min(1, transitionCount / 3);

  // 2c. Logical section markers (numbered lists, bullet-like chars, paragraph breaks)
  const sectionMarkers = (text.match(/\n\n|^\s*[-•*]\s|^\s*\d+[.)]\s/gm) || []).length;
  const sectionScore = Math.min(1, sectionMarkers / 2);

  // 2d. Filler / vagueness penalty
  const fillerPatterns = /\b(basically|actually|sort of|kind of|stuff|things|like um|you know|i think maybe|i guess)\b/gi;
  const fillerCount = (text.match(fillerPatterns) || []).length;
  const fillerPenalty = Math.min(0.3, fillerCount * 0.1);

  // 2e. Multiple sentences bonus
  const multiSentenceBonus = sentenceCount >= 3 ? 0.1 : 0;

  const raw = (lenScore * 0.40 + transitionScore * 0.25 + sectionScore * 0.15 + 0.20) - fillerPenalty + multiSentenceBonus;
  const score = clamp(Math.min(1, raw) * 10);

  if (score >= 8) feedback.push('Exceptionally clear — well-structured sentences with good logical flow.');
  else if (score >= 6) feedback.push('Reasonably clear, but flow could improve with better transitions.');
  else if (score >= 4) feedback.push('Some clarity issues — sentences may be too long/short or lack logical connectors.');
  else feedback.push('Answer is difficult to follow — needs better structure and clearer phrasing.');

  if (avgLen > 30) suggestions.push('Break long sentences into shorter, focused statements.');
  if (avgLen < 8 && sentenceCount > 1) suggestions.push('Combine very short fragments into complete, descriptive sentences.');
  if (transitionCount === 0) suggestions.push('Use transition words (e.g., "however", "therefore", "for example") to improve flow.');
  if (fillerCount >= 2) suggestions.push('Reduce filler words ("basically", "sort of", "kind of") for a more polished response.');
  if (sectionMarkers === 0 && words > 80) suggestions.push('Consider using numbered lists or paragraphs to organize longer responses.');

  return { score, feedback, suggestions };
}

// ─────────────────────────────────────────────────────────────
// 3. DEPTH SCORER
//    How thorough and detailed is the answer?
//    — Word count vs. difficulty threshold
//    — Presence of examples, comparisons, reasoning, steps
//    — Multiple angles / perspectives
//    — STAR method for behavioral
// ─────────────────────────────────────────────────────────────
function scoreDepth({ text, words, category, difficulty }) {
  const feedback = [];
  const suggestions = [];
  const thresholds = DIFFICULTY_THRESHOLD[difficulty] || DIFFICULTY_THRESHOLD.medium;

  if (words === 0) return { score: 0, feedback: ['No answer provided.'], suggestions: ['Provide a thorough response.'] };

  // 3a. Word-count factor
  let lengthFactor = 0;
  if (words >= thresholds.goodWords) lengthFactor = 1.0;
  else if (words >= thresholds.minWords) lengthFactor = 0.4 + 0.6 * ((words - thresholds.minWords) / (thresholds.goodWords - thresholds.minWords));
  else lengthFactor = 0.2 * (words / thresholds.minWords);

  // 3b. Structural depth indicators
  const indicators = {
    examples:     /for example|for instance|such as|e\.g\.|like when|in one case/i.test(text),
    steps:        /first|second|third|step \d|then|next|finally|1\.|2\.|3\./i.test(text),
    comparisons:  /however|on the other hand|in contrast|versus|vs\.|compared to|difference between|whereas|alternatively/i.test(text),
    reasoning:    /because|reason|since|therefore|as a result|due to|consequently|this means|this led to/i.test(text),
    conclusion:   /in summary|overall|in conclusion|to summarize|key takeaway|the result was|the outcome/i.test(text),
    specifics:    /\d+%|\d+ (year|month|day|hour|user|request|team|member|sprint|release|server)/i.test(text),
    multiAngle:   /on one hand|another perspective|alternatively|some argue|it depends|context matters/i.test(text)
  };

  const trueCount = Object.values(indicators).filter(Boolean).length;
  const indicatorScore = Math.min(1, trueCount / 4);

  // 3c. STAR method for behavioral
  let starBonus = 0;
  if (category === 'behavioral') {
    const starParts = ['situation', 'task', 'action', 'result'];
    const lower = text.toLowerCase();
    const starHits = starParts.filter(p => lower.includes(p)).length;
    starBonus = starHits >= 3 ? 0.15 : starHits >= 2 ? 0.08 : 0;
  }

  const raw = lengthFactor * 0.45 + indicatorScore * 0.45 + starBonus + 0.10;
  const score = clamp(Math.min(1, raw) * 10);

  if (score >= 8) feedback.push('Excellent depth — comprehensive coverage with strong supporting detail.');
  else if (score >= 6) feedback.push('Good depth, though additional examples or perspectives would strengthen the answer.');
  else if (score >= 4) feedback.push('Moderate depth — expand with more details, examples, and reasoning.');
  else feedback.push('Answer lacks depth — provide more thorough analysis and specific details.');

  if (!indicators.examples) suggestions.push('Include concrete examples to illustrate your points.');
  if (!indicators.reasoning) suggestions.push('Explain the "why" behind your statements with clear reasoning.');
  if (!indicators.comparisons && difficulty !== 'easy') suggestions.push('Compare alternatives or trade-offs to show breadth of understanding.');
  if (words < thresholds.minWords) suggestions.push(`Aim for at least ${thresholds.goodWords} words for a ${difficulty}-level question.`);
  if (category === 'behavioral' && starBonus === 0) suggestions.push('Structure behavioral answers using the STAR method (Situation, Task, Action, Result).');
  if (!indicators.specifics && difficulty === 'hard') suggestions.push('Include specific numbers, metrics, or timeframes to strengthen credibility.');

  return { score, feedback, suggestions };
}

// ─────────────────────────────────────────────────────────────
// 4. PRACTICAL UNDERSTANDING SCORER
//    Does the candidate demonstrate real-world, hands-on knowledge?
//    — Tool / technology mentions
//    — Implementation verbs (built, deployed, shipped …)
//    — Metrics and quantifiable outcomes
//    — Trade-off discussion
//    — Real scenario language ("in my previous role …")
// ─────────────────────────────────────────────────────────────
function scorePractical({ text, words, category }) {
  const feedback = [];
  const suggestions = [];

  if (words === 0) return { score: 0, feedback: ['No answer provided.'], suggestions: ['Demonstrate applied knowledge.'] };

  // Count how many practical-indicator patterns match
  let practicalHits = 0;
  for (const pattern of PRACTICAL_INDICATORS) {
    const matches = text.match(pattern);
    if (matches) practicalHits += Math.min(matches.length, 3); // cap per pattern to avoid one pattern dominating
  }

  // Additional checks
  const hasMetrics = /\d+\s*(%|ms|seconds|minutes|users|requests|rps|tps|qps|GB|MB|TB)/i.test(text);
  const hasToolMention = /\b(aws|azure|gcp|docker|kubernetes|jenkins|terraform|react|angular|vue|express|spring|django|postgres|mysql|redis|mongodb|elasticsearch|kafka|rabbitmq|nginx)\b/i.test(text);
  const hasTradeOff = /\b(trade.?off|chose .+ over|pros and cons|benefits .+ drawbacks|decided to .+ because|weighed)\b/i.test(text);
  const hasRealScenario = /\b(in my (previous |last |current )?(role|project|team|company)|at (my |our )(company|startup|org)|when I (was|worked))\b/i.test(text);
  const hasImplementation = /\b(implemented|deployed|migrated|built|shipped|released|refactored|optimized|debugged|profiled|automated|integrated|architected)\b/i.test(text);

  // Score components
  const hitScore = Math.min(1, practicalHits / 6); // 6+ indicator hits → full score
  const bonuses = [hasMetrics, hasToolMention, hasTradeOff, hasRealScenario, hasImplementation]
    .filter(Boolean).length;
  const bonusScore = Math.min(1, bonuses / 3);

  // Behavioral questions get a bump for scenario language
  let categoryBonus = 0;
  if (category === 'behavioral' && hasRealScenario) categoryBonus = 0.1;
  if (category === 'scenario_based' && hasTradeOff) categoryBonus = 0.1;

  const raw = hitScore * 0.50 + bonusScore * 0.40 + categoryBonus + 0.10;
  const score = clamp(Math.min(1, raw) * 10);

  if (score >= 8) feedback.push('Strong practical understanding — real-world experience and applied knowledge are evident.');
  else if (score >= 6) feedback.push('Good practical awareness, but more implementation details or metrics would help.');
  else if (score >= 4) feedback.push('Some practical knowledge shown, but answer leans theoretical.');
  else feedback.push('Answer is mostly theoretical — demonstrate how concepts apply in practice.');

  if (!hasRealScenario) suggestions.push('Reference real projects or roles where you applied these concepts.');
  if (!hasToolMention) suggestions.push('Mention specific tools/technologies you used (e.g., Docker, AWS, React).');
  if (!hasMetrics) suggestions.push('Include measurable outcomes (e.g., "reduced latency by 40%", "served 10K rps").');
  if (!hasTradeOff) suggestions.push('Discuss trade-offs you considered when making technical decisions.');
  if (!hasImplementation) suggestions.push('Use action verbs like "built", "deployed", "optimized" to describe hands-on work.');

  return { score, feedback, suggestions };
}

// ─────────────────────────────────────────────────────────────
// MAIN: evaluateAnswer
// ─────────────────────────────────────────────────────────────

/**
 * Evaluate a candidate's answer across 4 universal dimensions.
 *
 * @param {Object} opts
 * @param {string} opts.answer
 * @param {string} opts.questionText
 * @param {string} opts.category           – core_knowledge | scenario_based | problem_solving | behavioral
 * @param {string} opts.difficulty         – easy | medium | hard
 * @param {string} opts.keyCompetency
 * @param {string[]} opts.evaluationCriteria
 * @param {string[]} opts.expectedTopics
 * @param {string} opts.jobRole
 * @param {string} opts.experienceLevel
 *
 * @returns {{
 *   score: number,
 *   dimensionScores: { relevance: number, clarity: number, depth: number, practicalUnderstanding: number },
 *   feedback: string,
 *   dimensionFeedback: { relevance: { score, feedback, suggestions }, clarity: …, depth: …, practicalUnderstanding: … },
 *   strengths: string[],
 *   improvements: string[],
 *   keyTopicsCovered: string[]
 * }}
 */
function evaluateAnswer({
  answer,
  questionText,
  category,
  difficulty = 'medium',
  keyCompetency = '',
  evaluationCriteria = [],
  expectedTopics = [],
  jobRole = '',
  experienceLevel = 'mid'
}) {
  const text = (answer || '').trim();
  const tokens = tokenize(text);
  const joinedText = text.toLowerCase();
  const words = wordCount(text);

  const weights = DIMENSION_WEIGHTS[category] || DIMENSION_WEIGHTS.core_knowledge;

  // ── Score each dimension ──────────────────────────────────
  const relevanceResult = scoreRelevance({ tokens, joinedText, evaluationCriteria, keyCompetency, questionText });
  const clarityResult   = scoreClarity({ text, words });
  const depthResult     = scoreDepth({ text, words, category, difficulty });
  const practicalResult = scorePractical({ text, words, category });

  const dimensionScores = {
    relevance:              relevanceResult.score,
    clarity:                clarityResult.score,
    depth:                  depthResult.score,
    practicalUnderstanding: practicalResult.score
  };

  // ── Composite score (0-10) ────────────────────────────────
  const rawComposite =
    dimensionScores.relevance              * weights.relevance +
    dimensionScores.clarity                * weights.clarity +
    dimensionScores.depth                  * weights.depth +
    dimensionScores.practicalUnderstanding * weights.practicalUnderstanding;

  // Difficulty modifier
  const diffMod = difficulty === 'hard' ? 0.5 : difficulty === 'easy' ? -0.3 : 0;
  let score = clamp(rawComposite + diffMod);

  // Floor for non-trivial answers
  if (words >= (DIFFICULTY_THRESHOLD[difficulty] || DIFFICULTY_THRESHOLD.medium).minWords && score < 2) score = 2;
  if (words < 10) score = Math.min(score, 2);

  // ── Aggregate strengths & improvements ────────────────────
  const strengths = [];
  const improvements = [];

  // Collect top-line per-dimension strengths (score ≥ 7) and improvements (score < 5)
  if (dimensionScores.relevance >= 7) strengths.push('Highly relevant response that addresses the question directly.');
  if (dimensionScores.clarity >= 7) strengths.push('Clear and well-articulated answer with good logical flow.');
  if (dimensionScores.depth >= 7) strengths.push('Thorough and detailed analysis with strong supporting evidence.');
  if (dimensionScores.practicalUnderstanding >= 7) strengths.push('Demonstrates strong real-world experience and practical knowledge.');

  if (dimensionScores.relevance < 5) improvements.push('Focus more directly on the question being asked and its key criteria.');
  if (dimensionScores.clarity < 5) improvements.push('Improve answer clarity with better sentence structure and transitions.');
  if (dimensionScores.depth < 5) improvements.push('Provide more depth — include examples, reasoning, and detailed explanations.');
  if (dimensionScores.practicalUnderstanding < 5) improvements.push('Show more practical experience — reference real tools, projects, and metrics.');

  // Add specific suggestions from the weakest dimension
  const dimResults = [
    { name: 'relevance', result: relevanceResult },
    { name: 'clarity', result: clarityResult },
    { name: 'depth', result: depthResult },
    { name: 'practicalUnderstanding', result: practicalResult }
  ].sort((a, b) => a.result.score - b.result.score);

  for (const { result } of dimResults.slice(0, 2)) {
    for (const s of result.suggestions.slice(0, 2)) {
      if (!improvements.includes(s)) improvements.push(s);
    }
  }

  // ── Per-dimension feedback object ─────────────────────────
  const dimensionFeedback = {
    relevance: {
      score: relevanceResult.score,
      feedback: relevanceResult.feedback.join(' '),
      suggestions: relevanceResult.suggestions
    },
    clarity: {
      score: clarityResult.score,
      feedback: clarityResult.feedback.join(' '),
      suggestions: clarityResult.suggestions
    },
    depth: {
      score: depthResult.score,
      feedback: depthResult.feedback.join(' '),
      suggestions: depthResult.suggestions
    },
    practicalUnderstanding: {
      score: practicalResult.score,
      feedback: practicalResult.feedback.join(' '),
      suggestions: practicalResult.suggestions
    }
  };

  // ── Summary feedback ──────────────────────────────────────
  const feedbackParts = [];
  if (score >= 8) feedbackParts.push('Excellent answer!');
  else if (score >= 6) feedbackParts.push('Good answer with room for improvement.');
  else if (score >= 4) feedbackParts.push('Adequate response, but several areas need more depth.');
  else feedbackParts.push('This answer needs significant improvement.');

  // Highlight strongest and weakest dimension
  const strongest = dimResults[dimResults.length - 1];
  const weakest = dimResults[0];
  feedbackParts.push(`Strongest area: ${strongest.name} (${strongest.result.score}/10).`);
  if (weakest.result.score < 7) {
    feedbackParts.push(`Focus on improving: ${weakest.name} (${weakest.result.score}/10).`);
  }

  const feedback = feedbackParts.join(' ');

  return {
    score,
    dimensionScores,
    feedback,
    dimensionFeedback,
    strengths: [...new Set(strengths)],
    improvements: [...new Set(improvements)],
    keyTopicsCovered: [...new Set(relevanceResult.topicsCovered)]
  };
}

const evaluateBasicAnswer = (answer) => {
  let score = 0;
  let feedback = '';
  let suggestion = '';

  const safeAnswer = (answer || '').trim();

  if (safeAnswer.length > 50) score += 3;
  if (safeAnswer.length > 150) score += 3;

  if (safeAnswer.toLowerCase().includes('example')) {
    score += 2;
  }

  if (safeAnswer.split(/\s+/).filter(Boolean).length > 20) {
    score += 2;
  }

  if (score >= 8) {
    feedback = 'Great answer! Clear and detailed.';
    suggestion = 'Keep this structure and add one measurable outcome for an even stronger response.';
  } else if (score >= 5) {
    feedback = 'Good, but can be improved with more detail.';
    suggestion = 'Add one specific example and explain the result you achieved.';
  } else {
    feedback = 'Answer is too short. Add examples and explanation.';
    suggestion = 'Expand your answer with context, actions, and outcomes.';
  }

  return { score, feedback, suggestion };
};

module.exports = { evaluateAnswer, evaluateBasicAnswer };
