import { CircularGauge } from './CircularGauge';
import { AnimatedCounter } from './AnimatedCounter';
import { Sparkles, Zap, TrendingUp, Shield, Flame } from 'lucide-react';

/**
 * 🏆 ReadinessPanel – Full readiness display with circular gauge + stats
 * 
 * Props:
 *   readiness – object from GET /api/interviews/readiness
 *   history   – object from GET /api/interviews/history (optional)
 */
export function ReadinessPanel({ readiness = {}, history = {} }) {
  const {
    readinessScore = 0,
    readinessLabel = 'Not Started',
    confidence = 0,
    confidenceLabel = 'Low',
    totalInterviews = 0,
    completedInterviews = 0,
    avgScore = 0,
    avgScoreLabel = 'N/A',
    streakDays = 0,
    dimensionAverages = {}
  } = readiness;

  const { trend = 'stable', rolling = {} } = history;

  const trendIcon = trend === 'improving' ? TrendingUp : trend === 'declining' ? TrendingUp : Zap;
  const trendColor = trend === 'improving' ? 'text-status-success' : trend === 'declining' ? 'text-status-error' : 'text-brand-primary-light';
  const trendRotation = trend === 'declining' ? 'rotate-180' : '';

  return (
    <div className="bg-dark-card rounded-card border border-dark-border shadow-card p-6 ds-hover-lift">
      <div className="flex items-center gap-2 mb-6">
        <Shield size={18} className="text-brand-accent-light" />
        <h3 className="font-semibold text-text-primary">Interview Readiness</h3>
        <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-brand-accent/15 text-brand-accent-light font-medium flex items-center gap-1">
          <Sparkles size={10} /> AI Assessed
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-8">
        {/* ── Circular Gauge ──────────────────────────────── */}
        <div className="flex-shrink-0">
          <CircularGauge value={readinessScore} size={180} thickness={12} delay={200}>
            <div className="text-center">
              <AnimatedCounter
                value={readinessScore}
                duration={1500}
                suffix="%"
                delay={300}
                className="text-4xl"
              />
              <div className="text-xs text-text-secondary mt-1 font-medium">{readinessLabel}</div>
            </div>
          </CircularGauge>
        </div>

        {/* ── Stats Grid ──────────────────────────────────── */}
        <div className="flex-1 grid grid-cols-2 gap-4 w-full">
          {/* Avg Score */}
          <div className="bg-dark-bg rounded-card border border-dark-border p-3 ds-hover-glow">
            <div className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Avg Score</div>
            <div className="flex items-baseline gap-1.5">
              <AnimatedCounter value={avgScore} duration={1200} suffix="%" className="text-xl text-text-primary" delay={400} />
              <span className="text-[10px] text-text-muted">{avgScoreLabel}</span>
            </div>
          </div>

          {/* Completed */}
          <div className="bg-dark-bg rounded-card border border-dark-border p-3 ds-hover-glow">
            <div className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Completed</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-text-primary">{completedInterviews}</span>
              <span className="text-[10px] text-text-muted">/ {totalInterviews}</span>
            </div>
          </div>

          {/* Streak */}
          <div className="bg-dark-bg rounded-card border border-dark-border p-3 ds-hover-glow">
            <div className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Streak</div>
            <div className="flex items-center gap-1.5">
              <Flame size={16} className={streakDays > 0 ? 'text-status-warning' : 'text-text-muted'} />
              <span className="text-xl font-bold text-text-primary">{streakDays}</span>
              <span className="text-[10px] text-text-muted">days</span>
            </div>
          </div>

          {/* Trend */}
          <div className="bg-dark-bg rounded-card border border-dark-border p-3 ds-hover-glow">
            <div className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Trend</div>
            <div className="flex items-center gap-1.5">
              <trendIcon size={16} className={`${trendColor} ${trendRotation} transition-transform`} />
              <span className={`text-sm font-semibold capitalize ${trendColor}`}>{trend}</span>
            </div>
            {rolling.last3 > 0 && (
              <div className="text-[10px] text-text-muted mt-0.5">Last 3 avg: {rolling.last3}%</div>
            )}
          </div>
        </div>
      </div>

      {/* ── AI Confidence Bar ─────────────────────────────── */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-text-secondary">AI Confidence</span>
          <span className={`text-xs font-semibold ${
            confidenceLabel === 'High' ? 'text-status-success' :
            confidenceLabel === 'Medium' ? 'text-status-warning' :
            'text-status-error'
          }`}>{confidenceLabel} ({Math.round(confidence * 100)}%)</span>
        </div>
        <div className="h-1.5 bg-dark-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${confidence * 100}%`,
              background: confidenceLabel === 'High'
                ? 'linear-gradient(90deg, #10B981, #059669)'
                : confidenceLabel === 'Medium'
                ? 'linear-gradient(90deg, #F59E0B, #D97706)'
                : 'linear-gradient(90deg, #EF4444, #DC2626)'
            }}
          />
        </div>
      </div>

      {/* ── Dimension Mini-Bars ────────────────────────────── */}
      {Object.values(dimensionAverages).some(v => v > 0) && (
        <div className="mt-5 space-y-2">
          <div className="text-[10px] text-text-muted uppercase tracking-wider mb-2">Dimension Averages</div>
          {[
            { key: 'technical', label: 'Technical', color: '#2563EB' },
            { key: 'communication', label: 'Communication', color: '#7C3AED' },
            { key: 'confidence', label: 'Confidence', color: '#10B981' },
            { key: 'problem_solving', label: 'Problem Solving', color: '#3B82F6' },
            { key: 'clarity', label: 'Clarity', color: '#8B5CF6' }
          ].map(dim => (
            <div key={dim.key} className="flex items-center gap-3">
              <span className="text-[11px] text-text-secondary w-28 shrink-0">{dim.label}</span>
              <div className="flex-1 h-1.5 bg-dark-border rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full ds-progress-animate"
                  style={{
                    width: `${(dimensionAverages[dim.key] || 0) / 10 * 100}%`,
                    backgroundColor: dim.color
                  }}
                />
              </div>
              <span className="text-[11px] font-semibold text-text-primary w-8 text-right">
                {dimensionAverages[dim.key] || 0}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReadinessPanel;
