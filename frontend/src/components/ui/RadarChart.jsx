import { useEffect, useRef, useState } from 'react';

/**
 * 🕸️ RadarChart – SVG radar/spider chart for skill scores
 * 
 * Props:
 *   data – array of { label, value (0-10), color }
 *   size – chart size in px (default: 280)
 *   levels – number of concentric rings (default: 5)
 *   animated – whether to animate on mount (default: true)
 *
 * Default axes: Technical (Blue), Communication (Purple), Confidence (Green),
 *               Problem Solving (Blue-light), Clarity (Accent-light)
 */

const DEFAULT_COLORS = {
  technical: '#2563EB',
  communication: '#7C3AED',
  confidence: '#10B981',
  problem_solving: '#3B82F6',
  clarity: '#8B5CF6'
};

export function RadarChart({
  data = [],
  size = 280,
  levels = 5,
  animated = true
}) {
  const [animProgress, setAnimProgress] = useState(animated ? 0 : 1);
  const animRef = useRef(null);

  useEffect(() => {
    if (!animated) return;
    const startTime = performance.now();
    const duration = 800;

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out quad
      const eased = 1 - Math.pow(1 - progress, 2);
      setAnimProgress(eased);
      if (progress < 1) animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [animated, data]);

  if (!data.length) return null;

  const cx = size / 2;
  const cy = size / 2;
  const radius = (size / 2) - 40; // padding for labels
  const angleSlice = (2 * Math.PI) / data.length;

  // Get point position on the chart
  const getPoint = (index, value, maxVal = 10) => {
    const angle = angleSlice * index - Math.PI / 2;
    const r = (value / maxVal) * radius * animProgress;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle)
    };
  };

  // Build concentric level rings
  const levelRings = [];
  for (let lvl = 1; lvl <= levels; lvl++) {
    const points = data.map((_, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const r = (lvl / levels) * radius;
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    }).join(' ');
    levelRings.push(points);
  }

  // Build axis lines
  const axisLines = data.map((_, i) => {
    const angle = angleSlice * i - Math.PI / 2;
    return {
      x2: cx + radius * Math.cos(angle),
      y2: cy + radius * Math.sin(angle)
    };
  });

  // Data polygon
  const dataPoints = data.map((d, i) => getPoint(i, d.value));
  const polygonStr = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  // Label positions (slightly outside the chart)
  const labelPositions = data.map((d, i) => {
    const angle = angleSlice * i - Math.PI / 2;
    const r = radius + 24;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      label: d.label,
      value: d.value,
      color: d.color || DEFAULT_COLORS[d.key] || '#2563EB'
    };
  });

  // Gradient fill color – blended from data colors
  const fillColor = 'rgba(124, 58, 237, 0.15)';
  const strokeColor = 'rgba(124, 58, 237, 0.7)';

  return (
    <div className="flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        <defs>
          <radialGradient id="radar-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(124, 58, 237, 0.2)" />
            <stop offset="100%" stopColor="rgba(124, 58, 237, 0)" />
          </radialGradient>
        </defs>

        {/* Background glow */}
        <circle cx={cx} cy={cy} r={radius} fill="url(#radar-glow)" />

        {/* Level rings */}
        {levelRings.map((points, i) => (
          <polygon
            key={`level-${i}`}
            points={points}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
        ))}

        {/* Axis lines */}
        {axisLines.map((axis, i) => (
          <line
            key={`axis-${i}`}
            x1={cx}
            y1={cy}
            x2={axis.x2}
            y2={axis.y2}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />
        ))}

        {/* Data polygon fill */}
        <polygon
          points={polygonStr}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinejoin="round"
          style={{ transition: 'all 0.3s ease' }}
        />

        {/* Data points (dots) */}
        {dataPoints.map((p, i) => (
          <circle
            key={`dot-${i}`}
            cx={p.x}
            cy={p.y}
            r="4"
            fill={data[i].color || DEFAULT_COLORS[data[i].key] || '#7C3AED'}
            stroke="#0F172A"
            strokeWidth="2"
            style={{ filter: `drop-shadow(0 0 4px ${data[i].color || '#7C3AED'})` }}
          />
        ))}

        {/* Labels */}
        {labelPositions.map((lp, i) => (
          <g key={`label-${i}`}>
            <text
              x={lp.x}
              y={lp.y - 6}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-text-secondary text-[10px] font-medium"
              style={{ fontSize: '10px' }}
            >
              {lp.label}
            </text>
            <text
              x={lp.x}
              y={lp.y + 8}
              textAnchor="middle"
              dominantBaseline="middle"
              className="font-bold text-[11px]"
              style={{ fontSize: '11px', fill: lp.color }}
            >
              {lp.value != null ? `${lp.value}/10` : '—'}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default RadarChart;
