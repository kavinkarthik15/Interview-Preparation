import { useState } from 'react';
import { Cpu, ChevronDown, ChevronUp, Activity } from 'lucide-react';
import { MLConfidenceBar } from './MLConfidenceBar';
import { HistoricalLineChart } from './HistoricalLineChart';
import { AIExplanationPanel } from './AIExplanationPanel';
import { ReadinessStat } from './ReadinessStat';

/**
 * 🧠 MLInsightsPanel – Composite ML visualization layer
 *
 * Combines:
 *   - Large ReadinessStat (animated 82%)
 *   - ML Confidence Bar (blue glow)
 *   - Historical Line Chart (smooth animation)
 *   - AI Explanation Panel (purple left border)
 *
 * Props:
 *   prediction – object from GET /api/interviews/predict
 *   readiness  – object from GET /api/interviews/readiness
 *   defaultExpanded – start open (default: true)
 */
export function MLInsightsPanel({
  prediction = {},
  readiness = {},
  defaultExpanded = true
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const {
    score = 0,
    confidence = 0,
    weak_area = null,
    explanation = '',
    history = []
  } = prediction;

  const {
    readinessScore = 0,
    readinessLabel = 'Not Started'
  } = readiness;

  const hasData = score > 0 || confidence > 0 || readinessScore > 0;

  if (!hasData) return null;

  return (
    <div
      className="rounded-card border border-brand-primary/20 overflow-hidden transition-all duration-300"
      style={{
        boxShadow: expanded
          ? '0 0 30px rgba(37, 99, 235, 0.12), inset 0 0 40px rgba(37, 99, 235, 0.03)'
          : '0 0 10px rgba(37, 99, 235, 0.06)'
      }}
    >
      {/* Header toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-brand-primary/5
                   hover:bg-brand-primary/8 transition-all duration-200 group"
      >
        <div className="flex items-center gap-2.5">
          <Cpu size={18} className="text-brand-primary-light" />
          <span className="text-sm font-bold text-text-primary">ML Performance Insights</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-primary/15 text-brand-primary-light font-medium flex items-center gap-1">
            <Activity size={8} />
            LIVE
          </span>
        </div>
        <div className="flex items-center gap-3">
          {score > 0 && (
            <span className={`text-sm font-bold ${
              score >= 8 ? 'text-status-success' :
              score >= 6 ? 'text-brand-primary-light' :
              score >= 4 ? 'text-status-warning' :
              'text-status-error'
            }`}>{score}/10</span>
          )}
          {expanded ? (
            <ChevronUp size={16} className="text-text-muted group-hover:text-text-secondary transition" />
          ) : (
            <ChevronDown size={16} className="text-text-muted group-hover:text-text-secondary transition" />
          )}
        </div>
      </button>

      {/* Expandable content */}
      {expanded && (
        <div className="p-5 bg-dark-card/50 space-y-6 animate-fade-in">

          {/* ── Top row: Readiness Stat + ML Confidence ────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ReadinessStat
              readinessScore={readinessScore}
              readinessLabel={readinessLabel}
            />
            <div className="bg-dark-card rounded-card border border-dark-border p-5 flex flex-col justify-center space-y-5 ds-hover-lift">
              <MLConfidenceBar confidence={confidence} label="ML Confidence" />
              <MLConfidenceBar
                confidence={score * 10}
                label="Predicted Score"
                showIcon={false}
              />
              {weak_area && weak_area !== 'No Data' && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] text-text-muted uppercase tracking-wider">Weak Area</span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-status-warning/10 text-status-warning border border-status-warning/20">
                    {weak_area}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── Historical Line Chart ─────────────────────── */}
          {history.length >= 2 && (
            <div className="bg-dark-card rounded-card border border-dark-border p-5 ds-hover-lift">
              <div className="flex items-center gap-2 mb-4">
                <Activity size={14} className="text-brand-primary-light" />
                <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Performance Trend
                </h4>
              </div>
              <HistoricalLineChart data={history} height={220} />
            </div>
          )}

          {/* ── AI Explanation Panel ──────────────────────── */}
          {(explanation || weak_area) && (
            <AIExplanationPanel
              explanation={explanation}
              weakArea={weak_area}
              score={score}
              confidence={confidence}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default MLInsightsPanel;
