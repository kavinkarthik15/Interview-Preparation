import { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Brain } from 'lucide-react';
import { AIScoreCard } from './AIScoreCard';
import { RadarChart } from './RadarChart';
import { ImprovementSection } from './ImprovementSection';

/**
 * 🧠 AIFeedbackPanel – Composite panel combining:
 *   - AI Score Cards (animated count-up with purple glow)
 *   - Radar Chart (blue/purple/green skill visualization)
 *   - Improvement Section (strengths/weaknesses/suggestions tags)
 *
 * Props:
 *   scoreBreakdown   – { technical_score, clarity_score, confidence_score, problem_solving_score, communication_score }
 *   aiFeedbackSummary – { strengths[], weaknesses[], suggestions[], hasAIFeedback }
 *   overallScore     – 0-100 overall score
 *   defaultExpanded  – start open (default: false)
 */

const SCORE_CONFIG = [
  { key: 'technical_score', label: 'Technical', color: '#2563EB' },
  { key: 'communication_score', label: 'Communication', color: '#7C3AED' },
  { key: 'confidence_score', label: 'Confidence', color: '#10B981' },
  { key: 'problem_solving_score', label: 'Problem Solving', color: '#3B82F6' },
  { key: 'clarity_score', label: 'Clarity', color: '#8B5CF6' }
];

export function AIFeedbackPanel({
  scoreBreakdown = {},
  aiFeedbackSummary = {},
  overallScore = null,
  defaultExpanded = false
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  // Check if we have any meaningful score data
  const hasScores = SCORE_CONFIG.some(s => scoreBreakdown[s.key] != null);
  const hasAIFeedback = aiFeedbackSummary?.hasAIFeedback;

  if (!hasScores && !hasAIFeedback) return null;

  // Prepare radar chart data
  const radarData = SCORE_CONFIG
    .filter(s => scoreBreakdown[s.key] != null)
    .map(s => ({
      key: s.key.replace('_score', ''),
      label: s.label,
      value: scoreBreakdown[s.key],
      color: s.color
    }));

  return (
    <div className="mt-4 rounded-card border border-brand-accent/20 overflow-hidden transition-all duration-300"
      style={{
        boxShadow: expanded
          ? '0 0 30px rgba(124, 58, 237, 0.15), inset 0 0 40px rgba(124, 58, 237, 0.04)'
          : '0 0 12px rgba(124, 58, 237, 0.08)'
      }}
    >
      {/* Toggle Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-brand-accent/5 
                   hover:bg-brand-accent/8 transition-all duration-200 group"
      >
        <div className="flex items-center gap-2">
          <Brain size={16} className="text-brand-accent-light" />
          <span className="text-sm font-semibold text-text-primary">AI Performance Analysis</span>
          {hasAIFeedback && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-accent/15 text-brand-accent-light font-medium">
              AI
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {overallScore != null && (
            <span className={`text-sm font-bold ${
              overallScore >= 90 ? 'text-status-success' :
              overallScore >= 75 ? 'text-brand-primary-light' :
              overallScore >= 50 ? 'text-status-warning' :
              'text-status-error'
            }`}>{overallScore}%</span>
          )}
          {expanded ? (
            <ChevronUp size={16} className="text-text-muted group-hover:text-text-secondary transition" />
          ) : (
            <ChevronDown size={16} className="text-text-muted group-hover:text-text-secondary transition" />
          )}
        </div>
      </button>

      {/* Expandable Content */}
      {expanded && (
        <div className="p-4 bg-dark-card/50 space-y-6 animate-fade-in">

          {/* ─── Score Cards Grid ──────────────────────────────────── */}
          {hasScores && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-brand-accent-light" />
                <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Score Breakdown
                </h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {SCORE_CONFIG.filter(s => scoreBreakdown[s.key] != null).map((s, i) => (
                  <AIScoreCard
                    key={s.key}
                    label={s.label}
                    value={scoreBreakdown[s.key]}
                    maxValue={10}
                    color={s.color}
                    delay={i * 150}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ─── Radar Chart ──────────────────────────────────────── */}
          {radarData.length >= 3 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Brain size={14} className="text-brand-accent-light" />
                <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Skills Radar
                </h4>
              </div>
              <div className="bg-dark-bg/50 rounded-card border border-dark-border p-4 flex items-center justify-center">
                <RadarChart data={radarData} size={280} />
              </div>
            </div>
          )}

          {/* ─── Improvement Section ──────────────────────────────── */}
          {hasAIFeedback && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-brand-accent-light" />
                <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  AI Feedback
                </h4>
              </div>
              <div className="bg-dark-bg/50 rounded-card border border-dark-border p-4">
                <ImprovementSection
                  strengths={aiFeedbackSummary.strengths}
                  weaknesses={aiFeedbackSummary.weaknesses}
                  suggestions={aiFeedbackSummary.suggestions}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AIFeedbackPanel;
