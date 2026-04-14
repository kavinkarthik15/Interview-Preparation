import { useState, useEffect, useRef } from 'react';

/**
 * 🔵 CircularGauge – Animated SVG circular progress meter
 * 
 * Features:
 *   - Smooth animated fill on mount
 *   - Glowing stroke that matches the score color
 *   - Configurable size, thickness, colors
 *   - Optional inner content (via children)
 *
 * Props:
 *   value      – 0-100 percentage
 *   size       – diameter in px (default: 160)
 *   thickness  – stroke width (default: 10)
 *   color      – primary stroke color (default: auto from value)
 *   glowColor  – glow shadow color (default: derived from color)
 *   bgStroke   – track color (default: dark border)
 *   duration   – animation ms (default: 1500)
 *   delay      – animation delay ms (default: 0)
 *   children   – content rendered inside the circle
 */
export function CircularGauge({
  value = 0,
  size = 160,
  thickness = 10,
  color = null,
  glowColor = null,
  bgStroke = 'rgba(31, 41, 55, 0.8)',
  duration = 1500,
  delay = 0,
  children
}) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const rafRef = useRef(null);

  // Auto-pick color based on value
  const resolvedColor = color || (
    value >= 85 ? '#10B981' :
    value >= 65 ? '#2563EB' :
    value >= 40 ? '#F59E0B' :
    '#EF4444'
  );
  const resolvedGlow = glowColor || resolvedColor;

  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  useEffect(() => {
    const clampedValue = Math.min(Math.max(value || 0, 0), 100);
    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedValue(eased * clampedValue);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    const timer = setTimeout(() => {
      rafRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration, delay]);

  const strokeDashoffset = circumference - (animatedValue / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
        style={{
          filter: `drop-shadow(0 0 8px ${resolvedGlow}40)`
        }}
      >
        <defs>
          {/* Gradient for the progress stroke */}
          <linearGradient id={`gauge-gradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={resolvedColor} />
            <stop offset="100%" stopColor={resolvedColor} stopOpacity="0.6" />
          </linearGradient>
          {/* Glow filter */}
          <filter id={`gauge-glow-${size}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={bgStroke}
          strokeWidth={thickness}
          strokeLinecap="round"
        />

        {/* Progress arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={`url(#gauge-gradient-${size})`}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          filter={`url(#gauge-glow-${size})`}
          style={{ transition: 'stroke-dashoffset 0.1s ease' }}
        />

        {/* Glowing tip dot */}
        {animatedValue > 2 && (
          <circle
            cx={center + radius * Math.cos(((animatedValue / 100) * 360 - 90) * Math.PI / 180)}
            cy={center + radius * Math.sin(((animatedValue / 100) * 360 - 90) * Math.PI / 180)}
            r={thickness / 2 + 2}
            fill={resolvedColor}
            style={{
              filter: `drop-shadow(0 0 6px ${resolvedColor})`,
              opacity: 0.9
            }}
          />
        )}
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

export default CircularGauge;
