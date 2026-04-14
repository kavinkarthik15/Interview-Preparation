import { useState } from 'react';
import {
  Trophy, TrendingUp, TrendingDown, AlertTriangle, Target,
  Clock, ChevronDown, ChevronUp, RotateCcw, BookOpen,
  CheckCircle2, Sparkles, Award, BarChart3
} from 'lucide-react';
import { Button, Card, Badge, ProgressBar } from '../../components/ui';

// ─── Score helpers ──────────────────────────────────────────
const gradeColors = {
  'A+': 'text-status-success', A: 'text-status-success', 'A-': 'text-status-success',
  'B+': 'text-brand-primary-light', B: 'text-brand-primary-light', 'B-': 'text-brand-primary-light',
  'C+': 'text-status-warning', C: 'text-status-warning', 'C-': 'text-status-warning',
  'D+': 'text-status-error', D: 'text-status-error', F: 'text-status-error',
};

const dimLabels = {
  relevance: 'Relevance',
  clarity: 'Clarity',
  depth: 'Depth',
  practicalUnderstanding: 'Practical Understanding',
};

const categoryLabels = {
  core_knowledge: 'Core Knowledge',
  scenario_based: 'Scenario-Based',
  problem_solving: 'Problem Solving',
  behavioral: 'Behavioral',
};

export default function ResultScreen({ report, onRestart }) {
  const [expandedAnswer, setExpandedAnswer] = useState(null);

  if (!report) return null;

  const gradeColor = gradeColors[report.grade] || 'text-text-primary';

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">

      {/* ─── Hero Card ──────────────────────────────────── */}
      <Card hover={false} className="relative overflow-hidden text-center">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-64 h-64 bg-brand-accent/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative py-4">
          <div className="inline-flex items-center gap-2 mb-3">
            <Trophy className={`${gradeColor}`} size={28} />
            <h2 className="text-2xl font-bold text-text-primary">Interview Complete</h2>
          </div>

          {/* Grade + Score */}
          <div className="flex items-center justify-center gap-8 my-6">
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Grade</p>
              <span className={`text-6xl font-black ${gradeColor}`}>{report.grade}</span>
              <p className="text-sm text-text-secondary mt-1">{report.gradeLabel}</p>
            </div>
            <div className="w-px h-20 bg-dark-border" />
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Score</p>
              <span className={`text-6xl font-black ${gradeColor}`}>{report.overallScore}</span>
              <p className="text-sm text-text-secondary mt-1">out of 100</p>
            </div>
          </div>

          {/* Readiness */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 border border-brand-primary/20">
            <Sparkles size={16} className="text-brand-primary-light" />
            <span className="text-sm font-medium text-brand-primary-light">{report.readinessLevel}</span>
          </div>
          <p className="text-sm text-text-secondary mt-3 max-w-lg mx-auto">{report.readinessAdvice}</p>

          {/* Meta */}
          <div className="flex items-center justify-center gap-6 mt-5 text-xs text-text-muted">
            <span>{report.jobRole}</span>
            <span className="w-1 h-1 rounded-full bg-dark-border" />
            <span>{report.experienceLevel}</span>
            <span className="w-1 h-1 rounded-full bg-dark-border" />
            <span>{report.answeredQuestions}/{report.totalQuestions} answered</span>
            {report.skippedQuestions > 0 && (
              <>
                <span className="w-1 h-1 rounded-full bg-dark-border" />
                <span className="text-status-warning">{report.skippedQuestions} skipped</span>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* ─── Dimension Analysis ─────────────────────────── */}
      <Card hover={false}>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={18} className="text-brand-accent-light" />
          <h3 className="font-semibold text-text-primary">Dimension Analysis</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(report.dimensionAnalysis || []).map((dim) => {
            const scoreVal = dim.score ?? 0;
            const color = scoreVal >= 7 ? 'text-status-success' : scoreVal >= 5 ? 'text-status-warning' : 'text-status-error';
            return (
              <div key={dim.dimension} className="bg-dark-bg/50 rounded-xl p-4 border border-dark-border">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-text-primary">{dimLabels[dim.dimension] || dim.dimension}</p>
                  <span className={`text-lg font-bold ${color}`}>{dim.score ?? '-'}<span className="text-xs text-text-muted">/10</span></span>
                </div>
                <ProgressBar value={scoreVal} max={10} size="sm" />
                <p className="text-xs text-text-secondary mt-2">{dim.insight}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ─── Category Breakdown ─────────────────────────── */}
      <Card hover={false}>
        <div className="flex items-center gap-2 mb-4">
          <Target size={18} className="text-brand-primary-light" />
          <h3 className="font-semibold text-text-primary">Category Breakdown</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(report.categoryBreakdown || []).map((cat) => {
            const scoreVal = cat.score ?? 0;
            const color = scoreVal >= 7 ? 'text-status-success' : scoreVal >= 5 ? 'text-status-warning' : 'text-status-error';
            return (
              <div key={cat.category} className="bg-dark-bg/50 rounded-xl p-3 text-center border border-dark-border">
                <p className="text-xs text-text-muted mb-1">{categoryLabels[cat.category] || cat.category}</p>
                <p className={`text-2xl font-bold ${cat.score != null ? color : 'text-text-muted'}`}>{cat.score ?? '-'}</p>
                <p className="text-xs text-text-secondary">{cat.label}</p>
                <p className="text-[10px] text-text-muted mt-1">{cat.answeredCount}/{cat.questionCount} answered</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ─── Strengths & Weaknesses ─────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card hover={false}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-status-success" />
            <h3 className="font-semibold text-text-primary">Strengths</h3>
          </div>
          {report.strengths?.length > 0 ? (
            <div className="space-y-3">
              {report.strengths.slice(0, 6).map((s, i) => (
                <div key={i} className="flex gap-3">
                  <CheckCircle2 size={16} className="text-status-success mt-0.5 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-text-primary">{s.area}</p>
                      <span className="text-xs text-status-success font-semibold">{s.score}/10</span>
                    </div>
                    <p className="text-xs text-text-secondary">{s.detail}</p>
                    {s.evidence && <p className="text-[10px] text-text-muted mt-0.5">{s.evidence}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted">No significant strengths identified — keep practicing!</p>
          )}
        </Card>

        {/* Weaknesses */}
        <Card hover={false}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown size={18} className="text-status-error" />
            <h3 className="font-semibold text-text-primary">Weaknesses</h3>
          </div>
          {report.weaknesses?.length > 0 ? (
            <div className="space-y-3">
              {report.weaknesses.slice(0, 6).map((w, i) => (
                <div key={i} className="flex gap-3">
                  <AlertTriangle size={16} className="text-status-warning mt-0.5 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-text-primary">{w.area}</p>
                      <span className="text-xs text-status-error font-semibold">{w.score}/10</span>
                    </div>
                    <p className="text-xs text-text-secondary">{w.detail}</p>
                    {w.recommendation && (
                      <p className="text-xs text-brand-primary-light mt-1">💡 {w.recommendation}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted">No major weaknesses — excellent performance!</p>
          )}
        </Card>
      </div>

      {/* ─── Competency Gaps ────────────────────────────── */}
      {report.competencyGaps?.length > 0 && (
        <Card hover={false}>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-status-warning" />
            <h3 className="font-semibold text-text-primary">Competency Gaps</h3>
          </div>
          <div className="space-y-3">
            {report.competencyGaps.map((gap, i) => (
              <div key={i} className="p-3 rounded-lg bg-dark-bg/50 border border-dark-border">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm font-medium text-text-primary">{gap.category}</p>
                  <Badge variant={gap.gapSeverity === 'high' ? 'error' : gap.gapSeverity === 'medium' ? 'warning' : 'info'}>
                    {gap.gapSeverity} gap
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {gap.missingTopics.map((t, j) => (
                    <span key={j} className="text-xs px-2 py-0.5 rounded bg-status-error/10 text-status-error border border-status-error/20">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ─── Recommendations ────────────────────────────── */}
      {report.recommendations?.length > 0 && (
        <Card hover={false}>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={18} className="text-brand-accent-light" />
            <h3 className="font-semibold text-text-primary">Recommendations</h3>
          </div>
          <div className="space-y-2">
            {report.recommendations.map((rec, i) => (
              <div key={i} className="flex gap-3 p-2 rounded-lg hover:bg-dark-card-hover transition-colors">
                <span className="text-brand-accent-light font-bold text-sm mt-0.5">{i + 1}.</span>
                <p className="text-sm text-text-secondary">{rec}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ─── Time Analytics ─────────────────────────────── */}
      {report.timeAnalysis && report.timeAnalysis.totalSeconds > 0 && (
        <Card hover={false}>
          <div className="flex items-center gap-2 mb-4">
            <Clock size={18} className="text-text-secondary" />
            <h3 className="font-semibold text-text-primary">Time Analytics</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-text-primary">
                {Math.floor(report.timeAnalysis.totalSeconds / 60)}m {report.timeAnalysis.totalSeconds % 60}s
              </p>
              <p className="text-xs text-text-muted">Total Time</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-text-primary">
                {Math.floor(report.timeAnalysis.averagePerQuestion / 60)}m {report.timeAnalysis.averagePerQuestion % 60}s
              </p>
              <p className="text-xs text-text-muted">Avg per Question</p>
            </div>
            {report.timeAnalysis.fastestAnswer && (
              <div className="text-center col-span-2 sm:col-span-1">
                <p className="text-2xl font-bold text-status-success">
                  {Math.floor(report.timeAnalysis.fastestAnswer.seconds / 60)}m {report.timeAnalysis.fastestAnswer.seconds % 60}s
                </p>
                <p className="text-xs text-text-muted">Fastest Answer</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* ─── Answer Details (collapsible) ───────────────── */}
      {report.answerDetails?.length > 0 && (
        <Card hover={false}>
          <div className="flex items-center gap-2 mb-4">
            <Award size={18} className="text-brand-primary-light" />
            <h3 className="font-semibold text-text-primary">Answer Details</h3>
          </div>
          <div className="space-y-2">
            {report.answerDetails.map((a) => {
              const isExpanded = expandedAnswer === a.questionNumber;
              const scoreColor = a.score >= 8 ? 'text-status-success' : a.score >= 6 ? 'text-brand-primary-light' : a.score >= 4 ? 'text-status-warning' : 'text-status-error';

              return (
                <div key={a.questionNumber} className="border border-dark-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedAnswer(isExpanded ? null : a.questionNumber)}
                    className="w-full flex items-center justify-between p-3 hover:bg-dark-card-hover transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-mono text-text-muted shrink-0">Q{a.questionNumber}</span>
                      <p className="text-sm text-text-primary truncate">{a.questionText}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-sm font-bold ${scoreColor}`}>{a.score}/10</span>
                      {isExpanded ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-3 pb-3 space-y-3 animate-fade-in border-t border-dark-border pt-3">
                      {/* Dimension scores */}
                      {a.dimensionScores && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {Object.entries(a.dimensionScores).map(([dim, val]) => (
                            <div key={dim} className="text-center p-2 rounded bg-dark-bg/50">
                              <p className="text-[10px] text-text-muted">{dimLabels[dim] || dim}</p>
                              <p className={`text-sm font-bold ${val >= 7 ? 'text-status-success' : val >= 5 ? 'text-status-warning' : 'text-status-error'}`}>{val ?? '-'}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Answer text */}
                      <div>
                        <p className="text-xs text-text-muted mb-1">Your Answer:</p>
                        <p className="text-xs text-text-secondary bg-dark-bg/30 p-2 rounded leading-relaxed whitespace-pre-wrap">
                          {a.answer || 'No answer provided'}
                        </p>
                      </div>

                      {/* Feedback */}
                      {a.feedback && (
                        <p className="text-xs text-text-secondary">{a.feedback}</p>
                      )}

                      {/* Strengths & Improvements */}
                      <div className="flex flex-wrap gap-4">
                        {a.strengths?.length > 0 && (
                          <div>
                            <p className="text-[10px] font-semibold text-status-success mb-1">Strengths</p>
                            {a.strengths.slice(0, 2).map((s, i) => (
                              <p key={i} className="text-[11px] text-text-secondary">• {s}</p>
                            ))}
                          </div>
                        )}
                        {a.improvements?.length > 0 && (
                          <div>
                            <p className="text-[10px] font-semibold text-status-warning mb-1">Improvements</p>
                            {a.improvements.slice(0, 2).map((s, i) => (
                              <p key={i} className="text-[11px] text-text-secondary">• {s}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ─── Actions ────────────────────────────────────── */}
      <div className="flex justify-center gap-4 pb-8">
        <Button onClick={onRestart} variant="outline" className="flex items-center gap-2">
          <RotateCcw size={16} />
          Start New Interview
        </Button>
      </div>
    </div>
  );
}
