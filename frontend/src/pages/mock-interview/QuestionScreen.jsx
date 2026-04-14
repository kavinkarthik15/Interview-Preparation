import { useState, useEffect, useRef } from 'react';
import { Send, Clock, Tag, Target, Lightbulb, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { Button, Card, Badge } from '../../components/ui';
import InterviewProgress from './InterviewProgress';

const CATEGORY_COLORS = {
  core_knowledge: 'info',
  scenario_based: 'accent',
  problem_solving: 'warning',
  behavioral: 'success',
};

export default function QuestionScreen({
  session,
  currentQuestion,
  onSubmitAnswer,
  onNextQuestion,
  onComplete,
  submitting,
  lastEvaluation,
}) {
  const [answer, setAnswer] = useState('');
  const [showCriteria, setShowCriteria] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timeWarning, setTimeWarning] = useState(false);
  const [timeExpired, setTimeExpired] = useState(false);
  const timerRef = useRef(null);
  const textareaRef = useRef(null);
  const [showFeedback, setShowFeedback] = useState(!!lastEvaluation);

  const timeLimit = currentQuestion?.timeLimit || 0; // 0 = no limit (elapsed mode)

  // Start timer
  useEffect(() => {
    setTimer(0);
    setTimeWarning(false);
    setTimeExpired(false);
    timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [currentQuestion?.id]);

  // Countdown warning & expiry
  useEffect(() => {
    if (timeLimit <= 0 || lastEvaluation) return;
    const remaining = timeLimit - timer;
    if (remaining <= 30 && remaining > 0 && !timeWarning) {
      setTimeWarning(true);
    }
    if (remaining <= 0 && !timeExpired) {
      setTimeExpired(true);
      clearInterval(timerRef.current);
    }
  }, [timer, timeLimit, lastEvaluation, timeWarning, timeExpired]);

  // Auto-focus textarea on new question
  useEffect(() => {
    if (!lastEvaluation) {
      setAnswer('');
      setShowFeedback(false);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [currentQuestion?.id, lastEvaluation]);

  // When evaluation arrives, show feedback
  useEffect(() => {
    if (lastEvaluation) setShowFeedback(true);
  }, [lastEvaluation]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Display time: countdown if timeLimit set, else elapsed
  const displayTime = timeLimit > 0 ? Math.max(0, timeLimit - timer) : timer;
  const timerColorClass = timeLimit > 0
    ? (timeExpired ? 'text-status-error' : timeWarning ? 'text-status-warning animate-pulse' : 'text-text-secondary')
    : 'text-text-secondary';

  const handleSubmit = async () => {
    if (!answer.trim() || submitting) return;
    clearInterval(timerRef.current);
    try {
      await onSubmitAnswer(answer.trim(), timer);
    } catch {
      // Restart timer on failure so user can retry
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  };

  const isLastQuestion = session.isComplete || session.currentQuestionIndex >= session.totalQuestions;
  const hasAnswered = !!lastEvaluation;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Progress */}
      <Card hover={false} padding="p-4">
        <InterviewProgress
          currentIndex={session.currentQuestionIndex}
          totalQuestions={session.totalQuestions}
          answeredCount={session.answeredCount || session.currentQuestionIndex}
          category={currentQuestion?.category}
        />
      </Card>

      {/* Question Card */}
      <Card hover={false} className="relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-progress" />

        <div className="pt-2">
          {/* Question header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={CATEGORY_COLORS[currentQuestion?.category] || 'info'}>
                {(currentQuestion?.category || '').replace(/_/g, ' ')}
              </Badge>
              <Badge variant={currentQuestion?.difficulty === 'hard' ? 'error' : currentQuestion?.difficulty === 'easy' ? 'success' : 'warning'}>
                {currentQuestion?.difficulty || 'medium'}
              </Badge>
              {currentQuestion?.keyCompetency && (
                <span className="text-xs text-text-muted flex items-center gap-1">
                  <Target size={12} /> {currentQuestion.keyCompetency}
                </span>
              )}
            </div>
            <div className={`flex items-center gap-1.5 shrink-0 ${timerColorClass}`}>
              {timeExpired ? <AlertTriangle size={14} /> : <Clock size={14} />}
              <span className="text-sm font-mono font-medium">
                {timeLimit > 0 && !timeExpired && '\u23F3 '}
                {formatTime(displayTime)}
              </span>
              {timeLimit > 0 && (
                <span className="text-[10px] text-text-muted ml-1">
                  / {formatTime(timeLimit)}
                </span>
              )}
            </div>
          </div>

          {/* Question text */}
          <h3 className="text-lg font-semibold text-text-primary leading-relaxed mb-4">
            {currentQuestion?.text}
          </h3>

          {/* Evaluation criteria (collapsible) */}
          {currentQuestion?.evaluationCriteria?.length > 0 && (
            <button
              onClick={() => setShowCriteria(!showCriteria)}
              className="flex items-center gap-1.5 text-xs text-brand-primary-light hover:text-brand-primary transition-colors mb-4"
            >
              <Lightbulb size={13} />
              <span>Evaluation Criteria</span>
              {showCriteria ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          )}

          {showCriteria && (
            <div className="mb-4 p-3 rounded-lg bg-brand-primary/5 border border-brand-primary/10">
              <div className="flex flex-wrap gap-1.5">
                {currentQuestion.evaluationCriteria.map((c, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded bg-brand-primary/10 text-brand-primary-light">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Time expired banner */}
          {timeExpired && !hasAnswered && (
            <div className="mb-4 p-3 rounded-lg bg-status-error/10 border border-status-error/20 flex items-center gap-2">
              <AlertTriangle size={16} className="text-status-error shrink-0" />
              <div>
                <p className="text-sm font-medium text-status-error">Time's up!</p>
                <p className="text-xs text-text-muted">Time is up — submit your answer when ready.</p>
              </div>
            </div>
          )}

          {/* Time warning banner */}
          {timeWarning && !timeExpired && !hasAnswered && (
            <div className="mb-4 p-2.5 rounded-lg bg-status-warning/10 border border-status-warning/20 flex items-center gap-2">
              <Clock size={14} className="text-status-warning shrink-0" />
              <p className="text-xs text-status-warning">Less than 30 seconds remaining — wrap up your answer!</p>
            </div>
          )}

          {/* Answer textarea */}
          {!hasAnswered && (
            <div className="space-y-3">
              <textarea
                ref={textareaRef}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your answer here... (Ctrl+Enter to submit)"
                rows={8}
                className="ds-textarea w-full resize-y min-h-[120px]"
              />

              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">
                  {answer.trim().split(/\s+/).filter(Boolean).length} words
                </span>
                <Button
                  onClick={handleSubmit}
                  disabled={!answer.trim() || submitting}
                  loading={submitting}
                  className="flex items-center gap-2"
                >
                  <Send size={16} />
                  Submit Answer
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Evaluation Feedback */}
      {showFeedback && lastEvaluation && (
        <EvaluationFeedback
          evaluation={lastEvaluation}
          isLastQuestion={isLastQuestion}
          onNext={() => {
            setShowFeedback(false);
            setAnswer('');
            if (onNextQuestion) onNextQuestion();
          }}
          onComplete={onComplete}
        />
      )}
    </div>
  );
}

// ─── Evaluation Feedback Sub-component ─────────────────────
function EvaluationFeedback({ evaluation, isLastQuestion, onNext, onComplete }) {
  const scoreColor = evaluation.score >= 8 ? 'text-status-success' : evaluation.score >= 6 ? 'text-brand-primary-light' : evaluation.score >= 4 ? 'text-status-warning' : 'text-status-error';

  const dimLabels = {
    relevance: 'Relevance',
    clarity: 'Clarity',
    depth: 'Depth',
    practicalUnderstanding: 'Practical Understanding',
  };

  return (
    <Card hover={false} aiGlow className="animate-fade-in">
      {/* Score header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm text-text-secondary mb-1">Your Score</p>
          <span className={`text-4xl font-bold ${scoreColor}`}>
            {evaluation.score}
            <span className="text-lg text-text-muted">/10</span>
          </span>
        </div>
        <p className="text-sm text-text-secondary max-w-xs text-right">{evaluation.feedback}</p>
      </div>

      {/* Dimension scores */}
      {evaluation.dimensionScores && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {Object.entries(evaluation.dimensionScores).map(([dim, val]) => {
            const dimColor = val >= 7 ? 'text-status-success' : val >= 5 ? 'text-status-warning' : 'text-status-error';
            return (
              <div key={dim} className="bg-dark-bg/50 rounded-lg p-3 text-center">
                <p className="text-xs text-text-muted mb-1">{dimLabels[dim] || dim}</p>
                <p className={`text-xl font-bold ${dimColor}`}>{val ?? '-'}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Dimension feedback */}
      {evaluation.dimensionFeedback && (
        <div className="space-y-2 mb-5">
          {Object.entries(evaluation.dimensionFeedback).map(([dim, data]) => {
            if (!data || !data.suggestions?.length) return null;
            return (
              <div key={dim} className="text-xs">
                <span className="text-text-secondary font-medium">{dimLabels[dim]}:</span>{' '}
                <span className="text-text-muted">{data.feedback}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        {evaluation.strengths?.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-status-success">✅ Strengths</p>
            {evaluation.strengths.slice(0, 3).map((s, i) => (
              <p key={i} className="text-xs text-text-secondary pl-4">• {s}</p>
            ))}
          </div>
        )}
        {evaluation.improvements?.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-status-warning">💡 Improvements</p>
            {evaluation.improvements.slice(0, 3).map((s, i) => (
              <p key={i} className="text-xs text-text-secondary pl-4">• {s}</p>
            ))}
          </div>
        )}
      </div>

      {/* Topics covered */}
      {evaluation.keyTopicsCovered?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-5">
          <Tag size={12} className="text-text-muted" />
          {evaluation.keyTopicsCovered.map((t, i) => (
            <span key={i} className="text-xs px-2 py-0.5 rounded bg-status-success/10 text-status-success border border-status-success/20">
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-end gap-3">
        {isLastQuestion ? (
          <Button onClick={onComplete} variant="accent" className="flex items-center gap-2">
            🎯 View Final Report
          </Button>
        ) : (
          <Button onClick={onNext} className="flex items-center gap-2">
            Next Question →
          </Button>
        )}
      </div>
    </Card>
  );
}
