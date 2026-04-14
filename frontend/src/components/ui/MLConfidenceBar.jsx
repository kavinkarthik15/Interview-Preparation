import { useState, useEffect, useRef } from 'react';
import { Cpu } from 'lucide-react';

/**
 * 🔵 MLConfidenceBar – Horizontal confidence meter with blue glow
 *
 * Props:
 *   confidence  – 0-100 percentage
 *   label       – label text (default: "ML Confidence")
 *   animated    – animate on mount (default: true)
 *   duration    – animation ms (default: 1200)
 *   showIcon    – show CPU/ML icon (default: true)
 */
export function MLConfidenceBar({
  confidence = 0,
  label = 'ML Confidence',
  animated = true,
  duration = 1200,
  showIcon = true
}) {
  const [width, setWidth] = useState(animated ? 0 : confidence);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!animated) { setWidth(confidence); return; }

    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setWidth(eased * confidence);
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [confidence, animated, duration]);

  const colorClass = confidence >= 70 ? 'from-blue-500 to-blue-400'
    : confidence >= 40 ? 'from-blue-600 to-blue-500'
    : 'from-blue-700 to-blue-600';

  const glowIntensity = confidence >= 70 ? '0 0 20px rgba(37, 99, 235, 0.5), 0 0 40px rgba(37, 99, 235, 0.2)'
    : confidence >= 40 ? '0 0 14px rgba(37, 99, 235, 0.35)'
    : '0 0 8px rgba(37, 99, 235, 0.2)';

  const confidenceLabel = confidence >= 80 ? 'High' : confidence >= 50 ? 'Medium' : 'Low';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showIcon && <Cpu size={14} className="text-brand-primary-light" />}
          <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold ${
            confidence >= 70 ? 'text-brand-primary-light' :
            confidence >= 40 ? 'text-status-warning' :
            'text-status-error'
          }`}>{confidenceLabel}</span>
          <span className="text-sm font-bold text-text-primary tabular-nums">
            {Math.round(width)}%
          </span>
        </div>
      </div>

      <div className="relative h-3 bg-dark-border rounded-full overflow-hidden">
        {/* Glow layer behind the bar */}
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all ease-out"
          style={{
            width: `${width}%`,
            boxShadow: glowIntensity,
            background: 'transparent'
          }}
        />
        {/* Progress fill */}
        <div
          className={`h-full rounded-full bg-gradient-to-r ${colorClass} relative`}
          style={{ width: `${width}%`, transition: 'width 0.1s ease' }}
        >
          {/* Shimmer overlay */}
          <div
            className="absolute inset-0 rounded-full opacity-30"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 2s linear infinite'
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default MLConfidenceBar;
