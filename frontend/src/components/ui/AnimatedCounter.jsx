import { useState, useEffect, useRef } from 'react';

/**
 * 🎬 AnimatedCounter – Count-up animation for score numbers
 * Uses requestAnimationFrame for smooth 60fps animation.
 * 
 * Props:
 *   value     – target number to count up to
 *   duration  – animation duration in ms (default: 1200)
 *   decimals  – decimal places to show (default: 0)
 *   suffix    – text appended after number (e.g., '%', '/10')
 *   className – additional CSS classes
 *   delay     – delay before animation starts in ms (default: 0)
 */
export function AnimatedCounter({
  value = 0,
  duration = 1200,
  decimals = 0,
  suffix = '',
  className = '',
  delay = 0
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const animRef = useRef(null);
  const startTimeRef = useRef(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (value == null || isNaN(value)) {
      setDisplayValue(0);
      return;
    }

    const startAnimation = () => {
      hasStarted.current = true;
      startTimeRef.current = null;

      const animate = (timestamp) => {
        if (!startTimeRef.current) startTimeRef.current = timestamp;
        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-out cubic for smooth deceleration
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = eased * value;

        setDisplayValue(current);

        if (progress < 1) {
          animRef.current = requestAnimationFrame(animate);
        }
      };

      animRef.current = requestAnimationFrame(animate);
    };

    const timer = setTimeout(startAnimation, delay);

    return () => {
      clearTimeout(timer);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [value, duration, delay]);

  const formatted = displayValue.toFixed(decimals);

  return (
    <span className={`tabular-nums font-bold ${className}`}>
      {formatted}{suffix}
    </span>
  );
}

export default AnimatedCounter;
