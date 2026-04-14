import { AnimatedCounter } from './AnimatedCounter';
import { CircularGauge } from './CircularGauge';
import { Shield, Sparkles } from 'lucide-react';

/**
 * 🏆 ReadinessStat – Large "Interview Readiness: 82%" animated display
 *
 * Props:
 *   readinessScore – 0-100
 *   readinessLabel – text label (e.g., "Almost Ready")
 *   compact        – smaller variant (default: false)
 */
export function ReadinessStat({
  readinessScore = 0,
  readinessLabel = '',
  compact = false
}) {
  const gaugeSize = compact ? 120 : 180;
  const numSize = compact ? 'text-3xl' : 'text-5xl';
  const labelSize = compact ? 'text-xs' : 'text-sm';

  return (
    <div className="relative bg-dark-card rounded-card border border-dark-border shadow-card p-6 ds-hover-lift overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-brand-accent/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-brand-primary/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Shield size={compact ? 16 : 20} className="text-brand-accent-light" />
          <h3 className={`font-bold text-text-primary ${compact ? 'text-base' : 'text-lg'}`}>
            Interview Readiness
          </h3>
          <Sparkles size={compact ? 12 : 16} className="text-brand-accent-light animate-pulse" />
        </div>

        {/* Circular gauge with large animated number */}
        <CircularGauge
          value={readinessScore}
          size={gaugeSize}
          thickness={compact ? 8 : 12}
          delay={300}
        >
          <div className="text-center">
            <AnimatedCounter
              value={readinessScore}
              duration={1800}
              suffix="%"
              delay={400}
              className={`${numSize} bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent`}
            />
          </div>
        </CircularGauge>

        {/* Label */}
        <div className={`mt-3 ${labelSize} font-semibold ${
          readinessScore >= 85 ? 'text-status-success' :
          readinessScore >= 65 ? 'text-brand-primary-light' :
          readinessScore >= 40 ? 'text-status-warning' :
          'text-text-muted'
        }`}>
          {readinessLabel}
        </div>

        {/* Glowing bar under the label */}
        <div className="mt-3 w-full max-w-[200px] h-1.5 bg-dark-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full ds-progress-animate"
            style={{
              width: `${readinessScore}%`,
              background: 'linear-gradient(90deg, #2563EB, #7C3AED)',
              boxShadow: '0 0 12px rgba(37, 99, 235, 0.4)'
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default ReadinessStat;
