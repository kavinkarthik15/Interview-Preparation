import { AnimatedCounter } from './AnimatedCounter';
import { Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * 🃏 AIScoreCard – Individual score card with purple glow + animated count-up
 * 
 * Props:
 *   label     – score category name (e.g., "Technical")
 *   value     – score value (0-10 scale)
 *   maxValue  – maximum score (default: 10)
 *   color     – accent color hex (mapped to glow)
 *   delay     – animation delay in ms
 *   icon      – optional Lucide icon component
 */
export function AIScoreCard({
  label = 'Score',
  value = 0,
  maxValue = 10,
  color = '#7C3AED',
  delay = 0,
  icon: Icon = null
}) {
  const percentage = value != null ? (value / maxValue) * 100 : 0;
  const isGood = percentage >= 70;
  const isMid = percentage >= 40 && percentage < 70;

  const TrendIcon = isGood ? TrendingUp : isMid ? Minus : TrendingDown;
  const trendColor = isGood ? '#10B981' : isMid ? '#F59E0B' : '#EF4444';

  return (
    <div
      className="relative bg-dark-card border border-dark-border rounded-card p-4 
                 transition-all duration-300 hover:border-dark-border-light group overflow-hidden"
      style={{
        boxShadow: `0 0 20px ${color}20, inset 0 0 30px ${color}06`
      }}
    >
      {/* Subtle animated glow ring */}
      <div
        className="absolute inset-0 rounded-card opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          boxShadow: `0 0 30px ${color}30, inset 0 0 20px ${color}08`
        }}
      />

      {/* AI indicator dot */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {Icon ? (
            <Icon size={16} style={{ color }} />
          ) : (
            <Sparkles size={14} style={{ color }} className="animate-pulse" />
          )}
          <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            {label}
          </span>
        </div>
        <TrendIcon size={14} style={{ color: trendColor }} />
      </div>

      {/* Animated score number */}
      <div className="relative z-10">
        <AnimatedCounter
          value={value ?? 0}
          duration={1200}
          decimals={1}
          suffix={`/${maxValue}`}
          delay={delay}
          className="text-3xl"
          style={{ color }}
        />
      </div>

      {/* Mini progress bar */}
      <div className="mt-3 h-1.5 bg-dark-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${percentage}%`,
            background: `linear-gradient(90deg, ${color}, ${color}88)`,
            transitionDelay: `${delay + 400}ms`
          }}
        />
      </div>
    </div>
  );
}

export default AIScoreCard;
