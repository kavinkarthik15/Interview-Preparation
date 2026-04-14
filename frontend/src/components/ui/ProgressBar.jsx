import React from 'react';

/**
 * 📊 ProgressBar – Gradient progress indicator (blue → purple)
 */
export function ProgressBar({
  value = 0,
  max = 100,
  showLabel = false,
  size = 'md',
  className = '',
}) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  const heights = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-text-secondary font-medium">Progress</span>
          <span className="text-xs font-semibold text-text-primary">{Math.round(percent)}%</span>
        </div>
      )}
      <div className={`ds-progress-track ${heights[size]}`}>
        <div
          className={`ds-progress-fill ${heights[size]}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
