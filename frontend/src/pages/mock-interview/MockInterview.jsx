import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Mic, Loader2 } from 'lucide-react';
import { mockInterviewAPI } from '../../services/api';
import RoleInputScreen from './RoleInputScreen';
import QuestionScreen from './QuestionScreen';
import ResultScreen from './ResultScreen';
import SkillGapPanel from './SkillGapPanel';

// ─── Interview Phase Constants ──────────────────────────────
const PHASE = {
  ROLE_INPUT: 'role_input',
  INTERVIEW: 'interview',
  COMPLETING: 'completing',
  RESULT: 'result',
};

export default function MockInterview() {
  const [phase, setPhase] = useState(PHASE.ROLE_INPUT);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Session state
  const [session, setSession] = useState(null);         // { sessionId, jobRole, experienceLevel, totalQuestions, currentQuestionIndex, ... }
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [lastEvaluation, setLastEvaluation] = useState(null);
  const [report, setReport] = useState(null);

  // ─── Start Interview ────────────────────────────────────
  const handleStart = useCallback(async ({ jobRole, experienceLevel, jobDescription, difficulty, targetCompany, timerEnabled }) => {
    setLoading(true);
    try {
      const { data } = await mockInterviewAPI.start({
        job_role: jobRole,
        experience_level: experienceLevel,
        job_description: jobDescription || '',
        difficulty: difficulty || 'mixed',
        target_company: targetCompany || '',
        timer_enabled: !!timerEnabled,
      });

      setSession(data.session);
      setCurrentQuestion(data.currentQuestion);
      setLastEvaluation(null);
      setPhase(PHASE.INTERVIEW);
      toast.success('Interview started — good luck!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to start interview';
      // If conflict (duplicate active session), offer to resume
      if (err.response?.status === 409) {
        toast.error(msg);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Submit Answer ──────────────────────────────────────
  const handleSubmitAnswer = useCallback(async (answer, timeTaken) => {
    if (!session || !currentQuestion) return;

    setSubmitting(true);
    try {
      const { data } = await mockInterviewAPI.submitAnswer({
        sessionId: session.sessionId,
        questionId: currentQuestion.id,
        answer,
        timeTaken,
      });

      // Update evaluation feedback
      setLastEvaluation(data.evaluation);

      // Update session progress
      setSession((prev) => ({
        ...prev,
        currentQuestionIndex: data.session.currentQuestionIndex,
        answeredCount: data.session.answeredCount,
        isComplete: data.session.isComplete,
      }));

      // Queue the next question (user will click "Next" to advance)
      if (data.nextQuestion) {
        // Store nextQuestion — QuestionScreen will move to it when user clicks "Next"
        setCurrentQuestion((prev) => ({
          ...prev,
          _next: data.nextQuestion,
        }));
      }

      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit answer';
      toast.error(msg);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [session, currentQuestion]);

  // ─── Advance to Next Question ───────────────────────────
  const handleNextQuestion = useCallback(() => {
    if (currentQuestion?._next) {
      setCurrentQuestion(currentQuestion._next);
      setLastEvaluation(null);
    }
  }, [currentQuestion]);

  // ─── Complete Interview ─────────────────────────────────
  const handleComplete = useCallback(async () => {
    if (!session) return;

    setPhase(PHASE.COMPLETING);
    try {
      const { data } = await mockInterviewAPI.complete(session.sessionId);
      setReport(data.report);
      setPhase(PHASE.RESULT);
      toast.success('Interview completed — review your results!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to complete interview';
      toast.error(msg);
      setPhase(PHASE.INTERVIEW);
    }
  }, [session]);

  // ─── Restart ────────────────────────────────────────────
  const handleRestart = useCallback(() => {
    setPhase(PHASE.ROLE_INPUT);
    setSession(null);
    setCurrentQuestion(null);
    setLastEvaluation(null);
    setReport(null);
  }, []);

  // ─── Render ─────────────────────────────────────────────
  return (
    <div className="py-8 px-4 min-h-[calc(100vh-4rem)]">
      {/* Page header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-2">
          <Mic size={24} className="text-brand-accent-light" />
          <h1 className="text-2xl font-bold text-text-primary">Mock Interview</h1>
        </div>
        {phase === PHASE.ROLE_INPUT && (
          <p className="text-sm text-text-secondary max-w-md mx-auto">
            Practice with AI-generated questions tailored to your target role and experience level.
          </p>
        )}
      </div>

      {/* Phase screens */}
      {phase === PHASE.ROLE_INPUT && (
        <>
          <RoleInputScreen onStart={handleStart} loading={loading} />
          <div className="max-w-2xl mx-auto mt-8">
            <SkillGapPanel />
          </div>
        </>
      )}

      {phase === PHASE.INTERVIEW && (
        <QuestionScreen
          session={session}
          currentQuestion={currentQuestion}
          onSubmitAnswer={handleSubmitAnswer}
          onNextQuestion={handleNextQuestion}
          onComplete={handleComplete}
          submitting={submitting}
          lastEvaluation={lastEvaluation}
        />
      )}

      {phase === PHASE.COMPLETING && (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <Loader2 size={40} className="text-brand-primary-light animate-spin" />
          <p className="text-text-secondary">Generating your performance report…</p>
        </div>
      )}

      {phase === PHASE.RESULT && (
        <ResultScreen report={report} onRestart={handleRestart} />
      )}
    </div>
  );
}
