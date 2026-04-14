import { useState, useEffect, useRef } from 'react';
import { TrendingUp } from 'lucide-react';

/**
 * 📈 HistoricalLineChart – SVG line chart with smooth animation
 *
 * Props:
 *   data      – array of { date, score (0-10), rawScore?, title? }
 *   height    – chart height in px (default: 200)
 *   animated  – animate draw-in (default: true)
 *   showDots  – show data point dots (default: true)
 *   showArea  – show filled area under line (default: true)
 */

const PADDING = { top: 20, right: 20, bottom: 30, left: 40 };

export function HistoricalLineChart({
  data = [],
  height = 200,
  animated = true,
  showDots = true,
  showArea = true
}) {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(600);
  const [animProgress, setAnimProgress] = useState(animated ? 0 : 1);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const rafRef = useRef(null);

  // Responsive width
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Draw animation
  useEffect(() => {
    if (!animated || data.length < 2) { setAnimProgress(1); return; }
    const start = performance.now();
    const dur = 1200;
    const animate = (now) => {
      const elapsed = now - start;
      const p = Math.min(elapsed / dur, 1);
      setAnimProgress(1 - Math.pow(1 - p, 3));
      if (p < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [data, animated]);

  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center h-32 text-text-muted text-sm">
        Need at least 2 data points for chart
      </div>
    );
  }

  const w = containerWidth;
  const chartW = w - PADDING.left - PADDING.right;
  const chartH = height - PADDING.top - PADDING.bottom;

  // Scales
  const scores = data.map(d => d.score);
  const minY = Math.max(Math.floor(Math.min(...scores)) - 1, 0);
  const maxY = Math.min(Math.ceil(Math.max(...scores)) + 1, 10);
  const rangeY = maxY - minY || 1;

  const xScale = (i) => PADDING.left + (i / (data.length - 1)) * chartW;
  const yScale = (val) => PADDING.top + chartH - ((val - minY) / rangeY) * chartH;

  // Build path
  const points = data.map((d, i) => ({ x: xScale(i), y: yScale(d.score) }));

  // Smooth curve using cardinal spline
  const buildPath = (pts) => {
    if (pts.length < 2) return '';
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(i - 1, 0)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(i + 2, pts.length - 1)];
      const tension = 0.3;
      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  const linePath = buildPath(points);
  const areaPath = linePath + ` L ${points[points.length - 1].x} ${PADDING.top + chartH} L ${points[0].x} ${PADDING.top + chartH} Z`;

  // Animated clip
  const visibleWidth = PADDING.left + chartW * animProgress;

  // Y-axis labels
  const yTicks = [];
  const tickCount = 5;
  for (let i = 0; i <= tickCount; i++) {
    const val = minY + (rangeY * i) / tickCount;
    yTicks.push({ val: parseFloat(val.toFixed(1)), y: yScale(val) });
  }

  // Format date
  const fmtDate = (d) => {
    const dt = new Date(d);
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div ref={containerRef} className="w-full">
      <svg width={w} height={height} viewBox={`0 0 ${w} ${height}`} className="overflow-visible">
        <defs>
          <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
          <linearGradient id="area-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(37, 99, 235, 0.2)" />
            <stop offset="100%" stopColor="rgba(37, 99, 235, 0)" />
          </linearGradient>
          <clipPath id="anim-clip">
            <rect x="0" y="0" width={visibleWidth} height={height} />
          </clipPath>
          <filter id="line-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid lines */}
        {yTicks.map((t, i) => (
          <g key={`grid-${i}`}>
            <line
              x1={PADDING.left} y1={t.y} x2={w - PADDING.right} y2={t.y}
              stroke="rgba(255,255,255,0.04)" strokeWidth="1"
            />
            <text x={PADDING.left - 8} y={t.y + 4} textAnchor="end"
              className="fill-text-muted" style={{ fontSize: '10px' }}>
              {t.val}
            </text>
          </g>
        ))}

        {/* X-axis labels */}
        {data.map((d, i) => {
          if (data.length > 10 && i % Math.ceil(data.length / 6) !== 0 && i !== data.length - 1) return null;
          return (
            <text key={`x-${i}`} x={xScale(i)} y={height - 6} textAnchor="middle"
              className="fill-text-muted" style={{ fontSize: '9px' }}>
              {fmtDate(d.date)}
            </text>
          );
        })}

        <g clipPath="url(#anim-clip)">
          {/* Area fill */}
          {showArea && (
            <path d={areaPath} fill="url(#area-gradient)" />
          )}

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="url(#line-gradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#line-glow)"
          />

          {/* Dots */}
          {showDots && points.map((p, i) => (
            <g key={`dot-${i}`}>
              <circle
                cx={p.x} cy={p.y} r={hoveredIdx === i ? 6 : 4}
                fill={hoveredIdx === i ? '#7C3AED' : '#2563EB'}
                stroke="#0F172A" strokeWidth="2"
                className="transition-all duration-200 cursor-pointer"
                style={{ filter: hoveredIdx === i ? 'drop-shadow(0 0 8px rgba(37, 99, 235, 0.6))' : 'drop-shadow(0 0 4px rgba(37, 99, 235, 0.3))' }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            </g>
          ))}
        </g>

        {/* Tooltip */}
        {hoveredIdx != null && (
          <g>
            <rect
              x={points[hoveredIdx].x - 50} y={points[hoveredIdx].y - 42}
              width="100" height="32" rx="6"
              fill="#1E293B" stroke="rgba(124,58,237,0.3)" strokeWidth="1"
            />
            <text
              x={points[hoveredIdx].x} y={points[hoveredIdx].y - 28}
              textAnchor="middle" className="fill-text-primary font-semibold"
              style={{ fontSize: '11px' }}
            >
              {data[hoveredIdx].score}/10
            </text>
            <text
              x={points[hoveredIdx].x} y={points[hoveredIdx].y - 16}
              textAnchor="middle" className="fill-text-muted"
              style={{ fontSize: '9px' }}
            >
              {fmtDate(data[hoveredIdx].date)}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

export default HistoricalLineChart;
